import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2 } from './IconSet.jsx';

const Toast = ({ message, type = 'success', onClose, duration = 1500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setIsVisible(true), 10);

    // Автоматическое закрытие
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose?.();
      }, 300); // Время анимации исчезновения
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';
  const isInfo = type === 'info';
  const bgColor = isSuccess
    ? 'bg-gradient-to-r from-green-500/20 to-green-400/10 border-green-400/50'
    : isInfo
      ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 border-cyan-400/50'
      : 'bg-gradient-to-r from-red-500/20 to-red-400/10 border-red-400/50';
  const textColor = isSuccess
    ? 'text-green-300'
    : isInfo
      ? 'text-cyan-300'
      : 'text-red-300';
  const icon = isSuccess ? '✓' : isInfo ? 'ℹ' : '✕';

  return (
    <div
      className={`min-w-[300px] max-w-[500px] p-4 rounded-lg border-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] backdrop-blur-md transition-all duration-300 ease-out ${
        bgColor
      } ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${textColor} font-bold flex-shrink-0`}>
          {icon}
        </div>
        <p className={`flex-1 ${textColor} text-sm font-medium`}>
          {message}
        </p>
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
  onClose: PropTypes.func,
  duration: PropTypes.number,
};

export default Toast;

