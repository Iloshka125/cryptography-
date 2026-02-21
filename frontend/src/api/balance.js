const API_BASE_URL = 'http://5.35.92.24:3000';

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
 * Получить баланс пользователя
 * @param {object} params - Параметры для идентификации пользователя
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Баланс пользователя
 */
export async function getBalance(params) {
  return apiRequest('/balance/get', {
    method: 'POST',
    body: params,
  });
}

/**
 * Обновить баланс монет
 * @param {object} params - Параметры
 * @param {number} params.coins - Новое количество монет
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Обновленный баланс
 */
export async function updateCoins(params) {
  return apiRequest('/balance/update-coins', {
    method: 'POST',
    body: params,
  });
}

/**
 * Обновить баланс подсказок
 * @param {object} params - Параметры
 * @param {number} params.hints - Новое количество подсказок
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Обновленный баланс
 */
export async function updateHints(params) {
  return apiRequest('/balance/update-hints', {
    method: 'POST',
    body: params,
  });
}

/**
 * Добавить монеты
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество монет для добавления
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Обновленный баланс
 */
export async function addCoins(params) {
  return apiRequest('/balance/add-coins', {
    method: 'POST',
    body: params,
  });
}

/**
 * Вычесть монеты
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество монет для вычитания
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Обновленный баланс
 */
export async function subtractCoins(params) {
  return apiRequest('/balance/subtract-coins', {
    method: 'POST',
    body: params,
  });
}

/**
 * Добавить подсказки
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество подсказок для добавления
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Обновленный баланс
 */
export async function addHints(params) {
  return apiRequest('/balance/add-hints', {
    method: 'POST',
    body: params,
  });
}

/**
 * Вычесть подсказки
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество подсказок для вычитания
 * @param {number} [params.user_id] - ID пользователя
 * @param {string} [params.email] - Email пользователя
 * @param {string} [params.phone] - Телефон пользователя
 * @returns {Promise<object>} - Обновленный баланс
 */
export async function subtractHints(params) {
  return apiRequest('/balance/subtract-hints', {
    method: 'POST',
    body: params,
  });
}

