const pool = require('../config/database');

class Category {
  // Создать категорию
  static async create({ name, description, icon, color }) {
    const query = `
      INSERT INTO categories (name, description, icon, color)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, description || null, icon || '🔐', color || '#00ffff'];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все категории с уровнями
  static async findAll() {
    const query = `
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', l.id,
              'name', l.name,
              'description', l.description,
              'task', l.task,
              'flag', l.flag,
              'order_index', l.order_index
            ) ORDER BY l.order_index
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) as levels
      FROM categories c
      LEFT JOIN levels l ON c.id = l.category_id
      GROUP BY c.id
      ORDER BY c.id;
    `;
    const res = await pool.query(query);
    return res.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      levels: row.levels || [],
    }));
  }

  // Получить категорию по ID
  static async findById(categoryId) {
    const query = `
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', l.id,
              'name', l.name,
              'description', l.description,
              'task', l.task,
              'flag', l.flag,
              'order_index', l.order_index
            ) ORDER BY l.order_index
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) as levels
      FROM categories c
      LEFT JOIN levels l ON c.id = l.category_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const res = await pool.query(query, [categoryId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      levels: row.levels || [],
    };
  }

  // Обновить категорию
  static async update(categoryId, { name, description, icon, color }) {
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
      return await this.findById(categoryId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(categoryId);

    const query = `
      UPDATE categories 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Удалить категорию
  static async delete(categoryId) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [categoryId]);
    return res.rows[0] || null;
  }
}

module.exports = Category;

