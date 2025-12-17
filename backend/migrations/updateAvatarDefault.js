const pool = require('../config/database');

async function updateAvatarDefault() {
  try {
    // Обновляем DEFAULT значение для avatar в таблице users
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN avatar SET DEFAULT 'target';
    `);
    
    // Обновляем существующих пользователей, у которых аватар равен старому значению '🎯' или NULL
    await pool.query(`
      UPDATE users 
      SET avatar = 'target' 
      WHERE avatar IS NULL OR avatar = '🎯' OR avatar = '';
    `);
    
    console.log('✅ Avatar default value updated to "target"');
  } catch (error) {
    // Игнорируем ошибки, если колонка не существует или уже обновлена
    if (error.message.includes('column "avatar" does not exist')) {
      console.log('⚠️ Avatar column does not exist yet, skipping...');
    } else {
      console.error('❌ Error updating avatar default:', error.message);
    }
  }
}

module.exports = updateAvatarDefault;

