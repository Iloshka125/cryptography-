import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/button.jsx';
import { Trophy, Lock, CheckCircle2 } from '../IconSet.jsx';

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
            <div className="text-6xl mb-4">{category.icon}</div>
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
          className={`p-6 border-2 rounded-lg transition-all ${
            level.locked
              ? 'border-cyan-200/30 opacity-50 bg-[#0a0a0f]/50'
              : level.completed
                ? 'border-green-500 bg-gradient-to-br from-green-500/10 to-green-400/5 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : 'border-cyan-400 bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-200">УРОВЕНЬ {level.id}</span>
            {level.locked ? (
              <Lock className="w-5 h-5 text-cyan-200" />
            ) : level.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : null}
          </div>
          <h3 className="text-base text-cyan-200 mb-4 min-h-[48px]">
            {level.name}
          </h3>
          <Button
            disabled={level.locked}
            onClick={() => {
              if (!level.locked) {
                navigate(`/level/${category.id}/${level.id}`);
              }
            }}
            className={`w-full ${
              level.completed
                ? 'bg-green-500 hover:bg-green-400'
                : 'bg-cyan-400 hover:bg-cyan-300'
            } text-black shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all disabled:opacity-30`}
          >
            {level.completed
              ? 'ПРОЙДЕНО'
              : level.locked
                ? 'ЗАБЛОКИРОВАНО'
                : 'НАЧАТЬ'}
          </Button>
        </div>
      ))}
    </div>
  </div>
);
};

CategoryLevels.propTypes = {
  category: PropTypes.object,
  onBack: PropTypes.func.isRequired,
};

export default CategoriesGrid;

