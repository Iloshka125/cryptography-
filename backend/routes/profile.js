const express = require('express');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Balance = require('../models/Balance');
const router = express.Router();

// Получить профиль пользователя
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
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Получаем баланс
    const balance = await Balance.findByUserId(userId);
    
    // Получаем достижения
    const achievements = await Achievement.findByUserId(userId);
    
    res.json({
      success: true,
      profile: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || 'target',
        level: user.level || 1,
        experience: user.experience || 0,
        isAdmin: user.is_admin || false,
        balance: {
          coins: balance.coins,
          hints: balance.hints,
        },
        achievements: achievements.map(a => ({
          id: a.achievement_id,
          unlocked: a.unlocked,
          unlocked_at: a.unlocked_at,
        })),
      },
    });
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить профиль пользователя
router.post('/update', async (req, res) => {
  try {
    const { user_id, email, phone, nickname, avatar } = req.body;
    
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
    
    // Проверяем уникальность nickname, email, phone
    if (nickname || email || phone) {
      const existingUser = await User.findById(userId);
      const checkData = {
        nickname: nickname || existingUser.nickname,
        email: email || existingUser.email,
        phone: phone || existingUser.phone,
      };
      
      const exists = await User.exists(checkData);
      if (exists) {
        // Проверяем, что это не тот же пользователь
        const user = await User.findByEmailOrPhone(checkData.email, checkData.phone);
        if (user && user.id !== userId) {
          return res.status(409).json({ error: 'Пользователь с такими данными уже существует' });
        }
      }
    }
    
    const updatedUser = await User.update(userId, { nickname, avatar, email, phone });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({
      success: true,
      profile: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        level: updatedUser.level,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Изменить пароль
router.post('/change-password', async (req, res) => {
  try {
    const { user_id, email, phone, old_password, new_password } = req.body;
    
    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Требуется старый и новый пароль' });
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
    
    // Получаем пользователя для проверки старого пароля
    let user = null;
    if (email || phone) {
      user = await User.findByEmailOrPhone(email, phone);
    }
    if (!user) {
      // Если не нашли по email/phone, ищем по ID
      const pool = require('../config/database');
      const userById = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userById.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      user = userById.rows[0];
    }
    
    // Проверяем старый пароль
    const isValid = await User.comparePassword(old_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }
    
    // Обновляем пароль
    await User.updatePassword(userId, new_password);
    
    res.json({
      success: true,
      message: 'Пароль успешно изменен',
    });
  } catch (err) {
    console.error('Ошибка изменения пароля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Разблокировать достижение
router.post('/unlock-achievement', async (req, res) => {
  try {
    const { user_id, email, phone, achievement_id } = req.body;
    
    if (!achievement_id) {
      return res.status(400).json({ error: 'Требуется achievement_id' });
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
    
    const achievement = await Achievement.unlock(userId, achievement_id);
    
    res.json({
      success: true,
      achievement: {
        id: achievement_id,
        unlocked: achievement !== null,
      },
    });
  } catch (err) {
    console.error('Ошибка разблокировки достижения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

