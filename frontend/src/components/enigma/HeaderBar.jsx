import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Coins, Zap, ShoppingCart, Medal, Grid3x3, Star, Trophy, Gamepad2, User, Settings, renderIconByValue } from '../IconSet.jsx';
import Button from '../ui/button.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

const HeaderBar = ({
  coins,
  hints,
  onChangeSection,
  currentSection,
  userAvatar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Определяем текущую секцию на основе URL
  const getCurrentSection = () => {
    if (currentSection) return currentSection; // Если передано явно, используем это
    const path = location.pathname;
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/battle')) return 'battlepass';
    if (path.startsWith('/leaderboard')) return 'leaderboard';
    if (path.startsWith('/competitions')) return 'competitions';
    if (path.startsWith('/1vs1') || path.startsWith('/one-vs-one')) return 'versus';
    return '';
  };

  const activeSection = getCurrentSection();
  
  return (
  <header className="relative z-10 border-b border-cyan-500/30 bg-[#0f0f1a]/70 backdrop-blur">
    <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
      <h1 className="text-2xl text-cyan-300 font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
        ENIGMA
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
          onClick={() => onChangeSection?.('shop')}
          className="p-2 bg-[#0a0a0f] border border-cyan-400/50 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:bg-cyan-500/10 transition-all relative"
          title="Магазин"
        >
          <ShoppingCart className="w-5 h-5 text-cyan-300" />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-300 rounded-full border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)] transition-all flex items-center justify-center cursor-pointer"
        >
          {typeof userAvatar === 'string' && userAvatar
            ? renderIconByValue(userAvatar, 'w-6 h-6 text-black')
            : renderIconByValue('target', 'w-6 h-6 text-black')}
        </button>
      </div>
    </div>

    <div className="border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 flex-wrap">
        <Button
          onClick={() => navigate('/categories')}
          className={`flex items-center justify-center gap-2 ${
            activeSection === 'categories'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }`}
        >
            <Grid3x3 className="w-4 h-4" />
          <span>КАТЕГОРИИ</span>
        </Button>
        <Button
          onClick={() => navigate('/battle')}
          className={`flex items-center justify-center gap-2 ${
            activeSection === 'battlepass'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }`}
        >
            <Star className="w-4 h-4" />
          <span>BATTLE PASS</span>
        </Button>
        <Button
          onClick={() => navigate('/leaderboard')}
          className={`flex items-center justify-center gap-2 ${
            activeSection === 'leaderboard'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }`}
        >
            <Medal className="w-4 h-4" />
          <span>LEADERBOARD</span>
        </Button>
        <Button
          onClick={() => navigate('/competitions')}
          className={`flex items-center justify-center gap-2 ${
            activeSection === 'competitions'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>СОРЕВНОВАНИЯ</span>
        </Button>
        <Button
          onClick={() => navigate('/1vs1')}
          className={`flex items-center justify-center gap-2 ${
            activeSection === 'versus'
              ? 'bg-cyan-400 text-black'
              : 'bg-transparent border border-cyan-400 text-cyan-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>1 VS 1</span>
        </Button>
        {isAdmin && (
          <Button
            onClick={() => navigate('/admin')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 border border-purple-400"
          >
            <Settings className="w-4 h-4" />
            <span>АДМИН</span>
          </Button>
        )}
      </div>
    </div>
  </header>
);
};

HeaderBar.propTypes = {
  coins: PropTypes.number.isRequired,
  hints: PropTypes.number.isRequired,
  onChangeSection: PropTypes.func,
  currentSection: PropTypes.string,
  userAvatar: PropTypes.node.isRequired,
};

export default HeaderBar;

