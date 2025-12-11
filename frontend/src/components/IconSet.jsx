// Lightweight emoji-based icon set to avoid extra dependencies.
// Each icon mirrors the names used in the imported app.tsx.
import PropTypes from 'prop-types';

const createIcon = (glyph) => {
  const Icon = ({ className = '' }) => (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">
      {glyph}
    </span>
  );
  Icon.propTypes = {
    className: PropTypes.string,
  };
  return Icon;
};

export const Coins = createIcon('🪙');
export const Trophy = createIcon('🏆');
export const ShoppingCart = createIcon('🛒');
export const Award = createIcon('🎖️');
export const Lock = createIcon('🔒');
export const CheckCircle2 = createIcon('✅');
export const Zap = createIcon('⚡');
export const Star = createIcon('⭐');
export const Code = createIcon('💻');
export const Gamepad2 = createIcon('🎮');
export const Users = createIcon('👥');
export const Target = createIcon('🎯');
export const Sparkles = createIcon('✨');
export const Shield = createIcon('🛡️');
export const User = createIcon('👤');
export const Medal = createIcon('🥇');
export const Grid3x3 = createIcon('🔳');
export const Phone = createIcon('📞');
export const Mail = createIcon('✉️');
export const Crown = createIcon('👑');
export const ArrowLeft = createIcon('←');
export const Clock = createIcon('⏰');

// A simple star icon with outline for leaderboard maybe, reuse Star if needed.

