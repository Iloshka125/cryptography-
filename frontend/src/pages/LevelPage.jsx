import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ArrowLeft, CheckCircle2, Lock, Code, Target, Zap, renderIconByValue } from '../components/IconSet.jsx';
import Button from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { getLevelById, checkLevelFlag } from '../api/categories.js';

const LevelPage = () => {
  const { categoryId, levelId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userId, balance, subtractHints } = useAuth();
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHintRevealed, setIsHintRevealed] = useState(false);

  // Загружаем данные уровня из БД
  useEffect(() => {
    loadLevel();
  }, [levelId, userId]);

  const loadLevel = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await getLevelById(levelId, userId);
      if (response.success && response.level) {
        const levelData = response.level;
        // Проверяем доступ к платному уровню
        if (levelData.isPaid && !levelData.purchased) {
          showToast('Этот уровень платный. Необходимо его купить.', 'error');
          setTimeout(() => {
            navigate('/enigma');
          }, 2000);
          return;
        }
        setLevel(levelData);
        setIsCompleted(levelData.completed || false);
      } else {
        showToast('Уровень не найден', 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки уровня:', error);
      showToast('Ошибка загрузки уровня', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isCompleted) {
      showToast('Этот уровень уже пройден!', 'info');
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
      const response = await checkLevelFlag(levelId, flag, userId);
      if (response.success) {
        if (response.correct) {
          // Если уровень уже был пройден ранее
          if (response.alreadyCompleted) {
            showToast(response.message || 'Этот уровень уже пройден!', 'info');
            setIsCompleted(true);
            setIsSubmitting(false);
            // Перезагружаем данные уровня для обновления статуса
            await loadLevel();
            return;
          }
          
          // Уровень только что пройден
          let message = response.message || 'Правильный флаг! Уровень пройден!';
          if (response.experienceGained) {
            message += ` Получено ${response.experienceGained} опыта!`;
            if (response.newLevel) {
              message += ` Ваш уровень: ${response.newLevel}`;
            }
          }
          showToast(message, 'success');
          
          // Обновляем статус уровня как пройденного
          setIsCompleted(true);
          
        setTimeout(() => {
          navigate(`/enigma`);
          }, 2000);
      } else {
          showToast(response.message || 'Неверный флаг. Попробуйте еще раз.', 'error');
        setIsSubmitting(false);
      }
      }
    } catch (error) {
      console.error('Ошибка проверки флага:', error);
      showToast(error.message || 'Ошибка при проверке флага', 'error');
      setIsSubmitting(false);
    }
  };

  const handleBuyHint = async () => {
    if (!level?.hint) {
      showToast('Для этого уровня пока нет подсказки.', 'info');
      return;
    }

    if (isHintRevealed) {
      return;
    }

    const currentHints = balance?.hints || 0;
    const hintCost = 1; // стоимость одной подсказки в "молниях"

    if (currentHints < hintCost) {
      showToast('Недостаточно подсказок. Купите их в магазине.', 'error');
      return;
    }

    try {
      await subtractHints(hintCost);
      setIsHintRevealed(true);
      showToast('Подсказка открыта!', 'success');
    } catch (error) {
      console.error('Ошибка покупки подсказки:', error);
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
          <Button onClick={() => navigate('/enigma')} className="bg-cyan-400 text-black">
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-fade-in relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <Button
            onClick={() => navigate('/enigma')}
            className="mb-6 bg-transparent border-2 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            НАЗАД
          </Button>
          
          <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-cyan-500/5 to-transparent border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] backdrop-blur-xl">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                <Code className="w-10 h-10 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 rounded-lg text-cyan-300 text-sm font-semibold">
                    УРОВЕНЬ {level?.order_index || level?.orderIndex || levelId}
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] mb-3">
                  {level.name}
                </h1>
                <p className="text-cyan-200/80 text-lg">
                  Готовы принять вызов?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Description Card */}
          <div className="lg:col-span-2 p-8 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-300" />
              </div>
              <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
                Описание
              </h2>
            </div>
            <p className="text-cyan-200 text-lg leading-relaxed whitespace-pre-wrap">
              {level.description || 'Описание отсутствует'}
            </p>
          </div>

          {/* Stats Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Информация</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                <span className="text-cyan-200 text-sm">Сложность</span>
                <span className="text-cyan-300 font-semibold">
                  {level.difficulty === 'easy' ? 'Легкая' : level.difficulty === 'hard' ? 'Сложная' : 'Средняя'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                <span className="text-cyan-200 text-sm">Очки</span>
                <span className="text-cyan-300 font-semibold">{level.points || 100}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                <span className="text-cyan-200 text-sm">Время</span>
                <span className="text-cyan-300 font-semibold">~{level.estimatedTime || '15 мин'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Card */}
        <div className="mb-6 p-8 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              Задание
            </h2>
          </div>
          <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 border-2 border-cyan-400/20 shadow-inner">
            {level.taskFilePath ? (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-cyan-200 mb-4">Задание доступно в виде файла</p>
                <a
                  href={`http://localhost:3000/categories/levels/${level.id}/task-file`}
                  download
                  className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Скачать задание (txt)
                </a>
              </div>
            ) : (
              <p className="text-cyan-100 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {level.task || 'Задание отсутствует'}
            </p>
            )}
          </div>
        </div>

        {/* Flag Submission Card */}
        <div className={`p-8 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 backdrop-blur-xl ${
          isCompleted 
            ? 'border-green-400/50 shadow-[0_0_40px_rgba(34,197,94,0.4)]' 
            : 'border-cyan-400/50 shadow-[0_0_40px_rgba(0,255,255,0.4)]'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
              isCompleted
                ? 'bg-green-400/20 border-green-400/50'
                : 'bg-green-400/20 border-green-400/50'
            }`}>
              <CheckCircle2 className={`w-6 h-6 ${
                isCompleted ? 'text-green-300' : 'text-green-300'
              }`} />
            </div>
            <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              {isCompleted ? 'Уровень пройден!' : 'Введите флаг'}
            </h2>
          </div>
          
          {isCompleted && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-400/30">
              <p className="text-green-300 font-semibold text-center">
                ✓ Этот уровень уже пройден! Вы получили награду за его прохождение.
              </p>
            </div>
          )}

          {!isCompleted && (
            <>
          <div className="mb-6 p-4 rounded-lg bg-cyan-400/10 border border-cyan-400/30">
            <p className="text-cyan-200/90 text-sm flex items-center gap-2">
              <span className="text-cyan-300 font-semibold">Формат:</span>
              <span className="font-mono text-cyan-300 bg-black/30 px-3 py-1 rounded border border-cyan-400/50">
                ENIGMA&#123;...&#125;
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="ENIGMA{ваш_флаг_здесь}"
                className="relative w-full text-xl font-mono text-center py-5 bg-[#0f0f1a]/80 border-2 border-cyan-400/50 focus:border-cyan-400 focus:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all rounded-lg"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-black hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all hover:scale-[1.02] text-xl font-bold py-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Проверка...
                </span>
              ) : (
                'ОТПРАВИТЬ ФЛАГ'
              )}
            </Button>
          </form>
            </>
          )}

          {isCompleted && (
            <div className="text-center py-4">
              <Button
                onClick={() => navigate('/enigma')}
                className="w-full bg-green-500 text-white hover:bg-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all hover:scale-[1.02] text-xl font-bold py-5"
              >
                ВЕРНУТЬСЯ К КАТЕГОРИЯМ
              </Button>
            </div>
          )}
        </div>

        {/* Подсказка (покупаемая) */}
        {level?.hint && (
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 border border-cyan-400/40 backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-3">
              <Zap className="w-6 h-6 text-cyan-300" />
              <div className="flex-1">
                <p className="text-cyan-200 font-semibold mb-1">Подсказка</p>
                {!isHintRevealed ? (
                  <>
                    <p className="text-cyan-200/80 text-sm mb-3">
                      Можете открыть подсказку за 1 молнию. Сейчас у вас {balance?.hints ?? 0} подсказок.
                    </p>
                    <button
                      type="button"
                      onClick={handleBuyHint}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                    >
                      <Zap className="w-4 h-4" />
                      Открыть подсказку (1)
                    </button>
                  </>
                ) : (
                  <p className="text-cyan-50 text-sm whitespace-pre-wrap">
                    {level.hint}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelPage;

