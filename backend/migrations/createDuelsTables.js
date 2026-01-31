const pool = require('../config/database');

async function createDuelsTables() {
  try {
    // Таблица заданий для дуэлей (админ добавляет)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS duel_tasks (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        level_id INTEGER REFERENCES levels(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        task TEXT,
        task_file_path VARCHAR(500),
        flag VARCHAR(255) NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
        time_limit INTEGER DEFAULT 300, -- время в секундах
        points INTEGER DEFAULT 100,
        hint TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Таблица заявок на дуэль
    await pool.query(`
      CREATE TABLE IF NOT EXISTS duel_challenges (
        id SERIAL PRIMARY KEY,
        challenger_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        opponent_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL если рандомный соперник
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- NULL если рандомная категория
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')), -- NULL если рандомная сложность
        stake INTEGER NOT NULL DEFAULT 0, -- ставка (монеты)
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'cancelled')),
        task_id INTEGER REFERENCES duel_tasks(id) ON DELETE SET NULL, -- задание выбирается при старте
        winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        started_at TIMESTAMP, -- когда началась дуэль (через 24ч после принятия)
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Таблица прогресса участников дуэли
    await pool.query(`
      CREATE TABLE IF NOT EXISTS duel_participants (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER NOT NULL REFERENCES duel_challenges(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        submitted_flag VARCHAR(255),
        submitted_at TIMESTAMP,
        is_winner BOOLEAN DEFAULT FALSE,
        prize_received INTEGER DEFAULT 0,
        UNIQUE(challenge_id, user_id)
      );
    `);

    // Индексы
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_duel_tasks_category ON duel_tasks(category_id);
      CREATE INDEX IF NOT EXISTS idx_duel_tasks_difficulty ON duel_tasks(difficulty);
      CREATE INDEX IF NOT EXISTS idx_duel_tasks_active ON duel_tasks(is_active);
      
      CREATE INDEX IF NOT EXISTS idx_duel_challenges_challenger ON duel_challenges(challenger_id);
      CREATE INDEX IF NOT EXISTS idx_duel_challenges_opponent ON duel_challenges(opponent_id);
      CREATE INDEX IF NOT EXISTS idx_duel_challenges_status ON duel_challenges(status);
      CREATE INDEX IF NOT EXISTS idx_duel_challenges_created ON duel_challenges(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_duel_participants_challenge ON duel_participants(challenge_id);
      CREATE INDEX IF NOT EXISTS idx_duel_participants_user ON duel_participants(user_id);
    `);

    console.log('✅ Таблицы для дуэлей созданы');
  } catch (err) {
    console.error('❌ Ошибка создания таблиц для дуэлей:', err.stack);
    throw err;
  }
}

module.exports = createDuelsTables;
