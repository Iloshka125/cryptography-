const pool = require('../config/database');

class Leaderboard {
  // Получить топ пользователей по уровню и опыту
  static async getTopUsers(limit = 100) {
    const query = `
      SELECT 
        id,
        nickname,
        avatar,
        COALESCE(level, 1) as level,
        COALESCE(experience, 0) as experience
      FROM users
      ORDER BY COALESCE(level, 1) DESC, COALESCE(experience, 0) DESC, id ASC
      LIMIT $1;
    `;
    const res = await pool.query(query, [limit]);
    return res.rows;
  }

  // Получить позицию пользователя в рейтинге
  static async getUserRank(userId) {
    const query = `
      WITH ranked_users AS (
        SELECT 
          id,
          nickname,
          avatar,
          COALESCE(level, 1) as level,
          COALESCE(experience, 0) as experience,
          ROW_NUMBER() OVER (ORDER BY COALESCE(level, 1) DESC, COALESCE(experience, 0) DESC, id ASC) as rank
        FROM users
      )
      SELECT rank, level, experience
      FROM ranked_users
      WHERE id = $1;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows[0] || null;
  }

  // Получить лидерборд с позицией конкретного пользователя
  static async getLeaderboardWithUser(userId, limit = 100) {
    // Получаем топ пользователей
    const topUsers = await this.getTopUsers(limit);
    
    // Получаем позицию пользователя
    const userRank = await this.getUserRank(userId);
    
    // Находим индекс пользователя в топе
    const userIndex = topUsers.findIndex(u => u.id === userId);
    let userInTop = null;
    
    if (userIndex !== -1) {
      userInTop = {
        ...topUsers[userIndex],
        rank: userIndex + 1,
      };
    } else if (userRank) {
      // Пользователь не в топе, но получаем его данные
      const userQuery = `
        SELECT id, nickname, avatar, level, experience
        FROM users
        WHERE id = $1;
      `;
      const userRes = await pool.query(userQuery, [userId]);
      if (userRes.rows[0]) {
        userInTop = {
          ...userRes.rows[0],
          rank: userRank.rank,
        };
      }
    }
    
    return {
      topUsers: topUsers, // rank будет добавлен в роуте
      userRank: userInTop,
    };
  }
}

module.exports = Leaderboard;

