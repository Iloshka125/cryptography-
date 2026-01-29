import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/button.jsx';
import { Trophy, Lock, CheckCircle2, renderIconByValue, Coins } from '../IconSet.jsx';

export const CategoriesGrid = ({ categories, onSelect }) => (
  <div className="space-y-6">
    <h2 className="text-3xl text-cyan-300 mb-6 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
      КАТЕГОРИИ КРИПТОГРАФИИ
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={() => onSelect(category.id)}
          className="group cursor-pointer p-8 border-2 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all hover:scale-105 flex flex-col h-full"
          style={{ borderColor: category.color }}
        >
          <div className="text-center flex flex-col flex-1 h-full">
            <div className="text-6xl mb-4 text-cyan-300 flex justify-center items-center">
              {renderIconByValue(category.icon || 'lock', 'w-16 h-16')}
            </div>
            <h3 className="text-2xl text-cyan-300 mb-3">
              {category.name}
            </h3>
            <p className="text-cyan-200 text-sm mb-4 h-[80px] flex items-center justify-center flex-grow">
              {category.description}
            </p>
            <div className="mt-auto pt-4 space-y-4">
            <div className="flex items-center justify-center gap-2 text-cyan-200 text-sm">
              <Trophy className="w-4 h-4" />
              <span>
                {category.levels.filter((l) => l.completed).length} /{' '}
                {category.levels.length} завершено
              </span>
            </div>
              <Button className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all">
              ВЫБРАТЬ
            </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

CategoriesGrid.propTypes = {
  categories: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export const CategoryLevels = ({
  category,
  onBack,
  userId,
  balance,
  onPurchaseLevel,
}) => {
  const navigate = useNavigate();
  
  return (
  <div className="space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <Button
        onClick={onBack}
        className="bg-transparent border-2 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black transition-all"
      >
        ← НАЗАД
      </Button>
      <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
        {category?.name}
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {category?.levels.map((level) => (
        <div
          key={level.id}
          className={`p-6 border-2 rounded-lg transition-all flex flex-col h-[200px] ${
            level.locked && !(level.isPaid && !level.purchased)
              ? 'border-cyan-200/30 opacity-50 bg-[#0a0a0f]/50'
              : level.completed
                ? 'border-green-500 bg-gradient-to-br from-green-500/10 to-green-400/5 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : level.locked && level.isPaid && !level.purchased
                  ? 'border-yellow-400/60 bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] opacity-100'
                  : 'border-cyan-400 bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-cyan-200 text-sm">УРОВЕНЬ {level.order_index || level.orderIndex || level.id}</span>
            {level.locked ? (
              <Lock className="w-5 h-5 text-cyan-200" />
            ) : level.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : null}
          </div>
          <h3 className="text-base text-cyan-200 mb-2 line-clamp-2 flex-shrink-0">
            {level.name}
          </h3>
          {level.isPaid && level.price > 0 && (
            <div className="flex items-center gap-2 mb-3 text-cyan-300 flex-shrink-0">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-semibold">{level.price} монет</span>
            </div>
          )}
          <div className="mt-auto">
            <button
              onClick={() => {
                if (level.locked && level.isPaid && !level.purchased) {
                  // Покупка уровня
                  if (onPurchaseLevel) {
                    onPurchaseLevel(level.hash || level.id, level.price);
                  }
                } else if (!level.locked) {
                  navigate(`/level/${category.id}/${level.hash || level.id}`);
                }
              }}
              disabled={level.locked && !(level.isPaid && !level.purchased)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 w-full ${
                level.completed
                  ? 'bg-green-500 hover:bg-green-400'
                  : level.locked && level.isPaid && !level.purchased
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-[0_0_20px_rgba(251,191,36,0.8)] hover:shadow-[0_0_30px_rgba(251,191,36,1)] cursor-pointer active:scale-95 hover:scale-[1.02] opacity-100'
                    : level.locked
                      ? 'bg-gray-500 hover:bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-cyan-400 hover:bg-cyan-300 hover:scale-[1.02]'
              } text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]`}
            >
              {level.completed
                ? 'ПРОЙДЕНО'
                : level.locked && level.isPaid && !level.purchased
                  ? `КУПИТЬ (${level.price} монет)`
                  : level.locked
                    ? 'ЗАБЛОКИРОВАНО'
                    : 'НАЧАТЬ'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

CategoryLevels.propTypes = {
  category: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  balance: PropTypes.object,
  onPurchaseLevel: PropTypes.func,
};

export default CategoriesGrid;

