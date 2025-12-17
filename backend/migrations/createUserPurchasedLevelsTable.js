const pool = require('../config/database');

async function createUserPurchasedLevelsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_purchased_levels (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
      purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      price_paid INTEGER NOT NULL,
      UNIQUE(user_id, level_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_purchased_levels_user_id ON user_purchased_levels(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_purchased_levels_level_id ON user_purchased_levels(level_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблица user_purchased_levels создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы user_purchased_levels:', err.stack);
    process.exit(1);
  }
}

module.exports = createUserPurchasedLevelsTable;

