const pool = require('../config/database');

async function createSessionsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_hash VARCHAR(64) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)');
    console.log('✅ Таблица sessions создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы sessions:', err.stack);
    process.exit(1);
  }
}

module.exports = createSessionsTable;
