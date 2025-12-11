import PropTypes from 'prop-types';
import { useState } from 'react';
import Button from '../ui/button.jsx';
import { Gamepad2, Users, Trophy, Zap, Clock } from '../IconSet.jsx';

const VersusSection = ({ showToast }) => {
  const [searching, setSearching] = useState(false);

  const activeMatches = [
    {
      id: 1,
      opponent: 'CryptoMaster',
      opponentAvatar: '👑',
      status: 'waiting',
      timeLeft: '2:30',
    },
    {
      id: 2,
      opponent: 'CodeBreaker',
      opponentAvatar: '🔓',
      status: 'in_progress',
      score: '3:2',
    },
  ];

  const handleFindOpponent = () => {
    setSearching(true);
    showToast?.('Поиск соперника...', 'success');
    setTimeout(() => {
      setSearching(false);
      showToast?.('Соперник найден! Начинаем игру...', 'success');
    }, 2000);
  };

  const handleChallenge = (opponentId) => {
    showToast?.('Вызов отправлен!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
          1 VS 1
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Find Opponent Card */}
        <div className="p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-[#0a0a0f]/90 to-[#0f0f1a]/90 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              <Gamepad2 className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-2xl text-cyan-300 mb-2 font-bold">
              Найти соперника
            </h3>
            <p className="text-cyan-200/80">
              Сыграйте против случайного игрока
            </p>
          </div>
          <Button
            onClick={handleFindOpponent}
            disabled={searching}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-black hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all hover:scale-105 text-lg font-bold py-4 disabled:opacity-50"
          >
            {searching ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                Поиск...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                НАЙТИ СОПЕРНИКА
              </span>
            )}
          </Button>
        </div>

        {/* Active Matches */}
        <div className="space-y-4">
          <h3 className="text-xl text-cyan-300 mb-4">Активные матчи</h3>
          {activeMatches.length > 0 ? (
            activeMatches.map((match) => (
              <div
                key={match.id}
                className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-2xl">
                      {match.opponentAvatar}
                    </div>
                    <div>
                      <p className="text-cyan-300 font-semibold">{match.opponent}</p>
                      <p className="text-cyan-200/60 text-sm">
                        {match.status === 'waiting' ? 'Ожидание' : 'В процессе'}
                      </p>
                    </div>
                  </div>
                  {match.status === 'waiting' && (
                    <div className="flex items-center gap-2 text-amber-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{match.timeLeft}</span>
                    </div>
                  )}
                  {match.status === 'in_progress' && (
                    <div className="text-cyan-300 font-bold text-lg">
                      {match.score}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleChallenge(match.id)}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                >
                  {match.status === 'waiting' ? 'ПРИНЯТЬ ВЫЗОВ' : 'ПРОДОЛЖИТЬ'}
                </Button>
              </div>
            ))
          ) : (
            <div className="p-6 border border-cyan-400/20 rounded-lg bg-[#0a0a0f]/50 text-center">
              <p className="text-cyan-200/60">Нет активных матчей</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 text-center">
          <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-2" />
          <p className="text-cyan-200 text-sm mb-1">Побед</p>
          <p className="text-cyan-300 text-2xl font-bold">12</p>
        </div>
        <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 text-center">
          <Gamepad2 className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
          <p className="text-cyan-200 text-sm mb-1">Матчей</p>
          <p className="text-cyan-300 text-2xl font-bold">24</p>
        </div>
        <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 text-center">
          <Users className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
          <p className="text-cyan-200 text-sm mb-1">Рейтинг</p>
          <p className="text-cyan-300 text-2xl font-bold">1450</p>
        </div>
      </div>
    </div>
  );
};

VersusSection.propTypes = {
  showToast: PropTypes.func,
};

export default VersusSection;


