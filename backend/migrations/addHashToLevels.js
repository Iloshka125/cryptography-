const pool = require('../config/database');
const crypto = require('crypto');

async function addHashToLevels() {
  try {
    // Добавляем поле hash
    await pool.query(`
      ALTER TABLE levels 
      ADD COLUMN IF NOT EXISTS hash VARCHAR(64) UNIQUE;
    `);

    // Создаем индекс для быстрого поиска по hash
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_levels_hash ON levels(hash);
    `);

    // Генерируем hash для существующих уровней
    const levels = await pool.query('SELECT id FROM levels WHERE hash IS NULL');
    for (const level of levels.rows) {
      const hash = crypto.randomBytes(32).toString('hex');
      await pool.query('UPDATE levels SET hash = $1 WHERE id = $2', [hash, level.id]);
    }

    console.log('✅ Поле hash добавлено в таблицу levels');
  } catch (err) {
    console.error('❌ Ошибка добавления поля hash в levels:', err.stack);
    throw err;
  }
}

module.exports = addHashToLevels;
