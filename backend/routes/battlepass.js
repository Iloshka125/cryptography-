const express = require('express');
const BattlePass = require('../models/BattlePass');
const UserBattlePass = require('../models/UserBattlePass');
const Balance = require('../models/Balance');
const router = express.Router();

// Получить все награды Battle Pass с информацией о полученных наградах пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.query.userId;
    const rewards = await BattlePass.findAll();
    
    let claimedRewardIds = [];
    if (userId) {
      claimedRewardIds = await UserBattlePass.getClaimedRewards(parseInt(userId));
    }
    
    // Добавляем информацию о том, получена ли награда
    const rewardsWithClaimed = rewards.map(reward => ({
      ...reward,
      claimed: claimedRewardIds.includes(reward.id),
    }));
    
    res.json({
      success: true,
      rewards: rewardsWithClaimed,
    });
  } catch (err) {
    console.error('Ошибка получения наград Battle Pass:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить награду (claim reward)
router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.user_id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется user_id' });
    }
    
    // Проверяем существование награды
    const reward = await BattlePass.findById(id);
    if (!reward) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }
    
    // Проверяем, не получена ли уже награда
    const isClaimed = await UserBattlePass.isRewardClaimed(parseInt(userId), parseInt(id));
    if (isClaimed) {
      return res.status(400).json({ error: 'Награда уже получена' });
    }
    
    // Отмечаем награду как полученную
    await UserBattlePass.claimReward(parseInt(userId), parseInt(id));
    
    // Парсим награду и извлекаем монеты
    const rewardText = reward.reward || '';
    const coinMatch = rewardText.match(/(\d+)\s*монет/i);
    let coinsToAdd = 0;
    
    if (coinMatch) {
      coinsToAdd = parseInt(coinMatch[1]);
    }
    
    // Зачисляем монеты на баланс, если они есть
    if (coinsToAdd > 0) {
      await Balance.addCoins(parseInt(userId), coinsToAdd);
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

