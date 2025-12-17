const pool = require('../config/database');

async function createUserLevelProgressTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_level_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      experience_gained INTEGER NOT NULL,
      UNIQUE(user_id, level_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_level_progress_user_id ON user_level_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_level_progress_level_id ON user_level_progress(level_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблица user_level_progress создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы user_level_progress:', err.stack);
    process.exit(1);
  }
}

module.exports = createUserLevelProgressTable;

