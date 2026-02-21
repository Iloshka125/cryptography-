const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/email');
const router = express.Router();

// Генерирует токен верификации и время истечения (24 часа)
function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

router.post('/register', async (req, res) => {
  const { nickname, email, phone, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: 'Требуются nickname и password' });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: 'Требуется email или телефон' });
  }

  try {
    const normalizedEmail = email === '' ? null : email;
    const normalizedPhone = phone === '' ? null : phone;

    if (await User.exists({ nickname, email: normalizedEmail, phone: normalizedPhone })) {
      return res.status(409).json({ error: 'Пользователь с такими данными уже существует' });
    }

    let emailVerified = true; // по умолчанию — для регистрации только по телефону
    let emailVerificationToken = null;
    let emailVerificationExpires = null;

    // Если указан email — требуется подтверждение
    if (normalizedEmail) {
      emailVerified = false;
      const { token, expiresAt } = generateVerificationToken();
      emailVerificationToken = token;
      emailVerificationExpires = expiresAt;
    }

    const user = await User.create({
      nickname,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      emailVerified,
      emailVerificationToken,
      emailVerificationExpires,
    });

    const Balance = require('../models/Balance');
    await Balance.create(user.id, 0, 0);

    // Отправляем письмо, если есть email и нужна верификация
    if (normalizedEmail && !emailVerified) {
      const result = await sendVerificationEmail(normalizedEmail, emailVerificationToken, nickname);
      if (!result.sent) {
        console.warn('[AUTH] Не удалось отправить письмо подтверждения:', result.error || '');
      }
      return res.status(201).json({
        message: result.sent
          ? 'Проверьте почту — письмо с ссылкой подтверждения отправлено'
          : 'Аккаунт создан, но письмо не отправлено. Нажмите «Отправить повторно» на странице входа после верификации отправителя в SendGrid.',
        needsVerification: true,
        user_id: user.id,
      });
    }

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user_id: user.id,
      user: {
        user_id: user.id,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        isAdmin: user.is_admin || false,
        balance: { coins: 0, hints: 0 },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'Требуется email/телефон и пароль' });
  }

  try {
    const user = await User.findByEmailOrPhone(email, phone);
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isValid = await User.comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Если вход по email и почта не подтверждена — блокируем
    if (email && user.email && !user.email_verified) {
      return res.status(403).json({
        error: 'Подтвердите почту. Проверьте письмо или запросите повторную отправку.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const Balance = require('../models/Balance');
    const balance = await Balance.findByUserId(user.id);

    res.json({
      success: true,
      message: 'Успешный вход',
      user: {
        nickname: user.nickname,
        user_id: user.id,
        email: user.email,
        phone: user.phone,
        isAdmin: user.is_admin || false,
        balance: {
          coins: balance.coins,
          hints: balance.hints,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Подтверждение почты по ссылке из письма
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Не указан токен подтверждения' });
  }

  try {
    const result = await User.verifyEmail(token);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({
      success: true,
      message: 'Почта подтверждена. Теперь вы можете войти.',
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Повторная отправка письма подтверждения
// POST /auth/resend-verification { "email": "user@example.com" }
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Укажите email' });
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return res.status(400).json({ error: 'Укажите корректный email' });
  }

  try {
    const user = await User.findByEmailOrPhone(trimmedEmail, null);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }
    if (!user.email) {
      return res.status(400).json({ error: 'У этого аккаунта нет привязанной почты.' });
    }
    if (user.email_verified) {
      return res.status(400).json({ error: 'Почта уже подтверждена. Можно войти.' });
    }

    const { token, expiresAt } = generateVerificationToken();
    await User.setVerificationToken(user.id, token, expiresAt);
    const result = await sendVerificationEmail(user.email, token, user.nickname || 'пользователь');

    if (!result.sent) {
      return res.status(500).json({
        error: result.error || 'Не удалось отправить письмо. Проверьте настройки SendGrid на сервере.',
      });
    }

    res.json({
      success: true,
      message: 'Новое письмо с подтверждением отправлено на вашу почту',
    });
  } catch (err) {
    console.error('[resend-verification]', err.code || '', err.message || err);
    if (err.code === '42703') {
      return res.status(503).json({
        error: 'Сервис обновляется. Перезапустите бэкенд на сервере, чтобы применить обновления БД.',
      });
    }
    const isDev = process.env.NODE_ENV !== 'production';
    const detail = isDev && err.message
      ? (err.code ? `[${err.code}] ` : '') + err.message
      : null;
    res.status(500).json({
      error: detail || 'Ошибка сервера. Попробуйте позже или обратитесь к администратору.',
    });
  }
});

module.exports = router;
