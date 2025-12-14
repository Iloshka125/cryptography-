const pool = require('../config/database');

async function createBattlePassTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS battle_pass_rewards (
      id SERIAL PRIMARY KEY,
      level INTEGER NOT NULL UNIQUE,
      reward VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_battle_pass_level ON battle_pass_rewards(level);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблица battle_pass_rewards создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы battle_pass_rewards:', err.stack);
    process.exit(1);
  }
}

module.exports = createBattlePassTable;

