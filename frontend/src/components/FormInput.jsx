import { useState } from 'react';
import PropTypes from 'prop-types';

const EyeIcon = ({ crossed }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {crossed ? (
      <>
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M19.5 12.75c.3-.48.45-.72.45-.75C18.6 9 15.61 6.75 12 6.75a7.2 7.2 0 00-2.06.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.25 8.5C5.08 9.66 3.71 11.4 3 12c0 .03 3 5.25 9 5.25a9.2 9.2 0 002.53-.36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.75 9.75a2.25 2.25 0 003 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <path
          d="M1.5 12S5.25 5.25 12 5.25 22.5 12 22.5 12 18.75 18.75 12 18.75 1.5 12 1.5 12z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15a3 3 0 110-6 3 3 0 010 6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

EyeIcon.propTypes = {
  crossed: PropTypes.bool
};

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
  inputMode,
  allowToggle = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldToggle = allowToggle && type === 'password';
  const resolvedType = shouldToggle && isVisible ? 'text' : type;

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <div className="field__input-wrapper">
        <input
          className={`field__input${error ? ' field__input--error' : ''}`}
          name={name}
          type={resolvedType}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          autoComplete={autoComplete}
          maxLength={maxLength}
          inputMode={inputMode}
        />
        {shouldToggle && (
          <button
            type="button"
            className={`field__toggle${isVisible ? ' field__toggle--active' : ''}`}
            onClick={() => setIsVisible((prev) => !prev)}
            aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          >
            <EyeIcon crossed={!isVisible} />
          </button>
        )}
      </div>
      {error && <span className="field__error">{error}</span>}
    </label>
  );
};

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
  inputMode: PropTypes.string,
  allowToggle: PropTypes.bool
};

export default FormInput;