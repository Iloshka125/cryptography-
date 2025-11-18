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

    await User.create({ nickname, email, phone, password });
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
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

    res.json({ message: 'Успешный вход', nickname: user.nickname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;