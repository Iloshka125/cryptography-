const express = require('express');
const multer = require('multer');
const path = require('path');
const DuelChallenge = require('../models/DuelChallenge');
const DuelTask = require('../models/DuelTask');
const Balance = require('../models/Balance');
const router = express.Router();

// Настройка multer для загрузки файлов заданий
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/tasks'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'duel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
  const userId = req.query.user_id || req.body.user_id;
  if (!userId) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  req.userId = parseInt(userId);
  next();
};

// Middleware для проверки админа
const requireAdmin = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const user = await User.findById(userId);
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
  } catch (err) {
    console.error('Ошибка проверки админа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверить и запустить дуэли, которые должны начаться
router.use(async (req, res, next) => {
  try {
    // Находим все принятые заявки, которые должны начаться
    const acceptedChallenges = await DuelChallenge.findAll({ status: 'accepted' });
    const now = new Date();

    for (const challenge of acceptedChallenges) {
      if (challenge.started_at && new Date(challenge.started_at) <= now) {
        await DuelChallenge.start(challenge.id);
      }
    }
  } catch (err) {
    console.error('Ошибка проверки дуэлей:', err);
  }
  next();
});

// ========== ЗАДАНИЯ ДУЭЛЕЙ (админ) ==========

// Получить все задания
router.get('/tasks', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tasks = await DuelTask.findAll();
    res.json({ success: true, tasks });
  } catch (err) {
    console.error('Ошибка получения заданий дуэлей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать задание
router.post('/tasks', requireAuth, requireAdmin, upload.single('taskFile'), async (req, res) => {
  try {
    const { categoryId, levelId, name, description, task, flag, difficulty, timeLimit, points, hint } = req.body;
    
    if (!name || !flag) {
      return res.status(400).json({ error: 'Требуется название и флаг' });
    }

    const taskFilePath = req.file ? `uploads/tasks/${req.file.filename}` : null;
    const finalTask = taskFilePath ? null : (task || null);

    const newTask = await DuelTask.create({
      categoryId: categoryId || null,
      levelId: levelId || null,
      name,
      description: description || null,
      task: finalTask,
      taskFilePath,
      flag,
      difficulty: difficulty || 'medium',
      timeLimit: timeLimit ? parseInt(timeLimit) : 300,
      points: points ? parseInt(points) : 100,
      hint: hint || null,
    });

    res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    console.error('Ошибка создания задания дуэли:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить задание
router.put('/tasks/:id', requireAuth, requireAdmin, upload.single('taskFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, task, flag, difficulty, timeLimit, points, hint, isActive } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (task !== undefined) updates.task = task;
    if (flag !== undefined) updates.flag = flag;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (timeLimit !== undefined) updates.timeLimit = parseInt(timeLimit);
    if (points !== undefined) updates.points = parseInt(points);
    if (hint !== undefined) updates.hint = hint;
    if (isActive !== undefined) updates.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      updates.taskFilePath = `uploads/tasks/${req.file.filename}`;
      updates.task = null;
    }

    const updated = await DuelTask.update(parseInt(id), updates);
    if (!updated) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }

    res.json({ success: true, task: updated });
  } catch (err) {
    console.error('Ошибка обновления задания дуэли:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить задание
router.delete('/tasks/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DuelTask.delete(parseInt(id));
    if (!deleted) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }
    res.json({ success: true, message: 'Задание удалено' });
  } catch (err) {
    console.error('Ошибка удаления задания дуэли:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ЗАЯВКИ НА ДУЭЛЬ ==========

// Получить все заявки
router.get('/challenges', requireAuth, async (req, res) => {
  try {
    const { status, opponentId } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (opponentId === 'null') {
      filters.opponentId = null; // Рандомные заявки
    }
    
    // Получаем заявки пользователя и доступные для принятия
    const myChallenges = await DuelChallenge.findAll({ ...filters, userId: req.userId });
    const availableChallenges = await DuelChallenge.findAll({ status: 'pending', opponentId: null });
    
    res.json({ 
      success: true, 
      myChallenges,
      availableChallenges: availableChallenges.filter(c => c.challenger_id !== req.userId)
    });
  } catch (err) {
    console.error('Ошибка получения заявок на дуэль:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать заявку на дуэль
router.post('/challenges', requireAuth, async (req, res) => {
  try {
    const { opponentId, categoryId, difficulty, stake } = req.body;
    
    if (!stake || stake <= 0) {
      return res.status(400).json({ error: 'Ставка должна быть больше 0' });
    }

    // Проверяем баланс
    const balance = await Balance.findByUserId(req.userId);
    if (balance.coins < stake) {
      return res.status(400).json({ error: 'Недостаточно монет' });
    }

    // Списываем ставку
    await Balance.subtractCoins(req.userId, stake);

    const challenge = await DuelChallenge.create({
      challengerId: req.userId,
      opponentId: opponentId || null,
      categoryId: categoryId || null,
      difficulty: difficulty || null,
      stake: parseInt(stake),
    });

    res.status(201).json({ success: true, challenge });
  } catch (err) {
    console.error('Ошибка создания заявки на дуэль:', err);
    if (err.message === 'Недостаточно монет') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Принять заявку
router.post('/challenges/:id/accept', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await DuelChallenge.findById(parseInt(id));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ error: 'Заявка уже принята или отменена' });
    }

    // Проверяем баланс
    const balance = await Balance.findByUserId(req.userId);
    if (balance.coins < challenge.stake) {
      return res.status(400).json({ error: 'Недостаточно монет для принятия заявки' });
    }

    // Списываем ставку
    await Balance.subtractCoins(req.userId, challenge.stake);

    const accepted = await DuelChallenge.accept(parseInt(id), req.userId);
    if (!accepted) {
      // Возвращаем монеты, если не удалось принять
      await Balance.addCoins(req.userId, challenge.stake);
      return res.status(400).json({ error: 'Не удалось принять заявку' });
    }

    res.json({ success: true, challenge: accepted });
  } catch (err) {
    console.error('Ошибка принятия заявки на дуэль:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить заявку по ID
router.get('/challenges/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await DuelChallenge.findById(parseInt(id));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    // Получаем участников
    const participants = await DuelChallenge.getParticipants(parseInt(id));

    res.json({ 
      success: true, 
      challenge: {
        ...challenge,
        participants,
      }
    });
  } catch (err) {
    console.error('Ошибка получения заявки на дуэль:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отправить ответ
router.post('/challenges/:id/submit', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { flag } = req.body;

    if (!flag) {
      return res.status(400).json({ error: 'Требуется флаг' });
    }

    const result = await DuelChallenge.submitAnswer(parseInt(id), req.userId, flag);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Ошибка отправки ответа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отменить заявку
router.post('/challenges/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await DuelChallenge.findById(parseInt(id));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    if (challenge.challenger_id !== req.userId) {
      return res.status(403).json({ error: 'Вы можете отменить только свои заявки' });
    }

    const cancelled = await DuelChallenge.cancel(parseInt(id), req.userId);
    if (!cancelled) {
      return res.status(400).json({ error: 'Не удалось отменить заявку' });
    }

    // Возвращаем ставку
    await Balance.addCoins(req.userId, challenge.stake);

    res.json({ success: true, challenge: cancelled });
  } catch (err) {
    console.error('Ошибка отмены заявки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
