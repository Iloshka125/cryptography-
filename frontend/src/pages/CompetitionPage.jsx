import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getCompetitionById } from '../api/competitions.js';
import Button from '../components/ui/button.jsx';
import { Trophy, Users, Clock, ArrowLeft, CheckCircle2, Lock } from '../components/IconSet.jsx';

// Компонент для эффекта переворота календарных страниц
const FlipCard = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(() => String(value).padStart(2, '0'));
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(value);
  const innerRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const newValue = String(value).padStart(2, '0');
    const prevValue = prevValueRef.current;
    
    // Проверяем только реальное изменение value и что не обрабатываем уже
    if (prevValue !== value && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
      // Сбрасываем состояние переворота
      setIsFlipping(false);
      
      // Небольшая задержка для сброса состояния перед новой анимацией
      const timeoutId = setTimeout(() => {
        setIsFlipping(true);
        
        const handleTransitionEnd = (e) => {
          // Проверяем, что событие произошло на нужном элементе и свойстве
          if (e.target === innerRef.current && e.propertyName === 'transform') {
            setDisplayValue(newValue);
            setIsFlipping(false);
            prevValueRef.current = value;
            isProcessingRef.current = false;
            if (innerRef.current) {
              innerRef.current.removeEventListener('transitionend', handleTransitionEnd);
            }
          }
        };

        if (innerRef.current) {
          innerRef.current.addEventListener('transitionend', handleTransitionEnd, { once: true });
        }
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        isProcessingRef.current = false;
      };
    }
  }, [value]);

  return (
    <div className="relative inline-block">
      <div className={`flip-card ${isFlipping ? 'flipping' : ''}`}>
        <div ref={innerRef} className="flip-card-inner">
          <div className="flip-card-front">
            {displayValue}
          </div>
          <div className="flip-card-back">
            {String(value).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompetitionPage = () => {
  const { competitionHash } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userId } = useAuth();

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    loadCompetition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionHash, userId]);

  // Обновляем таймер каждую секунду
  useEffect(() => {
    if (!competition) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      
      // Проверяем, прошла ли дата начала
      const startDate = competition.start_date ? new Date(competition.start_date).getTime() : null;
      const endDate = competition.end_date ? new Date(competition.end_date).getTime() : null;
      
      // Определяем, что показывать: если дата начала прошла, показываем время до конца
      let targetDate = null;
      let isCountingToEnd = false;
      
      if (startDate && now < startDate) {
        // Соревнование еще не началось
        targetDate = startDate;
        isCountingToEnd = false;
      } else if (endDate) {
        // Соревнование началось или уже идет, показываем время до конца
        targetDate = endDate;
        isCountingToEnd = true;
      }
      
      if (!targetDate || isNaN(targetDate)) {
        setTimeRemaining(null);
        return;
      }

      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeRemaining({ days, hours, minutes, seconds, isCountingToEnd });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isCountingToEnd });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [competition]);

  const loadCompetition = async () => {
    try {
      setLoading(true);
      const response = await getCompetitionById(competitionHash, userId);
      if (response.success && response.competition) {
        const competitionData = response.competition;
        
        // Если соревнование завершено, показываем только результаты
        if (competitionData.status === 'finished') {
          setCompetition(competitionData);
          return;
        }
        
        // Проверяем доступ: если требуется плата за вход и пользователь не участвует
        if (competitionData.entry_fee > 0 && !competitionData.isParticipating) {
          showToast('Для доступа к этому соревнованию необходимо оплатить вход.', 'error');
          setLoading(false);
          navigate('/competitions');
          return;
        }
        
        setCompetition(competitionData);
      } else {
        setLoading(false);
        navigate('/competitions');
      }
    } catch (error) {
      console.error('Ошибка загрузки соревнования:', error);
      showToast(error.message || 'Ошибка загрузки соревнования', 'error');
      setLoading(false);
      navigate('/competitions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen page-fade-in flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-3xl text-cyan-300">Загрузка соревнования...</h1>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen page-fade-in flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl text-cyan-300 mb-4">Соревнование не найдено</h1>
          <Button onClick={() => navigate('/competitions')} className="bg-cyan-400 text-black">
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  const isUpcoming = competition.status === 'upcoming';

  return (
    <div className="min-h-screen page-fade-in relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate('/competitions')}
            className="bg-transparent border-2 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            НАЗАД
          </Button>
        </div>

        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-cyan-500/5 to-transparent border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] backdrop-blur-xl">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              <Trophy className="w-10 h-10 text-black" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 rounded-lg text-cyan-300 text-sm font-semibold">
                  СОРЕВНОВАНИЕ
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    competition.status === 'active'
                      ? 'bg-green-500/20 text-green-300 border border-green-400/50'
                      : competition.status === 'finished'
                      ? 'bg-gray-500/20 text-gray-300 border border-gray-400/50'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                  }`}
                >
                  {competition.status === 'active'
                    ? 'Активно'
                    : competition.status === 'finished'
                    ? 'Завершено'
                    : 'Скоро'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] mb-3">
                {competition.name}
              </h1>
              <p className="text-cyan-200/80 text-lg mb-4">
                {competition.description || 'Без описания'}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-cyan-200/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Участников: {competition.participants?.length || competition.participants_count || 0}
                  {competition.max_participants ? ` / ${competition.max_participants}` : ''}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {isUpcoming ? 'Начало:' : 'Окончание:'}{' '}
                  {formatDate(isUpcoming ? competition.start_date : competition.end_date)}
                </div>
                {competition.entry_fee > 0 && (
                  <div className="flex items-center gap-2">
                    Взнос:{' '}
                    <span className="text-amber-300 font-semibold">
                      {competition.entry_fee} монет
                    </span>
                  </div>
                )}
                {competition.prize && (
                  <div className="flex items-center gap-2">
                    Приз:{' '}
                    <span className="text-amber-300 font-semibold">{competition.prize}</span>
                  </div>
                )}

                 {/* Таймер обратного отсчёта */}
        {timeRemaining !== null && (
          <div className="mt-6 flex items-center  gap-6 w-full">
            <span className="text-xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)] whitespace-nowrap">
              {timeRemaining.isCountingToEnd ? 'Конец:' : 'Начало:'}
            </span>
            <div className="flex items-center gap-3">
              {timeRemaining.days > 0 && (
                <div className="flex items-center gap-2">
                  <FlipCard value={timeRemaining.days} />
                  <span className="text-sm text-cyan-200/70 ml-1">д</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FlipCard value={timeRemaining.hours} />
                <span className="text-sm text-cyan-200/70 ml-1">ч</span>
              </div>
              <div className="flex items-center gap-2">
                <FlipCard value={timeRemaining.minutes} />
                <span className="text-sm text-cyan-200/70 ml-1">м</span>
              </div>
              <div className="flex items-center gap-2">
                <FlipCard value={timeRemaining.seconds} />
                <span className="text-sm text-cyan-200/70 ml-1">с</span>
              </div>
            </div>
          </div>
        )}

              </div>
            </div>
          </div>
        </div>

       

        {competition.welcome_text && competition.status !== 'finished' && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <h2 className="text-2xl text-cyan-300 mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              {competition.welcome_title || 'Приветствие'}
            </h2>
            <p className="text-cyan-200 text-lg whitespace-pre-wrap">
              {competition.welcome_text}
            </p>
          </div>
        )}

        {competition.status === 'finished' && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-2 border-gray-400/30 shadow-[0_0_30px_rgba(128,128,128,0.2)] backdrop-blur-xl">
            <h2 className="text-2xl text-gray-300 mb-4 drop-shadow-[0_0_10px_rgba(128,128,128,0.6)]">
              Соревнование завершено
            </h2>
            <p className="text-gray-200 text-lg mb-4">
              Это соревнование завершено. Ниже представлены результаты.
            </p>
            {competition.prize && competition.prize_awarded && competition.participants && competition.participants.length > 0 && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                <p className="text-amber-300 font-semibold mb-1">
                  🏆 Победитель: {competition.participants[0].nickname || 'Неизвестно'}
                </p>
                <p className="text-amber-200 text-sm">
                  Приз {competition.prize} начислен
                </p>
              </div>
            )}
          </div>
        )}

        {/* Уровни соревнования - показываем только если соревнование активно (не завершено и не скоро) */}
        {competition.levels && competition.levels.length > 0 && competition.status === 'active' && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <h2 className="text-2xl text-cyan-300 mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              Уровни соревнования
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competition.levels.map((level, index) => {
                // Уровень доступен, если предыдущий решен или это первый уровень
                const prevLevel = index > 0 ? competition.levels[index - 1] : null;
                const isLocked = prevLevel && !prevLevel.completed;
                
                return (
                  <div
                    key={level.id}
                    onClick={() => {
                      if (competition.isParticipating && !isLocked && competition.status !== 'upcoming') {
                        navigate(`/competition/${competition.hash}/level/${level.hash}`);
                      }
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      level.completed
                        ? 'border-green-400 bg-green-400/10 cursor-pointer hover:bg-green-400/20'
                        : isLocked
                        ? 'border-gray-400/30 bg-[#0a0a0f]/50 opacity-60 cursor-not-allowed'
                        : 'border-cyan-400/30 bg-[#0a0a0f]/70 cursor-pointer hover:border-cyan-400 hover:bg-cyan-400/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-cyan-200 font-semibold">{level.name}</h3>
                      {level.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : null}
                    </div>
                    {level.description && (
                      <p className="text-cyan-200/70 text-sm mb-2 line-clamp-2">
                        {level.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-300">
                        {level.points} очков
                      </span>
                      {level.isFirstSolver && (
                        <span className="text-green-300">⭐ Первый</span>
                      )}
                      {level.completed && (
                        <span className="text-green-300">
                          +{level.experienceGained} опыта
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {competition.participants && competition.participants.length > 0 && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <h2 className="text-2xl text-cyan-300 mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              Участники
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {competition.participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between p-2 border border-cyan-400/20 rounded-lg bg-[#0a0a0f]/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 text-sm">
                      {(p.nickname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-cyan-200 text-sm">
                        {p.nickname || 'Без имени'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-cyan-200/80">
                    <div>Опыт: {p.experienceGained || 0}</div>
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

export default CompetitionPage;
