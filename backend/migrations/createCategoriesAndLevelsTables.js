const pool = require('../config/database');

async function createCategoriesAndLevelsTables() {
  const queries = [
    // Таблица категорий
    `CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      icon VARCHAR(10) DEFAULT '🔐',
      color VARCHAR(20) DEFAULT '#00ffff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Таблица уровней
    `CREATE TABLE IF NOT EXISTS levels (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      task TEXT,
      flag VARCHAR(255),
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Индексы для быстрого поиска
    `CREATE INDEX IF NOT EXISTS idx_levels_category_id ON levels(category_id);`,
    `CREATE INDEX IF NOT EXISTS idx_levels_order ON levels(category_id, order_index);`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Таблицы categories и levels созданы');
  } catch (err) {
    console.error('❌ Ошибка создания таблиц categories и levels:', err.stack);
    process.exit(1);
  }
}

module.exports = createCategoriesAndLevelsTables;

