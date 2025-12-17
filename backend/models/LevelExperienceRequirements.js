const pool = require('../config/database');

class LevelExperienceRequirements {
  // Получить все требования опыта для уровней
  static async getAll() {
    const query = `SELECT level_number, experience_required FROM level_experience_requirements ORDER BY level_number`;
    const res = await pool.query(query);
    return res.rows;
  }

  // Получить требование опыта для конкретного уровня
  static async getByLevel(levelNumber) {
    const query = `SELECT experience_required FROM level_experience_requirements WHERE level_number = $1`;
    const res = await pool.query(query, [levelNumber]);
    if (res.rows.length === 0) {
      // Если требования для уровня нет, создаем его с базовым значением
      const baseExperience = levelNumber * 100;
      await this.set(levelNumber, baseExperience);
      return { experience_required: baseExperience };
    }
    return res.rows[0];
  }

  // Установить требование опыта для уровня
  static async set(levelNumber, experienceRequired) {
    const query = `
      INSERT INTO level_experience_requirements (level_number, experience_required, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (level_number) 
      DO UPDATE SET experience_required = $2, updated_at = CURRENT_TIMESTAMP
      RETURNING level_number, experience_required;
    `;
    const res = await pool.query(query, [levelNumber, experienceRequired]);
    return res.rows[0];
  }

  // Удалить требование для уровня
  static async delete(levelNumber) {
    const query = `DELETE FROM level_experience_requirements WHERE level_number = $1 RETURNING level_number`;
    const res = await pool.query(query, [levelNumber]);
    return res.rows[0] || null;
  }

  // Вычислить уровень пользователя на основе опыта
  static async calculateLevel(experience) {
    const requirements = await this.getAll();
    if (requirements.length === 0) {
      // Если нет настроек, используем базовое значение
      return Math.floor((experience || 0) / 100) + 1;
    }

    // Сортируем требования по уровню
    requirements.sort((a, b) => a.level_number - b.level_number);

    // Находим максимальный уровень, который пользователь может достичь с данным опытом
    // experience_required - это кумулятивное значение (общий опыт для достижения уровня)
    let maxLevel = 1;
    
    for (const req of requirements) {
      if (experience >= req.experience_required) {
        // Если опыт больше или равен требованию, то пользователь достиг этого уровня
        maxLevel = req.level_number;
      } else {
        // Как только нашли первый уровень, который не достигнут, выходим
        break;
      }
    }
    
    // Если опыт больше всех требований, возвращаем максимальный уровень + 1
    const maxRequired = requirements[requirements.length - 1];
    if (experience >= maxRequired.experience_required) {
      return maxRequired.level_number;
    }

    return maxLevel;
  }

  // Получить требование опыта для следующего уровня (относительное)
  // Возвращает, сколько опыта нужно от текущего уровня до следующего
  static async getExperienceForNextLevel(currentLevel) {
    const currentReq = await this.getByLevel(currentLevel);
    const nextReq = await this.getByLevel(currentLevel + 1);
    return nextReq.experience_required - currentReq.experience_required;
  }
}

module.exports = LevelExperienceRequirements;

