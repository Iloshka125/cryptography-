const express = require('express');
const path = require('path');
const fs = require('fs');
const Category = require('../models/Category');
const Level = require('../models/Level');
const UserLevelProgress = require('../models/UserLevelProgress');
const UserPurchasedLevels = require('../models/UserPurchasedLevels');
const User = require('../models/User');
const Balance = require('../models/Balance');
const upload = require('../config/upload');
const router = express.Router();

// Получить все категории с уровнями
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.query.userId;
    const categories = await Category.findAll();
    
    // Если передан user_id, добавляем информацию о пройденных и купленных уровнях
    let completedLevelIds = [];
    let purchasedLevelIds = [];
    if (userId) {
      completedLevelIds = await UserLevelProgress.getCompletedLevels(parseInt(userId));
      purchasedLevelIds = await UserPurchasedLevels.getPurchasedLevels(parseInt(userId));
    }
    
    // Добавляем информацию о пройденных уровнях и доступе (купленных/бесплатных)
    const categoriesWithProgress = categories.map(category => ({
      ...category,
      levels: (category.levels || []).map(level => ({
        ...level,
        completed: completedLevelIds.includes(level.id),
        purchased: purchasedLevelIds.includes(level.id) || !level.is_paid, // Бесплатные уровни считаются "купленными"
      })),
    }));
    
    res.json({
      success: true,
      categories: categoriesWithProgress,
    });
  } catch (err) {
    console.error('Ошибка получения категорий:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить уровень по ID (без флага для безопасности)
// ВАЖНО: этот маршрут должен быть перед /:id, иначе Express перехватит запрос как категорию
router.get('/levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.user_id || req.query.userId;
    const level = await Level.findById(id);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    // Не возвращаем флаг для безопасности
    const { flag, ...levelWithoutFlag } = level;
    
    // Проверяем, пройден ли уровень пользователем и куплен ли он
    let completed = false;
    let purchased = false;
    if (userId) {
      completed = await UserLevelProgress.isLevelCompleted(parseInt(userId), parseInt(id));
      purchased = await UserPurchasedLevels.isLevelPurchased(parseInt(userId), parseInt(id));
    }
    
    // Бесплатные уровни считаются "купленными"
    if (!levelWithoutFlag.is_paid) {
      purchased = true;
    }
    
    // Форматируем данные для фронтенда
    const formattedLevel = {
      id: levelWithoutFlag.id,
      categoryId: levelWithoutFlag.category_id,
      name: levelWithoutFlag.name,
      description: levelWithoutFlag.description,
      task: levelWithoutFlag.task,
      taskFilePath: levelWithoutFlag.task_file_path,
      orderIndex: levelWithoutFlag.order_index,
      difficulty: levelWithoutFlag.difficulty,
      points: levelWithoutFlag.points,
      estimatedTime: levelWithoutFlag.estimated_time,
      isPaid: levelWithoutFlag.is_paid || false,
      price: levelWithoutFlag.price || 0,
      completed,
      purchased,
    };
    
    res.json({
      success: true,
      level: formattedLevel,
    });
  } catch (err) {
    console.error('Ошибка получения уровня:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверить правильность флага уровня
router.post('/levels/:id/check', async (req, res) => {
  try {
    const { id } = req.params;
    const { flag, user_id } = req.body;
    
    if (!flag) {
      return res.status(400).json({ error: 'Требуется флаг' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'Требуется user_id' });
    }
    
    const level = await Level.findById(id);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }

    const userId = parseInt(user_id);
    const levelId = parseInt(id);

    // Проверяем, не пройден ли уже уровень
    const isAlreadyCompleted = await UserLevelProgress.isLevelCompleted(userId, levelId);
    
    if (isAlreadyCompleted) {
      return res.json({
        success: true,
        correct: true,
        alreadyCompleted: true,
        message: 'Этот уровень уже пройден!',
      });
    }
    
    // Сравниваем флаги (без учета регистра)
    const isCorrect = level.flag && 
      level.flag.trim().toUpperCase() === flag.trim().toUpperCase();
    
    // Если флаг правильный, отмечаем уровень как пройденный и начисляем опыт
    if (isCorrect) {
      // Начисляем опыт (используем points уровня)
      const experienceGained = level.points || 100;
      
      // Отмечаем уровень как пройденный (передаем category_id из уровня)
      await UserLevelProgress.completeLevel(userId, levelId, level.category_id, experienceGained);
      
      // Добавляем опыт пользователю и обновляем его уровень
      const updatedUser = await User.addExperience(userId, experienceGained);
      
      res.json({
        success: true,
        correct: true,
        alreadyCompleted: false,
        message: 'Правильный флаг! Уровень пройден!',
        experienceGained,
        newLevel: updatedUser.level,
        newExperience: updatedUser.experience,
      });
    } else {
      res.json({
        success: true,
        correct: false,
        alreadyCompleted: false,
        message: 'Неверный флаг. Попробуйте еще раз.',
      });
    }
  } catch (err) {
    console.error('Ошибка проверки флага:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить категорию по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json({
      success: true,
      category,
    });
  } catch (err) {
    console.error('Ошибка получения категории:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать категорию (только для админов)
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Требуется название категории' });
    }
    
    const category = await Category.create({ name, description, icon, color });
    
    res.status(201).json({
      success: true,
      category: {
        id: category.id.toString(),
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        levels: [],
      },
    });
  } catch (err) {
    console.error('Ошибка создания категории:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить категорию (только для админов)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;
    
    const category = await Category.update(id, { name, description, icon, color });
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json({
      success: true,
      category: {
        id: category.id.toString(),
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления категории:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить категорию (только для админов)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.delete(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json({
      success: true,
      message: 'Категория удалена',
    });
  } catch (err) {
    console.error('Ошибка удаления категории:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать уровень в категории (только для админов)
router.post('/:categoryId/levels', upload.single('taskFile'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, task, flag, orderIndex, difficulty, points, estimatedTime, isPaid, price } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Требуется название уровня' });
    }
    
    // Проверяем существование категории
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    // Обрабатываем загруженный файл
    let taskFilePath = null;
    if (req.file) {
      // Сохраняем относительный путь для БД
      taskFilePath = `uploads/tasks/${req.file.filename}`;
    }
    
    const level = await Level.create({
      categoryId: parseInt(categoryId),
      name,
      description,
      task: taskFilePath ? null : task, // Если есть файл, task = null
      taskFilePath,
      flag,
      orderIndex,
      difficulty,
      points,
      estimatedTime,
      isPaid: isPaid || false,
      price: isPaid ? (price || 0) : 0,
    });
    
    res.status(201).json({
      success: true,
      level: {
        id: level.id,
        categoryId: level.category_id,
        name: level.name,
        description: level.description,
        task: level.task,
        taskFilePath: level.task_file_path,
        flag: level.flag,
        orderIndex: level.order_index,
        difficulty: level.difficulty,
        points: level.points,
        estimatedTime: level.estimated_time,
        isPaid: level.is_paid,
        price: level.price,
      },
    });
  } catch (err) {
    console.error('Ошибка создания уровня:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить уровень (только для админов)
router.put('/levels/:id', upload.single('taskFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, task, flag, orderIndex, difficulty, points, estimatedTime, isPaid, price } = req.body;
    
    // Обрабатываем загруженный файл
    let taskFilePath = undefined;
    if (req.file) {
      // Получаем текущий уровень для удаления старого файла
      const currentLevel = await Level.findById(id);
      if (currentLevel && currentLevel.task_file_path) {
        const oldFilePath = path.join(__dirname, '..', currentLevel.task_file_path);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error('Ошибка удаления старого файла:', err);
        }
      }
      taskFilePath = `uploads/tasks/${req.file.filename}`;
    }
    
    const updateData = { name, description, task, taskFilePath, flag, orderIndex, difficulty, points, estimatedTime };
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid;
      updateData.price = isPaid ? (price || 0) : 0;
    } else if (price !== undefined) {
      updateData.price = price;
    }
    
    const level = await Level.update(id, updateData);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    res.json({
      success: true,
      level: {
        id: level.id,
        categoryId: level.category_id,
        name: level.name,
        description: level.description,
        task: level.task,
        taskFilePath: level.task_file_path,
        flag: level.flag,
        orderIndex: level.order_index,
        difficulty: level.difficulty,
        points: level.points,
        estimatedTime: level.estimated_time,
        isPaid: level.is_paid,
        price: level.price,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления уровня:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить уровень (только для админов)
router.delete('/levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const level = await Level.delete(id);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    res.json({
      success: true,
      message: 'Уровень удален',
    });
  } catch (err) {
    console.error('Ошибка удаления уровня:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Купить уровень
router.post('/levels/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'Требуется user_id' });
    }
    
    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    // Проверяем, что уровень платный
    if (!level.is_paid) {
      return res.status(400).json({ error: 'Этот уровень бесплатный' });
    }
    
    // Проверяем, не куплен ли уже уровень
    const isPurchased = await UserPurchasedLevels.isLevelPurchased(parseInt(user_id), parseInt(id));
    if (isPurchased) {
      return res.status(400).json({ error: 'Уровень уже куплен' });
    }
    
    // Проверяем баланс пользователя
    const user = await User.findById(parseInt(user_id));
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const price = level.price || 0;
    const userBalance = await Balance.findByUserId(parseInt(user_id));
    
    if ((userBalance?.coins || 0) < price) {
      return res.status(400).json({ error: 'Недостаточно монет' });
    }
    
    // Списываем монеты
    await Balance.subtractCoins(parseInt(user_id), price);
    
    // Записываем покупку
    await UserPurchasedLevels.purchaseLevel(parseInt(user_id), parseInt(id), price);
    
    // Получаем обновленный баланс
    const newBalance = await Balance.findByUserId(parseInt(user_id));
    
    res.json({
      success: true,
      message: 'Уровень успешно куплен',
      balance: newBalance,
    });
  } catch (err) {
    console.error('Ошибка покупки уровня:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Скачать файл задания уровня
router.get('/levels/:id/task-file', async (req, res) => {
  try {
    const { id } = req.params;
    const level = await Level.findById(id);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    if (!level.task_file_path) {
      return res.status(404).json({ error: 'Файл задания не найден' });
    }
    
    const filePath = path.join(__dirname, '..', level.task_file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден на сервере' });
    }
    
    res.download(filePath, `task-level-${id}.txt`);
  } catch (err) {
    console.error('Ошибка скачивания файла задания:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

