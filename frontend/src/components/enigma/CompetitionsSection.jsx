import PropTypes from 'prop-types';
import Button from '../ui/button.jsx';
import { Trophy, Star, Clock, Users, Crown, Zap, renderIconByValue } from '../IconSet.jsx';

const CompetitionsSection = ({ showToast }) => {
  const competitions = [
    {
      id: 1,
      name: 'Еженедельный турнир',
      description: 'Соревнуйтесь с другими игроками и выигрывайте призы',
      prize: '5000 монет',
      participants: 234,
      status: 'active',
      endDate: '2024-01-15',
      icon: 'trophy',
    },
    {
      id: 2,
      name: 'Месячный чемпионат',
      description: 'Главное соревнование месяца с крупными наградами',
      prize: '10000 монет + Уникальный аватар',
      participants: 567,
      status: 'active',
      endDate: '2024-01-31',
      icon: 'crown',
    },
    {
      id: 3,
      name: 'Спринт по шифрованию',
      description: 'Быстрое соревнование на скорость решения задач',
      prize: '2000 монет',
      participants: 89,
      status: 'upcoming',
      endDate: '2024-01-20',
      icon: 'zap',
    },
  ];

  const handleJoin = (competitionId) => {
    showToast?.(`Вы присоединились к соревнованию!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
          СОРЕВНОВАНИЯ
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <div
            key={competition.id}
            className={`p-6 border-2 rounded-lg transition-all hover:scale-105 ${
              competition.status === 'active'
                ? 'border-cyan-400 bg-[#0a0a0f]/70 shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)]'
                : 'border-cyan-200/30 bg-[#0a0a0f]/50 opacity-80'
            }`}
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-3 text-cyan-300">
                {renderIconByValue(competition.icon || 'trophy', 'w-12 h-12')}
              </div>
              <h3 className="text-xl text-cyan-300 mb-2 font-semibold">
                {competition.name}
              </h3>
              <p className="text-cyan-200 text-sm mb-4 min-h-[60px]">
                {competition.description}
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-2 bg-cyan-400/10 rounded-lg">
                <span className="text-cyan-200 text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  Приз
                </span>
                <span className="text-amber-300 font-semibold">{competition.prize}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-cyan-400/10 rounded-lg">
                <span className="text-cyan-200 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Участников
                </span>
                <span className="text-cyan-300 font-semibold">{competition.participants}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-cyan-400/10 rounded-lg">
                <span className="text-cyan-200 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  До конца
                </span>
                <span className="text-cyan-300 font-semibold">{competition.endDate}</span>
              </div>
            </div>

            <Button
              onClick={() => handleJoin(competition.id)}
              disabled={competition.status !== 'active'}
              className={`w-full ${
                competition.status === 'active'
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                  : 'bg-cyan-400/30 text-cyan-200'
              } shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all disabled:opacity-50`}
            >
              {competition.status === 'active' ? 'ПРИСОЕДИНИТЬСЯ' : 'СКОРО'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

CompetitionsSection.propTypes = {
  showToast: PropTypes.func,
};

export default CompetitionsSection;


