/**
 * Всегда относительный /api — запросы идут на тот же origin, cookie сессии сохраняется.
 * Dev: Vite proxy в vite.config.js проксирует /api на бэкенд.
 * Prod: настрой прокси на сервере (nginx и т.п.): /api -> бэкенд.
 * Если нужен полный URL (без прокси), задай VITE_API_URL в .env (тогда cookie может не работать cross-origin).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
