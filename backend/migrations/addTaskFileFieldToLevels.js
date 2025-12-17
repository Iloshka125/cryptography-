const pool = require('../config/database');

async function addTaskFileFieldToLevels() {
  try {
    console.log('Добавление поля task_file_path в таблицу levels...');
    
    await pool.query(`
      ALTER TABLE levels 
      ADD COLUMN IF NOT EXISTS task_file_path VARCHAR(500);
    `);
    
    console.log('✓ Поле task_file_path успешно добавлено в таблицу levels');
  } catch (err) {
    console.error('Ошибка при добавлении поля task_file_path:', err.message);
  }
}

module.exports = addTaskFileFieldToLevels;


