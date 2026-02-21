const express = require('express');
const Competition = require('../models/Competition');
const CompetitionLevel = require('../models/CompetitionLevel');
const User = require('../models/User');
const Balance = require('../models/Balance');
const requireSession = require('../middleware/requireSession');
const optionalSession = require('../middleware/requireSession').optionalSession;
const router = express.Router();

// Получить все соревнования (участие по сессии)
router.get('/', optionalSession, async (req, res) => {
  try {
    const userId = req.userId;
    const competitions = await Competition.findAll();
    // Также проверяем завершенные соревнования и начисляем призы
    const competitionsWithParticipation = await Promise.all(
      competitions.map(async (comp) => {
        // Если соревнование завершено, начисляем приз (если еще не начислен)
        if (comp.status === 'finished' && !comp.prize_awarded && comp.prize) {
          await Competition.awardPrizeToWinner(comp.id);
          // Перезагружаем данные соревнования
          const updated = await Competition.findById(comp.id);
          if (updated) {
            comp.prize_awarded = updated.prize_awarded;
          }
        }
        
        let isParticipating = false;
        if (userId) {
          isParticipating = await Competition.isUserParticipating(userId, comp.id);
        }
        
        // Для завершенных соревнований получаем победителя (первое место)
        let winner = null;
        if (comp.status === 'finished') {
          const participants = await Competition.getParticipants(comp.id);
          if (participants.length > 0) {
            winner = {
              nickname: participants[0].nickname,
              experienceGained: participants[0].experience_gained || 0,
            };
          }
        }
        
        return {
          ...comp,
          isParticipating,
          winner,
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

// Получить соревнование по hash (участие по сессии)
router.get('/:hash', optionalSession, async (req, res) => {
  try {
    const { hash } = req.params;
    const userId = req.userId;
    let competition = await Competition.findByHash(hash);
    if (!competition && !isNaN(parseInt(hash))) {
      competition = await Competition.findById(parseInt(hash));
    }

    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }

    let isParticipating = false;
    let userProgress = null;
    if (userId) {
      isParticipating = await Competition.isUserParticipating(userId, competition.id);
      if (isParticipating) {
        const participants = await Competition.getParticipants(competition.id);
        const userParticipant = participants.find(p => p.user_id === userId);
        if (userParticipant) {
          userProgress = {
            experienceGained: userParticipant.experience_gained || 0,
            currentExperience: userParticipant.current_experience || 0,
          };
        }
      }
    }
    
    const participants = await Competition.getParticipants(competition.id);
    
    // Если соревнование завершено, начисляем приз первому месту (если еще не начислен)
    if (competition.status === 'finished' && !competition.prize_awarded && competition.prize) {
      await Competition.awardPrizeToWinner(competition.id);
      // Перезагружаем соревнование, чтобы получить обновленный статус prize_awarded
      competition = await Competition.findByHash(hash);
      if (!competition && !isNaN(parseInt(hash))) {
        competition = await Competition.findById(parseInt(hash));
      }
    }
    
    // Получаем уровни соревнования (только если соревнование началось)
    const levels = competition.status !== 'upcoming' 
      ? await CompetitionLevel.findByCompetitionId(competition.id)
      : [];
    
    // Если пользователь участвует, получаем его прогресс
    let userLevelProgress = [];
    if (userId && isParticipating && competition.status !== 'upcoming') {
      userLevelProgress = await CompetitionLevel.getUserProgress(userId, competition.id);
    }
    
    res.json({
      success: true,
      competition: {
        ...competition,
        isParticipating,
        userProgress,
        levels: levels.map(level => {
          const userProgress = userLevelProgress.find(p => p.level_id === level.id);
          return {
            ...level,
            completed: !!userProgress,
            isFirstSolver: userProgress?.is_first_solver || false,
            experienceGained: userProgress?.experience_gained || 0,
          };
        }),
        participants: participants.map(p => ({
          userId: p.user_id,
          nickname: p.nickname,
          avatar: p.avatar,
          experienceGained: p.experience_gained || 0,
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
    const { name, description, welcomeText, welcomeTitle, entryFee, startDate, endDate, initialConditions, prize, maxParticipants } = req.body;
    
    if (!name || !endDate) {
      return res.status(400).json({ error: 'Требуется название и дата окончания' });
    }
    
    const competition = await Competition.create({
      name,
      description,
      welcomeText,
      welcomeTitle,
      entryFee: entryFee || 0,
              startDate,
              endDate,
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
router.put('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const { name, description, welcomeText, welcomeTitle, entryFee, startDate, endDate, initialConditions, prize, maxParticipants } = req.body;
    
    // Пробуем найти по hash, если не найдено - пробуем по ID (для обратной совместимости)
    let competition = await Competition.updateByHash(hash, {
      name,
      description,
      welcomeText,
      welcomeTitle,
      entryFee,
      startDate,
      endDate,
      initialConditions,
      prize,
      maxParticipants,
    });
    
    if (!competition && !isNaN(parseInt(hash))) {
      competition = await Competition.update(parseInt(hash), {
        name,
        description,
        welcomeText,
        welcomeTitle,
        entryFee,
      startDate,
      endDate,
      initialConditions,
      prize,
      maxParticipants,
    });
    }
    
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
router.delete('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    // Пробуем найти по hash, если не найдено - пробуем по ID (для обратной совместимости)
    let deleted = await Competition.deleteByHash(hash);
    
    if (!deleted && !isNaN(parseInt(hash))) {
      deleted = await Competition.delete(parseInt(hash));
    }
    
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

// Присоединиться к соревнованию (текущая сессия)
router.post('/:hash/join', requireSession, async (req, res) => {
  try {
    const { hash } = req.params;
    const userId = req.userId;

    let competition = await Competition.findByHash(hash);
    if (!competition && !isNaN(parseInt(hash))) {
      competition = await Competition.findById(parseInt(hash));
    }
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }

    if (competition.status !== 'active' && competition.status !== 'upcoming') {
      return res.status(400).json({ error: 'Соревнование не доступно для участия' });
    }

    const isParticipating = await Competition.isUserParticipating(userId, competition.id);
    if (isParticipating) {
      return res.status(400).json({ error: 'Вы уже участвуете в этом соревновании' });
    }

    if (competition.max_participants && competition.participants_count >= competition.max_participants) {
      return res.status(400).json({ error: 'Достигнуто максимальное количество участников' });
    }

    if (competition.entry_fee > 0) {
      const userBalance = await Balance.findByUserId(userId);
      if (!userBalance || (userBalance.coins || 0) < competition.entry_fee) {
        return res.status(400).json({ error: 'Недостаточно монет для участия' });
      }
      await Balance.subtractCoins(userId, competition.entry_fee);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const initialExperience = 0;
    const initialLevel = 1;
    await Competition.joinCompetition(userId, competition.id, initialExperience, initialLevel);
    const newBalance = await Balance.findByUserId(userId);
    
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
