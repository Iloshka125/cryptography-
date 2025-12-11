# API для работы с балансом монет и подсказок

## Описание

Система управления балансом пользователей. Каждый пользователь имеет баланс монет и подсказок, которые хранятся в таблице `user_balance`.

## Таблица user_balance

```sql
CREATE TABLE user_balance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 1000 CHECK (coins >= 0),
  hints INTEGER NOT NULL DEFAULT 5 CHECK (hints >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Получить баланс пользователя
**POST** `/balance/get`

**Тело запроса:**
```json
{
  "user_id": 1
}
```
или
```json
{
  "email": "user@example.com"
}
```
или
```json
{
  "phone": "+79281716796"
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 1000,
    "hints": 5
  }
}
```

### 2. Обновить баланс монет
**POST** `/balance/update-coins`

**Тело запроса:**
```json
{
  "user_id": 1,
  "coins": 1500
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 1500,
    "hints": 5
  }
}
```

### 3. Обновить баланс подсказок
**POST** `/balance/update-hints`

**Тело запроса:**
```json
{
  "user_id": 1,
  "hints": 10
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 1000,
    "hints": 10
  }
}
```

### 4. Добавить монеты
**POST** `/balance/add-coins`

**Тело запроса:**
```json
{
  "user_id": 1,
  "amount": 500
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 1500,
    "hints": 5
  }
}
```

### 5. Вычесть монеты
**POST** `/balance/subtract-coins`

**Тело запроса:**
```json
{
  "user_id": 1,
  "amount": 200
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 800,
    "hints": 5
  }
}
```

**Ошибка при недостатке монет:**
```json
{
  "error": "Недостаточно монет"
}
```

### 6. Добавить подсказки
**POST** `/balance/add-hints`

**Тело запроса:**
```json
{
  "user_id": 1,
  "amount": 3
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 1000,
    "hints": 8
  }
}
```

### 7. Вычесть подсказки
**POST** `/balance/subtract-hints`

**Тело запроса:**
```json
{
  "user_id": 1,
  "amount": 2
}
```

**Ответ:**
```json
{
  "success": true,
  "balance": {
    "coins": 1000,
    "hints": 3
  }
}
```

**Ошибка при недостатке подсказок:**
```json
{
  "error": "Недостаточно подсказок"
}
```

## Автоматическое создание баланса

- При регистрации нового пользователя автоматически создается баланс с начальными значениями:
  - Монеты: 1000
  - Подсказки: 5

- При первом запросе баланса, если его нет, он создается автоматически с дефолтными значениями.

## Обновленные endpoints авторизации

### Регистрация
**POST** `/auth/register`

Теперь возвращает `user_id`:
```json
{
  "message": "Пользователь успешно зарегистрирован",
  "user_id": 1
}
```

### Вход
**POST** `/auth/login`

Теперь возвращает баланс пользователя:
```json
{
  "message": "Успешный вход",
  "nickname": "CyberHacker",
  "user_id": 1,
  "balance": {
    "coins": 1000,
    "hints": 5
  }
}
```

## Примеры использования

### Получить баланс по email
```bash
curl -X POST http://localhost:3000/balance/get \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Купить подсказки (вычесть монеты и добавить подсказки)
```bash
# Вычесть 200 монет
curl -X POST http://localhost:3000/balance/subtract-coins \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "amount": 200}'

# Добавить 5 подсказок
curl -X POST http://localhost:3000/balance/add-hints \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "amount": 5}'
```

