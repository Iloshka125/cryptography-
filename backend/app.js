const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const balanceRoutes = require('./routes/balance');
const profileRoutes = require('./routes/profile');
const categoriesRoutes = require('./routes/categories');
const battlepassRoutes = require('./routes/battlepass');
const leaderboardRoutes = require('./routes/leaderboard');
const levelSettingsRoutes = require('./routes/levelSettings');
const levelExperienceRequirementsRoutes = require('./routes/levelExperienceRequirements');
const createUsersTable = require('./migrations/createUsersTable');
const createUserBalanceTable = require('./migrations/createUserBalanceTable');
const addProfileFields = require('./migrations/addProfileFields');
const addAdminField = require('./migrations/addAdminField');
const createCategoriesAndLevelsTables = require('./migrations/createCategoriesAndLevelsTables');
const addLevelFields = require('./migrations/addLevelFields');
const createBattlePassTable = require('./migrations/createBattlePassTable');
const createUserBattlePassTable = require('./migrations/createUserBattlePassTable');
const removeExperienceFromBattlePass = require('./migrations/removeExperienceFromBattlePass');
const createUserLevelProgressTable = require('./migrations/createUserLevelProgressTable');
const addCategoryIdToUserLevelProgress = require('./migrations/addCategoryIdToUserLevelProgress');
const addExperienceToUsers = require('./migrations/addExperienceToUsers');
const updateAvatarDefault = require('./migrations/updateAvatarDefault');
const updateAvatarFieldSize = require('./migrations/updateAvatarFieldSize');
const updateCategoryIconFieldSize = require('./migrations/updateCategoryIconFieldSize');
const createLevelSettingsTable = require('./migrations/createLevelSettingsTable');
const createLevelExperienceRequirementsTable = require('./migrations/createLevelExperienceRequirementsTable');
const addLevelPaymentFields = require('./migrations/addLevelPaymentFields');
const addTaskFileFieldToLevels = require('./migrations/addTaskFileFieldToLevels');
const createUserPurchasedLevelsTable = require('./migrations/createUserPurchasedLevelsTable');
const normalizeEmptyPhoneAndEmail = require('./migrations/normalizeEmptyPhoneAndEmail');
const addLevelHintField = require('./migrations/addLevelHintField');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Статические файлы для скачивания
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS для работы с фронтендом
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // В DEV просто возвращаем тот Origin, который пришёл от фронта
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Создание таблиц при старте
(async () => {
  try {
    await createUsersTable();
    await createUserBalanceTable();
    await addProfileFields();
    await addAdminField();
    await createCategoriesAndLevelsTables();
    await addLevelFields();
    await createBattlePassTable();
    await createUserBattlePassTable();
    await removeExperienceFromBattlePass();
    await createUserLevelProgressTable();
    await addCategoryIdToUserLevelProgress();
    await addExperienceToUsers();
    await updateAvatarDefault();
    await updateAvatarFieldSize();
    await updateCategoryIconFieldSize();
    await createLevelSettingsTable();
    await createLevelExperienceRequirementsTable();
    await addLevelPaymentFields();
    await addTaskFileFieldToLevels();
    await createUserPurchasedLevelsTable();
    await normalizeEmptyPhoneAndEmail();
    await addLevelHintField();
  } catch (err) {
    console.error('Ошибка выполнения миграций:', err);
    process.exit(1);
  }
})();

// Маршруты
app.use('/auth', authRoutes);
app.use('/balance', balanceRoutes);
app.use('/profile', profileRoutes);
app.use('/categories', categoriesRoutes);
app.use('/battlepass', battlepassRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/level-settings', levelSettingsRoutes);
app.use('/level-experience-requirements', levelExperienceRequirementsRoutes);

// Health check endpoint для Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на http://0.0.0.0:${PORT}`);
});