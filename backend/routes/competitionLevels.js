const express = require('express');
const multer = require('multer');
const path = require('path');
const CompetitionLevel = require('../models/CompetitionLevel');
const Competition = require('../models/Competition');
const User = require('../models/User');
const requireSession = require('../middleware/requireSession');
const optionalSession = require('../middleware/requireSession').optionalSession;
const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/tasks'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'competition-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Получить все уровни соревнования
router.get('/competition/:competitionId', async (req, res) => {
  try {
    const { competitionId } = req.params;
    const levels = await CompetitionLevel.findByCompetitionId(parseInt(competitionId));
    
    res.json({
      success: true,
      levels,
    });
  } catch (err) {
    console.error('Ошибка получения уровней соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить уровень по hash (прогресс по сессии)
router.get('/:hash', optionalSession, async (req, res) => {
  try {
    const { hash } = req.params;
    const userId = req.userId;

    let level = await CompetitionLevel.findByHash(hash);
    if (!level && !isNaN(parseInt(hash))) {
      level = await CompetitionLevel.findById(parseInt(hash));
    }

    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }

    const competition = await Competition.findById(level.competition_id);
    if (competition) {
      const calculatedStatus = Competition.calculateStatus(competition.start_date, competition.end_date);
      if (calculatedStatus === 'upcoming') {
        return res.status(403).json({ error: 'Соревнование еще не началось. Уровни будут доступны после начала соревнования.' });
      }
    }

    const { flag, ...levelWithoutFlag } = level;

    let completed = false;
    let isFirstSolver = false;
    if (userId) {
      completed = await CompetitionLevel.isLevelCompleted(userId, level.competition_id, level.id);
      if (completed) {
        const progress = await CompetitionLevel.getUserProgress(userId, level.competition_id);
        const userLevelProgress = progress.find(p => p.level_id === level.id);
        isFirstSolver = userLevelProgress?.is_first_solver || false;
      }
    }
    
    res.json({
      success: true,
      level: {
        ...levelWithoutFlag,
        completed,
        isFirstSolver,
      },
    });
  } catch (err) {
    console.error('Ошибка получения уровня соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать уровень соревнования (только админ)
router.post('/', upload.single('taskFile'), async (req, res) => {
  try {
    const { competitionId, name, description, task, flag, orderIndex, points, hint } = req.body;
    
    if (!competitionId || !name || !flag) {
      return res.status(400).json({ error: 'Требуется competitionId, name и flag' });
    }
    
    // Проверяем существование соревнования
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }
    
    // Обрабатываем загруженный файл
    let taskFilePath = null;
    let finalTask = null;
    if (req.file) {
      taskFilePath = `uploads/tasks/${req.file.filename}`;
      finalTask = null;
    } else {
      finalTask = task || null;
    }
    
    const level = await CompetitionLevel.create({
      competitionId: parseInt(competitionId),
      name,
      description: description || null,
      task: finalTask,
      taskFilePath,
      flag: flag || null,
      orderIndex: orderIndex ? parseInt(orderIndex) : 0,
      points: points ? parseInt(points) : 100,
      hint: hint || null,
    });
    
    res.status(201).json({
      success: true,
      level,
    });
  } catch (err) {
    console.error('Ошибка создания уровня соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить уровень соревнования (только админ)
router.put('/:hash', upload.single('taskFile'), async (req, res) => {
  try {
    const { hash } = req.params;
    const { name, description, task, flag, orderIndex, points, hint } = req.body;
    
    // Пробуем найти по hash, если не найдено - пробуем по ID
    let level = await CompetitionLevel.findByHash(hash);
    if (!level && !isNaN(parseInt(hash))) {
      level = await CompetitionLevel.findById(parseInt(hash));
    }
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    // Обрабатываем загруженный файл
    let taskFilePath = level.task_file_path;
    let finalTask = task;
    if (req.file) {
      taskFilePath = `uploads/tasks/${req.file.filename}`;
      finalTask = null;
    } else if (task !== undefined) {
      finalTask = task;
      if (task) {
        taskFilePath = null;
      }
    }
    
    const updatedLevel = await CompetitionLevel.update(level.id, {
      name,
      description,
      task: finalTask,
      taskFilePath,
      flag,
      orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined,
      points: points !== undefined ? parseInt(points) : undefined,
      hint,
    });
    
    res.json({
      success: true,
      level: updatedLevel,
    });
  } catch (err) {
    console.error('Ошибка обновления уровня соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить уровень соревнования (только админ)
router.delete('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Пробуем найти по hash, если не найдено - пробуем по ID
    let level = await CompetitionLevel.findByHash(hash);
    if (!level && !isNaN(parseInt(hash))) {
      level = await CompetitionLevel.findById(parseInt(hash));
    }
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    const deleted = await CompetitionLevel.delete(level.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    res.json({
      success: true,
      message: 'Уровень удален',
    });
  } catch (err) {
    console.error('Ошибка удаления уровня соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверить флаг уровня соревнования (текущая сессия)
router.post('/:hash/check', requireSession, async (req, res) => {
  try {
    const { hash } = req.params;
    const { flag } = req.body;

    if (!flag) {
      return res.status(400).json({ error: 'Требуется флаг' });
    }

    let level = await CompetitionLevel.findByHash(hash);
    if (!level && !isNaN(parseInt(hash))) {
      level = await CompetitionLevel.findById(parseInt(hash));
    }

    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }

    const competition = await Competition.findById(level.competition_id);
    if (competition) {
      const calculatedStatus = Competition.calculateStatus(competition.start_date, competition.end_date);
      if (calculatedStatus === 'upcoming') {
        return res.status(403).json({ error: 'Соревнование еще не началось. Уровни будут доступны после начала соревнования.' });
      }
    }

    const userId = req.userId;
    const competitionId = level.competition_id;

    // Проверяем, не решен ли уже уровень
    const isAlreadyCompleted = await CompetitionLevel.isLevelCompleted(userId, competitionId, level.id);
    
    if (isAlreadyCompleted) {
      return res.json({
        success: true,
        correct: true,
        alreadyCompleted: true,
        message: 'Уровень уже решен',
      });
    }

    // Проверяем правильность флага
    const isCorrect = flag.trim().toLowerCase() === level.flag.toLowerCase();
    
    if (isCorrect) {
      // Проверяем, был ли уровень уже решен кем-то (для бонуса первого решающего)
      const isFirstSolverAvailable = await CompetitionLevel.isFirstSolverAvailable(competitionId, level.id);
      const isFirstSolver = isFirstSolverAvailable;
      
      // Рассчитываем опыт: базовые очки + 10% бонус за первое решение
      let experienceGained = level.points || 100;
      if (isFirstSolver) {
        experienceGained = Math.floor(experienceGained * 1.1); // +10% бонус
      }
      
      // Записываем решение
      await CompetitionLevel.completeLevel(userId, competitionId, level.id, experienceGained, isFirstSolver);
      
      // Обновляем общий опыт пользователя в соревновании
      const totalExperience = await CompetitionLevel.getUserTotalExperience(userId, competitionId);
      await CompetitionLevel.updateUserCompetitionExperience(userId, competitionId, totalExperience);
      
      return res.json({
        success: true,
        correct: true,
        message: isFirstSolver ? 'Правильно! Вы первый решили этот уровень! +10% бонус' : 'Правильно!',
        experienceGained,
        isFirstSolver,
      });
    } else {
      return res.json({
        success: true,
        correct: false,
        message: 'Неверный флаг',
      });
    }
  } catch (err) {
    console.error('Ошибка проверки флага уровня соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
