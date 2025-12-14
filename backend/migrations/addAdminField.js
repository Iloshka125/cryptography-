const pool = require('../config/database');

async function addAdminField() {
  const query = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
  `;

  try {
    await pool.query(query);
    console.log('✅ Поле is_admin добавлено в таблицу users');
  } catch (err) {
    console.error('❌ Ошибка добавления поля is_admin:', err.stack);
    process.exit(1);
  }
}

module.exports = addAdminField;

