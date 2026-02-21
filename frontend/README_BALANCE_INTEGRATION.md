# Интеграция баланса монет и подсказок во фронтенд

## Что было сделано

1. **Создан API клиент** (`src/api/balance.js`)
   - Функции для получения и обновления баланса
   - Функции для добавления/вычитания монет и подсказок

2. **Обновлен AuthContext** (`src/contexts/AuthContext.jsx`)
   - Добавлено хранение `userId`, `userEmail`, `userPhone`
   - Добавлено хранение баланса (`balance: { coins, hints }`)
   - Добавлены функции для работы с балансом:
     - `fetchBalance()` - загрузка баланса с сервера
     - `updateBalance(newBalance)` - обновление баланса
     - `addCoins(amount)` - добавление монет
     - `subtractCoins(amount)` - вычитание монет
     - `addHints(amount)` - добавление подсказок
     - `subtractHints(amount)` - вычитание подсказок

3. **Обновлены страницы авторизации**
   - `LoginPage.jsx` - сохраняет баланс при входе
   - `RegisterPage.jsx` - устанавливает начальный баланс при регистрации

4. **Обновлены компоненты**
   - `EnigmaPage.jsx` - использует баланс из контекста вместо локального состояния
   - `ProfilePage.jsx` - отображает баланс из контекста
   - `ShopDialog.jsx` - работает с балансом через функции контекста

## Использование

### Получение баланса в компоненте

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

const MyComponent = () => {
  const { balance, fetchBalance } = useAuth();
  
  useEffect(() => {
    fetchBalance(); // Загрузить баланс при монтировании
  }, [fetchBalance]);
  
  return (
    <div>
      <p>Монеты: {balance.coins}</p>
      <p>Подсказки: {balance.hints}</p>
    </div>
  );
};
```

### Обновление баланса

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

const MyComponent = () => {
  const { addCoins, subtractCoins, addHints, subtractHints, showToast } = useAuth();
  
  const handleBuyItem = async () => {
    try {
      await subtractCoins(100); // Вычесть 100 монет
      await addHints(5); // Добавить 5 подсказок
      showToast('Покупка успешна!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  return <button onClick={handleBuyItem}>Купить</button>;
};
```

## Автоматическая синхронизация

- Баланс загружается по сессии (cookie), без использования localStorage
- При входе и по запросу баланс берётся с сервера через защищённые по сессии API
- При выходе сессия уничтожается на сервере, состояние сбрасывается

## Структура данных баланса

```javascript
balance = {
  coins: 1000,  // Количество монет
  hints: 5      // Количество подсказок
}
```

