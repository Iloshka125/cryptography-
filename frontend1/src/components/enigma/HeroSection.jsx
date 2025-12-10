import PropTypes from 'prop-types';
import { Button } from '../ui/button.jsx';
import { Code, Trophy, Gamepad2, Target, Sparkles, Shield, Users, Star } from '../IconSet.jsx';
import ImageWithFallback from '../ImageWithFallback.jsx';

const features = [
  {
    title: 'Интерактивное обучение',
    desc: 'Решайте задачи по программированию в игровом формате с мгновенной обратной связью',
    icon: Code,
  },
  {
    title: 'Система достижений',
    desc: 'Получайте награды и разблокируйте новые уровни по мере прохождения заданий',
    icon: Trophy,
  },
  {
    title: 'Геймификация',
    desc: 'Собирайте монеты, используйте подсказки и прокачивайте Battle Pass',
    icon: Gamepad2,
  },
  {
    title: 'Прогрессия уровней',
    desc: 'Проходите уникальные зоны с возрастающей сложностью и боссами',
    icon: Target,
  },
  {
    title: 'Внутриигровой магазин',
    desc: 'Покупайте валюту и полезные предметы для ускорения прогресса',
    icon: Sparkles,
  },
  {
    title: 'Безопасность',
    desc: 'Полная система регистрации с защитой данных и проверкой пользователей',
    icon: Shield,
  },
];

const HeroSection = ({ onStart }) => (
  <div className="min-h-screen bg-[#0a0a0f] relative overflow-x-hidden">
    <div className="fixed inset-0 opacity-30 pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse delay-1000" />
    </div>
    <div
      className="fixed inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}
    />

    <section className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="text-center relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl text-cyan-300 drop-shadow-[0_0_20px_rgba(0,255,255,0.9)] animate-pulse tracking-wider">
            ENIGMA
          </h1>
          <h2 className="text-3xl md:text-4xl text-cyan-200 drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]">
            Перезагрузка
          </h2>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-400" />
        </div>
        <div className="max-w-2xl mx-auto p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          <p className="text-cyan-200 leading-relaxed text-sm md:text-base">
            В мире, где восставший ИИ разделил планету на зоны-коды, игроку предстоит
            взламывать цифровые барьеры и сражаться с машинами. Прокачивай навыки,
            открывай новые ветки пути и приближайся к ядру, чтобы остановить Перезагрузку.
          </p>
        </div>
        <div className="pt-4">
          <Button
            onClick={onStart}
            className="px-12 py-6 text-lg bg-cyan-400 text-black hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:shadow-[0_0_50px_rgba(0,255,255,1)] hover:scale-105"
          >
            НАЧАТЬ ИГРУ
          </Button>
        </div>
        <div className="pt-8 flex justify-center gap-8 text-cyan-200/70 text-xs">
          <span className="animate-pulse">[ ONLINE ]</span>
          <span>|</span>
          <span className="animate-pulse delay-300">[ READY ]</span>
          <span>|</span>
          <span className="animate-pulse delay-700">[ CONNECT ]</span>
        </div>
      </div>
    </section>

    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.9)] mb-4">
            ПЛАТФОРМА
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
          <p className="text-cyan-200 max-w-2xl mx-auto">
            Полнофункциональная образовательная платформа для изучения программирования через игровой процесс
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="group p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-lg bg-cyan-400/10 flex items-center justify-center border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all">
                  <Icon className="w-8 h-8 text-cyan-300" />
                </div>
                <h3 className="text-xl text-cyan-200">{title}</h3>
                <p className="text-cyan-200/80 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="relative py-20 px-4 bg-gradient-to-b from-transparent via-[#0a0a0f] to-transparent">
      <div className="max-w-6xl mx-auto relative z-10 space-y-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.9)] mb-4">
            ЧТО ВАС ЖДЕТ?
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="p-8 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              <h3 className="text-2xl text-cyan-200 mb-4">Киберпанк вселенная</h3>
              <p className="text-cyan-200/80 leading-relaxed mb-4">
                Погрузитесь в мир высоких технологий и неоновых огней. Исследуйте цифровые лабиринты,
                взламывайте защищенные системы и сражайтесь с ИИ.
              </p>
              <ul className="space-y-2 text-cyan-200/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  5 уникальных зон с различными вызовами
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Босс-сражения с протоколами ИИ
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Атмосферные визуальные эффекты
                </li>
              </ul>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
              <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1641650265007-b2db704cd9f3?auto=format&fit=crop&w=1080&q=80"
                  alt="Cyberpunk city"
                  className="w-full h-64 lg:h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1672581437674-3186b17b405a?auto=format&fit=crop&w=1080&q=80"
                alt="Futuristic technology"
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>
          </div>
          <div>
            <div className="p-8 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              <h3 className="text-2xl text-cyan-200 mb-4">Реальные навыки программирования</h3>
              <p className="text-cyan-200/80 leading-relaxed mb-4">
                Обучение через практику — решайте задачи по алгоритмам и логике.
                Каждый уровень — это новое испытание ваших навыков кодирования.
              </p>
              <ul className="space-y-2 text-cyan-200/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Задачи от начального до продвинутого уровня
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Мгновенная проверка решений
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Система подсказок для сложных задач
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="p-8 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              <h3 className="text-2xl text-cyan-200 mb-4">Прогресс и награды</h3>
              <p className="text-cyan-200/80 leading-relaxed mb-4">
                Отслеживайте свой прогресс через систему достижений и Battle Pass. Зарабатывайте
                монеты, получайте уникальные награды и поднимайтесь на вершину рейтинга.
              </p>
              <ul className="space-y-2 text-cyan-200/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Более 20 уникальных достижений
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Эксклюзивные награды Battle Pass
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Система внутриигровой валюты
                </li>
              </ul>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
              <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1608742213509-815b97c30b36?auto=format&fit=crop&w=1080&q=80"
                  alt="Coding screen"
                  className="w-full h-64 lg:h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.9)] mb-4">
            КТО МЫ ТАКИЕ?
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1080&q=80"
                alt="Team collaboration"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
          <div className="p-8 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            <h3 className="text-2xl text-cyan-200 mb-4">Команда энтузиастов</h3>
            <p className="text-cyan-200/80 leading-relaxed mb-4">
              Мы — группа разработчиков, дизайнеров и педагогов, объединенных целью сделать обучение
              программированию увлекательным и доступным.
            </p>
            <p className="text-cyan-200/80 leading-relaxed">
              ENIGMA: Перезагрузка — результат страсти к играм, технологиям и образованию. Мы верим,
              что обучение должно быть захватывающим приключением.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-cyan-300" />
              <h4 className="text-lg text-cyan-200">Наша миссия</h4>
            </div>
            <p className="text-cyan-200/80 text-sm">
              Создать инновационную платформу для обучения программированию через геймификацию.
            </p>
          </div>

          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-cyan-300" />
              <h4 className="text-lg text-cyan-200">Наша цель</h4>
            </div>
            <p className="text-cyan-200/80 text-sm">
              Помочь тысячам людей освоить навыки программирования и начать карьеру в IT.
            </p>
          </div>

          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-cyan-300" />
              <h4 className="text-lg text-cyan-200">Наши ценности</h4>
            </div>
            <p className="text-cyan-200/80 text-sm">
              Инновации, доступность образования, сообщество и постоянное развитие.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-8 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-cyan-400/10 to-cyan-300/5 shadow-[0_0_40px_rgba(0,255,255,0.3)]">
            <h3 className="text-2xl text-cyan-200 mb-4">Готовы начать свое путешествие?</h3>
            <p className="text-cyan-200/80 mb-6 max-w-xl">
              Присоединяйтесь к тысячам игроков, которые уже взломали систему и прокачивают свои навыки программирования
            </p>
            <Button
              onClick={onStart}
              className="px-10 py-5 text-lg bg-cyan-400 text-black hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:shadow-[0_0_50px_rgba(0,255,255,1)] hover:scale-105"
            >
              ЗАРЕГИСТРИРОВАТЬСЯ СЕЙЧАС
            </Button>
          </div>
        </div>
      </div>
    </section>

    <footer className="relative py-8 border-t-2 border-cyan-400/30">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-cyan-200/80 text-sm">
          © 2025 ENIGMA: Перезагрузка. Все права защищены.
        </p>
        <div className="mt-4 flex justify-center gap-8 text-cyan-200/70 text-xs">
          <span className="animate-pulse">[ SYSTEM ONLINE ]</span>
          <span>|</span>
          <span className="animate-pulse delay-300">[ ALL SYSTEMS OPERATIONAL ]</span>
        </div>
      </div>
    </footer>
  </div>
);

HeroSection.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default HeroSection;

