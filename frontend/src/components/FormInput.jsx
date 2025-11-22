import PropTypes from 'prop-types';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  onChange,
  error,
  autoComplete = 'off',
  maxLength,
  inputMode
}) => (
  <label className="field">
    <span className="field__label">{label}</span>
    <input
      className={`field__input${error ? ' field__input--error' : ''}`}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      autoComplete={autoComplete}
      maxLength={maxLength}
      inputMode={inputMode}
    />
    {error && <span className="field__error">{error}</span>}
  </label>
);

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  autoComplete: PropTypes.string,
  maxLength: PropTypes.number,
  inputMode: PropTypes.string
};

export default FormInput;

