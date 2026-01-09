const pool = require('../config/database');

async function normalizeEmptyPhoneAndEmail() {
  try {
    // Обновляем пустые строки на NULL для phone
    await pool.query(`
      UPDATE users
      SET phone = NULL
      WHERE phone = '';
    `);
    
    // Обновляем пустые строки на NULL для email
    await pool.query(`
      UPDATE users
      SET email = NULL
      WHERE email = '';
    `);
    
    console.log('✅ Пустые строки в phone и email обновлены на NULL');
  } catch (err) {
    console.error('❌ Ошибка обновления пустых строк:', err.stack);
    process.exit(1);
  }
}

module.exports = normalizeEmptyPhoneAndEmail;

