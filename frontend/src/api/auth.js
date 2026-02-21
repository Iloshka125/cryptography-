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
 * Регистрация нового пользователя
 * @param {object} userData - Данные пользователя
 * @param {string} userData.nickname - Никнейм
 * @param {string} [userData.email] - Email (опционально)
 * @param {string} [userData.phone] - Телефон (опционально)
 * @param {string} userData.password - Пароль
 * @returns {Promise<object>} - Ответ от сервера
 */
export async function register(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

/**
 * Подтверждение почты по токену из ссылки в письме
 * @param {string} token - Токен из URL ?token=xxx
 * @returns {Promise<object>}
 */
export async function verifyEmail(token) {
  return apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
}

/**
 * Повторная отправка письма подтверждения
 * @param {string} email - Email пользователя
 * @returns {Promise<object>}
 */
export async function resendVerificationEmail(email) {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  });
}

/**
 * Вход пользователя
 * @param {object} credentials - Учетные данные
 * @param {string} [credentials.email] - Email (опционально, если есть phone)
 * @param {string} [credentials.phone] - Телефон (опционально, если есть email)
 * @param {string} credentials.password - Пароль
 * @returns {Promise<object>} - Ответ от сервера с данными пользователя
 */
export async function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

/**
 * Текущий пользователь по сессии (cookie)
 * @returns {Promise<{ user: object }>}
 */
export async function getMe() {
  return apiRequest('/auth/me', { method: 'GET' });
}

/**
 * Выход — уничтожение сессии на сервере и очистка cookie
 */
export async function logoutRequest() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

