import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getCompetitionById } from '../api/competitions.js';
import Button from '../components/ui/button.jsx';
import { Trophy, Users, Clock, ArrowLeft } from '../components/IconSet.jsx';

const CompetitionPage = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userId } = useAuth();

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionId, userId]);

  const loadCompetition = async () => {
    try {
      setLoading(true);
      const response = await getCompetitionById(competitionId, userId);
      if (response.success && response.competition) {
        setCompetition(response.competition);
      }
    } catch (error) {
      console.error('Ошибка загрузки соревнования:', error);
      showToast(error.message || 'Ошибка загрузки соревнования', 'error');
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
          <Button onClick={() => navigate('/enigma')} className="bg-cyan-400 text-black">
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
            onClick={() => navigate('/enigma')}
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
              </div>
            </div>
          </div>
        </div>

        {competition.welcome_text && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl">
            <h2 className="text-2xl text-cyan-300 mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
              Приветствие
            </h2>
            <p className="text-cyan-200 text-lg whitespace-pre-wrap">
              {competition.welcome_text}
            </p>
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
                      <p className="text-cyan-200/70 text-xs">
                        Уровень: {p.currentLevel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-cyan-200/80">
                    <div>Опыт: +{p.experienceGained || 0}</div>
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
