const pool = require('../config/database');

class UserBattlePass {
  // Отметить награду как полученную
  static async claimReward(userId, rewardId) {
    const query = `
      INSERT INTO user_battle_pass_rewards (user_id, reward_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, reward_id) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, rewardId]);
    return res.rows[0];
  }

  // Проверить, получена ли награда
  static async isRewardClaimed(userId, rewardId) {
    const query = `
      SELECT * FROM user_battle_pass_rewards
      WHERE user_id = $1 AND reward_id = $2;
    `;
    const res = await pool.query(query, [userId, rewardId]);
    return res.rows.length > 0;
  }

  // Получить все полученные награды пользователя
  static async getClaimedRewards(userId) {
    const query = `
      SELECT reward_id FROM user_battle_pass_rewards
      WHERE user_id = $1;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(row => row.reward_id);
  }
}

module.exports = UserBattlePass;

