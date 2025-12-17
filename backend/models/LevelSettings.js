const pool = require('../config/database');

class LevelSettings {
  // Получить настройки уровней
  static async get() {
    const query = `SELECT experience_per_level FROM level_settings WHERE id = 1`;
    const res = await pool.query(query);
    if (res.rows.length === 0) {
      // Если записи нет, создаем со значением по умолчанию
      await this.set(100);
      return { experience_per_level: 100 };
    }
    return res.rows[0];
  }

  // Обновить настройки уровней
  static async set(experiencePerLevel) {
    const query = `
      INSERT INTO level_settings (id, experience_per_level, updated_at)
      VALUES (1, $1, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET experience_per_level = $1, updated_at = CURRENT_TIMESTAMP
      RETURNING experience_per_level;
    `;
    const res = await pool.query(query, [experiencePerLevel]);
    return res.rows[0];
  }

  // Вычислить уровень на основе опыта (статический метод для использования в других местах)
  static calculateLevel(experience, experiencePerLevel = null) {
    // Если значение не передано, используем значение по умолчанию (будет обновлено асинхронно)
    const xpPerLevel = experiencePerLevel || 100;
    return Math.floor((experience || 0) / xpPerLevel) + 1;
  }
}

module.exports = LevelSettings;

