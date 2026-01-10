FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
# Используем npm install для большей гибкости с package-lock.json
RUN npm install --omit=dev --legacy-peer-deps

# Копируем остальные файлы
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads/tasks && chmod 755 uploads/tasks

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "app.js"]

