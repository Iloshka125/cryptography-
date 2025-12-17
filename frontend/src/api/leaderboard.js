import { apiRequest } from './api.js';

/**
 * Получить лидерборд
 * @param {number|string} [userId] - ID пользователя для получения его позиции
 * @param {number} [limit] - Количество записей (по умолчанию 100)
 * @returns {Promise<object>} - Лидерборд
 */
export async function getLeaderboard(userId, limit) {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (limit) params.append('limit', limit.toString());
  
  const url = `/leaderboard${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest(url);
}

