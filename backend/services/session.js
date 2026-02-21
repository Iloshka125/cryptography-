const crypto = require('crypto');
const pool = require('../config/database');

const COOKIE_NAME = 'sid';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 дней в секундах

function hashSessionId(sessionId) {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

async function create(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const sessionHash = hashSessionId(sessionId);
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);
  await pool.query(
    'INSERT INTO sessions (session_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [sessionHash, userId, expiresAt]
  );
  return { sessionId, expiresAt };
}

async function findBySessionId(sessionId) {
  if (!sessionId) return null;
  const sessionHash = hashSessionId(sessionId);
  const res = await pool.query(
    'SELECT user_id, expires_at FROM sessions WHERE session_hash = $1',
    [sessionHash]
  );
  const row = res.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    await destroyByHash(sessionHash);
    return null;
  }
  return { userId: row.user_id };
}

async function destroyByHash(sessionHash) {
  await pool.query('DELETE FROM sessions WHERE session_hash = $1', [sessionHash]);
}

async function destroyBySessionId(sessionId) {
  if (!sessionId) return;
  const sessionHash = hashSessionId(sessionId);
  await destroyByHash(sessionHash);
}

function setCookie(res, sessionId, maxAge = COOKIE_MAX_AGE) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: maxAge * 1000,
    path: '/',
  });
}

function clearCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

module.exports = {
  COOKIE_NAME,
  create,
  findBySessionId,
  destroyBySessionId,
  setCookie,
  clearCookie,
};
