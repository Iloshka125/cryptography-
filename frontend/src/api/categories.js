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
 * Получить все категории с уровнями
 * @returns {Promise<object>} - Список категорий
 */
export async function getCategories() {
  return apiRequest('/categories', {
    method: 'GET',
  });
}

/**
 * Получить категорию по ID
 * @param {number|string} categoryId - ID категории
 * @returns {Promise<object>} - Категория
 */
export async function getCategoryById(categoryId) {
  return apiRequest(`/categories/${categoryId}`, {
    method: 'GET',
  });
}

/**
 * Создать категорию
 * @param {object} categoryData - Данные категории
 * @param {string} categoryData.name - Название
 * @param {string} [categoryData.description] - Описание
 * @param {string} [categoryData.icon] - Иконка (эмодзи)
 * @param {string} [categoryData.color] - Цвет (hex)
 * @returns {Promise<object>} - Созданная категория
 */
export async function createCategory(categoryData) {
  return apiRequest('/categories', {
    method: 'POST',
    body: categoryData,
  });
}

/**
 * Обновить категорию
 * @param {number|string} categoryId - ID категории
 * @param {object} categoryData - Данные для обновления
 * @returns {Promise<object>} - Обновленная категория
 */
export async function updateCategory(categoryId, categoryData) {
  return apiRequest(`/categories/${categoryId}`, {
    method: 'PUT',
    body: categoryData,
  });
}

/**
 * Удалить категорию
 * @param {number|string} categoryId - ID категории
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteCategory(categoryId) {
  return apiRequest(`/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

/**
 * Создать уровень в категории
 * @param {number|string} categoryId - ID категории
 * @param {object} levelData - Данные уровня
 * @param {string} levelData.name - Название
 * @param {string} [levelData.description] - Описание
 * @param {string} [levelData.task] - Задание
 * @param {string} [levelData.flag] - Флаг (ответ)
 * @param {number} [levelData.orderIndex] - Порядок
 * @returns {Promise<object>} - Созданный уровень
 */
export async function createLevel(categoryId, levelData) {
  return apiRequest(`/categories/${categoryId}/levels`, {
    method: 'POST',
    body: levelData,
  });
}

/**
 * Обновить уровень
 * @param {number|string} levelId - ID уровня
 * @param {object} levelData - Данные для обновления
 * @returns {Promise<object>} - Обновленный уровень
 */
export async function updateLevel(levelId, levelData) {
  return apiRequest(`/categories/levels/${levelId}`, {
    method: 'PUT',
    body: levelData,
  });
}

/**
 * Удалить уровень
 * @param {number|string} levelId - ID уровня
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteLevel(levelId) {
  return apiRequest(`/categories/levels/${levelId}`, {
    method: 'DELETE',
  });
}

/**
 * Получить уровень по ID (без флага)
 * @param {number|string} levelId - ID уровня
 * @returns {Promise<object>} - Данные уровня
 */
export async function getLevelById(levelId) {
  return apiRequest(`/categories/levels/${levelId}`, {
    method: 'GET',
  });
}

/**
 * Проверить правильность флага уровня
 * @param {number|string} levelId - ID уровня
 * @param {string} flag - Введенный флаг
 * @returns {Promise<object>} - Результат проверки
 */
export async function checkLevelFlag(levelId, flag) {
  return apiRequest(`/categories/levels/${levelId}/check`, {
    method: 'POST',
    body: { flag },
  });
}

