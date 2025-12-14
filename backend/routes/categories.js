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
    const { name, description, task, flag, orderIndex } = req.body;
    
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
    const { name, description, task, flag, orderIndex } = req.body;
    
    const level = await Level.update(id, { name, description, task, flag, orderIndex });
    
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

