const express = require('express');
const LevelSettings = require('../models/LevelSettings');
const router = express.Router();

// Получить настройки уровней
router.get('/', async (req, res) => {
  try {
    const settings = await LevelSettings.get();
    res.json({
      success: true,
      settings: {
        experience_per_level: settings.experience_per_level,
      },
    });
  } catch (err) {
    console.error('Ошибка получения настроек уровней:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить настройки уровней
router.post('/update', async (req, res) => {
  try {
    const { experience_per_level } = req.body;
    
    if (!experience_per_level || experience_per_level < 1) {
      return res.status(400).json({ error: 'experience_per_level должно быть положительным числом' });
    }

    const settings = await LevelSettings.set(experience_per_level);
    
    res.json({
      success: true,
      settings: {
        experience_per_level: settings.experience_per_level,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления настроек уровней:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

