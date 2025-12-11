const User = require('../models/User');

// Простое middleware для аутентификации через user_id в теле запроса
// В реальном приложении здесь должна быть проверка JWT токена
const authenticate = async (req, res, next) => {
  try {
    const { user_id, email, phone } = req.body;
    
    // Если передан user_id, проверяем что пользователь существует
    if (user_id) {
      const query = 'SELECT id FROM users WHERE id = $1';
      const pool = require('../config/database');
      const result = await pool.query(query, [user_id]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Пользователь не найден' });
      }
      
      req.userId = user_id;
      return next();
    }
    
    // Если передан email или phone, находим пользователя
    if (email || phone) {
      const user = await User.findByEmailOrPhone(email, phone);
      if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' });
      }
      req.userId = user.id;
      return next();
    }
    
    // Если ничего не передано, проверяем заголовок Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Здесь можно добавить проверку JWT токена
      // Пока просто возвращаем ошибку
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }
    
    return res.status(401).json({ error: 'Требуется user_id, email/phone или токен' });
  } catch (err) {
    console.error('Ошибка аутентификации:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { authenticate };

