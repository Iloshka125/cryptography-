import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import HeaderBar from '../components/enigma/HeaderBar.jsx';
import ShopDialog from '../components/enigma/ShopDialog.jsx';
import LeaderboardSection from '../components/enigma/LeaderboardSection.jsx';
import { getProfile } from '../api/profile.js';
import { getLeaderboard } from '../api/leaderboard.js';

const LeaderboardPage = () => {
  const { showToast } = useToast();
  const { 
    balance, 
    subtractCoins,
    addHints,
    fetchBalance,
    userId,
    userEmail: authUserEmail,
    userPhone: authUserPhone,
  } = useAuth();

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState('target');
  const [username, setUsername] = useState('');
  const [userLevel, setUserLevel] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  // Загружаем профиль и баланс при монтировании и изменении идентификаторов
  useEffect(() => {
    if (userId || authUserEmail || authUserPhone) {
      fetchBalance();
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUserEmail, authUserPhone, fetchBalance]);

  // Загружаем лидерборд при монтировании
  useEffect(() => {
    if (userId) {
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadLeaderboard = async () => {
    if (!userId) return;
    
    try {
      setLeaderboardLoading(true);
      const response = await getLeaderboard(userId, 100);
      if (response.success && response.leaderboard) {
        const formattedLeaderboard = response.leaderboard.map(user => ({
          rank: user.rank,
          username: user.nickname || 'Без имени',
          score: user.experience || 0,
          avatar: user.avatar || 'target',
          level: user.level || 1,
          userId: user.id,
        }));
        setLeaderboardData(formattedLeaderboard);
        
        if (response.userRank) {
          setUserRank(response.userRank.rank);
        } else {
          const userIndex = formattedLeaderboard.findIndex(u => u.userId === parseInt(userId));
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки лидерборда:', error);
      showToast('Ошибка загрузки лидерборда', 'error');
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!userId && !authUserEmail && !authUserPhone) return;

    try {
      const params = userId 
        ? { user_id: userId }
        : (authUserEmail ? { email: authUserEmail } : { phone: authUserPhone });
      
      const response = await getProfile(params);
      
      if (response.success && response.profile) {
        const profile = response.profile;
        setUsername(profile.nickname || '');
        setUserAvatar(profile.avatar || 'target');
        const newLevel = profile.level || 1;
        setUserLevel(newLevel);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const shopItems = [
    { id: 1, name: '100 монет', price: 1.99, type: 'currency', icon: '💎' },
    { id: 2, name: '500 монет', price: 8.99, type: 'currency', icon: '💎' },
    { id: 3, name: '1000 монет', price: 14.99, type: 'currency', icon: '💎', popular: true },
    { id: 4, name: '1 подсказка', coinPrice: 50, type: 'hint', icon: 'zap' },
    { id: 5, name: '5 подсказок', coinPrice: 200, type: 'hint', icon: 'zap' },
    { id: 6, name: '10 подсказок', coinPrice: 350, type: 'hint', icon: 'zap' },
  ];

  const handleBuyHints = async (amount, price) => {
    if ((balance?.coins || 0) >= price) {
      try {
        await subtractCoins(price);
        await addHints(amount);
        showToast(`Куплено ${amount} подсказок!`, 'success');
      } catch (error) {
        showToast(error.message || 'Ошибка при покупке подсказок', 'error');
      }
    } else {
      showToast('Недостаточно монет!', 'error');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden page-fade-in">
      <HeaderBar
        coins={balance?.coins || 0}
        hints={balance?.hints || 0}
        onChangeSection={(section) => {
          if (section === 'shop') {
            setIsShopOpen(true);
          }
        }}
        currentSection="leaderboard"
        userAvatar={userAvatar}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 slide-stack">
        <div className="slide-panel">
          <LeaderboardSection 
            data={leaderboardData} 
            username={username}
            userLevel={userLevel}
            loading={leaderboardLoading}
            userRank={userRank}
          />
        </div>
      </div>

      <ShopDialog
        open={isShopOpen}
        onOpenChange={setIsShopOpen}
        shopItems={shopItems}
        onBuyHints={handleBuyHints}
        coins={balance?.coins || 0}
        showToast={showToast}
      />
    </div>
  );
};

export default LeaderboardPage;
