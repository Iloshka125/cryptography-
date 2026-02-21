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

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
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
 * Получить все заявки на дуэль
 * @param {number|string} userId - ID пользователя
 * @param {string} [status] - Фильтр по статусу
 * @returns {Promise<object>} - Список заявок
 */
export async function getChallenges(userId, status) {
  let url = `/duels/challenges?user_id=${userId}`;
  if (status) {
    url += `&status=${status}`;
  }
  return apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Получить все категории дуэлей
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Список категорий
 */
export async function getDuelCategories(userId) {
  return apiRequest(`/duels/categories/public?user_id=${userId}`, {
    method: 'GET',
  });
}

/**
 * Создать заявку на дуэль
 * @param {number|string} userId - ID пользователя
 * @param {object} challengeData - Данные заявки
 * @param {number|string} [challengeData.opponentId] - ID соперника (null для рандомного)
 * @param {number|string} [challengeData.duelCategoryId] - ID категории дуэлей (null для любой)
 * @param {string} [challengeData.difficulty] - Сложность (easy, medium, hard) или null
 * @param {number} challengeData.stake - Ставка в монетах
 * @returns {Promise<object>} - Созданная заявка
 */
export async function createChallenge(userId, challengeData) {
  return apiRequest('/duels/challenges', {
    method: 'POST',
    body: {
      ...challengeData,
      user_id: userId,
    },
  });
}

/**
 * Принять заявку на дуэль
 * @param {number|string} challengeId - ID заявки
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Принятая заявка
 */
export async function acceptChallenge(challengeId, userId) {
  return apiRequest(`/duels/challenges/${challengeId}/accept`, {
    method: 'POST',
    body: { user_id: userId },
  });
}

/**
 * Получить заявку по ID
 * @param {number|string} challengeId - ID заявки
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Заявка с участниками
 */
export async function getChallengeById(challengeId, userId) {
  return apiRequest(`/duels/challenges/${challengeId}?user_id=${userId}`, {
    method: 'GET',
  });
}

/**
 * Отправить ответ на задание дуэли
 * @param {number|string} challengeId - ID заявки
 * @param {string} flag - Флаг
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат проверки
 */
export async function submitDuelAnswer(challengeId, flag, userId) {
  return apiRequest(`/duels/challenges/${challengeId}/submit`, {
    method: 'POST',
    body: {
      flag,
      user_id: userId,
    },
  });
}

/**
 * Отменить заявку на дуэль
 * @param {number|string} challengeId - ID заявки
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат отмены
 */
export async function cancelChallenge(challengeId, userId) {
  return apiRequest(`/duels/challenges/${challengeId}/cancel`, {
    method: 'POST',
    body: { user_id: userId },
  });
}

// ========== АДМИН ФУНКЦИИ ==========

/**
 * Получить все категории дуэлей (админ)
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Список категорий
 */
export async function getDuelCategoriesAdmin(userId) {
  return apiRequest(`/duels/categories?user_id=${userId}`, {
    method: 'GET',
  });
}

/**
 * Создать категорию дуэлей (админ)
 * @param {object} categoryData - Данные категории
 * @param {string} categoryData.name - Название
 * @param {string} [categoryData.description] - Описание
 * @param {string} [categoryData.icon] - Иконка
 * @param {string} [categoryData.color] - Цвет
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Созданная категория
 */
export async function createDuelCategory(categoryData, userId) {
  return apiRequest('/duels/categories', {
    method: 'POST',
    body: {
      ...categoryData,
      user_id: userId,
    },
  });
}

/**
 * Обновить категорию дуэлей (админ)
 * @param {number|string} categoryId - ID категории
 * @param {object} categoryData - Данные для обновления
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Обновленная категория
 */
export async function updateDuelCategory(categoryId, categoryData, userId) {
  return apiRequest(`/duels/categories/${categoryId}`, {
    method: 'PUT',
    body: {
      ...categoryData,
      user_id: userId,
    },
  });
}

/**
 * Удалить категорию дуэлей (админ)
 * @param {number|string} categoryId - ID категории
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteDuelCategory(categoryId, userId) {
  return apiRequest(`/duels/categories/${categoryId}?user_id=${userId}`, {
    method: 'DELETE',
  });
}

/**
 * Получить все задания дуэлей (админ)
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Список заданий
 */
export async function getDuelTasks(userId) {
  return apiRequest(`/duels/tasks?user_id=${userId}`, {
    method: 'GET',
  });
}

/**
 * Создать задание дуэли (админ)
 * @param {object} taskData - Данные задания
 * @param {File} [taskData.taskFile] - Файл задания
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Созданное задание
 */
export async function createDuelTask(taskData, userId) {
  const formData = new FormData();
  
  Object.keys(taskData).forEach(key => {
    if (key === 'taskFile' && taskData[key]) {
      formData.append('taskFile', taskData[key]);
    } else if (key !== 'taskFile') {
      formData.append(key, taskData[key]);
    }
  });
  
  formData.append('user_id', userId);
  
  const API_BASE_URL = 'http://5.35.92.24:3000';
  const response = await fetch(`${API_BASE_URL}/duels/tasks?user_id=${userId}`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
}

/**
 * Обновить задание дуэли (админ)
 * @param {number|string} taskId - ID задания
 * @param {object} taskData - Данные для обновления
 * @param {File} [taskData.taskFile] - Файл задания
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Обновленное задание
 */
export async function updateDuelTask(taskId, taskData, userId) {
  const formData = new FormData();
  
  Object.keys(taskData).forEach(key => {
    if (key === 'taskFile' && taskData[key]) {
      formData.append('taskFile', taskData[key]);
    } else if (key !== 'taskFile') {
      formData.append(key, taskData[key]);
    }
  });
  
  formData.append('user_id', userId);
  
  const API_BASE_URL = 'http://5.35.92.24:3000';
  const response = await fetch(`${API_BASE_URL}/duels/tasks/${taskId}?user_id=${userId}`, {
    method: 'PUT',
    body: formData,
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
}

/**
 * Удалить задание дуэли (админ)
 * @param {number|string} taskId - ID задания
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteDuelTask(taskId, userId) {
  return apiRequest(`/duels/tasks/${taskId}?user_id=${userId}`, {
    method: 'DELETE',
  });
}
