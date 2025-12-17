import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx';
import { Label } from '../ui/label.jsx';
import { Input } from '../ui/input.jsx';
import { Button } from '../ui/button.jsx';
import { User, Mail, Phone, Lock, Award, CheckCircle2, renderIconByValue, Target, Crown, LockOpen, UserSecret, Code, Gamepad2, Zap, Star, Fire, Rocket, Gem, TheaterMasks, Palette, Magic, Ghost, Dragon, HatWizard, StarOfLife } from '../IconSet.jsx';

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

const ProfileDialog = ({
  open,
  onOpenChange,
  userAvatar,
  setUserAvatar,
  username,
  setUsername,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  onSaveProfile,
  onChangePassword,
  achievements,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-y-auto custom-scrollbar bg-[#0f0f1a] border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl">
      <DialogHeader>
        <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] text-2xl">
          ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
        </DialogTitle>
        <DialogDescription className="text-cyan-200">
          Управление настройками вашего аккаунта
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/50">
            <h3 className="text-lg text-cyan-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Выбор аватара
            </h3>
            <div className="grid grid-cols-6 gap-3">
              {avatars.map((avatar) => {
                const IconComponent = avatar.icon;
                return (
                  <button
                    key={avatar.value}
                    type="button"
                    onClick={() => setUserAvatar(avatar.value)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                      userAvatar === avatar.value
                        ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(0,255,255,0.5)]'
                        : 'border-cyan-200/30 hover:border-cyan-400 hover:bg-cyan-400/10'
                    }`}
                    title={avatar.name}
                  >
                    <IconComponent className="w-6 h-6 text-cyan-300" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/50">
            <h3 className="text-lg text-cyan-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Основная информация
            </h3>
            <form onSubmit={onSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email" className="flex items-center gap-2">
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
                <Label htmlFor="user-phone" className="flex items-center gap-2">
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
                className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
              >
                СОХРАНИТЬ ИЗМЕНЕНИЯ
              </Button>
            </form>
          </div>

          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/50">
            <h3 className="text-lg text-cyan-200 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Изменить пароль
            </h3>
            <form onSubmit={onChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password">Текущий пароль</Label>
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
                <Label htmlFor="new-password">Новый пароль</Label>
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
                <Label htmlFor="confirm-new-password">
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
                className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
              >
                ИЗМЕНИТЬ ПАРОЛЬ
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/50 h-full">
            <h3 className="text-lg text-cyan-200 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Достижения
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    achievement.unlocked
                      ? 'border-amber-300 bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                      : 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl text-cyan-300">
                      {renderIconByValue(achievement.icon || 'award', 'w-8 h-8')}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`mb-1 ${
                          achievement.unlocked
                            ? 'text-amber-200'
                            : 'text-cyan-200'
                        }`}
                      >
                        {achievement.name}
                      </h4>
                      <p className="text-cyan-200 text-sm">
                        {achievement.description}
                      </p>
                      {achievement.unlocked && (
                        <div className="mt-2 flex items-center gap-2 text-green-400 text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Разблокировано
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
    </DialogContent>
  </Dialog>
);

ProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  userAvatar: PropTypes.string.isRequired,
  setUserAvatar: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  setUserEmail: PropTypes.func.isRequired,
  userPhone: PropTypes.string.isRequired,
  setUserPhone: PropTypes.func.isRequired,
  oldPassword: PropTypes.string.isRequired,
  setOldPassword: PropTypes.func.isRequired,
  newPassword: PropTypes.string.isRequired,
  setNewPassword: PropTypes.func.isRequired,
  confirmNewPassword: PropTypes.string.isRequired,
  setConfirmNewPassword: PropTypes.func.isRequired,
  onSaveProfile: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  achievements: PropTypes.array.isRequired,
};

export default ProfileDialog;

