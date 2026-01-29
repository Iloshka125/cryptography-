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
 * Получить соревнование по hash
 * @param {string} competitionHash - Hash соревнования
 * @param {number|string} [userId] - ID пользователя
 * @returns {Promise<object>} - Соревнование
 */
export async function getCompetitionById(competitionHash, userId) {
  const url = userId ? `/competitions/${competitionHash}?user_id=${userId}` : `/competitions/${competitionHash}`;
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
 * @param {string} competitionHash - Hash соревнования
 * @param {object} competitionData - Данные для обновления
 * @returns {Promise<object>} - Обновленное соревнование
 */
export async function updateCompetition(competitionHash, competitionData) {
  return apiRequest(`/competitions/${competitionHash}`, {
    method: 'PUT',
    body: competitionData,
  });
}

/**
 * Удалить соревнование
 * @param {string} competitionHash - Hash соревнования
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteCompetition(competitionHash) {
  return apiRequest(`/competitions/${competitionHash}`, {
    method: 'DELETE',
  });
}

/**
 * Присоединиться к соревнованию
 * @param {string} competitionHash - Hash соревнования
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат присоединения
 */
export async function joinCompetition(competitionHash, userId) {
  return apiRequest(`/competitions/${competitionHash}/join`, {
    method: 'POST',
    body: { user_id: userId },
  });
}
