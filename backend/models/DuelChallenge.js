const pool = require('../config/database');
const DuelTask = require('./DuelTask');

class DuelChallenge {
  // Создать заявку на дуэль
  static async create({ challengerId, opponentId, duelCategoryId, difficulty, stake }) {
    // Устанавливаем время истечения заявки (5 минут от текущего времени)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const query = `
      INSERT INTO duel_challenges (challenger_id, opponent_id, duel_category_id, difficulty, stake, status, expires_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING *;
    `;
    const values = [
      challengerId,
      opponentId || null,
      duelCategoryId || null,
      difficulty || null,
      stake || 0,
      expiresAt,
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить заявку по ID
  static async findById(id) {
    const query = `
      SELECT 
        dc.*,
        u1.nickname as challenger_nickname,
        u1.avatar as challenger_avatar,
        u2.nickname as opponent_nickname,
        u2.avatar as opponent_avatar
      FROM duel_challenges dc
      LEFT JOIN users u1 ON dc.challenger_id = u1.id
      LEFT JOIN users u2 ON dc.opponent_id = u2.id
      WHERE dc.id = $1
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }

  // Получить все заявки (с фильтрами)
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT 
          dc.*,
          u1.nickname as challenger_nickname,
          u1.avatar as challenger_avatar,
          u2.nickname as opponent_nickname,
          u2.avatar as opponent_avatar
        FROM duel_challenges dc
        LEFT JOIN users u1 ON dc.challenger_id = u1.id
        LEFT JOIN users u2 ON dc.opponent_id = u2.id
        WHERE 1=1
      `;
      const values = [];
      let paramIndex = 1;

      if (filters.status) {
        query += ` AND dc.status = $${paramIndex++}`;
        values.push(filters.status);
      }

      if (filters.userId) {
        // Используем один параметр дважды для проверки userId в обоих полях
        query += ` AND (dc.challenger_id = $${paramIndex} OR dc.opponent_id = $${paramIndex})`;
        values.push(filters.userId);
        paramIndex++;
      }

      if (filters.opponentId === null) {
        query += ` AND dc.opponent_id IS NULL`; // Рандомные заявки
      }

      query += ' ORDER BY dc.created_at DESC';
      const res = await pool.query(query, values);
      return res.rows;
    } catch (err) {
      console.error('Ошибка в DuelChallenge.findAll:', err);
      console.error('Stack trace:', err.stack);
      throw err;
    }
  }

  // Принять заявку
  static async accept(challengeId, opponentId) {
    const challenge = await this.findById(challengeId);
    if (!challenge) {
      return null;
    }

    // Проверяем, что заявка еще не принята и соперник правильный
    if (challenge.status !== 'pending') {
      return null;
    }

    if (challenge.opponent_id && challenge.opponent_id !== opponentId) {
      return null; // Это не рандомная заявка и соперник не совпадает
    }

    // Обновляем заявку: устанавливаем соперника (если был NULL) и статус
    const query = `
      UPDATE duel_challenges
      SET opponent_id = COALESCE(opponent_id, $1),
          status = 'accepted',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'pending'
      RETURNING *;
    `;
    const res = await pool.query(query, [opponentId, challengeId]);
    
    if (res.rows.length === 0) {
      return null;
    }

    // Устанавливаем время старта (через 1 минуту после принятия)
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 1);
    
    await pool.query(
      'UPDATE duel_challenges SET started_at = $1, expires_at = NULL WHERE id = $2',
      [startTime, challengeId]
    );

    return await this.findById(challengeId);
  }

  // Начать дуэль (вызывается автоматически через 24 часа)
  static async start(challengeId) {
    const challenge = await this.findById(challengeId);
    if (!challenge || challenge.status !== 'accepted') {
      return null;
    }

    // Выбираем случайное задание по фильтрам
    const task = await DuelTask.findRandom({
      duelCategoryId: challenge.duel_category_id,
      difficulty: challenge.difficulty,
    });

    if (!task) {
      return null; // Нет подходящих заданий
    }

    // Обновляем заявку: устанавливаем задание и статус
    const query = `
      UPDATE duel_challenges
      SET task_id = $1,
          status = 'active',
          started_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [task.id, challengeId]);
    
    // Создаем записи участников
    await pool.query(
      'INSERT INTO duel_participants (challenge_id, user_id) VALUES ($1, $2), ($1, $3) ON CONFLICT DO NOTHING',
      [challengeId, challenge.challenger_id, challenge.opponent_id]
    );

    return await this.findById(challengeId);
  }

  // Отправить ответ
  static async submitAnswer(challengeId, userId, flag) {
    const challenge = await this.findById(challengeId);
    if (!challenge || challenge.status !== 'active') {
      return { success: false, error: 'Дуэль не активна' };
    }

    // Проверяем, что пользователь участвует
    const participant = await pool.query(
      'SELECT * FROM duel_participants WHERE challenge_id = $1 AND user_id = $2',
      [challengeId, userId]
    );

    if (participant.rows.length === 0) {
      return { success: false, error: 'Вы не участвуете в этой дуэли' };
    }

    // Проверяем, что ответ еще не отправлен
    if (participant.rows[0].submitted_flag) {
      return { success: false, error: 'Ответ уже отправлен' };
    }

    // Получаем задание
    const task = await DuelTask.findById(challenge.task_id);
    if (!task) {
      return { success: false, error: 'Задание не найдено' };
    }

    // Проверяем флаг
    const isCorrect = task.flag === flag;

    if (isCorrect) {
      // Обновляем участника: отмечаем как победителя
      await pool.query(
        `UPDATE duel_participants 
         SET submitted_flag = $1, submitted_at = CURRENT_TIMESTAMP, is_winner = TRUE
         WHERE challenge_id = $2 AND user_id = $3`,
        [flag, challengeId, userId]
      );

      // Обновляем заявку: отмечаем победителя и завершаем
      await pool.query(
        `UPDATE duel_challenges 
         SET winner_id = $1, status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [userId, challengeId]
      );

      // Начисляем приз (90% банка, 10% комиссия)
      const totalStake = challenge.stake * 2; // Ставки обоих участников
      const commission = Math.floor(totalStake * 0.1);
      const prize = totalStake - commission;

      const Balance = require('./Balance');
      await Balance.addCoins(userId, prize);

      // Обновляем участника: записываем полученный приз
      await pool.query(
        'UPDATE duel_participants SET prize_received = $1 WHERE challenge_id = $2 AND user_id = $3',
        [prize, challengeId, userId]
      );

      return { success: true, isWinner: true, prize };
    } else {
      // Неправильный ответ, просто сохраняем
      await pool.query(
        `UPDATE duel_participants 
         SET submitted_flag = $1, submitted_at = CURRENT_TIMESTAMP
         WHERE challenge_id = $2 AND user_id = $3`,
        [flag, challengeId, userId]
      );

      return { success: true, isWinner: false };
    }
  }

  // Получить прогресс участников
  static async getParticipants(challengeId) {
    const query = `
      SELECT 
        dp.*,
        u.nickname,
        u.avatar
      FROM duel_participants dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.challenge_id = $1
      ORDER BY dp.submitted_at ASC
    `;
    const res = await pool.query(query, [challengeId]);
    return res.rows;
  }

  // Отменить заявку (до начала дуэли)
  static async cancel(challengeId, userId) {
    const challenge = await this.findById(challengeId);
    if (!challenge) {
      return null;
    }

    // Проверяем, что пользователь является участником
    if (challenge.challenger_id !== userId && challenge.opponent_id !== userId) {
      return null; // Пользователь не является участником
    }

    // Можно отменить только до начала дуэли (pending или accepted, но не active)
    if (challenge.status === 'active' || challenge.status === 'completed' || challenge.status === 'cancelled') {
      return null; // Дуэль уже началась или завершена
    }

    const query = `
      UPDATE duel_challenges
      SET status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const res = await pool.query(query, [challengeId]);
    return res.rows[0] || null;
  }
}

module.exports = DuelChallenge;
