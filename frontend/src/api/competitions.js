const API_BASE_URL = 'http://localhost:3000';

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
 * Получить все соревнования
 * @param {number|string} [userId] - ID пользователя для проверки участия
 * @returns {Promise<object>} - Список соревнований
 */
export async function getCompetitions(userId) {
  const url = userId ? `/competitions?user_id=${userId}` : '/competitions';
  return apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Получить соревнование по ID
 * @param {number|string} competitionId - ID соревнования
 * @param {number|string} [userId] - ID пользователя
 * @returns {Promise<object>} - Соревнование
 */
export async function getCompetitionById(competitionId, userId) {
  const url = userId ? `/competitions/${competitionId}?user_id=${userId}` : `/competitions/${competitionId}`;
  return apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Создать соревнование
 * @param {object} competitionData - Данные соревнования
 * @returns {Promise<object>} - Созданное соревнование
 */
export async function createCompetition(competitionData) {
  return apiRequest('/competitions', {
    method: 'POST',
    body: competitionData,
  });
}

/**
 * Обновить соревнование
 * @param {number|string} competitionId - ID соревнования
 * @param {object} competitionData - Данные для обновления
 * @returns {Promise<object>} - Обновленное соревнование
 */
export async function updateCompetition(competitionId, competitionData) {
  return apiRequest(`/competitions/${competitionId}`, {
    method: 'PUT',
    body: competitionData,
  });
}

/**
 * Удалить соревнование
 * @param {number|string} competitionId - ID соревнования
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteCompetition(competitionId) {
  return apiRequest(`/competitions/${competitionId}`, {
    method: 'DELETE',
  });
}

/**
 * Присоединиться к соревнованию
 * @param {number|string} competitionId - ID соревнования
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат присоединения
 */
export async function joinCompetition(competitionId, userId) {
  return apiRequest(`/competitions/${competitionId}/join`, {
    method: 'POST',
    body: { user_id: userId },
  });
}
