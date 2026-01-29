import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getCompetitionLevelById, checkCompetitionLevelFlag } from '../api/competitionLevels.js';
import { getCompetitionById } from '../api/competitions.js';
import Button from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { ArrowLeft, CheckCircle2, Code, Target, Zap, Trophy } from '../components/IconSet.jsx';

const CompetitionLevelPage = () => {
  const { competitionHash, levelHash } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userId, balance, subtractHints } = useAuth();

  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHintRevealed, setIsHintRevealed] = useState(false);
  const [competition, setCompetition] = useState(null);

  useEffect(() => {
    loadLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelHash, userId]);

  const loadLevel = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Сначала проверяем статус соревнования
      const competitionResponse = await getCompetitionById(competitionHash, userId);
      if (competitionResponse.success && competitionResponse.competition) {
        const competitionData = competitionResponse.competition;
        setCompetition(competitionData);
        
        // Если соревнование еще не началось, запрещаем доступ
        if (competitionData.status === 'upcoming') {
          showToast('Соревнование еще не началось. Уровни будут доступны после начала соревнования.', 'error');
          navigate(`/competition/${competitionHash}`);
          return;
        }
      }
      
      const response = await getCompetitionLevelById(levelHash, userId);
      if (response.success && response.level) {
        const levelData = response.level;
        setLevel(levelData);
        setIsCompleted(levelData.completed || false);
      } else {
        showToast('Уровень не найден', 'error');
        navigate(`/competition/${competitionHash}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки уровня:', error);
      showToast('Ошибка загрузки уровня', 'error');
      navigate(`/competition/${competitionHash}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isCompleted) {
      showToast('Этот уровень уже решен!', 'info');
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

    try {
      setIsSubmitting(true);
      const response = await checkCompetitionLevelFlag(levelHash, flag.trim(), userId);
      
      if (response.success) {
        if (response.correct) {
          if (response.alreadyCompleted) {
            showToast('Уровень уже решен', 'info');
          } else {
            showToast(
              response.isFirstSolver 
                ? `Правильно! Вы первый решили этот уровень! +${response.experienceGained} опыта (+10% бонус)`
                : `Правильно! Получено ${response.experienceGained} опыта`,
              'success'
            );
            setIsCompleted(true);
            setFlag('');
            // Перезагружаем уровень для обновления данных
            await loadLevel();
          }
        } else {
          showToast('Неверный флаг', 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка проверки флага:', error);
      showToast(error.message || 'Ошибка при проверке флага', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyHint = async () => {
    if (!level || !level.hint) {
      showToast('Подсказка недоступна', 'error');
      return;
    }

    if ((balance?.hints || 0) < 1) {
      showToast('Недостаточно подсказок!', 'error');
      return;
    }

    try {
      await subtractHints(1);
      setIsHintRevealed(true);
      showToast('Подсказка открыта!', 'success');
    } catch (error) {
      showToast(error.message || 'Ошибка при покупке подсказки', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-fade-in flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-3xl text-cyan-300">Загрузка уровня...</h1>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen page-fade-in flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl text-cyan-300 mb-4">Уровень не найден</h1>
          <Button onClick={() => navigate(`/competition/${competitionHash}`)} className="bg-cyan-400 text-black">
            Вернуться к соревнованию
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-fade-in relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate(`/competition/${competitionHash}`)}
            className="bg-transparent border-2 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            НАЗАД
          </Button>
        </div>

        <div className="mb-6 p-8 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-cyan-500/5 to-transparent border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] backdrop-blur-xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              <Target className="w-8 h-8 text-black" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
                  {level.name}
                </h1>
                {isCompleted && (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                )}
              </div>
              {level.description && (
                <p className="text-cyan-200/80 text-lg mb-3">
                  {level.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-cyan-200/80">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>{level.points} очков</span>
                </div>
                {level.isFirstSolver && (
                  <div className="flex items-center gap-2 text-green-300">
                    <span>⭐ Первый решивший</span>
                  </div>
                )}
                {isCompleted && level.experienceGained > 0 && (
                  <div className="flex items-center gap-2 text-green-300">
                    <span>+{level.experienceGained} опыта</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Задание */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
          <h2 className="text-2xl text-cyan-300 mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)] flex items-center gap-2">
            <Code className="w-6 h-6" />
            Задание
          </h2>
          {level.task_file_path ? (
            <div className="text-cyan-200">
              <a
                href={`http://localhost:3000/${level.task_file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:text-cyan-200 underline"
              >
                Скачать файл задания
              </a>
            </div>
          ) : (
            <div className="text-cyan-200 whitespace-pre-wrap">
              {level.task || 'Задание не указано'}
            </div>
          )}
        </div>

        {/* Подсказка */}
        {level.hint && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)] flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Подсказка
              </h2>
              {!isHintRevealed && (
                <Button
                  onClick={handleBuyHint}
                  disabled={(balance?.hints || 0) < 1}
                  className="bg-amber-400 hover:bg-amber-300 text-black disabled:opacity-50"
                >
                  Купить за 1 подсказку
                </Button>
              )}
            </div>
            {isHintRevealed ? (
              <p className="text-cyan-200 whitespace-pre-wrap">
                {level.hint}
              </p>
            ) : (
              <p className="text-cyan-200/50 italic">
                Подсказка скрыта. Купите её, чтобы увидеть содержимое.
              </p>
            )}
          </div>
        )}

        {/* Форма ввода флага */}
        {!isCompleted && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cyan-200 mb-2">Введите флаг</label>
                <Input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="ENIGMA{...}"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !flag.trim()}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-black disabled:opacity-50"
              >
                {isSubmitting ? 'Проверка...' : 'ПРОВЕРИТЬ ФЛАГ'}
              </Button>
            </form>
          </div>
        )}

        {isCompleted && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-400/10 to-green-500/5 border-2 border-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] backdrop-blur-xl text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl text-green-300 mb-2">Уровень решен!</h2>
            <p className="text-green-200">
              Вы получили {level.experienceGained} опыта
              {level.isFirstSolver && ' (включая бонус за первое решение)'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionLevelPage;
