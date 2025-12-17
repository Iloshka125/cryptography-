const User = require('../models/User');

/**
 * Middleware для извлечения user_id из заголовка Authorization
 * Формат заголовка: Authorization: Bearer user_id
 * Или просто: Authorization: user_id
 * @param {boolean} optional - Если true, не требует обязательной авторизации
 */
const extractUserId = (optional = false) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Для отладки (можно убрать в продакшене)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[extractUserId] ${req.method} ${req.path}, optional: ${optional}, authHeader: ${authHeader ? 'present' : 'missing'}, query:`, req.query);
    }
    
    if (!authHeader) {
      // Пробуем получить из body для обратной совместимости
      if (req.body?.user_id) {
        const userId = parseInt(req.body.user_id);
        if (!isNaN(userId) && userId > 0) {
          req.userId = userId;
          return next();
        }
      }
      
      // Пробуем получить из query параметров (для обратной совместимости)
      if (req.query?.user_id || req.query?.userId) {
        const userId = parseInt(req.query.user_id || req.query.userId);
        if (!isNaN(userId) && userId > 0) {
          // Проверяем, что пользователь существует
          const user = await User.findById(userId);
          if (user) {
            req.userId = userId;
            return next();
          }
        }
      }
      
      // Если авторизация опциональна, просто продолжаем без user_id
      if (optional) {
        req.userId = null;
        return next();
      }
      
      return res.status(401).json({ error: 'Требуется авторизация (Authorization header или user_id в body/query)' });
    }

    // Убираем "Bearer " если есть
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    
    // Проверяем, что это число (user_id)
    const userId = parseInt(token);
    
    if (isNaN(userId) || userId <= 0) {
      // Если авторизация опциональна и формат неверный, просто продолжаем без user_id
      if (optional) {
        req.userId = null;
        return next();
      }
      return res.status(401).json({ error: 'Неверный формат user_id в Authorization header' });
    }

    try {
      // Проверяем, что пользователь существует
      const user = await User.findById(userId);
      if (!user) {
        // Если авторизация опциональна и пользователь не найден, просто продолжаем без user_id
        if (optional) {
          req.userId = null;
          return next();
        }
        return res.status(401).json({ error: 'Пользователь не найден' });
      }

      // Добавляем user_id в объект запроса
      req.userId = userId;
      next();
    } catch (userCheckError) {
      // Если ошибка при проверке пользователя и авторизация опциональна, продолжаем без user_id
      if (optional) {
        req.userId = null;
        return next();
      }
      throw userCheckError;
    }
  } catch (err) {
    console.error('Ошибка в middleware auth:', err);
    res.status(500).json({ error: 'Ошибка сервера при проверке авторизации' });
  }
};

module.exports = {
  extractUserId,
};
