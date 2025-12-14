const pool = require('../config/database');

async function createUserBattlePassTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_battle_pass_rewards (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reward_id INTEGER NOT NULL REFERENCES battle_pass_rewards(id) ON DELETE CASCADE,
      claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, reward_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_battle_pass_user_id ON user_battle_pass_rewards(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_battle_pass_reward_id ON user_battle_pass_rewards(reward_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблица user_battle_pass_rewards создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы user_battle_pass_rewards:', err.stack);
    process.exit(1);
  }
}

module.exports = createUserBattlePassTable;

