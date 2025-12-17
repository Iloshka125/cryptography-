const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Создать пользователя
  static async create({ nickname, email, phone, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (nickname, email, phone, password_hash, experience, level)
      VALUES ($1, $2, $3, $4, 0, 1)
      RETURNING id, nickname, email, phone, avatar, level, experience, is_admin;
    `;
    const values = [nickname, email, phone, hashedPassword];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // Найти пользователя по email или phone
  static async findByEmailOrPhone(email, phone) {
    const query = `SELECT id, nickname, email, phone, password_hash, avatar, level, experience, is_admin FROM users WHERE email = $1 OR phone = $2`;
    const res = await pool.query(query, [email, phone]);
    return res.rows[0] || null;
  }

  // Найти пользователя по ID
  static async findById(id) {
    const query = `SELECT id, nickname, email, phone, password_hash, avatar, level, experience, is_admin FROM users WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  }

  // Проверить существование пользователя с указанными данными
  static async exists({ nickname, email, phone }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (nickname) {
      conditions.push(`nickname = $${paramIndex++}`);
      values.push(nickname);
    }
    if (email) {
      conditions.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (phone) {
      conditions.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (conditions.length === 0) {
      return false;
    }

    const query = `SELECT COUNT(*) as count FROM users WHERE ${conditions.join(' OR ')}`;
    const res = await pool.query(query, values);
    return parseInt(res.rows[0].count) > 0;
  }

  // Обновить опыт пользователя и пересчитать уровень
  static async addExperience(userId, experienceToAdd) {
    // Получаем текущего пользователя
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const newExperience = (user.experience || 0) + experienceToAdd;
    // Используем требования опыта для каждого уровня
    const LevelExperienceRequirements = require('./LevelExperienceRequirements');
    const newLevel = await LevelExperienceRequirements.calculateLevel(newExperience);

    const query = `
      UPDATE users
      SET experience = $1, level = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, nickname, email, phone, avatar, level, experience, is_admin;
    `;
    const res = await pool.query(query, [newExperience, newLevel, userId]);
    return res.rows[0];
  }

  // Вычислить уровень на основе опыта (устаревший метод, используется LevelSettings.calculateLevel)
  // Оставлен для обратной совместимости, но лучше использовать LevelSettings.calculateLevel
  static calculateLevel(experience) {
    // Используем значение по умолчанию 100, но рекомендуется использовать LevelSettings
    return Math.floor((experience || 0) / 100) + 1;
  }

  // Обновить профиль пользователя
  static async update(id, { nickname, avatar, email, phone }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`);
      values.push(nickname);
    }
    if (avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`);
      values.push(avatar);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nickname, email, phone, avatar, level, experience, is_admin;
    `;
    
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }
}

module.exports = User;
