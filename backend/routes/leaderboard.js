const express = require('express');
const Leaderboard = require('../models/Leaderboard');
const router = express.Router();

// Получить лидерборд
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.query.userId;
    const limit = parseInt(req.query.limit) || 100;
    
    if (userId) {
      // Если передан user_id, возвращаем лидерборд с позицией пользователя
      const result = await Leaderboard.getLeaderboardWithUser(parseInt(userId), limit);
      const leaderboardWithRanks = result.topUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
      
      res.json({
        success: true,
        leaderboard: leaderboardWithRanks,
        userRank: result.userRank,
      });
    } else {
      // Иначе просто возвращаем топ пользователей
      const topUsers = await Leaderboard.getTopUsers(limit);
      res.json({
        success: true,
        leaderboard: topUsers.map((user, index) => ({
          ...user,
          rank: index + 1,
        })),
      });
    }
  } catch (err) {
    console.error('Ошибка получения лидерборда:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

