import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authAPI from '../api/auth.js';
import * as balanceAPI from '../api/balance.js';

const AuthContext = createContext(null);

function userDataToState(user) {
  if (!user) return null;
  return {
    userId: user.user_id,
    userEmail: user.email || null,
    userPhone: user.phone || null,
    username: user.nickname || null,
    isAdmin: user.isAdmin || false,
    balance: user.balance ? { ...user.balance } : { coins: 0, hints: 0 },
  };
}

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userPhone, setUserPhone] = useState(null);
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [balance, setBalance] = useState({ coins: 0, hints: 0 });

  const setUserFromResponse = useCallback((user) => {
    const s = userDataToState(user);
    if (!s) return;
    setIsAuthenticated(true);
    setUserId(s.userId);
    setUserEmail(s.userEmail);
    setUserPhone(s.userPhone);
    setUsername(s.username);
    setIsAdmin(s.isAdmin);
    setBalance(s.balance);
  }, []);

  useEffect(() => {
    let cancelled = false;
    authAPI
      .getMe()
      .then((data) => {
        if (cancelled || !data.user) return;
        setUserFromResponse(data.user);
      })
      .catch(() => {
        if (!cancelled) {
          setIsAuthenticated(false);
          setUserId(null);
          setUserEmail(null);
          setUserPhone(null);
          setUsername(null);
          setIsAdmin(false);
          setBalance({ coins: 0, hints: 0 });
        }
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => { cancelled = true; };
  }, [setUserFromResponse]);

  const fetchBalance = useCallback(async () => {
    if (!userId && !userEmail && !userPhone) return;
    try {
      const response = await balanceAPI.getBalance();
      if (response.success && response.balance) {
        setBalance(response.balance);
      }
    } catch (error) {
      console.error('Ошибка загрузки баланса:', error);
    }
  }, [userId, userEmail, userPhone]);

  const login = useCallback((userData = {}) => {
    setUserFromResponse({
      user_id: userData.user_id,
      nickname: userData.nickname ?? userData.username,
      email: userData.email,
      phone: userData.phone,
      isAdmin: userData.isAdmin,
      balance: userData.balance,
    });
  }, [setUserFromResponse]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logoutRequest();
    } catch (e) {
      // cookie уже может быть недействителен
    }
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    setUserPhone(null);
    setUsername(null);
    setIsAdmin(false);
    setBalance({ coins: 0, hints: 0 });
  }, []);

  const updateBalance = async (newBalance) => {
    if (!userId && !userEmail && !userPhone) return;
    try {
      let response;
      if (newBalance.coins !== undefined && newBalance.hints !== undefined) {
        await balanceAPI.updateCoins({ coins: newBalance.coins });
        response = await balanceAPI.updateHints({ hints: newBalance.hints });
      } else if (newBalance.coins !== undefined) {
        response = await balanceAPI.updateCoins({ coins: newBalance.coins });
      } else if (newBalance.hints !== undefined) {
        response = await balanceAPI.updateHints({ hints: newBalance.hints });
      }
      if (response && response.success && response.balance) {
        setBalance(response.balance);
      }
    } catch (error) {
      console.error('Ошибка обновления баланса:', error);
      throw error;
    }
  };

  const addCoins = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    const response = await balanceAPI.addCoins({ amount });
    if (response.success && response.balance) setBalance(response.balance);
    return response;
  };

  const subtractCoins = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    const response = await balanceAPI.subtractCoins({ amount });
    if (response.success && response.balance) setBalance(response.balance);
    return response;
  };

  const addHints = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    const response = await balanceAPI.addHints({ amount });
    if (response.success && response.balance) setBalance(response.balance);
    return response;
  };

  const subtractHints = async (amount) => {
    if (!userId && !userEmail && !userPhone) return;
    const response = await balanceAPI.subtractHints({ amount });
    if (response.success && response.balance) setBalance(response.balance);
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
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
      }}
    >
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
