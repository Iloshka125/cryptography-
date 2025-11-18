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
}

module.exports = User;