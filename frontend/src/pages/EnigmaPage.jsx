import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AuthModal from '../components/enigma/AuthModal.jsx';
import HeroSection from '../components/enigma/HeroSection.jsx';

const EnigmaPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    isAuthenticated, 
    login: authLogin, 
    balance, 
    subtractCoins, 
    addHints,
    fetchBalance 
  } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalState, setModalState] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [username] = useState('CyberHacker');
  const [userAvatar] = useState('🎯');

  const [currentSection, setCurrentSection] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [userLevel, setUserLevel] = useState(7);

  // Загружаем баланс при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, fetchBalance]);

  const [registrationStep, setRegistrationStep] = useState(0);
  const [task1Answers, setTask1Answers] = useState({
    question1: false,
    question2: false,
    question3: false,
  });
  const [task2Answer, setTask2Answer] = useState('');
  const [task3Answer, setTask3Answer] = useState('');

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

  const handleLogin = (e) => {
    e.preventDefault();
    authLogin(); // Устанавливаем авторизацию через контекст
    setIsOpen(false);
  };

  const handleRegisterDataSubmit = (e) => {
    e.preventDefault();
    setRegistrationStep(1);
  };

  const handleTask1Submit = (e) => {
    e.preventDefault();
    const allChecked = Object.values(task1Answers).every(Boolean);
    if (allChecked) {
      setRegistrationStep(2);
    }
  };

  const handleTask2Submit = (e) => {
    e.preventDefault();
    if (task2Answer.trim().length >= 10) {
      setRegistrationStep(3);
    }
  };

  const handleTask3Submit = (e) => {
    e.preventDefault();
    if (task3Answer.trim().length >= 50) {
      setRegistrationStep(4);
    }
  };

  const handleFinalRegistration = () => {
    authLogin(); // Устанавливаем авторизацию через контекст
    setIsOpen(false);
  };

  const openAuthModal = () => {
    // Плавный переход к странице регистрации
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setIsTransitioning(true);
    setIsOpen(false);
    setModalState('register');
    transitionTimeoutRef.current = setTimeout(() => {
      navigate('/register');
    }, 180); // легкая задержка для анимации
  };

  const handleBuyHints = async (amount, price) => {
    if (balance.coins >= price) {
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


  const isTask1AllChecked = useMemo(
    () => Object.values(task1Answers).every(Boolean),
    [task1Answers],
  );

  if (isAuthenticated) {
    const currentCategory = categories.find(
      (c) => c.id === selectedCategory,
    );

    return (
      <div className={`min-h-screen relative overflow-hidden ${isTransitioning ? 'page-fade-out' : 'page-fade-in'}`}>
        <HeaderBar
          coins={balance.coins}
          hints={balance.hints}
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
              coins={balance.coins}
              showToast={showToast}
            />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className={`slide-panel ${isTransitioning ? 'page-fade-out' : 'page-fade-in'}`}>
        <HeroSection onStart={openAuthModal} />
      </div>
      <div className={`slide-panel ${isTransitioning ? 'page-fade-out' : 'page-fade-in'}`}>
        <AuthModal
          open={isOpen}
          onOpenChange={setIsOpen}
          modalState={modalState}
          setModalState={setModalState}
          registrationStep={registrationStep}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          task1Answers={task1Answers}
          task2Answer={task2Answer}
          task3Answer={task3Answer}
          isTask1AllChecked={isTask1AllChecked}
          setEmail={setEmail}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
          setTask1Answers={setTask1Answers}
          setTask2Answer={setTask2Answer}
          setTask3Answer={setTask3Answer}
          handleLogin={handleLogin}
          handleRegisterDataSubmit={handleRegisterDataSubmit}
          handleTask1Submit={handleTask1Submit}
          handleTask2Submit={handleTask2Submit}
          handleTask3Submit={handleTask3Submit}
          handleFinalRegistration={handleFinalRegistration}
        />
      </div>
    </div>
  );
};

export default EnigmaPage;

