import { apiRequest } from './api.js';

/**
 * Получить настройки уровней
 * @returns {Promise<object>} Настройки уровней
 */
export async function getLevelSettings() {
  return apiRequest('/level-settings', {
    method: 'GET',
  });
}

/**
 * Обновить настройки уровней
 * @param {number} experiencePerLevel - Опыт, необходимый для одного уровня
 * @returns {Promise<object>} Обновленные настройки
 */
export async function updateLevelSettings(experiencePerLevel) {
  return apiRequest('/level-settings/update', {
    method: 'POST',
    body: { experience_per_level: experiencePerLevel },
  });
}

