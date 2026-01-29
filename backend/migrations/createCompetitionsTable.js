const pool = require('../config/database');

async function createCompetitionsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS competitions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      welcome_text TEXT,
      entry_fee INTEGER DEFAULT 0,
      start_date TIMESTAMP,
      end_date TIMESTAMP NOT NULL,
      status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
      initial_conditions JSONB DEFAULT '{}',
      prize VARCHAR(255),
      max_participants INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
    CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
    
    CREATE TABLE IF NOT EXISTS user_competitions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      initial_experience INTEGER DEFAULT 0,
      initial_level INTEGER DEFAULT 1,
      current_experience INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      UNIQUE(user_id, competition_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_competitions_user ON user_competitions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_competitions_competition ON user_competitions(competition_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Таблицы competitions и user_competitions созданы');
  } catch (err) {
    console.error('❌ Ошибка создания таблиц competitions:', err.stack);
    process.exit(1);
  }
}

module.exports = createCompetitionsTable;
