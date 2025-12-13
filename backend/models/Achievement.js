const pool = require('../config/database');

class Achievement {
  // Получить все достижения пользователя
  static async findByUserId(userId) {
    const query = `
      SELECT 
        ua.achievement_id,
        ua.unlocked_at,
        CASE WHEN ua.achievement_id IS NOT NULL THEN true ELSE false END as unlocked
      FROM (
        SELECT 1 as achievement_id UNION ALL
        SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
      ) a
      LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id AND ua.user_id = $1
      ORDER BY a.achievement_id;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  }

  // Разблокировать достижение
  static async unlock(userId, achievementId) {
    const query = `
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, achievement_id) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, achievementId]);
    return res.rows[0] || null;
  }

  // Проверить, разблокировано ли достижение
  static async isUnlocked(userId, achievementId) {
    const query = `
      SELECT 1 FROM user_achievements 
      WHERE user_id = $1 AND achievement_id = $2;
    `;
    const res = await pool.query(query, [userId, achievementId]);
    return res.rows.length > 0;
  }
}

module.exports = Achievement;

