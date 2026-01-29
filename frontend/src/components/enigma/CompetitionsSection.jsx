import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/button.jsx';
import { Trophy, Star, Clock, Users, Crown, Zap, renderIconByValue } from '../IconSet.jsx';
import { getCompetitions, joinCompetition } from '../../api/competitions.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const CompetitionsSection = ({ showToast }) => {
  const { userId, balance, fetchBalance } = useAuth();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCompetitions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const response = await getCompetitions(userId);
      if (response.success && response.competitions) {
        setCompetitions(response.competitions);
      }
    } catch (error) {
      console.error('Ошибка загрузки соревнований:', error);
      showToast?.('Ошибка загрузки соревнований', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (competitionId, entryFee) => {
    if (!userId) {
      showToast?.('Требуется авторизация', 'error');
      return;
    }

    if (entryFee > 0 && (balance?.coins || 0) < entryFee) {
      showToast?.('Недостаточно монет для участия', 'error');
      return;
    }

    try {
      const response = await joinCompetition(competitionId, userId);
      if (response.success) {
        showToast?.(response.message || 'Вы успешно присоединились к соревнованию!', 'success');
        await fetchBalance();
        await loadCompetitions();
      }
    } catch (error) {
      showToast?.(error.message || 'Ошибка при присоединении к соревнованию', 'error');
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
      <div className="space-y-6">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
          СОРЕВНОВАНИЯ
        </h2>
        <p className="text-cyan-200/50 text-center py-8">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
          СОРЕВНОВАНИЯ
        </h2>
      </div>

      {competitions.length === 0 ? (
        <p className="text-cyan-200/50 text-center py-8">Нет доступных соревнований</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => {
            const canJoin = (competition.status === 'active' || competition.status === 'upcoming') && !competition.isParticipating;
            const isFull = competition.max_participants && competition.participants_count >= competition.max_participants;
            
            return (
              <div
                key={competition.id}
                className={`p-6 border-2 rounded-lg transition-all hover:scale-105 ${
                  competition.status === 'active'
                    ? 'border-cyan-400 bg-[#0a0a0f]/70 shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)]'
                    : competition.status === 'finished'
                    ? 'border-gray-400/30 bg-[#0a0a0f]/50 opacity-60'
                    : 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-80'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3 text-cyan-300">
                    <Trophy className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-xl text-cyan-300 mb-2 font-semibold">
                    {competition.name}
                  </h3>
                  <p className="text-cyan-200 text-sm mb-4 min-h-[60px] line-clamp-3">
                    {competition.description || 'Без описания'}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {competition.prize && (
                    <div className="flex items-center justify-between p-2 bg-cyan-400/10 rounded-lg">
                      <span className="text-cyan-200 text-sm flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-300" />
                        Приз
                      </span>
                      <span className="text-amber-300 font-semibold">{competition.prize}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2 bg-cyan-400/10 rounded-lg">
                    <span className="text-cyan-200 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Участников
                    </span>
                    <span className="text-cyan-300 font-semibold">
                      {competition.participants_count || 0}
                      {competition.max_participants ? ` / ${competition.max_participants}` : ''}
                    </span>
                  </div>
                  {competition.entry_fee > 0 && (
                    <div className="flex items-center justify-between p-2 bg-amber-400/10 rounded-lg">
                      <span className="text-amber-200 text-sm">Взнос</span>
                      <span className="text-amber-300 font-semibold">{competition.entry_fee} монет</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2 bg-cyan-400/10 rounded-lg">
                    <span className="text-cyan-200 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {competition.status === 'upcoming' ? 'Начало' : 'До конца'}
                    </span>
                    <span className="text-cyan-300 font-semibold text-xs">
                      {formatDate(competition.status === 'upcoming' ? competition.start_date : competition.end_date)}
                    </span>
                  </div>
                </div>

                {competition.isParticipating ? (
                  <Button
                    onClick={() => navigate(`/competition/${competition.id}`)}
                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                  >
                    ПЕРЕЙТИ К СОРЕВНОВАНИЮ
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleJoin(competition.id, competition.entry_fee || 0)}
                    disabled={!canJoin || isFull}
                    className={`w-full ${
                      canJoin && !isFull
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                        : 'bg-cyan-400/30 text-cyan-200'
                    } shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all disabled:opacity-50`}
                  >
                    {isFull ? 'МЕСТ НЕТ' : competition.status === 'finished' ? 'ЗАВЕРШЕНО' : competition.status === 'active' || competition.status === 'upcoming' ? 'ПРИСОЕДИНИТЬСЯ' : 'СКОРО'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

CompetitionsSection.propTypes = {
  showToast: PropTypes.func,
};

export default CompetitionsSection;


