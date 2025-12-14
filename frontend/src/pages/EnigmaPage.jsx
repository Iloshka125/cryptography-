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

const EnigmaPage = () => {
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

  const [currentSection, setCurrentSection] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userAvatar, setUserAvatar] = useState('🎯');
  const [userLevel, setUserLevel] = useState(1);

  // Загружаем профиль и баланс при монтировании и изменении идентификаторов
  useEffect(() => {
    if (userId || authUserEmail || authUserPhone) {
      fetchBalance();
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUserEmail, authUserPhone, fetchBalance]);

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
        setUserLevel(profile.level || 1);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const categories = useMemo(
    () => [
      {
        id: 'symmetric',
        name: 'Симметричное шифрование',
        description:
          'Изучите алгоритмы AES, DES и другие методы симметричной криптографии',
        icon: '🔐',
        color: '#00ffff',
        levels: [
          { id: 1, name: 'Основы симметричного шифрования', completed: true, locked: false },
          { id: 2, name: 'Алгоритм Caesar Cipher', completed: true, locked: false },
          { id: 3, name: 'DES: Data Encryption Standard', completed: false, locked: false },
          { id: 4, name: 'AES: Advanced Encryption Standard', completed: false, locked: true },
          { id: 5, name: 'Режимы работы блочных шифров', completed: false, locked: true },
        ],
      },
      {
        id: 'asymmetric',
        name: 'Асимметричное шифрование',
        description:
          'Освойте RSA, ECC и принципы публичного и приватного ключей',
        icon: '🔑',
        color: '#00d4ff',
        levels: [
          { id: 1, name: 'Введение в асимметричную криптографию', completed: false, locked: false },
          { id: 2, name: 'Математические основы RSA', completed: false, locked: false },
          { id: 3, name: 'Реализация алгоритма RSA', completed: false, locked: true },
          { id: 4, name: 'Эллиптические кривые (ECC)', completed: false, locked: true },
          { id: 5, name: 'Diffie-Hellman обмен ключами', completed: false, locked: true },
        ],
      },
      {
        id: 'hashing',
        name: 'Хеширование и подписи',
        description:
          'Погрузитесь в мир хеш-функций, SHA, MD5 и цифровых подписей',
        icon: '🔏',
        color: '#5ec8d8',
        levels: [
          { id: 1, name: 'Основы хеш-функций', completed: false, locked: false },
          { id: 2, name: 'MD5 и его уязвимости', completed: false, locked: false },
          { id: 3, name: 'Семейство SHA: SHA-1, SHA-256', completed: false, locked: false },
          { id: 4, name: 'Цифровые подписи', completed: false, locked: true },
          { id: 5, name: 'HMAC и аутентификация', completed: false, locked: true },
        ],
      },
    ],
    [],
  );

  const leaderboardData = useMemo(() => [
    { rank: 1, username: 'CryptoMaster', score: 15420, avatar: '👑', level: 10 },
    { rank: 2, username: username, score: 12350, avatar: userAvatar, level: userLevel },
    { rank: 3, username: 'CodeBreaker', score: 10890, avatar: '🔓', level: 9 },
    { rank: 4, username: 'DigitalNinja', score: 9540, avatar: '🥷', level: 8 },
    { rank: 5, username: 'HackTheSystem', score: 8720, avatar: '💻', level: 7 },
  ], [username, userAvatar, userLevel]);


  const battlePassRewards = [
    { level: 1, reward: '100 монет', unlocked: true, claimed: true },
    { level: 2, reward: '5 подсказок', unlocked: true, claimed: true },
    { level: 3, reward: 'Скин "Неон"', unlocked: true, claimed: false },
    { level: 4, reward: '250 монет', unlocked: true, claimed: false },
    { level: 5, reward: 'Уникальный аватар', unlocked: false, claimed: false },
    { level: 6, reward: '500 монет', unlocked: false, claimed: false },
    { level: 7, reward: 'Уникальный значок 👑', unlocked: false, claimed: false },
    { level: 8, reward: '10 подсказок', unlocked: false, claimed: false },
    { level: 9, reward: '1000 монет', unlocked: false, claimed: false },
    { level: 10, reward: 'Легендарный аватар 🌟', unlocked: false, claimed: false },
  ];

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
              <BattlePassSection rewards={battlePassRewards} userLevel={userLevel} showToast={showToast} />
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

