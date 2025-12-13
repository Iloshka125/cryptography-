const API_BASE_URL = 'http://localhost:3000';

/**
 * Выполняет API запрос
 * @param {string} endpoint - Конечная точка API
 * @param {object} options - Опции для fetch
 * @returns {Promise<object>} - Ответ от сервера
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

  // Если есть тело запроса, преобразуем его в JSON
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
    // Если это ошибка сети
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.');
    }
    throw error;
  }
}

/**
 * Получить профиль пользователя
 * @param {object} params - Параметры для идентификации пользователя
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Профиль пользователя
 */
export async function getProfile(params) {
  return apiRequest('/profile/get', {
    method: 'POST',
    body: params,
  });
}

/**
 * Обновить профиль пользователя
 * @param {object} params - Параметры
 * @param {string} [params.nickname] - Новый никнейм
 * @param {string} [params.email] - Новый email
 * @param {string} [params.phone] - Новый телефон
 * @param {string} [params.avatar] - Новый аватар (эмодзи)
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя для идентификации
 * @param {string} [params.phone] - Телефон пользователя для идентификации
 * @returns {Promise<object>} - Обновленный профиль
 */
export async function updateProfile(params) {
  return apiRequest('/profile/update', {
    method: 'POST',
    body: params,
  });
}

/**
 * Изменить пароль пользователя
 * @param {object} params - Параметры
 * @param {string} params.old_password - Старый пароль
 * @param {string} params.new_password - Новый пароль
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Результат изменения пароля
 */
export async function changePassword(params) {
  return apiRequest('/profile/change-password', {
    method: 'POST',
    body: params,
  });
}

/**
 * Разблокировать достижение
 * @param {object} params - Параметры
 * @param {number} params.achievement_id - ID достижения
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Результат разблокировки
 */
export async function unlockAchievement(params) {
  return apiRequest('/profile/unlock-achievement', {
    method: 'POST',
    body: params,
  });
}

