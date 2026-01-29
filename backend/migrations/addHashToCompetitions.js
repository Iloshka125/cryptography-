const pool = require('../config/database');
const crypto = require('crypto');

async function addHashToCompetitions() {
  try {
    // Добавляем поле hash
    await pool.query(`
      ALTER TABLE competitions 
      ADD COLUMN IF NOT EXISTS hash VARCHAR(64) UNIQUE;
    `);

    // Создаем индекс для быстрого поиска по hash
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_competitions_hash ON competitions(hash);
    `);

    // Генерируем hash для существующих соревнований
    const competitions = await pool.query('SELECT id FROM competitions WHERE hash IS NULL');
    for (const comp of competitions.rows) {
      const hash = crypto.randomBytes(32).toString('hex');
      await pool.query('UPDATE competitions SET hash = $1 WHERE id = $2', [hash, comp.id]);
    }

    console.log('✅ Поле hash добавлено в таблицу competitions');
  } catch (err) {
    console.error('❌ Ошибка добавления поля hash в competitions:', err.stack);
    throw err;
  }
}

module.exports = addHashToCompetitions;
