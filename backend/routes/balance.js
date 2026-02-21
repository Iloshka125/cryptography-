const express = require('express');
const Balance = require('../models/Balance');
const requireSession = require('../middleware/requireSession');
const router = express.Router();

// Получить баланс пользователя (по сессии)
router.post('/get', requireSession, async (req, res) => {
  try {
    const balance = await Balance.findByUserId(req.userId);
    
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
router.post('/update-coins', requireSession, async (req, res) => {
  try {
    const { coins } = req.body;

    if (coins === undefined || coins < 0) {
      return res.status(400).json({ error: 'Некорректное значение coins' });
    }

    const balance = await Balance.updateCoins(req.userId, coins);
    
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
router.post('/update-hints', requireSession, async (req, res) => {
  try {
    const { hints } = req.body;

    if (hints === undefined || hints < 0) {
      return res.status(400).json({ error: 'Некорректное значение hints' });
    }

    const balance = await Balance.updateHints(req.userId, hints);
    
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
router.post('/add-coins', requireSession, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }

    const balance = await Balance.addCoins(req.userId, amount);
    
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
router.post('/subtract-coins', requireSession, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }

    const balance = await Balance.subtractCoins(req.userId, amount);
    
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
router.post('/add-hints', requireSession, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }

    const balance = await Balance.addHints(req.userId, amount);
    
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
router.post('/subtract-hints', requireSession, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некорректное значение amount' });
    }

    const balance = await Balance.subtractHints(req.userId, amount);
    
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

