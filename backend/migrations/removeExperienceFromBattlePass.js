const pool = require('../config/database');

async function removeExperienceFromBattlePass() {
  const query = `
    ALTER TABLE battle_pass_rewards 
    DROP COLUMN IF EXISTS experience_required;
  `;

  try {
    await pool.query(query);
    console.log('✅ Поле experience_required удалено из таблицы battle_pass_rewards');
  } catch (err) {
    console.error('❌ Ошибка удаления поля experience_required:', err.stack);
    process.exit(1);
  }
}

module.exports = removeExperienceFromBattlePass;

