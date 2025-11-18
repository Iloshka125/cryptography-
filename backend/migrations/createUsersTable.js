const pool = require('../config/database');

async function createUsersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nickname VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password_hash TEXT NOT NULL,
      CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблица "users" готова');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы:', err.stack);
    process.exit(1);
  }
}

module.exports = createUsersTable;