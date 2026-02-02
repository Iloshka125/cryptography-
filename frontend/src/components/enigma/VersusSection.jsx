import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Gamepad2, Trophy, Zap, Clock, renderIconByValue } from '../IconSet.jsx';
import { getChallenges, createChallenge, acceptChallenge, cancelChallenge, getDuelCategories } from '../../api/duels.js';

const VersusSection = ({ showToast, userId, balance }) => {
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [myChallenges, setMyChallenges] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Форма создания заявки
  const [challengeForm, setChallengeForm] = useState({
    opponentId: null, // null для рандомного
    duelCategoryId: null, // null для любой
    difficulty: null, // null для любой
    stake: 100,
  });

  useEffect(() => {
    if (userId) {
      loadChallenges();
      loadCategories();
    }
  }, [userId]);

  // Автообновление каждые 5 секунд
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      loadChallenges();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const loadCategories = async () => {
    try {
      const response = await getDuelCategories(userId);
      if (response.success && response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий дуэлей:', error);
    }
  };

  const loadChallenges = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await getChallenges(userId);
      if (response.success) {
        setMyChallenges(response.myChallenges || []);
        setAvailableChallenges(response.availableChallenges || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      showToast?.('Ошибка загрузки заявок', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!challengeForm.stake || challengeForm.stake <= 0) {
      showToast?.('Ставка должна быть больше 0', 'error');
      return;
    }

    if (balance?.coins < challengeForm.stake) {
      showToast?.('Недостаточно монет', 'error');
      return;
    }

    try {
      setSearching(true);
      const response = await createChallenge(userId, {
        opponentId: challengeForm.opponentId || null,
        duelCategoryId: challengeForm.duelCategoryId || null,
        difficulty: challengeForm.difficulty || null,
        stake: parseInt(challengeForm.stake),
      });

      if (response.success) {
        showToast?.('Заявка создана! Ожидайте соперника...', 'success');
        setIsCreateModalOpen(false);
        setChallengeForm({ opponentId: null, duelCategoryId: null, difficulty: null, stake: 100 });
        await loadChallenges();
      }
    } catch (error) {
      showToast?.(error.message || 'Ошибка создания заявки', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const response = await acceptChallenge(challengeId, userId);
      if (response.success) {
        showToast?.('Заявка принята! Дуэль начнется через 1 минуту.', 'success');
        await loadChallenges();
      }
    } catch (error) {
      showToast?.(error.message || 'Ошибка принятия заявки', 'error');
    }
  };

  const handleCancelChallenge = async (challengeId) => {
    try {
      const response = await cancelChallenge(challengeId, userId);
      if (response.success) {
        showToast?.('Заявка отменена. Монеты возвращены.', 'success');
        await loadChallenges();
      }
    } catch (error) {
      showToast?.(error.message || 'Ошибка отмены заявки', 'error');
    }
  };

  const handleOpenDuel = (challengeId) => {
    navigate(`/duels/${challengeId}`);
  };

  const formatTimeLeft = (startedAt) => {
    if (!startedAt) return 'Ожидание...';
    const start = new Date(startedAt);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Началось!';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидание соперника',
      accepted: 'Принято',
      active: 'Активна',
      completed: 'Завершена',
      cancelled: 'Отменена',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'text-amber-300',
      accepted: 'text-cyan-300',
      active: 'text-green-300',
      completed: 'text-purple-300',
      cancelled: 'text-red-300',
    };
    return colorMap[status] || 'text-cyan-200';
  };

  // Статистика
  const stats = {
    wins: myChallenges.filter(c => c.status === 'completed' && c.winner_id === parseInt(userId)).length,
    total: myChallenges.filter(c => c.status === 'completed' || c.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
          1 VS 1
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Challenge Card */}
        <div className="p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              <Gamepad2 className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-2xl text-cyan-300 mb-2 font-bold">
              Бросить вызов
            </h3>
            <p className="text-cyan-200/80">
              Создайте заявку на дуэль
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-black hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all hover:scale-105 text-lg font-bold py-4"
          >
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              СОЗДАТЬ ЗАЯВКУ
            </span>
          </Button>
        </div>

        {/* Available Challenges */}
        <div className="space-y-4">
          <h3 className="text-xl text-cyan-300 mb-4">Доступные заявки</h3>
          {loading ? (
            <div className="p-6 border border-cyan-400/20 rounded-lg bg-[#0a0a0f]/50 text-center">
              <p className="text-cyan-200/60">Загрузка...</p>
            </div>
          ) : availableChallenges.length > 0 ? (
            availableChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center">
                      {challenge.challenger_avatar && typeof challenge.challenger_avatar === 'string'
                        ? renderIconByValue(challenge.challenger_avatar, 'w-6 h-6 text-black')
                        : renderIconByValue('target', 'w-6 h-6 text-black')}
                    </div>
                    <div>
                      <p className="text-cyan-300 font-semibold">{challenge.challenger_nickname || 'Игрок'}</p>
                      <p className="text-cyan-200/60 text-sm">
                        Ставка: {challenge.stake} монет
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleAcceptChallenge(challenge.id)}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                >
                  ПРИНЯТЬ ВЫЗОВ
                </Button>
              </div>
            ))
          ) : (
            <div className="p-6 border border-cyan-400/20 rounded-lg bg-[#0a0a0f]/50 text-center">
              <p className="text-cyan-200/60">Нет доступных заявок</p>
            </div>
          )}
        </div>
      </div>

      {/* My Challenges */}
      <div className="mt-6">
        <h3 className="text-xl text-cyan-300 mb-4">Мои заявки</h3>
        {loading ? (
          <div className="p-6 border border-cyan-400/20 rounded-lg bg-[#0a0a0f]/50 text-center">
            <p className="text-cyan-200/60">Загрузка...</p>
          </div>
        ) : myChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center">
                      {challenge.opponent_id 
                        ? (challenge.opponent_avatar && typeof challenge.opponent_avatar === 'string'
                            ? renderIconByValue(challenge.opponent_avatar, 'w-6 h-6 text-black')
                            : renderIconByValue('target', 'w-6 h-6 text-black'))
                        : renderIconByValue('target', 'w-6 h-6 text-black')}
                    </div>
                    <div>
                      <p className="text-cyan-300 font-semibold">
                        {challenge.opponent_id ? (challenge.opponent_nickname || 'Соперник') : 'Ожидание соперника...'}
                      </p>
                      {challenge.status === 'completed' ? (
                        <p className={`text-sm font-bold ${
                          challenge.winner_id === parseInt(userId) 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {challenge.winner_id === parseInt(userId) ? '✓ ВЫИГРАЛ' : '✗ ПРОИГРАЛ'}
                        </p>
                      ) : (
                        <p className={`text-sm ${getStatusColor(challenge.status)}`}>
                          {getStatusText(challenge.status)}
                        </p>
                      )}
                    </div>
                  </div>
                  {challenge.status === 'accepted' && challenge.started_at && (
                    <div className="flex items-center gap-2 text-amber-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTimeLeft(challenge.started_at)}</span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-cyan-200/60 text-sm mb-1">Ставка: {challenge.stake} монет</p>
                  {challenge.difficulty && (
                    <p className="text-cyan-200/60 text-sm">Сложность: {challenge.difficulty}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {challenge.status === 'active' && (
                    <Button
                      onClick={() => handleOpenDuel(challenge.id)}
                      className="flex-1 bg-green-400 hover:bg-green-300 text-black shadow-[0_0_15px_rgba(0,255,0,0.4)]"
                    >
                      ПЕРЕЙТИ К ЗАДАНИЮ
                    </Button>
                  )}
                  {challenge.status === 'accepted' && challenge.started_at && (
                    <Button
                      onClick={() => handleOpenDuel(challenge.id)}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_15px_rgba(255,193,7,0.4)]"
                    >
                      ПЕРЕЙТИ К ЗАДАНИЮ
                    </Button>
                  )}
                  {/* Кнопка отмены - показывается до начала дуэли для обоих участников */}
                  {challenge.status !== 'active' && 
                   challenge.status !== 'completed' && 
                   challenge.status !== 'cancelled' &&
                   (challenge.challenger_id === parseInt(userId) || challenge.opponent_id === parseInt(userId)) && (
                    <Button
                      onClick={() => handleCancelChallenge(challenge.id)}
                      className={`${challenge.status === 'accepted' && challenge.started_at ? '' : 'flex-1'} bg-red-400 hover:bg-red-300 text-black shadow-[0_0_15px_rgba(255,0,0,0.4)]`}
                    >
                      ОТМЕНИТЬ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border border-cyan-400/20 rounded-lg bg-[#0a0a0f]/50 text-center">
            <p className="text-cyan-200/60">У вас нет активных заявок</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 text-center">
          <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-2" />
          <p className="text-cyan-200 text-sm mb-1">Побед</p>
          <p className="text-cyan-300 text-2xl font-bold">{stats.wins}</p>
        </div>
        <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 text-center">
          <Gamepad2 className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
          <p className="text-cyan-200 text-sm mb-1">Матчей</p>
          <p className="text-cyan-300 text-2xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Create Challenge Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#0a0a0f] border-2 border-cyan-400/50">
          <DialogHeader>
            <DialogTitle>Создать заявку на дуэль</DialogTitle>
            <DialogDescription>
              Выберите параметры дуэли и установите ставку
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="stake">Ставка (монеты)</Label>
              <Input
                id="stake"
                type="number"
                min="1"
                value={challengeForm.stake}
                onChange={(e) => setChallengeForm({ ...challengeForm, stake: e.target.value })}
                placeholder="100"
              />
              <p className="text-cyan-200/60 text-xs mt-1">
                Ваш баланс: {balance?.coins || 0} монет
              </p>
            </div>

            <div>
              <Label htmlFor="duelCategory">Категория дуэлей (опционально)</Label>
              <select
                id="duelCategory"
                className="w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                value={challengeForm.duelCategoryId || ''}
                onChange={(e) => setChallengeForm({ ...challengeForm, duelCategoryId: e.target.value || null })}
              >
                <option value="">Любая категория</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="difficulty">Сложность (опционально)</Label>
              <select
                id="difficulty"
                className="w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                value={challengeForm.difficulty || ''}
                onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value || null })}
              >
                <option value="">Любая сложность</option>
                <option value="easy">Легкая</option>
                <option value="medium">Средняя</option>
                <option value="hard">Сложная</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateChallenge}
                disabled={searching}
                className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black"
              >
                {searching ? 'Создание...' : 'СОЗДАТЬ'}
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white"
              >
                ОТМЕНА
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

VersusSection.propTypes = {
  showToast: PropTypes.func,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  balance: PropTypes.object,
};

export default VersusSection;
