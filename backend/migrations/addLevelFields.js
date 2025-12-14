const pool = require('../config/database');

async function addLevelFields() {
  const queries = [
    // Добавляем поля difficulty, points, estimated_time в таблицу levels
    `ALTER TABLE levels 
     ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium',
     ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100,
     ADD COLUMN IF NOT EXISTS estimated_time VARCHAR(50) DEFAULT '15 мин';`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Поля difficulty, points, estimated_time добавлены в таблицу levels');
  } catch (err) {
    console.error('❌ Ошибка добавления полей в levels:', err.stack);
    process.exit(1);
  }
}

module.exports = addLevelFields;

