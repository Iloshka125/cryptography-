const pool = require('../config/database');

class UserLevelProgress {
  // Отметить уровень как пройденный
  static async completeLevel(userId, levelId, categoryId, experienceGained) {
    const query = `
      INSERT INTO user_level_progress (user_id, level_id, category_id, experience_gained)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, level_id) DO UPDATE
      SET experience_gained = EXCLUDED.experience_gained,
          category_id = EXCLUDED.category_id,
          completed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, levelId, categoryId, experienceGained]);
    return res.rows[0];
  }

  // Проверить, пройден ли уровень
  static async isLevelCompleted(userId, levelId) {
    const query = `
      SELECT * FROM user_level_progress
      WHERE user_id = $1 AND level_id = $2;
    `;
    const res = await pool.query(query, [userId, levelId]);
    return res.rows.length > 0;
  }

  // Получить все пройденные уровни пользователя
  static async getCompletedLevels(userId) {
    const query = `
      SELECT level_id FROM user_level_progress
      WHERE user_id = $1;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(row => row.level_id);
  }

  // Получить общий опыт пользователя из пройденных уровней
  static async getUserTotalExperience(userId) {
    const query = `
      SELECT COALESCE(SUM(experience_gained), 0) as total_experience
      FROM user_level_progress
      WHERE user_id = $1;
    `;
    const res = await pool.query(query, [userId]);
    return parseInt(res.rows[0].total_experience) || 0;
  }
}

module.exports = UserLevelProgress;

