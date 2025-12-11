const pool = require('../config/database');

class Balance {
  // Создать баланс для пользователя
  static async create(userId, coins = 0, hints = 0) {
    const query = `
      INSERT INTO user_balance (user_id, coins, hints)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *;
    `;
    const values = [userId, coins, hints];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить баланс пользователя
  static async findByUserId(userId) {
    const query = 'SELECT * FROM user_balance WHERE user_id = $1';
    const res = await pool.query(query, [userId]);
    
    // Если баланса нет, создаем его с дефолтными значениями
    if (res.rows.length === 0) {
      return await this.create(userId);
    }
    
    return res.rows[0];
  }

  // Обновить баланс монет
  static async updateCoins(userId, coins) {
    const query = `
      UPDATE user_balance 
      SET coins = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [coins, userId]);
    return res.rows[0];
  }

  // Обновить баланс подсказок
  static async updateHints(userId, hints) {
    const query = `
      UPDATE user_balance 
      SET hints = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [hints, userId]);
    return res.rows[0];
  }

  // Обновить оба баланса
  static async update(userId, coins, hints) {
    const query = `
      UPDATE user_balance 
      SET coins = $1, hints = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING *;
    `;
    const res = await pool.query(query, [coins, hints, userId]);
    return res.rows[0];
  }

  // Добавить монеты (увеличить баланс)
  static async addCoins(userId, amount) {
    const balance = await this.findByUserId(userId);
    const newCoins = balance.coins + amount;
    return await this.updateCoins(userId, newCoins);
  }

  // Вычесть монеты (уменьшить баланс)
  static async subtractCoins(userId, amount) {
    const balance = await this.findByUserId(userId);
    if (balance.coins < amount) {
      throw new Error('Недостаточно монет');
    }
    const newCoins = balance.coins - amount;
    return await this.updateCoins(userId, newCoins);
  }

  // Добавить подсказки
  static async addHints(userId, amount) {
    const balance = await this.findByUserId(userId);
    const newHints = balance.hints + amount;
    return await this.updateHints(userId, newHints);
  }

  // Вычесть подсказки
  static async subtractHints(userId, amount) {
    const balance = await this.findByUserId(userId);
    if (balance.hints < amount) {
      throw new Error('Недостаточно подсказок');
    }
    const newHints = balance.hints - amount;
    return await this.updateHints(userId, newHints);
  }
}

module.exports = Balance;

