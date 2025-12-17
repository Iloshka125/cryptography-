import PropTypes from 'prop-types';

export const Checkbox = ({ id, checked, onChange, disabled, className = '', label, ...rest }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="cursor-pointer"
        {...rest}
      />
      {label && (
        <label 
          htmlFor={id} 
          className="text-cyan-200 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
};

export default Checkbox;
