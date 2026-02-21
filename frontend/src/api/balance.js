import { API_BASE_URL } from './config.js';

/**
 * Выполняет API запрос
 * @param {string} endpoint - Конечная точка API
 * @param {object} options - Опции для fetch
 * @returns {Promise<object>} - Ответ от сервера
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    credentials: 'include',
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
 * Получить баланс текущего пользователя (по сессии/cookie)
 * @returns {Promise<object>} - Баланс пользователя
 */
export async function getBalance() {
  return apiRequest('/balance/get', {
    method: 'POST',
    body: {},
  });
}

/**
 * Обновить баланс монет (для текущей сессии)
 * @param {object} params - Параметры
 * @param {number} params.coins - Новое количество монет
 */
export async function updateCoins(params) {
  return apiRequest('/balance/update-coins', {
    method: 'POST',
    body: { coins: params.coins },
  });
}

/**
 * Обновить баланс подсказок (для текущей сессии)
 * @param {object} params - Параметры
 * @param {number} params.hints - Новое количество подсказок
 */
export async function updateHints(params) {
  return apiRequest('/balance/update-hints', {
    method: 'POST',
    body: { hints: params.hints },
  });
}

/**
 * Добавить монеты (для текущей сессии)
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество монет для добавления
 */
export async function addCoins(params) {
  return apiRequest('/balance/add-coins', {
    method: 'POST',
    body: { amount: params.amount },
  });
}

/**
 * Вычесть монеты (для текущей сессии)
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество монет для вычитания
 */
export async function subtractCoins(params) {
  return apiRequest('/balance/subtract-coins', {
    method: 'POST',
    body: { amount: params.amount },
  });
}

/**
 * Добавить подсказки (для текущей сессии)
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество подсказок для добавления
 */
export async function addHints(params) {
  return apiRequest('/balance/add-hints', {
    method: 'POST',
    body: { amount: params.amount },
  });
}

/**
 * Вычесть подсказки (для текущей сессии)
 * @param {object} params - Параметры
 * @param {number} params.amount - Количество подсказок для вычитания
 */
export async function subtractHints(params) {
  return apiRequest('/balance/subtract-hints', {
    method: 'POST',
    body: { amount: params.amount },
  });
}

