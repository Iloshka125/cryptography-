const pool = require('../config/database');

async function addPrizeAwardedToCompetitions() {
  try {
    await pool.query(`
      ALTER TABLE competitions
      ADD COLUMN IF NOT EXISTS prize_awarded BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Поле prize_awarded добавлено в таблицу competitions');
  } catch (err) {
    console.error('❌ Ошибка добавления поля prize_awarded:', err.stack);
    throw err;
  }
}

module.exports = addPrizeAwardedToCompetitions;
