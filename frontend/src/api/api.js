import { API_BASE_URL } from './config.js';

/**
 * Выполняет API запрос
 * @param {string} endpoint - Конечная точка API
 * @param {object} options - Опции для fetch
 * @returns {Promise<object>} - Ответ от сервера
 */
export async function apiRequest(endpoint, options = {}) {
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

