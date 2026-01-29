const pool = require('../config/database');
const crypto = require('crypto');

class CompetitionLevel {
  // Создать уровень соревнования
  static async create({ competitionId, name, description, task, taskFilePath, flag, orderIndex, points, hint }) {
    const hash = crypto.randomBytes(32).toString('hex');
    const query = `
      INSERT INTO competition_levels (competition_id, name, description, task, task_file_path, flag, order_index, points, hint, hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      competitionId,
      name,
      description || null,
      task || null,
      taskFilePath || null,
      flag,
      orderIndex || 0,
      points || 100,
      hint || null,
      hash,
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все уровни соревнования
  static async findByCompetitionId(competitionId) {
    const query = `
      SELECT * FROM competition_levels
      WHERE competition_id = $1
      ORDER BY order_index, id;
    `;
    const res = await pool.query(query, [competitionId]);
    return res.rows;
  }

  // Получить уровень по ID
  static async findById(levelId) {
    const query = 'SELECT * FROM competition_levels WHERE id = $1';
    const res = await pool.query(query, [levelId]);
    return res.rows[0] || null;
  }

  // Получить уровень по hash
  static async findByHash(hash) {
    const query = 'SELECT * FROM competition_levels WHERE hash = $1';
    const res = await pool.query(query, [hash]);
    return res.rows[0] || null;
  }

  // Обновить уровень
  static async update(levelId, { name, description, task, taskFilePath, flag, orderIndex, points, hint }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (task !== undefined) {
      updates.push(`task = $${paramIndex++}`);
      values.push(task);
    }
    if (taskFilePath !== undefined) {
      updates.push(`task_file_path = $${paramIndex++}`);
      values.push(taskFilePath);
    }
    if (flag !== undefined) {
      updates.push(`flag = $${paramIndex++}`);
      values.push(flag);
    }
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(orderIndex);
    }
    if (points !== undefined) {
      updates.push(`points = $${paramIndex++}`);
      values.push(points);
    }
    if (hint !== undefined) {
      updates.push(`hint = $${paramIndex++}`);
      values.push(hint);
    }

    if (updates.length === 0) {
      return await this.findById(levelId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(levelId);

    const query = `
      UPDATE competition_levels 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Удалить уровень
  static async delete(levelId) {
    const query = 'DELETE FROM competition_levels WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [levelId]);
    return res.rows[0] || null;
  }

  // Проверить, решен ли уровень пользователем
  static async isLevelCompleted(userId, competitionId, levelId) {
    const query = `
      SELECT * FROM user_competition_level_progress
      WHERE user_id = $1 AND competition_id = $2 AND level_id = $3
    `;
    const res = await pool.query(query, [userId, competitionId, levelId]);
    return res.rows.length > 0;
  }

  // Получить прогресс пользователя в соревновании
  static async getUserProgress(userId, competitionId) {
    const query = `
      SELECT 
        uclp.*,
        cl.name as level_name,
        cl.points as level_points
      FROM user_competition_level_progress uclp
      JOIN competition_levels cl ON uclp.level_id = cl.id
      WHERE uclp.user_id = $1 AND uclp.competition_id = $2
      ORDER BY uclp.completed_at ASC;
    `;
    const res = await pool.query(query, [userId, competitionId]);
    return res.rows;
  }

  // Получить общий опыт пользователя в соревновании
  static async getUserTotalExperience(userId, competitionId) {
    const query = `
      SELECT COALESCE(SUM(experience_gained), 0) as total_experience
      FROM user_competition_level_progress
      WHERE user_id = $1 AND competition_id = $2
    `;
    const res = await pool.query(query, [userId, competitionId]);
    return parseInt(res.rows[0]?.total_experience || 0);
  }

  // Проверить, был ли уровень уже решен кем-то
  static async isFirstSolverAvailable(competitionId, levelId) {
    const query = `
      SELECT COUNT(*) as count
      FROM user_competition_level_progress
      WHERE competition_id = $1 AND level_id = $2 AND is_first_solver = TRUE
    `;
    const res = await pool.query(query, [competitionId, levelId]);
    return parseInt(res.rows[0]?.count || 0) === 0;
  }

  // Записать решение уровня
  static async completeLevel(userId, competitionId, levelId, experienceGained, isFirstSolver) {
    const query = `
      INSERT INTO user_competition_level_progress (user_id, competition_id, level_id, experience_gained, is_first_solver)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, competition_id, level_id) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, competitionId, levelId, experienceGained, isFirstSolver]);
    return res.rows[0] || null;
  }

  // Обновить опыт пользователя в соревновании
  static async updateUserCompetitionExperience(userId, competitionId, totalExperience) {
    const query = `
      UPDATE user_competitions
      SET current_experience = $3
      WHERE user_id = $1 AND competition_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, competitionId, totalExperience]);
    return res.rows[0] || null;
  }
}

module.exports = CompetitionLevel;
