import PropTypes from 'prop-types';

export const Input = ({ className = '', ...rest }) => (
  <input
    className={[
      'w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2',
      'placeholder:text-cyan-200/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;

