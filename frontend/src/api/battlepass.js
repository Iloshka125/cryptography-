const API_BASE_URL = 'http://5.35.92.24:3000';

/**
 * Выполняет API запрос
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.');
    }
    throw error;
  }
}

/**
 * Получить все награды Battle Pass
 * @param {number|string} [userId] - ID пользователя для проверки полученных наград
 * @returns {Promise<object>} - Список наград
 */
export async function getBattlePassRewards(userId) {
  const url = userId ? `/battlepass?user_id=${userId}` : '/battlepass';
  return apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Получить награду (claim reward)
 * @param {number|string} rewardId - ID награды
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат получения награды
 */
export async function claimBattlePassReward(rewardId, userId) {
  return apiRequest(`/battlepass/${rewardId}/claim`, {
    method: 'POST',
    body: { user_id: userId },
  });
}

/**
 * Получить награду по ID
 * @param {number|string} rewardId - ID награды
 * @returns {Promise<object>} - Награда
 */
export async function getBattlePassRewardById(rewardId) {
  return apiRequest(`/battlepass/${rewardId}`, {
    method: 'GET',
  });
}

/**
 * Создать награду Battle Pass
 * @param {object} rewardData - Данные награды
 * @param {number} rewardData.level - Уровень
 * @param {string} rewardData.reward - Награда
 * @returns {Promise<object>} - Созданная награда
 */
export async function createBattlePassReward(rewardData) {
  return apiRequest('/battlepass', {
    method: 'POST',
    body: rewardData,
  });
}

/**
 * Обновить награду Battle Pass
 * @param {number|string} rewardId - ID награды
 * @param {object} rewardData - Данные для обновления
 * @returns {Promise<object>} - Обновленная награда
 */
export async function updateBattlePassReward(rewardId, rewardData) {
  return apiRequest(`/battlepass/${rewardId}`, {
    method: 'PUT',
    body: rewardData,
  });
}

/**
 * Удалить награду Battle Pass
 * @param {number|string} rewardId - ID награды
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteBattlePassReward(rewardId) {
  return apiRequest(`/battlepass/${rewardId}`, {
    method: 'DELETE',
  });
}

