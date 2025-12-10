import PropTypes from 'prop-types';

export const Label = ({ className = '', children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className={[
      'text-cyan-200 text-sm tracking-wide',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </label>
);

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  htmlFor: PropTypes.string,
};

export default Label;

