const pool = require('../config/database');
const crypto = require('crypto');

class Competition {
  // Автоматически определить статус соревнования на основе дат
  static calculateStatus(startDate, endDate) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (!end) {
      return 'upcoming'; // Если нет даты окончания, считаем что скоро
    }
    
    if (now < start) {
      return 'upcoming'; // Еще не началось
    } else if (now >= start && now < end) {
      return 'active'; // Активно
    } else {
      return 'finished'; // Завершено
    }
  }
  // Создать соревнование
  static async create({ name, description, welcomeText, welcomeTitle, entryFee, startDate, endDate, status, initialConditions, prize, maxParticipants }) {
    const hash = crypto.randomBytes(32).toString('hex');
    const query = `
      INSERT INTO competitions (name, description, welcome_text, welcome_title, entry_fee, start_date, end_date, status, initial_conditions, prize, max_participants, hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      name,
      description || null,
      welcomeText || null,
      welcomeTitle || 'Приветствие',
      entryFee || 0,
      startDate || null,
      endDate,
      'upcoming', // Статус по умолчанию, будет переопределен автоматически
      initialConditions ? JSON.stringify(initialConditions) : '{}',
      prize || null,
      maxParticipants || null,
      hash,
    ];
    const res = await pool.query(query, values);
    const created = res.rows[0];
    // Автоматически определяем статус при создании
    const calculatedStatus = Competition.calculateStatus(created.start_date, created.end_date);
    return {
      ...created,
      status: calculatedStatus,
    };
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
    return res.rows.map(row => {
      const calculatedStatus = Competition.calculateStatus(row.start_date, row.end_date);
      return {
        ...row,
        status: calculatedStatus, // Переопределяем статус автоматически
        initial_conditions: typeof row.initial_conditions === 'string' 
          ? JSON.parse(row.initial_conditions) 
          : row.initial_conditions,
        participants_count: parseInt(row.participants_count) || 0,
      };
    });
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
    const calculatedStatus = Competition.calculateStatus(row.start_date, row.end_date);
    return {
      ...row,
      status: calculatedStatus, // Переопределяем статус автоматически
      initial_conditions: typeof row.initial_conditions === 'string' 
        ? JSON.parse(row.initial_conditions) 
        : row.initial_conditions,
      participants_count: parseInt(row.participants_count) || 0,
    };
  }

  // Получить соревнование по hash
  static async findByHash(hash) {
    const query = `
      SELECT 
        c.*,
        COUNT(uc.id) as participants_count
      FROM competitions c
      LEFT JOIN user_competitions uc ON c.id = uc.competition_id
      WHERE c.hash = $1
      GROUP BY c.id;
    `;
    const res = await pool.query(query, [hash]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const calculatedStatus = Competition.calculateStatus(row.start_date, row.end_date);
    return {
      ...row,
      status: calculatedStatus, // Переопределяем статус автоматически
      initial_conditions: typeof row.initial_conditions === 'string' 
        ? JSON.parse(row.initial_conditions) 
        : row.initial_conditions,
      participants_count: parseInt(row.participants_count) || 0,
    };
  }

  // Обновить соревнование
  static async update(id, { name, description, welcomeText, welcomeTitle, entryFee, startDate, endDate, status, initialConditions, prize, maxParticipants }) {
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
    if (welcomeTitle !== undefined) {
      updates.push(`welcome_title = $${paramIndex++}`);
      values.push(welcomeTitle);
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
    // Статус больше не обновляется вручную, он вычисляется автоматически
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
    const calculatedStatus = Competition.calculateStatus(row.start_date, row.end_date);
    return {
      ...row,
      status: calculatedStatus, // Переопределяем статус автоматически
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

  // Обновить соревнование по hash
  static async updateByHash(hash, data) {
    const competition = await this.findByHash(hash);
    if (!competition) return null;
    return await this.update(competition.id, data);
  }

  // Удалить соревнование по hash
  static async deleteByHash(hash) {
    const competition = await this.findByHash(hash);
    if (!competition) return null;
    return await this.delete(competition.id);
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
        uc.user_id,
        uc.competition_id,
        uc.current_experience as experience_gained,
        u.nickname,
        u.avatar
      FROM user_competitions uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.competition_id = $1
      ORDER BY uc.current_experience DESC, uc.joined_at ASC;
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

  // Начислить приз первому месту (если соревнование завершено и приз еще не начислен)
  static async awardPrizeToWinner(competitionId) {
    const competition = await this.findById(competitionId);
    if (!competition) {
      return null;
    }

    // Проверяем, что соревнование завершено
    const calculatedStatus = this.calculateStatus(competition.start_date, competition.end_date);
    if (calculatedStatus !== 'finished') {
      return null; // Соревнование еще не завершено
    }

    // Проверяем, что приз еще не начислен
    if (competition.prize_awarded) {
      return { alreadyAwarded: true };
    }

    // Проверяем, есть ли приз
    if (!competition.prize) {
      return null; // Нет приза для начисления
    }

    // Получаем участников, отсортированных по опыту
    const participants = await this.getParticipants(competitionId);
    if (participants.length === 0) {
      return null; // Нет участников
    }

    // Первый участник - победитель
    const winner = participants[0];
    
    // Парсим приз (может быть в формате "5000 монет" или просто число)
    const prizeMatch = competition.prize.match(/(\d+)/);
    if (!prizeMatch) {
      return null; // Не удалось распарсить приз
    }

    const prizeAmount = parseInt(prizeMatch[1]);
    if (isNaN(prizeAmount) || prizeAmount <= 0) {
      return null; // Некорректная сумма приза
    }

    // Начисляем приз победителю
    const Balance = require('./Balance');
    try {
      await Balance.addCoins(winner.user_id, prizeAmount);
      
      // Отмечаем, что приз начислен
      await pool.query(
        'UPDATE competitions SET prize_awarded = TRUE WHERE id = $1',
        [competitionId]
      );

      return {
        winnerId: winner.user_id,
        winnerNickname: winner.nickname,
        prizeAmount,
      };
    } catch (error) {
      console.error('Ошибка начисления приза:', error);
      return null;
    }
  }
}

module.exports = Competition;
