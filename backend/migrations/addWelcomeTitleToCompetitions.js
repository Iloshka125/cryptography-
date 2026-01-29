const pool = require('../config/database');

async function addWelcomeTitleToCompetitions() {
  const query = `
    ALTER TABLE competitions 
    ADD COLUMN IF NOT EXISTS welcome_title VARCHAR(255) DEFAULT 'Приветствие';
  `;

  try {
    await pool.query(query);
    console.log('✅ Поле welcome_title добавлено в таблицу competitions');
  } catch (err) {
    console.error('❌ Ошибка добавления поля welcome_title:', err.stack);
    throw err;
  }
}

module.exports = addWelcomeTitleToCompetitions;
