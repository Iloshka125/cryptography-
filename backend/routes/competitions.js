const express = require('express');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Balance = require('../models/Balance');
const router = express.Router();

// Получить все соревнования
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const competitions = await Competition.findAll();
    
    // Если передан user_id, добавляем информацию об участии
    const competitionsWithParticipation = await Promise.all(
      competitions.map(async (comp) => {
        let isParticipating = false;
        if (userId) {
          isParticipating = await Competition.isUserParticipating(parseInt(userId), comp.id);
        }
        return {
          ...comp,
          isParticipating,
        };
      })
    );
    
    res.json({
      success: true,
      competitions: competitionsWithParticipation,
    });
  } catch (err) {
    console.error('Ошибка получения соревнований:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить соревнование по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.user_id;
    const competition = await Competition.findById(id);
    
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }
    
    let isParticipating = false;
    let userProgress = null;
    if (userId) {
      isParticipating = await Competition.isUserParticipating(parseInt(userId), parseInt(id));
      if (isParticipating) {
        const participants = await Competition.getParticipants(parseInt(id));
        const userParticipant = participants.find(p => p.user_id === parseInt(userId));
        if (userParticipant) {
          userProgress = {
            experienceGained: userParticipant.experience_gained,
            currentExperience: userParticipant.current_experience,
            currentLevel: userParticipant.current_level,
          };
        }
      }
    }
    
    const participants = await Competition.getParticipants(parseInt(id));
    
    res.json({
      success: true,
      competition: {
        ...competition,
        isParticipating,
        userProgress,
        participants: participants.map(p => ({
          userId: p.user_id,
          nickname: p.nickname,
          avatar: p.avatar,
          experienceGained: p.experience_gained,
          currentLevel: p.current_level,
        })),
      },
    });
  } catch (err) {
    console.error('Ошибка получения соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать соревнование (только админ)
router.post('/', async (req, res) => {
  try {
    const { name, description, welcomeText, entryFee, startDate, endDate, status, initialConditions, prize, maxParticipants } = req.body;
    
    if (!name || !endDate) {
      return res.status(400).json({ error: 'Требуется название и дата окончания' });
    }
    
    const competition = await Competition.create({
      name,
      description,
      welcomeText,
      entryFee: entryFee || 0,
      startDate,
      endDate,
      status: status || 'upcoming',
      initialConditions: initialConditions || {},
      prize,
      maxParticipants,
    });
    
    res.status(201).json({
      success: true,
      competition,
    });
  } catch (err) {
    console.error('Ошибка создания соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить соревнование (только админ)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, welcomeText, entryFee, startDate, endDate, status, initialConditions, prize, maxParticipants } = req.body;
    
    const competition = await Competition.update(id, {
      name,
      description,
      welcomeText,
      entryFee,
      startDate,
      endDate,
      status,
      initialConditions,
      prize,
      maxParticipants,
    });
    
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }
    
    res.json({
      success: true,
      competition,
    });
  } catch (err) {
    console.error('Ошибка обновления соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить соревнование (только админ)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Competition.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }
    
    res.json({
      success: true,
      message: 'Соревнование удалено',
    });
  } catch (err) {
    console.error('Ошибка удаления соревнования:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Присоединиться к соревнованию
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'Требуется user_id' });
    }
    
    const competition = await Competition.findById(id);
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }
    
    // Проверяем статус соревнования
    if (competition.status !== 'active' && competition.status !== 'upcoming') {
      return res.status(400).json({ error: 'Соревнование не доступно для участия' });
    }
    
    // Проверяем, не участвует ли уже пользователь
    const isParticipating = await Competition.isUserParticipating(parseInt(user_id), parseInt(id));
    if (isParticipating) {
      return res.status(400).json({ error: 'Вы уже участвуете в этом соревновании' });
    }
    
    // Проверяем максимальное количество участников
    if (competition.max_participants && competition.participants_count >= competition.max_participants) {
      return res.status(400).json({ error: 'Достигнуто максимальное количество участников' });
    }
    
    // Проверяем и списываем плату за вход
    if (competition.entry_fee > 0) {
      const userBalance = await Balance.findByUserId(parseInt(user_id));
      if (!userBalance || (userBalance.coins || 0) < competition.entry_fee) {
        return res.status(400).json({ error: 'Недостаточно монет для участия' });
      }
      await Balance.subtractCoins(parseInt(user_id), competition.entry_fee);
    }
    
    // Получаем текущие данные пользователя
    const user = await User.findById(parseInt(user_id));
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Применяем начальные условия, если они есть
    let initialExperience = user.experience || 0;
    let initialLevel = user.level || 1;
    
    if (competition.initial_conditions) {
      if (competition.initial_conditions.resetExperience !== undefined && competition.initial_conditions.resetExperience) {
        initialExperience = 0;
        initialLevel = 1;
      }
      if (competition.initial_conditions.startingExperience !== undefined) {
        initialExperience = competition.initial_conditions.startingExperience;
      }
      if (competition.initial_conditions.startingLevel !== undefined) {
        initialLevel = competition.initial_conditions.startingLevel;
      }
    }
    
    // Присоединяем пользователя
    await Competition.joinCompetition(parseInt(user_id), parseInt(id), initialExperience, initialLevel);
    
    // Получаем обновленный баланс
    const newBalance = await Balance.findByUserId(parseInt(user_id));
    
    res.json({
      success: true,
      message: 'Вы успешно присоединились к соревнованию!',
      balance: newBalance,
    });
  } catch (err) {
    console.error('Ошибка присоединения к соревнованию:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
