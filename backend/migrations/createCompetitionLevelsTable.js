const pool = require('../config/database');
const crypto = require('crypto');

async function createCompetitionLevelsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS competition_levels (
      id SERIAL PRIMARY KEY,
      competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      task TEXT,
      task_file_path VARCHAR(500),
      flag VARCHAR(255) NOT NULL,
      order_index INTEGER DEFAULT 0,
      points INTEGER DEFAULT 100,
      hint TEXT,
      hash VARCHAR(64) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_competition_levels_competition ON competition_levels(competition_id);
    CREATE INDEX IF NOT EXISTS idx_competition_levels_order ON competition_levels(competition_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_competition_levels_hash ON competition_levels(hash);
    
    CREATE TABLE IF NOT EXISTS user_competition_level_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      level_id INTEGER NOT NULL REFERENCES competition_levels(id) ON DELETE CASCADE,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      experience_gained INTEGER DEFAULT 0,
      is_first_solver BOOLEAN DEFAULT FALSE,
      UNIQUE(user_id, competition_id, level_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_competition_level_progress_user ON user_competition_level_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_competition_level_progress_competition ON user_competition_level_progress(competition_id);
    CREATE INDEX IF NOT EXISTS idx_user_competition_level_progress_level ON user_competition_level_progress(level_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблицы competition_levels и user_competition_level_progress созданы');
  } catch (err) {
    console.error('❌ Ошибка создания таблиц competition_levels:', err.stack);
    throw err;
  }
}

module.exports = createCompetitionLevelsTable;
