const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { nickname, email, phone, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: 'Требуются nickname и password' });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: 'Требуется email или телефон' });
  }

  try {
    if (await User.exists({ nickname, email, phone })) {
      return res.status(409).json({ error: 'Пользователь с такими данными уже существует' });
    }

    const user = await User.create({ nickname, email, phone, password });
    
    // Создаем начальный баланс для нового пользователя
    const Balance = require('../models/Balance');
    await Balance.create(user.id, 1000, 5);
    
    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован',
      user_id: user.id 
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

    // Получаем баланс пользователя
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

module.exports = router;