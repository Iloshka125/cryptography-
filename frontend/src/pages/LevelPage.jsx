import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { ArrowLeft, CheckCircle2, Lock, Code, Target, Zap } from '../components/IconSet.jsx';
import Button from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { getLevelById, checkLevelFlag } from '../api/categories.js';

const LevelPage = () => {
  const { categoryId, levelId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем данные уровня из БД
  useEffect(() => {
    loadLevel();
  }, [levelId]);

  const loadLevel = async () => {
    try {
      setLoading(true);
      const response = await getLevelById(levelId);
      if (response.success && response.level) {
        setLevel(response.level);
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

    setIsSubmitting(true);

    try {
      const response = await checkLevelFlag(levelId, flag);
      if (response.success) {
        if (response.correct) {
          showToast(response.message || 'Правильный флаг! Уровень пройден!', 'success');
          setTimeout(() => {
            navigate(`/enigma`);
          }, 1500);
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
                    УРОВЕНЬ {levelId}
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
            <p className="text-cyan-200 text-lg leading-relaxed">
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
            <p className="text-cyan-100 text-lg leading-relaxed whitespace-pre-line font-medium">
              {level.task || 'Задание отсутствует'}
            </p>
          </div>
        </div>

        {/* Flag Submission Card */}
        <div className="p-8 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(0,255,255,0.4)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-400/20 border border-green-400/50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-300" />
            </div>
            <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              Введите флаг
            </h2>
          </div>
          
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
        </div>

        {/* Hint Section */}
        <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-400/30 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-amber-200 font-semibold mb-1">Совет</p>
              <p className="text-amber-200/80 text-sm">
                Внимательно изучите описание задания и используйте полученные знания для решения. Не торопитесь!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelPage;

