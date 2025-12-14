const express = require('express');
const Category = require('../models/Category');
const Level = require('../models/Level');
const router = express.Router();

// Получить все категории с уровнями
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      categories,
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
    const level = await Level.findById(id);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    // Не возвращаем флаг для безопасности
    const { flag, ...levelWithoutFlag } = level;
    
    // Преобразуем названия полей для фронтенда
    const formattedLevel = {
      id: level.id,
      categoryId: level.category_id,
      name: level.name,
      description: level.description,
      task: level.task,
      orderIndex: level.order_index,
      difficulty: level.difficulty,
      points: level.points,
      estimatedTime: level.estimated_time,
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
    const { flag } = req.body;
    
    if (!flag) {
      return res.status(400).json({ error: 'Требуется флаг' });
    }
    
    const level = await Level.findById(id);
    
    if (!level) {
      return res.status(404).json({ error: 'Уровень не найден' });
    }
    
    // Сравниваем флаги (без учета регистра)
    const isCorrect = level.flag && 
      level.flag.trim().toUpperCase() === flag.trim().toUpperCase();
    
    res.json({
      success: true,
      correct: isCorrect,
      message: isCorrect 
        ? 'Правильный флаг! Уровень пройден!' 
        : 'Неверный флаг. Попробуйте еще раз.',
    });
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
router.post('/:categoryId/levels', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, task, flag, orderIndex, difficulty, points, estimatedTime } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Требуется название уровня' });
    }
    
    // Проверяем существование категории
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    const level = await Level.create({
      categoryId: parseInt(categoryId),
      name,
      description,
      task,
      flag,
      orderIndex,
      difficulty,
      points,
      estimatedTime,
    });
    
    res.status(201).json({
      success: true,
      level: {
        id: level.id,
        categoryId: level.category_id,
        name: level.name,
        description: level.description,
        task: level.task,
        flag: level.flag,
        orderIndex: level.order_index,
        difficulty: level.difficulty,
        points: level.points,
        estimatedTime: level.estimated_time,
      },
    });
  } catch (err) {
    console.error('Ошибка создания уровня:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить уровень (только для админов)
router.put('/levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, task, flag, orderIndex, difficulty, points, estimatedTime } = req.body;
    
    const level = await Level.update(id, { name, description, task, flag, orderIndex, difficulty, points, estimatedTime });
    
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
        flag: level.flag,
        orderIndex: level.order_index,
        difficulty: level.difficulty,
        points: level.points,
        estimatedTime: level.estimated_time,
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

module.exports = router;

