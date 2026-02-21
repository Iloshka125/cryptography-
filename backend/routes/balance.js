const express = require('express');
const Balance = require('../models/Balance');
const User = require('../models/User');
const router = express.Router();

// Получить баланс пользователя
router.post('/get', async (req, res) => {
  try {
    const { user_id, email, phone } = req.body;
    
    let userId = user_id;
    
    // Если передан email или phone, находим user_id
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.findByUserId(userId);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    console.error('Ошибка получения баланса:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить баланс монет
router.post('/update-coins', async (req, res) => {
  try {
    const { user_id, email, phone, coins } = req.body;
    
    if (coins === undefined || coins < 0) {
      return res.status(400).json({ error: 'Некорректное значение coins' });
    }
    
    let userId = user_id;
    
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.updateCoins(userId, coins);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления баланса монет:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить баланс подсказок
router.post('/update-hints', async (req, res) => {
  try {
    const { user_id, email, phone, hints } = req.body;
    
    if (hints === undefined || hints < 0) {
      return res.status(400).json({ error: 'Некорректное значение hints' });
    }
    
    let userId = user_id;
    
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.updateHints(userId, hints);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления баланса подсказок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить монеты
router.post('/add-coins', async (req, res) => {
  try {
    const { user_id, email, phone, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }
    
    let userId = user_id;
    
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.addCoins(userId, amount);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    console.error('Ошибка добавления монет:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вычесть монеты
router.post('/subtract-coins', async (req, res) => {
  try {
    const { user_id, email, phone, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }
    
    let userId = user_id;
    
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.subtractCoins(userId, amount);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    if (err.message === 'Недостаточно монет') {
      return res.status(400).json({ error: 'Недостаточно монет' });
    }
    console.error('Ошибка вычитания монет:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить подсказки
router.post('/add-hints', async (req, res) => {
  try {
    const { user_id, email, phone, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }
    
    let userId = user_id;
    
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.addHints(userId, amount);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    console.error('Ошибка добавления подсказок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вычесть подсказки
router.post('/subtract-hints', async (req, res) => {
  try {
    const { user_id, email, phone, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }
    
    let userId = user_id;
    
    if (!userId && (email || phone)) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      userId = user.id;
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id, email или phone' });
    }
    
    const balance = await Balance.subtractHints(userId, amount);
    
    res.json({
      success: true,
      balance: {
        coins: balance.coins,
        hints: balance.hints,
      },
    });
  } catch (err) {
    if (err.message === 'Недостаточно подсказок') {
      return res.status(400).json({ error: 'Недостаточно подсказок' });
    }
    console.error('Ошибка вычитания подсказок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

