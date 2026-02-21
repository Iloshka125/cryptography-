const express = require('express');
const Leaderboard = require('../models/Leaderboard');
const optionalSession = require('../middleware/requireSession').optionalSession;
const router = express.Router();

// Получить лидерборд (позиция пользователя по сессии)
router.get('/', optionalSession, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 100;

    if (userId) {
      const result = await Leaderboard.getLeaderboardWithUser(userId, limit);
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

