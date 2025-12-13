const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create({ nickname, email, phone, password }) {
    const password_hash = await bcrypt.hash(password, 12);
    const query = `
      INSERT INTO users (nickname, email, phone, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nickname, email, phone;
    `;
    const values = [nickname, email || null, phone || null, password_hash];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  static async findByEmailOrPhone(email, phone) {
    const query = 'SELECT * FROM users WHERE email = $1 OR phone = $2';
    const res = await pool.query(query, [email || null, phone || null]);
    return res.rows[0] || null;
  }

  static async exists({ nickname, email, phone }) {
    const query = `
      SELECT 1 FROM users
      WHERE nickname = $1 OR email = $2 OR phone = $3
    `;
    const res = await pool.query(query, [nickname, email || null, phone || null]);
    return res.rows.length > 0;
  }

  static async comparePassword(plainPassword, hash) {
    return await bcrypt.compare(plainPassword, hash);
  }

  // Получить профиль пользователя
  static async findById(userId) {
    const query = 'SELECT id, nickname, email, phone, avatar, level FROM users WHERE id = $1';
    const res = await pool.query(query, [userId]);
    return res.rows[0] || null;
  }

  // Обновить профиль пользователя
  static async updateProfile(userId, { nickname, email, phone, avatar }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`);
      values.push(nickname);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`);
      values.push(avatar);
    }

    if (updates.length === 0) {
      return await this.findById(userId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nickname, email, phone, avatar, level;
    `;
    
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  // Обновить пароль пользователя
  static async updatePassword(userId, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 12);
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id;
    `;
    const res = await pool.query(query, [password_hash, userId]);
    return res.rows[0] || null;
  }

  // Обновить уровень пользователя
  static async updateLevel(userId, level) {
    const query = `
      UPDATE users 
      SET level = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, level;
    `;
    const res = await pool.query(query, [level, userId]);
    return res.rows[0] || null;
  }
}

module.exports = User;