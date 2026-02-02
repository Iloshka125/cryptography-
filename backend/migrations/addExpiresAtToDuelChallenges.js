const pool = require('../config/database');

async function addExpiresAtToDuelChallenges() {
  try {
    // Добавляем поле expires_at для отслеживания времени истечения заявки
    await pool.query(`
      ALTER TABLE duel_challenges 
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    `);

    // Создаем индекс для быстрого поиска истекших заявок
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_duel_challenges_expires_at ON duel_challenges(expires_at);
    `);

    console.log('✅ Поле expires_at добавлено в таблицу duel_challenges');
  } catch (err) {
    console.error('❌ Ошибка добавления поля expires_at:', err.stack);
    throw err;
  }
}

module.exports = addExpiresAtToDuelChallenges;
