import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ArrowLeft, CheckCircle2, Code, Target, Zap, Clock } from '../components/IconSet.jsx';
import Button from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { getChallengeById, submitDuelAnswer } from '../api/duels.js';

const DuelPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userId } = useAuth();
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [prize, setPrize] = useState(0);

  useEffect(() => {
    if (userId && challengeId) {
      loadChallenge();
    }
  }, [challengeId, userId]);

  // Таймер для активной дуэли или принятой (ожидающей начала)
  useEffect(() => {
    if (!challenge || (challenge.status !== 'active' && challenge.status !== 'accepted') || !challenge.started_at) return;

    const updateTimer = () => {
      const startTime = new Date(challenge.started_at);
      const now = new Date();
      const diff = startTime.getTime() - now.getTime();

      // Если дуэль еще не началась (статус accepted)
      if (challenge.status === 'accepted' && diff > 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`До начала: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        return;
      }

      // Если дуэль активна, показываем что она идет (без ограничения времени)
      if (challenge.status === 'active') {
        setTimeLeft('Дуэль активна');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [challenge, task, challenge?.status, challenge?.started_at]);

  const loadChallenge = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await getChallengeById(challengeId, userId);
      if (response.success && response.challenge) {
        const challengeData = response.challenge;
        setChallenge(challengeData);
        
        // Проверяем, что пользователь участвует
        const participants = challengeData.participants || [];
        const isParticipant = participants.some(p => p.user_id === parseInt(userId));
        
        if (!isParticipant && challengeData.status === 'active') {
          showToast('Вы не участвуете в этой дуэли', 'error');
          navigate('/1vs1');
          return;
        }

        // Если дуэль активна или принята (и должна начаться), загружаем задание
        if (challengeData.status === 'active' || (challengeData.status === 'accepted' && challengeData.started_at)) {
          if (challengeData.task) {
            setTask(challengeData.task);
          } else if (challengeData.task_id) {
            // Если задание не пришло, но есть task_id, показываем сообщение
            showToast('Задание еще не загружено', 'info');
          }
        }

        // Проверяем, завершена ли дуэль
        if (challengeData.status === 'completed') {
          setIsCompleted(true);
          const myParticipant = participants.find(p => p.user_id === parseInt(userId));
          if (myParticipant) {
            setIsWinner(myParticipant.is_winner || false);
            setPrize(myParticipant.prize_received || 0);
          }
        }

        // Проверяем, отправил ли пользователь уже ответ
        const myParticipant = participants.find(p => p.user_id === parseInt(userId));
        if (myParticipant && myParticipant.submitted_flag) {
          setIsCompleted(true);
          setIsWinner(myParticipant.is_winner || false);
        }
      } else {
        showToast('Дуэль не найдена', 'error');
        navigate('/1vs1');
      }
    } catch (error) {
      console.error('Ошибка загрузки дуэли:', error);
      showToast('Ошибка загрузки дуэли', 'error');
      navigate('/1vs1');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isCompleted) {
      showToast('Дуэль уже завершена!', 'info');
      return;
    }
    
    if (!flag.trim()) {
      showToast('Введите флаг', 'error');
      return;
    }

    // Проверка формата ENIGMA{...}
    const flagPattern = /^ENIGMA\{.+\}$/i;
    if (!flagPattern.test(flag.trim())) {
      showToast('Флаг должен быть в формате ENIGMA{...}', 'error');
      return;
    }

    if (!userId) {
      showToast('Ошибка: пользователь не авторизован', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitDuelAnswer(challengeId, flag, userId);
      if (response.success) {
        if (response.isWinner) {
          setIsWinner(true);
          setIsCompleted(true);
          setPrize(response.prize || 0);
          showToast(`Поздравляем! Вы выиграли ${response.prize} монет!`, 'success');
        } else {
          showToast('Неправильный флаг. Попробуйте еще раз!', 'error');
        }
        setFlag('');
        await loadChallenge();
      }
    } catch (error) {
      showToast(error.message || 'Ошибка отправки ответа', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-300 text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  // Если дуэль еще не началась
  if (challenge.status === 'pending' || challenge.status === 'accepted') {
    return (
      <div className="min-h-screen relative overflow-hidden page-fade-in">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/1vs1')}
            className="mb-6 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl text-center">
            <Clock className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h2 className="text-2xl text-cyan-300 mb-4">Дуэль еще не началась</h2>
            {challenge.status === 'accepted' && challenge.started_at && (
              <p className="text-cyan-200/80">
                Дуэль начнется: {new Date(challenge.started_at).toLocaleString('ru-RU')}
              </p>
            )}
            {challenge.status === 'pending' && (
              <p className="text-cyan-200/80">Ожидание соперника...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Если дуэль завершена
  if (isCompleted) {
    return (
      <div className="min-h-screen relative overflow-hidden page-fade-in">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/1vs1')}
            className="mb-6 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl text-center">
            {isWinner ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl text-green-300 mb-4">Поздравляем! Вы выиграли!</h2>
                {prize > 0 && (
                  <p className="text-cyan-200/80 text-lg mb-4">
                    Вы получили {prize} монет
                  </p>
                )}
              </>
            ) : (
              <>
                <Target className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl text-red-300 mb-4">Дуэль завершена</h2>
                <p className="text-cyan-200/80">
                  К сожалению, вы не выиграли эту дуэль
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Если дуэль активна, но задание еще не загружено
  if (challenge.status === 'active' && !task) {
    return (
      <div className="min-h-screen relative overflow-hidden page-fade-in">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="text-cyan-300 text-xl text-center">Загрузка задания...</div>
        </div>
      </div>
    );
  }

  // Активная дуэль с заданием
  return (
    <div className="min-h-screen relative overflow-hidden page-fade-in">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/1vs1')}
          className="mb-6 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        {/* Таймер только для ожидания начала */}
        {timeLeft && challenge.status === 'accepted' && (
          <div className="mb-6 p-4 border-2 border-amber-400 rounded-lg bg-[#0a0a0f]/70 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-300">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold">{timeLeft}</span>
            </div>
          </div>
        )}

        {/* Задание */}
        <div className="p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-8 h-8 text-cyan-300" />
            <h2 className="text-2xl text-cyan-300">{task.name || 'Задание дуэли'}</h2>
          </div>

          {task.description && (
            <div className="mb-6">
              <p className="text-cyan-200/80 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.task && (
            <div className="mb-6 p-4 bg-[#0a0a0f]/50 rounded-lg border border-cyan-400/30">
              <p className="text-cyan-100 whitespace-pre-wrap font-mono text-sm">{task.task}</p>
            </div>
          )}

          {task.task_file_path && (
            <div className="mb-6">
              <a
                href={`http://localhost:3000/${task.task_file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 underline"
              >
                <Code className="w-4 h-4" />
                Скачать файл задания
              </a>
            </div>
          )}

          {/* Форма отправки флага */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="flag" className="block text-cyan-300 mb-2">
                Введите флаг:
              </label>
              <Input
                id="flag"
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="ENIGMA{...}"
                disabled={isSubmitting || isCompleted}
                className="font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isCompleted || !flag.trim()}
              className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-black hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all hover:scale-105 font-bold py-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Отправка...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  ОТПРАВИТЬ ФЛАГ
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Информация о сопернике */}
        {challenge.participants && challenge.participants.length > 0 && (
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70">
            <h3 className="text-xl text-cyan-300 mb-4">Участники:</h3>
            <div className="space-y-2">
              {challenge.participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className={`p-3 rounded-lg ${
                    participant.user_id === parseInt(userId)
                      ? 'bg-cyan-400/20 border border-cyan-400/50'
                      : 'bg-cyan-400/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-200">
                      {participant.nickname || `Игрок ${participant.user_id}`}
                    </span>
                    {participant.submitted_flag && (
                      <span className="text-green-300 text-sm">✓ Ответ отправлен</span>
                    )}
                    {participant.is_winner && (
                      <span className="text-amber-300 text-sm font-bold">🏆 Победитель</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuelPage;
