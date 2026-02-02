const pool = require('../config/database');

class DuelCategory {
  // Создать категорию для дуэлей
  static async create({ name, description, icon, color }) {
    const query = `
      INSERT INTO duel_categories (name, description, icon, color)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      name,
      description || null,
      icon || null,
      color || '#00ffff',
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все категории
  static async findAll() {
    const query = 'SELECT * FROM duel_categories ORDER BY name';
    const res = await pool.query(query);
    return res.rows;
  }

  // Получить категорию по ID
  static async findById(id) {
    const query = 'SELECT * FROM duel_categories WHERE id = $1';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }

  // Обновить категорию
  static async update(id, { name, description, icon, color }) {
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
    if (icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(color);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE duel_categories 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Удалить категорию
  static async delete(id) {
    const query = 'DELETE FROM duel_categories WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }
}

module.exports = DuelCategory;
