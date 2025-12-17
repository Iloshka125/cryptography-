const pool = require('../config/database');

async function addExperienceToUsers() {
  const queries = [
    `DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='experience') THEN
            ALTER TABLE users ADD COLUMN experience INTEGER DEFAULT 0;
        END IF;
    END
    $$;`,
    `DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='level') THEN
            ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
        END IF;
    END
    $$;`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Поля experience и level добавлены в таблицу users');
  } catch (err) {
    console.error('❌ Ошибка добавления полей experience и level:', err.stack);
    process.exit(1);
  }
}

module.exports = addExperienceToUsers;

