import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Label } from '../components/ui/label.jsx';
import { Input } from '../components/ui/input.jsx';
import { Button } from '../components/ui/button.jsx';
import { User, Mail, Phone, Lock, Award, CheckCircle2, ArrowLeft } from '../components/IconSet.jsx';

const avatars = [
  '🎯',
  '👑',
  '🔓',
  '🥷',
  '💻',
  '🎮',
  '⚡',
  '🌟',
  '🔥',
  '🚀',
  '💎',
  '🎪',
  '🦾',
  '🌀',
  '⭐',
  '🎨',
  '🔮',
  '🎭',
];

const achievements = [
  {
    id: 1,
    name: 'Первый шаг',
    description: 'Завершите свой первый уровень',
    icon: '🎯',
    unlocked: true,
  },
  {
    id: 2,
    name: 'Мастер шифрования',
    description: 'Завершите 10 уровней',
    icon: '🔐',
    unlocked: true,
  },
  {
    id: 3,
    name: 'Легенда',
    description: 'Завершите все уровни',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 4,
    name: 'Быстрый ученик',
    description: 'Завершите уровень за 5 минут',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 5,
    name: 'Коллекционер',
    description: 'Соберите 100 монет',
    icon: '🪙',
    unlocked: true,
  },
  {
    id: 6,
    name: 'Социальный',
    description: 'Добавьте 10 друзей',
    icon: '👥',
    unlocked: false,
  },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { username: authUsername, logout, balance, userEmail: authUserEmail, userPhone: authUserPhone } = useAuth();
  
  const [userAvatar, setUserAvatar] = useState('🎯');
  const [username, setUsername] = useState(authUsername || 'CyberHacker');
  const [userEmail, setUserEmail] = useState(authUserEmail || 'user@cybernet.com');
  const [userPhone, setUserPhone] = useState(authUserPhone || '+7 (999) 123-45-67');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    showToast('Профиль успешно обновлен!', 'success');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('Новые пароли не совпадают!', 'error');
      return;
    }
    showToast('Пароль успешно изменен!', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleLogout = () => {
    logout();
    showToast('Вы вышли из профиля', 'success');
    navigate('/enigma');
  };

  return (
    <div className="min-h-screen page-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate('/enigma')}
            className="bg-transparent border-2 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            НАЗАД
          </Button>
          <h1 className="text-4xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
            ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
          </h1>
          <div className="ml-auto">
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-rose-500 to-amber-400 text-black hover:from-rose-400 hover:to-amber-300 shadow-[0_0_20px_rgba(255,82,82,0.4)] transition-all"
            >
              ВЫЙТИ
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="mb-8 p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-300 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.6)] flex items-center justify-center text-6xl">
              {userAvatar}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl text-cyan-300 mb-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
                {username}
              </h2>
              <p className="text-cyan-200 text-lg mb-4">{userEmail}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 rounded-lg">
                  <span className="text-cyan-200 text-sm">Уровень: </span>
                  <span className="text-cyan-300 font-semibold">7</span>
                </div>
                <div className="px-4 py-2 bg-amber-400/20 border border-amber-400/50 rounded-lg">
                  <span className="text-amber-200 text-sm">Монеты: </span>
                  <span className="text-amber-300 font-semibold">{balance?.coins || 0}</span>
                </div>
                <div className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 rounded-lg">
                  <span className="text-cyan-200 text-sm">Подсказки: </span>
                  <span className="text-cyan-300 font-semibold">{balance?.hints || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Avatar Selection */}
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-xl text-cyan-300 mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                <User className="w-5 h-5" />
                Выбор аватара
              </h3>
              <div className="grid grid-cols-6 gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setUserAvatar(avatar)}
                    className={`w-14 h-14 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                      userAvatar === avatar
                        ? 'border-cyan-400 bg-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.6)] scale-110'
                        : 'border-cyan-200/30 hover:border-cyan-400 hover:bg-cyan-400/10'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-xl text-cyan-300 mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                <User className="w-5 h-5" />
                Основная информация
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-cyan-200">Имя пользователя</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email" className="text-cyan-200 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone" className="text-cyan-200 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Номер телефона
                  </Label>
                  <Input
                    id="user-phone"
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:scale-[1.02]"
                >
                  СОХРАНИТЬ ИЗМЕНЕНИЯ
                </Button>
              </form>
            </div>

            {/* Password Change */}
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-xl text-cyan-300 mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                <Lock className="w-5 h-5" />
                Изменить пароль
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password" className="text-cyan-200">Текущий пароль</Label>
                  <Input
                    id="old-password"
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-cyan-200">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="text-cyan-200">
                    Подтвердите новый пароль
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:scale-[1.02]"
                >
                  ИЗМЕНИТЬ ПАРОЛЬ
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column - Achievements */}
          <div className="space-y-6">
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-xl text-cyan-300 mb-6 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                <Award className="w-5 h-5" />
                Достижения
              </h3>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-5 border-2 rounded-lg transition-all hover:scale-[1.02] ${
                      achievement.unlocked
                        ? 'border-amber-300 bg-gradient-to-br from-amber-500/20 to-amber-400/10 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                        : 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4
                          className={`mb-2 text-lg font-semibold ${
                            achievement.unlocked
                              ? 'text-amber-200'
                              : 'text-cyan-200'
                          }`}
                        >
                          {achievement.name}
                        </h4>
                        <p className="text-cyan-200/80 text-sm mb-3">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Разблокировано</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


