const pool = require('../config/database');

class Level {
  // Создать уровень
  static async create({ categoryId, name, description, task, flag, orderIndex }) {
    const query = `
      INSERT INTO levels (category_id, name, description, task, flag, order_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      categoryId,
      name,
      description || null,
      task || null,
      flag || null,
      orderIndex || 0,
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все уровни категории
  static async findByCategoryId(categoryId) {
    const query = `
      SELECT * FROM levels
      WHERE category_id = $1
      ORDER BY order_index, id;
    `;
    const res = await pool.query(query, [categoryId]);
    return res.rows;
  }

  // Получить уровень по ID
  static async findById(levelId) {
    const query = 'SELECT * FROM levels WHERE id = $1';
    const res = await pool.query(query, [levelId]);
    return res.rows[0] || null;
  }

  // Обновить уровень
  static async update(levelId, { name, description, task, flag, orderIndex }) {
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
    if (flag !== undefined) {
      updates.push(`flag = $${paramIndex++}`);
      values.push(flag);
    }
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(orderIndex);
    }

    if (updates.length === 0) {
      return await this.findById(levelId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(levelId);

    const query = `
      UPDATE levels 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Удалить уровень
  static async delete(levelId) {
    const query = 'DELETE FROM levels WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [levelId]);
    return res.rows[0] || null;
  }
}

module.exports = Level;

