import PropTypes from 'prop-types';
import { CheckCircle2, Lock } from '../IconSet.jsx';

const BattlePassSection = ({ rewards }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl text-cyan-300">BATTLE PASS</h2>
      <div className="text-cyan-200">Прогресс: 2/5</div>
    </div>

    <div className="mb-6 p-6 border-2 border-cyan-400 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_25px_rgba(0,255,255,0.3)]">
      <div className="h-3 bg-[#0a0a0f] rounded-full overflow-hidden border border-cyan-400/30 mb-2">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500 shadow-[0_0_15px_rgba(0,255,255,0.8)]"
          style={{ width: '40%' }}
        />
      </div>
      <div className="text-center text-cyan-200 text-sm">
        800 / 2000 XP до следующего уровня
      </div>
    </div>

    <div className="space-y-3">
      {rewards.map((reward) => (
        <div
          key={reward.level}
          className={`p-6 border-2 rounded-lg flex items-center justify-between transition-all ${
            reward.unlocked
              ? 'border-green-500 bg-gradient-to-r from-green-500/10 to-green-400/5 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
              : 'border-cyan-200/30 bg-[#0a0a0f]/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${
                reward.unlocked
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-cyan-200/30 bg-[#0a0a0f]'
              }`}
            >
              <span
                className={
                  reward.unlocked ? 'text-green-400' : 'text-cyan-200'
                }
              >
                {reward.level}
              </span>
            </div>
            <div>
              <h4 className="text-cyan-300 mb-1">Уровень {reward.level}</h4>
              <p className="text-cyan-200 text-sm">{reward.reward}</p>
            </div>
          </div>
          {reward.unlocked ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <Lock className="w-6 h-6 text-cyan-200/60" />
          )}
        </div>
      ))}
    </div>
  </div>
);

BattlePassSection.propTypes = {
  rewards: PropTypes.array.isRequired,
};

export default BattlePassSection;

