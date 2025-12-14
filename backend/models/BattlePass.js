const pool = require('../config/database');

class BattlePass {
  // Создать награду
  static async create({ level, reward }) {
    const query = `
      INSERT INTO battle_pass_rewards (level, reward)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [level, reward];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все награды, отсортированные по уровню
  static async findAll() {
    const query = `
      SELECT * FROM battle_pass_rewards
      ORDER BY level ASC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  // Получить награду по ID
  static async findById(id) {
    const query = 'SELECT * FROM battle_pass_rewards WHERE id = $1';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }

  // Получить награду по уровню
  static async findByLevel(level) {
    const query = 'SELECT * FROM battle_pass_rewards WHERE level = $1';
    const res = await pool.query(query, [level]);
    return res.rows[0] || null;
  }

  // Обновить награду
  static async update(id, { level, reward }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      values.push(level);
    }
    if (reward !== undefined) {
      updates.push(`reward = $${paramIndex++}`);
      values.push(reward);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE battle_pass_rewards 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Удалить награду
  static async delete(id) {
    const query = 'DELETE FROM battle_pass_rewards WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }
}

module.exports = BattlePass;

