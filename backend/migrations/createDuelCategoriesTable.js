const pool = require('../config/database');

async function createDuelCategoriesTable() {
  try {
    // Создаем таблицу категорий для дуэлей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS duel_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Добавляем поле duel_category_id в duel_tasks
    await pool.query(`
      ALTER TABLE duel_tasks 
      ADD COLUMN IF NOT EXISTS duel_category_id INTEGER REFERENCES duel_categories(id) ON DELETE SET NULL;
    `);

    // Добавляем поле duel_category_id в duel_challenges
    await pool.query(`
      ALTER TABLE duel_challenges 
      ADD COLUMN IF NOT EXISTS duel_category_id INTEGER REFERENCES duel_categories(id) ON DELETE SET NULL;
    `);

    // Удаляем старые связи с categories (но оставляем колонки для обратной совместимости)
    // category_id и level_id в duel_tasks больше не используются, но оставляем их для безопасности

    // Создаем индексы
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_duel_tasks_duel_category ON duel_tasks(duel_category_id);
      CREATE INDEX IF NOT EXISTS idx_duel_challenges_duel_category ON duel_challenges(duel_category_id);
    `);

    console.log('✅ Таблица категорий дуэлей создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы категорий дуэлей:', err.stack);
    throw err;
  }
}

module.exports = createDuelCategoriesTable;
