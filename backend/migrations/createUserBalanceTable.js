const pool = require('../config/database');

async function createUserBalanceTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_balance (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
      hints INTEGER NOT NULL DEFAULT 0 CHECK (hints >= 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_balance_user_id ON user_balance(user_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблица "user_balance" готова');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы user_balance:', err.stack);
    process.exit(1);
  }
}

module.exports = createUserBalanceTable;

