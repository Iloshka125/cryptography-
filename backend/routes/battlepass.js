const express = require('express');
const BattlePass = require('../models/BattlePass');
const UserBattlePass = require('../models/UserBattlePass');
const Balance = require('../models/Balance');
const LevelExperienceRequirements = require('../models/LevelExperienceRequirements');
const User = require('../models/User');
const optionalSession = require('../middleware/requireSession').optionalSession;
const requireSession = require('../middleware/requireSession');
const router = express.Router();

// Получить все награды Battle Pass (прогресс по сессии)
router.get('/', optionalSession, async (req, res) => {
  try {
    const userId = req.userId;
    const rewards = await BattlePass.findAll();

    const levelRequirements = await LevelExperienceRequirements.getAll();
    const requirementsMap = {};
    levelRequirements.forEach(r => {
      requirementsMap[r.level_number] = r.experience_required;
    });

    let claimedRewardIds = [];
    let userExperience = 0;
    let userLevel = 1;

    if (userId) {
      claimedRewardIds = await UserBattlePass.getClaimedRewards(userId);
      const user = await User.findById(userId);
      if (user) {
        userExperience = user.experience || 0;
        userLevel = user.level || 1;
      }
    }
    
    // Добавляем информацию о том, получена ли награда и требования опыта
    const rewardsWithClaimed = rewards.map(reward => {
      const levelReq = requirementsMap[reward.level];
      const prevLevelReq = reward.level > 1 ? (requirementsMap[reward.level - 1] || 0) : 0;
      const experienceForLevel = levelReq ? (levelReq - prevLevelReq) : 0;
      const isUnlocked = userExperience >= (levelReq || 0);
      
      return {
        ...reward,
        claimed: claimedRewardIds.includes(reward.id),
        experienceRequired: levelReq || 0,
        experienceForLevel: experienceForLevel,
        unlocked: isUnlocked,
      };
    });
    
    // Определяем максимальный уровень и опыт для следующего уровня
    const maxRewardLevel = rewards.length > 0 ? Math.max(...rewards.map(r => r.level)) : 1;
    const nextLevelReq = requirementsMap[userLevel + 1] || 0;
    const currentLevelReq = requirementsMap[userLevel] || 0;
    const experienceForNextLevel = nextLevelReq - currentLevelReq;
    
    res.json({
      success: true,
      rewards: rewardsWithClaimed,
      userExperience,
      userLevel,
      maxLevel: maxRewardLevel,
      currentLevelExperience: currentLevelReq,
      nextLevelExperience: nextLevelReq,
      experienceForNextLevel: experienceForNextLevel,
    });
  } catch (err) {
    console.error('Ошибка получения наград Battle Pass:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить награду (текущая сессия)
router.post('/:id/claim', requireSession, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reward = await BattlePass.findById(id);
    if (!reward) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }

    const isClaimed = await UserBattlePass.isRewardClaimed(userId, parseInt(id));
    if (isClaimed) {
      return res.status(400).json({ error: 'Награда уже получена' });
    }

    await UserBattlePass.claimReward(userId, parseInt(id));

    const rewardText = reward.reward || '';
    const coinMatch = rewardText.match(/(\d+)\s*монет/i);
    let coinsToAdd = 0;
    if (coinMatch) {
      coinsToAdd = parseInt(coinMatch[1]);
    }
    if (coinsToAdd > 0) {
      await Balance.addCoins(userId, coinsToAdd);
    }
    
    res.json({
      success: true,
      message: 'Награда получена!',
      coinsAdded: coinsToAdd,
    });
  } catch (err) {
    console.error('Ошибка получения награды:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить награду по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await BattlePass.findById(id);
    
    if (!reward) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }
    
    res.json({
      success: true,
      reward,
    });
  } catch (err) {
    console.error('Ошибка получения награды:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать награду (только для админов)
router.post('/', async (req, res) => {
  try {
    const { level, reward } = req.body;
    
    if (!level || !reward) {
      return res.status(400).json({ error: 'Требуется уровень и награда' });
    }
    
    // Проверяем, нет ли уже награды на этом уровне
    const existing = await BattlePass.findByLevel(level);
    if (existing) {
      return res.status(409).json({ error: 'Награда на этом уровне уже существует' });
    }
    
    const battlePassReward = await BattlePass.create({
      level,
      reward,
    });
    
    res.status(201).json({
      success: true,
      reward: {
        id: battlePassReward.id,
        level: battlePassReward.level,
        reward: battlePassReward.reward,
      },
    });
  } catch (err) {
    console.error('Ошибка создания награды:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить награду (только для админов)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { level, reward } = req.body;
    
    // Если меняем уровень, проверяем уникальность
    if (level !== undefined) {
      const existing = await BattlePass.findByLevel(level);
      if (existing && existing.id !== parseInt(id)) {
        return res.status(409).json({ error: 'Награда на этом уровне уже существует' });
      }
    }
    
    const battlePassReward = await BattlePass.update(id, {
      level,
      reward,
    });
    
    if (!battlePassReward) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }
    
    res.json({
      success: true,
      reward: {
        id: battlePassReward.id,
        level: battlePassReward.level,
        reward: battlePassReward.reward,
      },
    });
  } catch (err) {
    console.error('Ошибка обновления награды:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить награду (только для админов)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await BattlePass.delete(id);
    
    if (!reward) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }
    
    res.json({
      success: true,
      message: 'Награда удалена',
    });
  } catch (err) {
    console.error('Ошибка удаления награды:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

