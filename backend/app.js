const express = require('express');
const authRoutes = require('./routes/auth');
const createUsersTable = require('./migrations/createUsersTable');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Создание таблицы при старте
createUsersTable();

// Маршруты
app.use('/auth', authRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});