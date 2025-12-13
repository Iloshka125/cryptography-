const pool = require('../config/database');

async function addProfileFields() {
  const queries = [
    // Добавляем поля в таблицу users
    `ALTER TABLE users 
     ADD COLUMN IF NOT EXISTS avatar VARCHAR(10) DEFAULT '🎯',
     ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level >= 1),
     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,
    
    // Создаем таблицу для достижений
    `CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id INTEGER NOT NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id)
    );`,
    
    // Создаем индекс для быстрого поиска достижений пользователя
    `CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Поля профиля добавлены');
  } catch (err) {
    console.error('❌ Ошибка добавления полей профиля:', err.stack);
    process.exit(1);
  }
}

module.exports = addProfileFields;

