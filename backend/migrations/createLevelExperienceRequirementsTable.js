const pool = require('../config/database');

async function createLevelExperienceRequirementsTable() {
  try {
    // Создаем таблицу для требований опыта для каждого уровня
    await pool.query(`
      CREATE TABLE IF NOT EXISTS level_experience_requirements (
        level_number INTEGER PRIMARY KEY,
        experience_required INTEGER NOT NULL DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Вставляем начальные значения для первых уровней (если их еще нет)
    const checkQuery = await pool.query(`SELECT COUNT(*) as count FROM level_experience_requirements`);
    if (parseInt(checkQuery.rows[0].count) === 0) {
      // Создаем первые 20 уровней с базовым значением 100 XP на уровень
      const values = Array.from({ length: 20 }, (_, i) => `(${i + 1}, ${100 * (i + 1)})`).join(', ');
      await pool.query(`
        INSERT INTO level_experience_requirements (level_number, experience_required)
        VALUES ${values};
      `);
    }
    
    console.log('✅ Таблица level_experience_requirements создана');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы level_experience_requirements:', err.message);
  }
}

module.exports = createLevelExperienceRequirementsTable;

