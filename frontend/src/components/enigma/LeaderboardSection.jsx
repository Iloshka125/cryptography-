import PropTypes from 'prop-types';
import { Medal, Star, User, renderIconByValue } from '../IconSet.jsx';

const LeaderboardSection = ({ data, username, userLevel, userScore = 6500, loading = false, userRank: propUserRank }) => {
  // Используем переданный рейтинг или вычисляем из данных
  const userRank = propUserRank || data.findIndex((p) => p.username === username) + 1 || data.length + 1;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] text-center flex-1">
          LEADERBOARD
        </h2>
        <div className="px-4 py-2 border-2 border-amber-300 rounded-lg bg-amber-300/10">
          <span className="text-amber-200">Ваш рейтинг: #{userRank}</span>
        </div>
      </div>

    <div className="space-y-3">
      {loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-200/50">Загрузка лидерборда...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-cyan-200/50">Нет данных в лидерборде</p>
        </div>
      ) : (
        data.map((player) => (
        <div
          key={player.userId || player.rank || player.username}
          className={`p-6 border-2 rounded-lg flex items-center justify-between transition-all ${
            player.rank <= 3
              ? 'border-amber-300 bg-gradient-to-r from-amber-300/10 to-amber-300/5 shadow-[0_0_25px_rgba(255,215,0,0.3)]'
              :               player.username === username
                ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/10 to-cyan-300/5 shadow-[0_0_25px_rgba(0,255,255,0.3)]'
                : 'border-cyan-200/30 bg-[#0a0a0f]/70 hover:border-cyan-200/50'
          }`}
        >
          <div className="flex items-center gap-6 flex-1">
            <div
              className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl border-2 ${
                player.rank === 1
                  ? 'border-amber-300 bg-gradient-to-br from-amber-300/20 to-amber-300/10 shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                  : player.rank === 2
                    ? 'border-gray-300 bg-gradient-to-br from-gray-300/20 to-gray-300/10'
                    : player.rank === 3
                      ? 'border-amber-600 bg-gradient-to-br from-amber-600/20 to-amber-600/10'
                      : 'border-cyan-200/30 bg-[#0a0a0f]'
              }`}
            >
              {player.rank <= 3 ? (
                <Medal className={`w-8 h-8 ${
                  player.rank === 1
                    ? 'text-amber-300'
                    : player.rank === 2
                      ? 'text-gray-300'
                      : 'text-amber-600'
                }`} />
              ) : (
                <span className="text-cyan-200">#{player.rank}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl text-cyan-300">
                  {player.avatar && typeof player.avatar === 'string'
                    ? renderIconByValue(player.avatar, 'w-8 h-8')
                    : renderIconByValue('target', 'w-8 h-8')}
                </div>
                <h3
                  className={`text-xl ${
                    player.username === username
                      ? 'text-cyan-200'
                      : 'text-cyan-100'
                  }`}
                >
                  {player.username}
                  {player.username === username && (
                    <span className="ml-2 text-xs text-cyan-200 border border-cyan-400 px-2 py-1 rounded">
                      ВЫ
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-200">
                    {player.score.toLocaleString()} очков
                  </span>
                </div>
                {player.level && (
                  <span className="text-cyan-200/80 text-sm">
                    Уровень {player.level}
                  </span>
                )}
              </div>
            </div>
          </div>
          {player.rank <= 3 && (
            <Medal
              className={`w-8 h-8 ${
                player.rank === 1
                  ? 'text-amber-300'
                  : player.rank === 2
                    ? 'text-gray-300'
                    : 'text-amber-600'
              }`}
            />
          )}
          </div>
          ))
        )}
      </div>
  </div>
  );
};

LeaderboardSection.propTypes = {
  data: PropTypes.array.isRequired,
  username: PropTypes.string,
  userLevel: PropTypes.number,
  userScore: PropTypes.number,
  loading: PropTypes.bool,
  userRank: PropTypes.number,
};

export default LeaderboardSection;

