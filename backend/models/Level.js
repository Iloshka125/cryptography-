const pool = require('../config/database');

class Level {
  // Создать уровень
  static async create({ categoryId, name, description, task, taskFilePath, flag, orderIndex, difficulty, points, estimatedTime, isPaid, price }) {
    const query = `
      INSERT INTO levels (category_id, name, description, task, task_file_path, flag, order_index, difficulty, points, estimated_time, is_paid, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      categoryId,
      name,
      description || null,
      taskFilePath ? null : (task || null), // Если есть файл, task = null
      taskFilePath || null,
      flag || null,
      orderIndex || 0,
      difficulty || 'medium',
      points || 100,
      estimatedTime || '15 мин',
      isPaid === true || isPaid === 'true' ? true : false,
      (isPaid === true || isPaid === 'true') ? (parseInt(price) || 0) : 0,
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
  static async update(levelId, { name, description, task, taskFilePath, flag, orderIndex, difficulty, points, estimatedTime, isPaid, price }) {
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
    if (taskFilePath !== undefined) {
      // Если загружается файл (или очищается путь), обновляем task_file_path
      updates.push(`task_file_path = $${paramIndex++}`);
      values.push(taskFilePath || null);
      if (taskFilePath) {
        // Если устанавливается файл, очищаем текстовое задание
        updates.push(`task = NULL`);
      }
    }
    if (task !== undefined && taskFilePath === undefined) {
      // Обновляем task только если taskFilePath не передан
      updates.push(`task = $${paramIndex++}`);
      values.push(task);
      // Если task задан явно (не null), а taskFilePath не передан, очищаем файл
      if (task !== null) {
        updates.push(`task_file_path = NULL`);
      }
    }
    if (flag !== undefined) {
      updates.push(`flag = $${paramIndex++}`);
      values.push(flag);
    }
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(orderIndex);
    }
    if (difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex++}`);
      values.push(difficulty);
    }
    if (points !== undefined) {
      updates.push(`points = $${paramIndex++}`);
      values.push(points);
    }
    if (estimatedTime !== undefined) {
      updates.push(`estimated_time = $${paramIndex++}`);
      values.push(estimatedTime);
    }
    if (isPaid !== undefined) {
      updates.push(`is_paid = $${paramIndex++}`);
      values.push(isPaid);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(price);
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

