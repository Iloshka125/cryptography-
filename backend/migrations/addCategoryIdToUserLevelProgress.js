const pool = require('../config/database');

async function addCategoryIdToUserLevelProgress() {
  const queries = [
    // Добавляем колонку category_id, если её нет
    `DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_level_progress' AND column_name='category_id') THEN
            ALTER TABLE user_level_progress ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;
        END IF;
    END
    $$;`,
    // Обновляем существующие записи: получаем category_id из таблицы levels
    `UPDATE user_level_progress ulp
     SET category_id = l.category_id
     FROM levels l
     WHERE ulp.level_id = l.id AND ulp.category_id IS NULL;`,
    // Теперь делаем колонку NOT NULL
    `DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_level_progress' AND column_name='category_id' AND is_nullable='YES') THEN
            ALTER TABLE user_level_progress ALTER COLUMN category_id SET NOT NULL;
        END IF;
    END
    $$;`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Поле category_id добавлено в таблицу user_level_progress');
  } catch (err) {
    console.error('❌ Ошибка добавления поля category_id:', err.stack);
    process.exit(1);
  }
}

module.exports = addCategoryIdToUserLevelProgress;

