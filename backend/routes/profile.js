const express = require('express');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Balance = require('../models/Balance');
const requireSession = require('../middleware/requireSession');
const router = express.Router();

// Получить профиль текущего пользователя (по сессии)
router.post('/get', requireSession, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const balance = await Balance.findByUserId(req.userId);
    const achievements = await Achievement.findByUserId(req.userId);
    
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

// Обновить профиль текущего пользователя
router.post('/update', requireSession, async (req, res) => {
  try {
    const { nickname, avatar, email, phone } = req.body;

    if (nickname || email !== undefined || phone !== undefined) {
      const existingUser = await User.findById(req.userId);
      // Нормализуем пустые строки в null
      const normalizedEmail = email === '' ? null : (email || existingUser.email);
      const normalizedPhone = phone === '' ? null : (phone || existingUser.phone);
      
      const checkData = {
        nickname: nickname || existingUser.nickname,
        email: normalizedEmail,
        phone: normalizedPhone,
      };
      
      // Проверяем только непустые значения
      if (checkData.nickname || checkData.email || checkData.phone) {
        const exists = await User.exists(checkData);
        if (exists) {
          // Проверяем, что это не тот же пользователь
          const user = await User.findByEmailOrPhone(checkData.email, checkData.phone);
          if (user && user.id !== req.userId) {
            return res.status(409).json({ error: 'Пользователь с такими данными уже существует' });
          }
        }
      }
    }
    
    // Нормализуем пустые строки в null перед обновлением
    const normalizedEmail = email === '' ? null : email;
    const normalizedPhone = phone === '' ? null : phone;
    const updatedUser = await User.update(req.userId, { nickname, avatar, email: normalizedEmail, phone: normalizedPhone });
    
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

// Изменить пароль (текущая сессия)
router.post('/change-password', requireSession, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Требуется старый и новый пароль' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isValid = await User.comparePassword(old_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    await User.updatePassword(req.userId, new_password);
    
    res.json({
      success: true,
      message: 'Пароль успешно изменен',
    });
  } catch (err) {
    console.error('Ошибка изменения пароля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Разблокировать достижение (текущая сессия)
router.post('/unlock-achievement', requireSession, async (req, res) => {
  try {
    const { achievement_id } = req.body;

    if (!achievement_id) {
      return res.status(400).json({ error: 'Требуется achievement_id' });
    }

    const achievement = await Achievement.unlock(req.userId, achievement_id);
    
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

