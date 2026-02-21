const API_BASE_URL = 'http://5.35.92.24:3000';

/**
 * Выполняет API запрос
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Если body - это FormData, не устанавливаем Content-Type и не преобразуем в JSON
  // Браузер сам установит правильный Content-Type с boundary для multipart/form-data
  if (config.body instanceof FormData) {
    // Не устанавливаем Content-Type для FormData
    delete config.headers['Content-Type'];
  } else if (config.body && typeof config.body === 'object') {
    // Для обычных объектов устанавливаем Content-Type и преобразуем в JSON
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  } else if (!config.headers['Content-Type']) {
    // Если Content-Type не установлен и body не FormData, устанавливаем по умолчанию
    config.headers['Content-Type'] = 'application/json';
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
 * Получить уровень соревнования по hash
 * @param {string} levelHash - Hash уровня
 * @param {number|string} [userId] - ID пользователя
 * @returns {Promise<object>} - Данные уровня
 */
export async function getCompetitionLevelById(levelHash, userId) {
  const url = userId ? `/competition-levels/${levelHash}?user_id=${userId}` : `/competition-levels/${levelHash}`;
  return apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Проверить правильность флага уровня соревнования
 * @param {string} levelHash - Hash уровня
 * @param {string} flag - Введенный флаг
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат проверки
 */
export async function checkCompetitionLevelFlag(levelHash, flag, userId) {
  return apiRequest(`/competition-levels/${levelHash}/check`, {
    method: 'POST',
    body: { flag, user_id: userId },
  });
}

/**
 * Получить все уровни соревнования
 * @param {number|string} competitionId - ID соревнования
 * @returns {Promise<object>} - Список уровней
 */
export async function getCompetitionLevels(competitionId) {
  return apiRequest(`/competition-levels/competition/${competitionId}`, {
    method: 'GET',
  });
}

/**
 * Создать уровень соревнования
 * @param {FormData} formData - Данные уровня (может содержать файл)
 * @returns {Promise<object>} - Созданный уровень
 */
export async function createCompetitionLevel(formData) {
  return apiRequest('/competition-levels', {
    method: 'POST',
    headers: {}, // Не устанавливаем Content-Type, браузер сам установит с boundary
    body: formData,
  });
}

/**
 * Обновить уровень соревнования
 * @param {string} levelHash - Hash уровня
 * @param {FormData} formData - Данные для обновления (может содержать файл)
 * @returns {Promise<object>} - Обновленный уровень
 */
export async function updateCompetitionLevel(levelHash, formData) {
  return apiRequest(`/competition-levels/${levelHash}`, {
    method: 'PUT',
    headers: {}, // Не устанавливаем Content-Type, браузер сам установит с boundary
    body: formData,
  });
}

/**
 * Удалить уровень соревнования
 * @param {string} levelHash - Hash уровня
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteCompetitionLevel(levelHash) {
  return apiRequest(`/competition-levels/${levelHash}`, {
    method: 'DELETE',
  });
}
