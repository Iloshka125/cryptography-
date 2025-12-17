const pool = require('../config/database');

async function addLevelPaymentFields() {
  try {
    // Добавляем поля для платности уровня
    await pool.query(`
      ALTER TABLE levels 
      ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
    `);
    
    console.log('✅ Поля is_paid и price добавлены в таблицу levels');
  } catch (err) {
    console.error('❌ Ошибка добавления полей is_paid и price:', err.message);
  }
}

module.exports = addLevelPaymentFields;

