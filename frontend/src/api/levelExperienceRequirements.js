import { apiRequest } from './api.js';

/**
 * Получить все требования опыта для уровней
 * @returns {Promise<object>} Список требований
 */
export async function getLevelExperienceRequirements() {
  return apiRequest('/level-experience-requirements', {
    method: 'GET',
  });
}

/**
 * Получить требование для конкретного уровня
 * @param {number} levelNumber - Номер уровня
 * @returns {Promise<object>} Требование для уровня
 */
export async function getLevelExperienceRequirement(levelNumber) {
  return apiRequest(`/level-experience-requirements/${levelNumber}`, {
    method: 'GET',
  });
}

/**
 * Установить требование опыта для уровня
 * @param {number} levelNumber - Номер уровня
 * @param {number} experienceRequired - Требуемый опыт
 * @returns {Promise<object>} Обновленное требование
 */
export async function setLevelExperienceRequirement(levelNumber, experienceRequired) {
  return apiRequest('/level-experience-requirements/set', {
    method: 'POST',
    body: { 
      level_number: levelNumber,
      experience_required: experienceRequired,
    },
  });
}

/**
 * Удалить требование для уровня
 * @param {number} levelNumber - Номер уровня
 * @returns {Promise<object>} Результат удаления
 */
export async function deleteLevelExperienceRequirement(levelNumber) {
  return apiRequest(`/level-experience-requirements/${levelNumber}`, {
    method: 'DELETE',
  });
}

