const sessionService = require('../services/session');

async function requireSession(req, res, next) {
  const sessionId = req.cookies && req.cookies[sessionService.COOKIE_NAME];
  const session = await sessionService.findBySessionId(sessionId);
  if (!session) {
    sessionService.clearCookie(res);
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  req.userId = session.userId;
  next();
}

/** Устанавливает req.userId из сессии, если есть; не возвращает 401 при отсутствии сессии */
async function optionalSession(req, res, next) {
  const sessionId = req.cookies && req.cookies[sessionService.COOKIE_NAME];
  const session = await sessionService.findBySessionId(sessionId);
  if (session) req.userId = session.userId;
  next();
}

module.exports = requireSession;
module.exports.optionalSession = optionalSession;
module.exports.requireSession = requireSession;
