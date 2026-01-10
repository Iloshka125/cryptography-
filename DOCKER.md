# Docker Guide - Cryptography Platform

Подробное руководство по использованию Docker для запуска проекта.

## 📋 Требования

- **Docker** версии 20.10 или выше
- **Docker Compose** версии 2.0 или выше

Проверьте установку:
```bash
docker --version
docker-compose --version
```

## 🚀 Быстрый старт

### Запуск всего проекта одной командой:

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL базу данных
- Backend API сервер
- Frontend веб-приложение

### Доступ к сервисам:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - User: `cryptography_user`
  - Password: `cryptography_password`
  - Database: `cryptography_db`

## 📝 Основные команды

### Запуск и остановка:

```bash
# Запуск всех сервисов в фоновом режиме
docker-compose up -d

# Запуск с просмотром логов
docker-compose up

# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (удалит данные БД!)
docker-compose down -v
```

### Просмотр логов:

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Последние 100 строк логов
docker-compose logs --tail=100 backend
```

### Управление контейнерами:

```bash
# Статус контейнеров
docker-compose ps

# Перезапуск сервиса
docker-compose restart backend

# Остановка сервиса
docker-compose stop backend

# Запуск сервиса
docker-compose start backend

# Пересборка после изменений
docker-compose build backend
docker-compose up -d backend
```

### Выполнение команд в контейнере:

```bash
# Зайти в контейнер backend
docker-compose exec backend sh

# Выполнить команду в контейнере
docker-compose exec backend npm install

# Зайти в PostgreSQL
docker-compose exec postgres psql -U cryptography_user -d cryptography_db
```

## 🔧 Режим разработки

Для разработки используйте `docker-compose.dev.yml`:

```bash
# Запустить только PostgreSQL и Backend (с hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Frontend запускайте локально для лучшего опыта разработки
cd frontend
npm install
npm run dev
```

Это позволит:
- Видеть изменения в backend коде без пересборки
- Использовать dev tools браузера для frontend
- Быстрее работать с hot-reload

## 🗄️ Работа с базой данных

### Подключение к PostgreSQL:

```bash
# Через docker-compose
docker-compose exec postgres psql -U cryptography_user -d cryptography_db

# Или используя внешний клиент
# Host: localhost
# Port: 5432
# User: cryptography_user
# Password: cryptography_password
# Database: cryptography_db
```

### Резервное копирование:

```bash
# Создать бэкап
docker-compose exec postgres pg_dump -U cryptography_user cryptography_db > backup.sql

# Восстановить из бэкапа
docker-compose exec -T postgres psql -U cryptography_user cryptography_db < backup.sql
```

### Просмотр данных:

```bash
# Список таблиц
docker-compose exec postgres psql -U cryptography_user -d cryptography_db -c "\dt"

# Количество записей в таблице users
docker-compose exec postgres psql -U cryptography_user -d cryptography_db -c "SELECT COUNT(*) FROM users;"
```

## 🔐 Настройка переменных окружения

### Изменение пароля БД:

Отредактируйте `docker-compose.yml`:

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: ваш_новый_пароль
```

И обновите в секции `backend`:

```yaml
backend:
  environment:
    DB_PASSWORD: ваш_новый_пароль
```

### Изменение портов:

```yaml
# Изменить порт frontend с 80 на 8080
frontend:
  ports:
    - "8080:80"

# Изменить порт backend с 3000 на 3001
backend:
  ports:
    - "3001:3000"
```

## 🐛 Решение проблем

### Проблема: Порты уже заняты

```bash
# Проверьте, что использует порт
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Измените порты в docker-compose.yml
```

### Проблема: Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs backend

# Проверьте статус
docker-compose ps

# Пересоберите контейнер
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Проблема: База данных не подключается

```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps postgres

# Проверьте логи PostgreSQL
docker-compose logs postgres

# Перезапустите PostgreSQL
docker-compose restart postgres
```

### Проблема: Изменения не применяются

```bash
# Пересоберите контейнеры
docker-compose build
docker-compose up -d

# Или пересоберите конкретный сервис
docker-compose build backend
docker-compose up -d backend
```

### Проблема: Недостаточно места на диске

```bash
# Очистка неиспользуемых образов
docker system prune -a

# Очистка volumes (удалит данные БД!)
docker volume prune
```

## 📊 Мониторинг

### Использование ресурсов:

```bash
# Статистика использования ресурсов
docker stats

# Для конкретных контейнеров
docker stats cryptography-backend cryptography-frontend cryptography-postgres
```

### Health checks:

Все сервисы имеют health checks. Проверьте статус:

```bash
docker-compose ps
```

Статус `healthy` означает, что сервис работает корректно.

## 🚀 Продакшен

### Рекомендации для продакшена:

1. **Измените пароли** в `docker-compose.yml`
2. **Используйте секреты** для паролей (Docker secrets или переменные окружения)
3. **Настройте SSL/TLS** для frontend (через nginx или reverse proxy)
4. **Настройте бэкапы** базы данных
5. **Используйте volumes** для персистентного хранения данных
6. **Настройте мониторинг** и логирование

### Пример продакшен конфигурации:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    
  backend:
    restart: always
    environment:
      NODE_ENV: production
      
  frontend:
    restart: always
```

Запуск:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)

## 💡 Советы

1. **Используйте `.env` файлы** для конфигурации вместо хардкода в docker-compose.yml
2. **Регулярно делайте бэкапы** базы данных
3. **Мониторьте логи** для раннего обнаружения проблем
4. **Используйте volumes** для персистентного хранения важных данных
5. **Обновляйте образы** регулярно для безопасности

---

**Приятной работы с Docker! 🐳**

