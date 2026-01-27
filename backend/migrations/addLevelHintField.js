const pool = require('../config/database');

async function addLevelHintField() {
  try {
    await pool.query(`
      ALTER TABLE levels
      ADD COLUMN IF NOT EXISTS hint TEXT;
    `);
    console.log('✅ Поле hint добавлено в таблицу levels');
  } catch (err) {
    console.error('❌ Ошибка добавления поля hint в levels:', err.stack);
    process.exit(1);
  }
}

module.exports = addLevelHintField;

