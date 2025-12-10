import PropTypes from 'prop-types';
import { Coins, Zap, ShoppingCart, Medal, Grid3x3, Star } from '../IconSet.jsx';
import Button from '../ui/button.jsx';

const HeaderBar = ({
  coins,
  hints,
  onOpenProfile,
  onChangeSection,
  currentSection,
  userAvatar,
}) => (
  <header className="relative z-10 border-b border-cyan-500/30 bg-[#0f0f1a]/70 backdrop-blur">
    <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
      <h1 className="text-2xl text-cyan-300 font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
        CODEFALL
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0f] border border-cyan-400/50 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <Coins className="w-5 h-5 text-amber-300" />
          <span className="text-amber-200">{coins}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0f] border border-cyan-400/50 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <Zap className="w-5 h-5 text-cyan-300" />
          <span className="text-cyan-200">{hints}</span>
        </div>
        <button
          onClick={() => onChangeSection('shop')}
          className="p-2 bg-[#0a0a0f] border border-cyan-400/50 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:bg-cyan-500/10 transition-all"
        >
          <ShoppingCart className="w-5 h-5 text-cyan-300" />
        </button>
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-300 rounded-full border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)] transition-all flex items-center justify-center text-xl"
        >
          {userAvatar}
        </button>
      </div>
    </div>

    <div className="border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 flex-wrap">
        <Button
          onClick={() => onChangeSection('categories')}
          className={
            currentSection === 'categories'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }
        >
          <span className="inline-flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            КАТЕГОРИИ
          </span>
        </Button>
        <Button
          onClick={() => onChangeSection('battlepass')}
          className={
            currentSection === 'battlepass'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }
        >
          <span className="inline-flex items-center gap-2">
            <Star className="w-4 h-4" />
            BATTLE PASS
          </span>
        </Button>
        <Button
          onClick={() => onChangeSection('leaderboard')}
          className={
            currentSection === 'leaderboard'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }
        >
          <span className="inline-flex items-center gap-2">
            <Medal className="w-4 h-4" />
            LEADERBOARD
          </span>
        </Button>
      </div>
    </div>
  </header>
);

HeaderBar.propTypes = {
  coins: PropTypes.number.isRequired,
  hints: PropTypes.number.isRequired,
  onOpenProfile: PropTypes.func.isRequired,
  onChangeSection: PropTypes.func.isRequired,
  currentSection: PropTypes.string.isRequired,
  userAvatar: PropTypes.node.isRequired,
};

export default HeaderBar;

