const express = require('express');
const LevelExperienceRequirements = require('../models/LevelExperienceRequirements');
const router = express.Router();

// Получить все требования опыта для уровней
router.get('/', async (req, res) => {
  try {
    const requirements = await LevelExperienceRequirements.getAll();
    res.json({
      success: true,
      requirements: requirements,
    });
  } catch (err) {
    console.error('Ошибка получения требований опыта:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить требование для конкретного уровня
router.get('/:levelNumber', async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.levelNumber);
    if (!levelNumber || levelNumber < 1) {
      return res.status(400).json({ error: 'Неверный номер уровня' });
    }

    const requirement = await LevelExperienceRequirements.getByLevel(levelNumber);
    res.json({
      success: true,
      requirement: {
        level_number: levelNumber,
        experience_required: requirement.experience_required,
      },
    });
  } catch (err) {
    console.error('Ошибка получения требования опыта:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать или обновить требование для уровня
router.post('/set', async (req, res) => {
  try {
    const { level_number, experience_required } = req.body;
    
    if (!level_number || level_number < 1) {
      return res.status(400).json({ error: 'level_number должно быть положительным числом' });
    }
    if (!experience_required || experience_required < 0) {
      return res.status(400).json({ error: 'experience_required должно быть неотрицательным числом' });
    }

    const requirement = await LevelExperienceRequirements.set(level_number, experience_required);
    
    res.json({
      success: true,
      requirement: requirement,
    });
  } catch (err) {
    console.error('Ошибка обновления требования опыта:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить требование для уровня
router.delete('/:levelNumber', async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.levelNumber);
    if (!levelNumber || levelNumber < 1) {
      return res.status(400).json({ error: 'Неверный номер уровня' });
    }

    const deleted = await LevelExperienceRequirements.delete(levelNumber);
    if (!deleted) {
      return res.status(404).json({ error: 'Требование для уровня не найдено' });
    }

    res.json({
      success: true,
      message: 'Требование удалено',
    });
  } catch (err) {
    console.error('Ошибка удаления требования опыта:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

