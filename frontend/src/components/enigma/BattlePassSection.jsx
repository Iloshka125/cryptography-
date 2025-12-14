import PropTypes from 'prop-types';
import { CheckCircle2, Lock, Crown } from '../IconSet.jsx';

const BattlePassSection = ({ rewards, userLevel = 7, showToast, onClaimReward }) => {
  const totalLevels = 10;
  const progress = (userLevel / totalLevels) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] flex items-center justify-center gap-2">
          <Crown className="w-6 h-6" />
          BATTLE PASS
        </h2>
        <p className="text-cyan-200">Прогресс: Уровень {userLevel}/{totalLevels}</p>
        <div className="p-6 border-2 border-cyan-400 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_25px_rgba(0,255,255,0.3)]">
      <div className="h-3 bg-[#0a0a0f] rounded-full overflow-hidden border border-cyan-400/30 mb-2">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500 shadow-[0_0_15px_rgba(0,255,255,0.8)]"
              style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center text-cyan-200 text-sm">
            {Math.round((userLevel / totalLevels) * 2000)} / 2000 XP до следующего уровня
          </div>
      </div>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {rewards.map((reward) => (
        <div
          key={reward.id || reward.level}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
            reward.unlocked
                ? reward.claimed
                  ? 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-50'
                  : 'border-amber-300 bg-gradient-to-br from-amber-500/20 to-amber-400/10 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                : 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-60'
          }`}
        >
            <div className="text-3xl mb-2">
              {reward.unlocked ? (reward.claimed ? '✓' : '🎁') : '🔒'}
            </div>
            <p className="text-cyan-300 mb-2 font-semibold">Уровень {reward.level}</p>
            <p className="text-cyan-200 text-sm mb-4">{reward.reward}</p>
            {reward.unlocked && !reward.claimed && (
              <button
                onClick={() => {
                  if (onClaimReward) {
                    onClaimReward(reward);
                  } else {
                    showToast?.(`Получена награда: ${reward.reward}`, 'success');
                  }
                }}
                className="w-full bg-amber-300 text-black hover:bg-amber-200 transition-all py-2 rounded text-sm font-semibold"
              >
                ЗАБРАТЬ
              </button>
          )}
        </div>
      ))}
    </div>
  </div>
);
};

BattlePassSection.propTypes = {
  rewards: PropTypes.array.isRequired,
  userLevel: PropTypes.number,
  showToast: PropTypes.func,
  onClaimReward: PropTypes.func,
};

export default BattlePassSection;

