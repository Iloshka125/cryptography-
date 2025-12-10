import PropTypes from 'prop-types';

export const Checkbox = ({
  className = '',
  checked = false,
  onCheckedChange,
  id,
}) => (
  <input
    id={id}
    type="checkbox"
    className={[
      'h-4 w-4 rounded border-cyan-400/60 bg-[#0a0a0f] text-cyan-400',
      'focus:ring-cyan-400 focus:outline-none',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
  />
);

Checkbox.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func,
  id: PropTypes.string,
};

export default Checkbox;

