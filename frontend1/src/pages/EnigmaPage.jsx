import { useMemo, useState } from 'react';
import HeaderBar from '../components/enigma/HeaderBar.jsx';
import {
  CategoriesGrid,
  CategoryLevels,
} from '../components/enigma/CategoriesSection.jsx';
import ShopSection from '../components/enigma/ShopSection.jsx';
import BattlePassSection from '../components/enigma/BattlePassSection.jsx';
import LeaderboardSection from '../components/enigma/LeaderboardSection.jsx';
import ProfileDialog from '../components/enigma/ProfileDialog.jsx';
import AuthModal from '../components/enigma/AuthModal.jsx';
import HeroSection from '../components/enigma/HeroSection.jsx';

const EnigmaPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalState, setModalState] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [username, setUsername] = useState('CyberHacker');
  const [userEmail, setUserEmail] = useState('user@cybernet.com');
  const [userPhone, setUserPhone] = useState('+7 (999) 123-45-67');
  const [userAvatar, setUserAvatar] = useState('🎯');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [currentSection, setCurrentSection] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [coins, setCoins] = useState(1000);
  const [hints, setHints] = useState(5);

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

  const leaderboardData = [
    { rank: 1, username: 'CryptoMaster', score: 15420, avatar: '👑' },
    { rank: 2, username: 'CyberHacker', score: 12350, avatar: '🎯' },
    { rank: 3, username: 'CodeBreaker', score: 10890, avatar: '🔓' },
    { rank: 4, username: 'DigitalNinja', score: 9540, avatar: '🥷' },
    { rank: 5, username: 'HackTheSystem', score: 8720, avatar: '💻' },
    { rank: 6, username: 'ByteBandit', score: 7650, avatar: '🎮' },
    { rank: 7, username: 'NeonCoder', score: 6430, avatar: '⚡' },
    { rank: 8, username: 'QuantumHack', score: 5820, avatar: '🌟' },
    { rank: 9, username: 'BinaryBoss', score: 4990, avatar: '🔥' },
    { rank: 10, username: 'MatrixRunner', score: 4120, avatar: '🚀' },
  ];

  const achievements = [
    { id: 1, name: 'Первый шаг', description: 'Пройдите первый уровень', unlocked: true, icon: '🎯' },
    { id: 2, name: 'Взломщик', description: 'Взломайте 5 шифров', unlocked: true, icon: '🔓' },
    { id: 3, name: 'Коллекционер', description: 'Соберите 1000 монет', unlocked: true, icon: '💰' },
    { id: 4, name: 'Мастер кода', description: 'Пройдите все уровни без подсказок', unlocked: false, icon: '👑' },
    { id: 5, name: 'Легенда', description: 'Победите финального босса', unlocked: false, icon: '⭐' },
  ];

  const battlePassRewards = [
    { level: 1, reward: '100 монет', unlocked: true },
    { level: 2, reward: '5 подсказок', unlocked: true },
    { level: 3, reward: 'Скин "Неон"', unlocked: false },
    { level: 4, reward: '250 монет', unlocked: false },
    { level: 5, reward: 'Уникальный аватар', unlocked: false },
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
    setIsAuthenticated(true);
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
    setIsAuthenticated(true);
    setIsOpen(false);
  };

  const openAuthModal = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTask1Answers({
      question1: false,
      question2: false,
      question3: false,
    });
    setTask2Answer('');
    setTask3Answer('');
    setRegistrationStep(0);
    setModalState('login');
    setIsOpen(true);
  };

  const handleBuyHints = (amount, price) => {
    if (coins >= price) {
      setCoins(coins - price);
      setHints(hints + amount);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert('Профиль успешно обновлен!');
    setIsProfileOpen(false);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('Новые пароли не совпадают!');
      return;
    }
    alert('Пароль успешно изменен!');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
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
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <HeaderBar
          coins={coins}
          hints={hints}
          onOpenProfile={() => setIsProfileOpen(true)}
          onChangeSection={(section) => {
            setCurrentSection(section);
            if (section !== 'categories') {
              setSelectedCategory(null);
            }
          }}
          currentSection={currentSection}
          userAvatar={userAvatar}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
          {currentSection === 'categories' && !selectedCategory && (
            <CategoriesGrid
              categories={categories}
              onSelect={(id) => {
                setSelectedCategory(id);
              }}
            />
          )}

          {currentSection === 'categories' && selectedCategory && (
            <CategoryLevels
              category={currentCategory}
              onBack={() => setSelectedCategory(null)}
            />
          )}

          {currentSection === 'shop' && (
            <ShopSection
              shopItems={shopItems}
              onBuyHints={handleBuyHints}
              coins={coins}
            />
          )}

          {currentSection === 'battlepass' && (
            <BattlePassSection rewards={battlePassRewards} />
          )}

          {currentSection === 'leaderboard' && (
            <LeaderboardSection data={leaderboardData} />
          )}
        </div>

        <ProfileDialog
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          userAvatar={userAvatar}
          setUserAvatar={setUserAvatar}
          username={username}
          setUsername={setUsername}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          userPhone={userPhone}
          setUserPhone={setUserPhone}
          oldPassword={oldPassword}
          setOldPassword={setOldPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          onSaveProfile={handleProfileUpdate}
          onChangePassword={handlePasswordChange}
          achievements={achievements}
        />
      </div>
    );
  }

  return (
    <>
      <HeroSection onStart={openAuthModal} />
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
    </>
  );
};

export default EnigmaPage;

