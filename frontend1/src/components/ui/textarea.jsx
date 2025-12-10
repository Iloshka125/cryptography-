import PropTypes from 'prop-types';

export const Textarea = ({ className = '', ...rest }) => (
  <textarea
    className={[
      'w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2',
      'placeholder:text-cyan-200/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400 resize-none',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

Textarea.propTypes = {
  className: PropTypes.string,
};

export default Textarea;

