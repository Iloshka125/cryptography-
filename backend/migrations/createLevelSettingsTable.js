const pool = require('../config/database');

async function createLevelSettingsTable() {
  try {
    // Создаем таблицу для настроек уровней (хранит только одну запись с id = 1)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS level_settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        experience_per_level INTEGER NOT NULL DEFAULT 100,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Вставляем запись по умолчанию, если её ещё нет
    const checkQuery = await pool.query(`SELECT COUNT(*) as count FROM level_settings WHERE id = 1`);
    if (parseInt(checkQuery.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO level_settings (id, experience_per_level)
        VALUES (1, 100);
      `);
    }
    
    console.log('✅ Таблица level_settings создана');
  } catch (err) {
    // Игнорируем ошибку, если таблица уже существует
    if (err.message.includes('already exists')) {
      console.log('⚠️ Таблица level_settings уже существует');
    } else {
      console.error('❌ Ошибка создания таблицы level_settings:', err.message);
    }
  }
}

module.exports = createLevelSettingsTable;

