import { useMemo, useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import HeaderBar from '../components/enigma/HeaderBar.jsx';
import {
  CategoriesGrid,
  CategoryLevels,
} from '../components/enigma/CategoriesSection.jsx';
import ShopDialog from '../components/enigma/ShopDialog.jsx';
import BattlePassSection from '../components/enigma/BattlePassSection.jsx';
import LeaderboardSection from '../components/enigma/LeaderboardSection.jsx';
import CompetitionsSection from '../components/enigma/CompetitionsSection.jsx';
import VersusSection from '../components/enigma/VersusSection.jsx';
import { getProfile } from '../api/profile.js';
import { getCategories } from '../api/categories.js';
import { getBattlePassRewards, claimBattlePassReward } from '../api/battlepass.js';

const EnigmaPage = () => {
  const { showToast } = useToast();
  const { 
    balance, 
    subtractCoins, 
    addCoins,
    addHints,
    fetchBalance,
    userId,
    userEmail: authUserEmail,
    userPhone: authUserPhone,
  } = useAuth();

  const [currentSection, setCurrentSection] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userAvatar, setUserAvatar] = useState('🎯');
  const [userLevel, setUserLevel] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [battlePassRewards, setBattlePassRewards] = useState([]);

  // Загружаем профиль и баланс при монтировании и изменении идентификаторов
  useEffect(() => {
    if (userId || authUserEmail || authUserPhone) {
      fetchBalance();
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUserEmail, authUserPhone, fetchBalance]);

  // Загружаем категории из БД
  useEffect(() => {
    loadCategories();
    if (userId) {
      loadBattlePassRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadBattlePassRewards = async () => {
    if (!userId) return;
    
    try {
      const response = await getBattlePassRewards(userId);
      if (response.success && response.rewards) {
        // Преобразуем данные из БД в формат, ожидаемый компонентом
        const formattedRewards = response.rewards.map(reward => ({
          id: reward.id,
          level: reward.level,
          reward: reward.reward,
          unlocked: userLevel >= reward.level,
          claimed: reward.claimed || false,
        }));
        setBattlePassRewards(formattedRewards);
      }
    } catch (error) {
      console.error('Ошибка загрузки наград Battle Pass:', error);
      setBattlePassRewards([]);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getCategories();
      if (response.success && response.categories) {
        // Преобразуем данные из БД в формат, ожидаемый компонентами
        const formattedCategories = response.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          icon: cat.icon || '🔐',
          color: cat.color || '#00ffff',
          levels: (cat.levels || []).map(level => ({
            id: level.id,
            name: level.name,
            description: level.description || '',
            completed: false, // TODO: загрузить прогресс пользователя
            locked: false, // TODO: определить логику блокировки
          })),
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      showToast('Ошибка загрузки категорий', 'error');
      // В случае ошибки используем пустой массив
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
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
        setUserAvatar(profile.avatar || '🎯');
        const newLevel = profile.level || 1;
        setUserLevel(newLevel);
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
        
        // Обновляем баланс, если были зачислены монеты
        if (response.coinsAdded > 0) {
          await fetchBalance();
        }
        
        // Обновляем список наград
        await loadBattlePassRewards();
      }
    } catch (error) {
      console.error('Ошибка получения награды:', error);
      showToast(error.message || 'Ошибка при получении награды', 'error');
    }
  };

  // Обновляем статус разблокировки наград при изменении уровня пользователя
  useEffect(() => {
    if (userLevel && userId) {
      loadBattlePassRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLevel]);


  const leaderboardData = useMemo(() => [
    { rank: 1, username: 'CryptoMaster', score: 15420, avatar: '👑', level: 10 },
    { rank: 2, username: username, score: 12350, avatar: userAvatar, level: userLevel },
    { rank: 3, username: 'CodeBreaker', score: 10890, avatar: '🔓', level: 9 },
    { rank: 4, username: 'DigitalNinja', score: 9540, avatar: '🥷', level: 8 },
    { rank: 5, username: 'HackTheSystem', score: 8720, avatar: '💻', level: 7 },
  ], [username, userAvatar, userLevel]);



  const shopItems = [
    { id: 1, name: '100 монет', price: 1.99, type: 'currency', icon: '💎' },
    { id: 2, name: '500 монет', price: 8.99, type: 'currency', icon: '💎' },
    { id: 3, name: '1000 монет', price: 14.99, type: 'currency', icon: '💎', popular: true },
    { id: 4, name: '1 подсказка', coinPrice: 50, type: 'hint', icon: '💡' },
    { id: 5, name: '5 подсказок', coinPrice: 200, type: 'hint', icon: '💡' },
    { id: 6, name: '10 подсказок', coinPrice: 350, type: 'hint', icon: '💡' },
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

  // Эта страница доступна только для авторизованных пользователей
  // Проверка авторизации происходит в App.jsx через ProtectedRoute
  const currentCategory = categories.find(
    (c) => c.id === selectedCategory,
  );

  return (
    <div className="min-h-screen relative overflow-hidden page-fade-in">
        <HeaderBar
          coins={balance?.coins || 0}
          hints={balance?.hints || 0}
          onChangeSection={(section) => {
            if (section === 'shop') {
              setIsShopOpen(true);
            } else {
              setCurrentSection(section);
              if (section !== 'categories') {
                setSelectedCategory(null);
              }
            }
          }}
          currentSection={currentSection}
          userAvatar={userAvatar}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 slide-stack">
          {currentSection === 'categories' && !selectedCategory && (
            <div className="slide-panel">
              <CategoriesGrid
                categories={categories}
                onSelect={(id) => {
                  setSelectedCategory(id);
                }}
              />
            </div>
          )}

          {currentSection === 'categories' && selectedCategory && (
            <div className="slide-panel">
              <CategoryLevels
                category={currentCategory}
                onBack={() => setSelectedCategory(null)}
              />
            </div>
          )}

          {currentSection === 'battlepass' && (
            <div className="slide-panel">
              <BattlePassSection 
                rewards={battlePassRewards} 
                userLevel={userLevel} 
                showToast={showToast}
                onClaimReward={handleClaimReward}
              />
            </div>
          )}

          {currentSection === 'leaderboard' && (
            <div className="slide-panel">
              <LeaderboardSection 
                data={leaderboardData} 
                username={username}
                userLevel={userLevel}
              />
            </div>
          )}

          {currentSection === 'competitions' && (
            <div className="slide-panel">
              <CompetitionsSection showToast={showToast} />
            </div>
          )}

          {currentSection === 'versus' && (
            <div className="slide-panel">
              <VersusSection showToast={showToast} />
            </div>
          )}
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

export default EnigmaPage;

