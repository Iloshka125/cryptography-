const pool = require('../config/database');

class Competition {
  // Создать соревнование
  static async create({ name, description, welcomeText, entryFee, startDate, endDate, status, initialConditions, prize, maxParticipants }) {
    const query = `
      INSERT INTO competitions (name, description, welcome_text, entry_fee, start_date, end_date, status, initial_conditions, prize, max_participants)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      name,
      description || null,
      welcomeText || null,
      entryFee || 0,
      startDate || null,
      endDate,
      status || 'upcoming',
      initialConditions ? JSON.stringify(initialConditions) : '{}',
      prize || null,
      maxParticipants || null,
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все соревнования
  static async findAll() {
    const query = `
      SELECT 
        c.*,
        COUNT(uc.id) as participants_count
      FROM competitions c
      LEFT JOIN user_competitions uc ON c.id = uc.competition_id
      GROUP BY c.id
      ORDER BY c.created_at DESC;
    `;
    const res = await pool.query(query);
    return res.rows.map(row => ({
      ...row,
      initial_conditions: typeof row.initial_conditions === 'string' 
        ? JSON.parse(row.initial_conditions) 
        : row.initial_conditions,
      participants_count: parseInt(row.participants_count) || 0,
    }));
  }

  // Получить соревнование по ID
  static async findById(id) {
    const query = `
      SELECT 
        c.*,
        COUNT(uc.id) as participants_count
      FROM competitions c
      LEFT JOIN user_competitions uc ON c.id = uc.competition_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const res = await pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      initial_conditions: typeof row.initial_conditions === 'string' 
        ? JSON.parse(row.initial_conditions) 
        : row.initial_conditions,
      participants_count: parseInt(row.participants_count) || 0,
    };
  }

  // Обновить соревнование
  static async update(id, { name, description, welcomeText, entryFee, startDate, endDate, status, initialConditions, prize, maxParticipants }) {
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
    if (welcomeText !== undefined) {
      updates.push(`welcome_text = $${paramIndex++}`);
      values.push(welcomeText);
    }
    if (entryFee !== undefined) {
      updates.push(`entry_fee = $${paramIndex++}`);
      values.push(entryFee);
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(endDate);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (initialConditions !== undefined) {
      updates.push(`initial_conditions = $${paramIndex++}`);
      values.push(JSON.stringify(initialConditions));
    }
    if (prize !== undefined) {
      updates.push(`prize = $${paramIndex++}`);
      values.push(prize);
    }
    if (maxParticipants !== undefined) {
      updates.push(`max_participants = $${paramIndex++}`);
      values.push(maxParticipants);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE competitions 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    
    const res = await pool.query(query, values);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      initial_conditions: typeof row.initial_conditions === 'string' 
        ? JSON.parse(row.initial_conditions) 
        : row.initial_conditions,
    };
  }

  // Удалить соревнование
  static async delete(id) {
    const query = 'DELETE FROM competitions WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }

  // Присоединить пользователя к соревнованию
  static async joinCompetition(userId, competitionId, initialExperience, initialLevel) {
    const query = `
      INSERT INTO user_competitions (user_id, competition_id, initial_experience, initial_level, current_experience, current_level)
      VALUES ($1, $2, $3, $4, $3, $4)
      ON CONFLICT (user_id, competition_id) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, competitionId, initialExperience || 0, initialLevel || 1]);
    return res.rows[0] || null;
  }

  // Проверить, участвует ли пользователь в соревновании
  static async isUserParticipating(userId, competitionId) {
    const query = 'SELECT * FROM user_competitions WHERE user_id = $1 AND competition_id = $2';
    const res = await pool.query(query, [userId, competitionId]);
    return res.rows.length > 0;
  }

  // Получить участников соревнования
  static async getParticipants(competitionId) {
    const query = `
      SELECT 
        uc.*,
        u.nickname,
        u.avatar,
        (uc.current_experience - uc.initial_experience) as experience_gained
      FROM user_competitions uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.competition_id = $1
      ORDER BY experience_gained DESC, uc.joined_at ASC;
    `;
    const res = await pool.query(query, [competitionId]);
    return res.rows;
  }

  // Обновить прогресс пользователя в соревновании
  static async updateUserProgress(userId, competitionId, currentExperience, currentLevel) {
    const query = `
      UPDATE user_competitions
      SET current_experience = $3, current_level = $4
      WHERE user_id = $1 AND competition_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, competitionId, currentExperience, currentLevel]);
    return res.rows[0] || null;
  }
}

module.exports = Competition;
