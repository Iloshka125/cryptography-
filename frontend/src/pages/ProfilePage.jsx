import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Label } from '../components/ui/label.jsx';
import { Input } from '../components/ui/input.jsx';
import { Button } from '../components/ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog.jsx';
import {
  User,
  Mail,
  Phone,
  Lock,
  Award,
  CheckCircle2,
  ArrowLeft,
  renderIconByValue,
  Target,
  Crown,
  LockOpen,
  UserSecret,
  Code,
  Gamepad2,
  Zap,
  Star,
  Fire,
  Rocket,
  Gem,
  TheaterMasks,
  Palette,
  Magic,
  Ghost,
  Dragon,
  HatWizard,
  StarOfLife,
} from '../components/IconSet.jsx';
import { getProfile, updateProfile, changePassword } from '../api/profile.js';

const avatars = [
  { value: 'target', icon: Target, name: 'Target' },
  { value: 'crown', icon: Crown, name: 'Crown' },
  { value: 'lock-open', icon: LockOpen, name: 'Lock Open' },
  { value: 'user-secret', icon: UserSecret, name: 'User Secret' },
  { value: 'code', icon: Code, name: 'Code' },
  { value: 'gamepad', icon: Gamepad2, name: 'Gamepad' },
  { value: 'zap', icon: Zap, name: 'Zap' },
  { value: 'star', icon: Star, name: 'Star' },
  { value: 'fire', icon: Fire, name: 'Fire' },
  { value: 'rocket', icon: Rocket, name: 'Rocket' },
  { value: 'gem', icon: Gem, name: 'Gem' },
  { value: 'theater-masks', icon: TheaterMasks, name: 'Theater Masks' },
  { value: 'palette', icon: Palette, name: 'Palette' },
  { value: 'magic', icon: Magic, name: 'Magic' },
  { value: 'ghost', icon: Ghost, name: 'Ghost' },
  { value: 'dragon', icon: Dragon, name: 'Dragon' },
  { value: 'hat-wizard', icon: HatWizard, name: 'Hat Wizard' },
  { value: 'star-of-life', icon: StarOfLife, name: 'Star Of Life' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    userId, 
    userEmail: authUserEmail, 
    userPhone: authUserPhone,
    username: authUsername,
    isAuthenticated,
    logout, 
    balance,
    login: authLogin,
    isAdmin 
  } = useAuth();
  
  const [loading, setLoading] = useState(true);
  // Инициализируем начальные значения из AuthContext (будут перезаписаны данными из БД)
  const [userAvatar, setUserAvatar] = useState('target');
  const [username, setUsername] = useState(authUsername || '');
  const [userEmail, setUserEmail] = useState(authUserEmail || '');
  const [userPhone, setUserPhone] = useState(authUserPhone || '');
  const [userLevel, setUserLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState('target');

  // Перенаправляем на приветственную страницу, если пользователь не авторизован
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/enigma', { replace: true });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Загружаем профиль при монтировании и при изменении идентификаторов пользователя
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUserEmail, authUserPhone, isAuthenticated]);

  const loadProfile = async () => {
    if (!userId && !authUserEmail && !authUserPhone) {
      setLoading(false);
      // Если пользователь не авторизован, перенаправляем на приветственную страницу
      navigate('/enigma', { replace: true });
      return;
    }

    try {
      setLoading(true);
      const params = userId 
        ? { user_id: userId }
        : (authUserEmail ? { email: authUserEmail } : { phone: authUserPhone });
      
      const response = await getProfile(params);
      
      if (response.success && response.profile) {
        const profile = response.profile;
        
        // Заполняем форму данными из БД
        setUsername(profile.nickname || '');
        setUserEmail(profile.email || '');
        setUserPhone(profile.phone || '');
        setUserAvatar(profile.avatar || 'target');
        setUserLevel(profile.level || 1);
        setPendingAvatar(profile.avatar || 'target');
        
        // Обновляем данные в AuthContext после загрузки из БД
        authLogin({
          user_id: profile.id || userId,
          email: profile.email,
          phone: profile.phone,
          username: profile.nickname,
          isAdmin: profile.isAdmin || false,
          balance: profile.balance,
        });
        
        // Маппинг достижений
        const achievementMap = {
          1: { id: 1, name: 'Первый шаг', description: 'Завершите свой первый уровень', icon: '🎯' },
          2: { id: 2, name: 'Мастер шифрования', description: 'Завершите 10 уровней', icon: '🔐' },
          3: { id: 3, name: 'Легенда', description: 'Завершите все уровни', icon: '👑' },
          4: { id: 4, name: 'Быстрый ученик', description: 'Завершите уровень за 5 минут', icon: '⚡' },
          5: { id: 5, name: 'Коллекционер', description: 'Соберите 100 монет', icon: '🪙' },
          6: { id: 6, name: 'Социальный', description: 'Добавьте 10 друзей', icon: '👥' },
        };
        
        const mappedAchievements = (profile.achievements || []).map(a => {
          const achievement = achievementMap[a.id];
          if (!achievement) return null;
          return {
            ...achievement,
            unlocked: a.unlocked,
          };
        }).filter(Boolean);
        setAchievements(mappedAchievements);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      showToast('Ошибка загрузки профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAvatarPicker = () => {
    setPendingAvatar(userAvatar);
    setIsAvatarDialogOpen(true);
  };

  const handleAvatarConfirm = () => {
    setUserAvatar(pendingAvatar);
    setIsAvatarDialogOpen(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!userId && !authUserEmail && !authUserPhone) {
      showToast('Ошибка: пользователь не авторизован', 'error');
      return;
    }

    try {
      setUpdatingProfile(true);
      // Создаем базовый объект с данными для обновления
      const updateData = {
        nickname: username,
        email: userEmail,
        phone: userPhone,
        avatar: userAvatar,
      };
      
      // Добавляем идентификатор пользователя (без дублирования ключей)
      const params = userId 
        ? { user_id: userId, ...updateData }
        : (authUserEmail 
          ? { email: authUserEmail, ...updateData }
          : { phone: authUserPhone, ...updateData });
      
      const response = await updateProfile(params);
      
      if (response.success) {
        showToast('Профиль успешно обновлен!', 'success');
        // Обновляем данные в контексте
        authLogin({
          user_id: userId || response.profile.id,
          email: response.profile.email,
          phone: response.profile.phone,
          username: response.profile.nickname,
        });
        // Перезагружаем профиль для получения актуальных данных из БД
        await loadProfile();
      }
    } catch (error) {
      showToast(error.message || 'Ошибка обновления профиля', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      showToast('Новые пароли не совпадают!', 'error');
      return;
    }

    if (!userId && !authUserEmail && !authUserPhone) {
      showToast('Ошибка: пользователь не авторизован', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      const params = userId 
        ? { user_id: userId, old_password: oldPassword, new_password: newPassword }
        : (authUserEmail 
          ? { email: authUserEmail, old_password: oldPassword, new_password: newPassword }
          : { phone: authUserPhone, old_password: oldPassword, new_password: newPassword });
      
      const response = await changePassword(params);
      
      if (response.success) {
        showToast('Пароль успешно изменен!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      showToast(error.message || 'Ошибка изменения пароля', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Вы вышли из профиля', 'success');
    navigate('/enigma');
  };

  if (loading) {
    return (
      <div className="min-h-screen page-fade-in flex items-center justify-center">
        <div className="text-cyan-300 text-xl">Загрузка профиля...</div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={openAvatarPicker}
              className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-300 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.6)] flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#0f0f1a]"
              title="Изменить аватар"
            >
              {renderIconByValue(userAvatar, 'w-16 h-16 text-black')}
            </button>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl text-cyan-300 mb-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
                {username}
              </h2>
              <p className="text-cyan-200 text-lg mb-4">{userEmail}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 rounded-lg">
                  <span className="text-cyan-200 text-sm">Уровень: </span>
                  <span className="text-cyan-300 font-semibold">{userLevel}</span>
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
                  disabled={updatingProfile}
                  className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {updatingProfile ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
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
                  disabled={changingPassword}
                  className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {changingPassword ? 'ИЗМЕНЕНИЕ...' : 'ИЗМЕНИТЬ ПАРОЛЬ'}
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
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement?.id || `achievement-${index}`}
                    className={`p-5 border-2 rounded-lg transition-all hover:scale-[1.02] ${
                      achievement.unlocked
                        ? 'border-amber-300 bg-gradient-to-br from-amber-500/20 to-amber-400/10 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                        : 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0 text-cyan-300">
                        {renderIconByValue(achievement.icon || 'award', 'w-10 h-10')}
                      </div>
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

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Выбор аватара</DialogTitle>
            <DialogDescription>
              Нажмите на понравившийся значок и подтвердите выбор.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
              {avatars.map((avatar) => {
                const IconComponent = avatar.icon;
                const isActive = pendingAvatar === avatar.value;
                return (
                  <button
                    key={avatar.value}
                    type="button"
                    onClick={() => setPendingAvatar(avatar.value)}
                    className={`w-14 h-14 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.6)] scale-110'
                        : 'border-cyan-200/30 hover:border-cyan-400 hover:bg-cyan-400/10'
                    }`}
                    title={avatar.name}
                  >
                    <IconComponent className="w-6 h-6 text-cyan-300" />
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="border border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                onClick={() => setIsAvatarDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="button"
                className="bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                onClick={handleAvatarConfirm}
              >
                Выбрать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;


