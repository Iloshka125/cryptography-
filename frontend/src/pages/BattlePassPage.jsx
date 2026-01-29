import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import HeaderBar from '../components/enigma/HeaderBar.jsx';
import ShopDialog from '../components/enigma/ShopDialog.jsx';
import BattlePassSection from '../components/enigma/BattlePassSection.jsx';
import { getProfile } from '../api/profile.js';
import { getBattlePassRewards, claimBattlePassReward } from '../api/battlepass.js';

const BattlePassPage = () => {
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
  const [userLevel, setUserLevel] = useState(1);
  const [userExperience, setUserExperience] = useState(0);
  const [battlePassRewards, setBattlePassRewards] = useState([]);
  const [battlePassData, setBattlePassData] = useState({
    maxLevel: 10,
    currentLevelExperience: 0,
    nextLevelExperience: 0,
    experienceForNextLevel: 0,
  });

  // Загружаем профиль и баланс при монтировании и изменении идентификаторов
  useEffect(() => {
    if (userId || authUserEmail || authUserPhone) {
      fetchBalance();
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUserEmail, authUserPhone, fetchBalance]);

  // Загружаем Battle Pass при монтировании
  useEffect(() => {
    if (userId) {
      loadBattlePassRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Обновляем Battle Pass при изменении уровня или опыта
  useEffect(() => {
    if (userLevel && userId) {
      loadBattlePassRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLevel, userExperience]);

  const loadBattlePassRewards = async () => {
    if (!userId) return;
    
    try {
      const response = await getBattlePassRewards(userId);
      if (response.success && response.rewards) {
        setBattlePassRewards(response.rewards);
        
        if (response.userExperience !== undefined) {
          setUserExperience(response.userExperience);
        }
        if (response.userLevel !== undefined) {
          setUserLevel(response.userLevel);
        }
        if (response.maxLevel !== undefined) {
          setBattlePassData({
            maxLevel: response.maxLevel || 10,
            currentLevelExperience: response.currentLevelExperience || 0,
            nextLevelExperience: response.nextLevelExperience || 0,
            experienceForNextLevel: response.experienceForNextLevel || 0,
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки наград Battle Pass:', error);
      setBattlePassRewards([]);
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
        setUserAvatar(profile.avatar || 'target');
        const newLevel = profile.level || 1;
        const newExperience = profile.experience || 0;
        setUserLevel(newLevel);
        setUserExperience(newExperience);
        
        if (userId) {
          loadBattlePassRewards();
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!userId) {
      showToast('Ошибка: пользователь не авторизован', 'error');
      return;
    }

    try {
      const response = await claimBattlePassReward(reward.id, userId);
      if (response.success) {
        showToast(
          response.coinsAdded > 0 
            ? `Награда получена! Зачислено ${response.coinsAdded} монет`
            : 'Награда получена!',
          'success'
        );
        
        if (response.coinsAdded > 0) {
          await fetchBalance();
        }
        
        await loadBattlePassRewards();
      }
    } catch (error) {
      console.error('Ошибка получения награды:', error);
      showToast(error.message || 'Ошибка при получении награды', 'error');
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
        currentSection="battlepass"
        userAvatar={userAvatar}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 slide-stack">
        <div className="slide-panel">
          <BattlePassSection 
            rewards={battlePassRewards} 
            userLevel={userLevel}
            userExperience={userExperience}
            battlePassData={battlePassData}
            showToast={showToast}
            onClaimReward={handleClaimReward}
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

export default BattlePassPage;
