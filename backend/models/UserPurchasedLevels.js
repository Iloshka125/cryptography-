const pool = require('../config/database');

class UserPurchasedLevels {
  // Купить уровень
  static async purchaseLevel(userId, levelId, pricePaid) {
    const query = `
      INSERT INTO user_purchased_levels (user_id, level_id, price_paid)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, level_id) DO UPDATE
      SET purchased_at = CURRENT_TIMESTAMP,
          price_paid = EXCLUDED.price_paid
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, levelId, pricePaid]);
    return res.rows[0];
  }

  // Проверить, куплен ли уровень пользователем
  static async isLevelPurchased(userId, levelId) {
    const query = `
      SELECT * FROM user_purchased_levels
      WHERE user_id = $1 AND level_id = $2;
    `;
    const res = await pool.query(query, [userId, levelId]);
    return res.rows.length > 0;
  }

  // Получить все купленные уровни пользователя
  static async getPurchasedLevels(userId) {
    const query = `
      SELECT level_id FROM user_purchased_levels
      WHERE user_id = $1;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(row => row.level_id);
  }
}

module.exports = UserPurchasedLevels;

