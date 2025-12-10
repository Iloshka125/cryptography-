/* Basic button wrapper to keep classNames consistent. */
import PropTypes from 'prop-types';

export const Button = ({
  className = '',
  children,
  disabled = false,
  ...rest
}) => {
  const composedClass = [
    'px-4',
    'py-2',
    'rounded-md',
    'font-semibold',
    'transition-all',
    'duration-200',
    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={composedClass} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool,
};

export default Button;

