const pool = require('../config/database');

class DuelTask {
  // Создать задание для дуэли
  static async create({ duelCategoryId, name, description, task, taskFilePath, flag, difficulty, hint }) {
    const query = `
      INSERT INTO duel_tasks (duel_category_id, name, description, task, task_file_path, flag, difficulty, hint)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    // Убеждаемся, что null передается как NULL, а не как строка "null"
    const values = [
      (duelCategoryId && duelCategoryId !== 'null' && duelCategoryId !== '') ? parseInt(duelCategoryId) : null,
      name,
      description || null,
      task || null,
      taskFilePath || null,
      flag,
      difficulty || 'medium',
      hint || null,
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Получить все задания
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM duel_tasks WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.duelCategoryId) {
      query += ` AND duel_category_id = $${paramIndex++}`;
      values.push(filters.duelCategoryId);
    }

    if (filters.difficulty) {
      query += ` AND difficulty = $${paramIndex++}`;
      values.push(filters.difficulty);
    }

    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      values.push(filters.isActive);
    }

    query += ' ORDER BY created_at DESC';
    const res = await pool.query(query, values);
    return res.rows;
  }

  // Получить задание по ID
  static async findById(id) {
    const query = 'SELECT * FROM duel_tasks WHERE id = $1';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }

  // Получить случайное задание по фильтрам
  static async findRandom(filters = {}) {
    let query = 'SELECT * FROM duel_tasks WHERE is_active = TRUE';
    const values = [];
    let paramIndex = 1;

    if (filters.duelCategoryId) {
      query += ` AND (duel_category_id = $${paramIndex++} OR duel_category_id IS NULL)`;
      values.push(filters.duelCategoryId);
    }

    if (filters.difficulty) {
      query += ` AND (difficulty = $${paramIndex++} OR difficulty IS NULL)`;
      values.push(filters.difficulty);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Обновить задание
  static async update(id, { name, description, task, taskFilePath, flag, difficulty, timeLimit, points, hint, isActive }) {
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
    if (difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex++}`);
      values.push(difficulty);
    }
    if (timeLimit !== undefined) {
      updates.push(`time_limit = $${paramIndex++}`);
      values.push(timeLimit);
    }
    if (points !== undefined) {
      updates.push(`points = $${paramIndex++}`);
      values.push(points);
    }
    if (hint !== undefined) {
      updates.push(`hint = $${paramIndex++}`);
      values.push(hint);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE duel_tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Удалить задание
  static async delete(id) {
    const query = 'DELETE FROM duel_tasks WHERE id = $1 RETURNING id';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }
}

module.exports = DuelTask;
