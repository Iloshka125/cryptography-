import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as balanceAPI from '../api/balance.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('isAuthenticated');
    return stored === 'true';
  });
  
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : null;
  });
  
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || null;
  });
  
  const [userPhone, setUserPhone] = useState(() => {
    return localStorage.getItem('userPhone') || null;
  });
  
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || null;
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('isAdmin');
    return stored === 'true';
  });
  
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem('balance');
    return stored ? JSON.parse(stored) : { coins: 0, hints: 0 };
  });

  // Загрузка баланса с сервера
  const fetchBalance = useCallback(async () => {
    if (!userId && !userEmail && !userPhone) return;
    
    try {
      const params = userId ? { user_id: userId } : (userEmail ? { email: userEmail } : { phone: userPhone });
      const response = await balanceAPI.getBalance(params);
      if (response.success && response.balance) {
        setBalance(response.balance);
        localStorage.setItem('balance', JSON.stringify(response.balance));
      }
    } catch (error) {
      console.error('Ошибка загрузки баланса:', error);
    }
  }, [userId, userEmail, userPhone]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
      if (userId) {
        localStorage.setItem('userId', userId.toString());
      }
      if (userEmail) {
        localStorage.setItem('userEmail', userEmail);
      }
      if (userPhone) {
        localStorage.setItem('userPhone', userPhone);
      }
      if (username) {
        localStorage.setItem('username', username);
      }
      if (isAdmin !== undefined) {
        localStorage.setItem('isAdmin', isAdmin.toString());
      }
      // Загружаем баланс при авторизации
      fetchBalance();
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('balance');
      setUserId(null);
      setUserEmail(null);
      setUserPhone(null);
      setUsername(null);
      setIsAdmin(false);
      setBalance({ coins: 0, hints: 0 });
    }
  }, [isAuthenticated, userId, userEmail, userPhone, username, isAdmin, fetchBalance]);

  const login = (userData = {}) => {
    setIsAuthenticated(true);
    if (userData.user_id) {
      setUserId(userData.user_id);
    }
    if (userData.email) {
      setUserEmail(userData.email);
    }
    if (userData.phone) {
      setUserPhone(userData.phone);
    }
    if (userData.username) {
      setUsername(userData.username);
    }
    if (userData.isAdmin !== undefined) {
      setIsAdmin(userData.isAdmin);
    }
    if (userData.balance) {
      setBalance(userData.balance);
      localStorage.setItem('balance', JSON.stringify(userData.balance));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    setUserPhone(null);
    setUsername(null);
    setIsAdmin(false);
    setBalance({ coins: 0, hints: 0 });
  };

  // Функции для работы с балансом
  const updateBalance = async (newBalance) => {
    if (!userId && !userEmail && !userPhone) return;
    
    try {
      const params = userId 
        ? { user_id: userId, ...newBalance }
        : (userEmail ? { email: userEmail, ...newBalance } : { phone: userPhone, ...newBalance });
      
      let response;
      if (newBalance.coins !== undefined && newBalance.hints !== undefined) {
        // Обновляем оба значения
        await balanceAPI.updateCoins({ ...params, coins: newBalance.coins });
        response = await balanceAPI.updateHints({ ...params, hints: newBalance.hints });
      } else if (newBalance.coins !== undefined) {
        response = await balanceAPI.updateCoins({ ...params, coins: newBalance.coins });
      } else if (newBalance.hints !== undefined) {
        response = await balanceAPI.updateHints({ ...params, hints: newBalance.hints });
      }
      
      if (response && response.success && response.balance) {
        setBalance(response.balance);
        localStorage.setItem('balance', JSON.stringify(response.balance));
      }
    } catch (error) {
      console.error('Ошибка обновления баланса:', error);
      throw error;
    }
  };

  const addCoins = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    
    try {
      const params = userId 
        ? { user_id: userId, amount }
        : (userEmail ? { email: userEmail, amount } : { phone: userPhone, amount });
      
      const response = await balanceAPI.addCoins(params);
      if (response.success && response.balance) {
        setBalance(response.balance);
        localStorage.setItem('balance', JSON.stringify(response.balance));
      }
    } catch (error) {
      console.error('Ошибка добавления монет:', error);
      throw error;
    }
  };

  const subtractCoins = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    
    try {
      const params = userId 
        ? { user_id: userId, amount }
        : (userEmail ? { email: userEmail, amount } : { phone: userPhone, amount });
      
      const response = await balanceAPI.subtractCoins(params);
      if (response.success && response.balance) {
        setBalance(response.balance);
        localStorage.setItem('balance', JSON.stringify(response.balance));
      }
    } catch (error) {
      console.error('Ошибка вычитания монет:', error);
      throw error;
    }
  };

  const addHints = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    
    try {
      const params = userId 
        ? { user_id: userId, amount }
        : (userEmail ? { email: userEmail, amount } : { phone: userPhone, amount });
      
      const response = await balanceAPI.addHints(params);
      if (response.success && response.balance) {
        setBalance(response.balance);
        localStorage.setItem('balance', JSON.stringify(response.balance));
      }
    } catch (error) {
      console.error('Ошибка добавления подсказок:', error);
      throw error;
    }
  };

  const subtractHints = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    
    try {
      const params = userId 
        ? { user_id: userId, amount }
        : (userEmail ? { email: userEmail, amount } : { phone: userPhone, amount });
      
      const response = await balanceAPI.subtractHints(params);
      if (response.success && response.balance) {
        setBalance(response.balance);
        localStorage.setItem('balance', JSON.stringify(response.balance));
      }
    } catch (error) {
      console.error('Ошибка вычитания подсказок:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId,
      userEmail,
      userPhone,
      username,
      isAdmin,
      balance,
      login, 
      logout,
      fetchBalance,
      updateBalance,
      addCoins,
      subtractCoins,
      addHints,
      subtractHints,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

