import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import useForm from '../hooks/useForm.js';
import {
  validateIdentifier,
  validatePassword
} from '../utils/validators.js';

const LoginPage = () => {
  const { values, errors, handleChange, validate } = useForm({
    identifier: '',
    password: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus(null);
    const isValid = validate({
      identifier: (value) => validateIdentifier(value),
      password: (value) => validatePassword(value)
    });
    if (!isValid) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus({
        type: 'success',
        message:
          'Валидация пройдена. Отправь эти данные на свой бек.'
      });
      console.log('login payload', values);
    }, 700);
  };

  return (
    <AuthCard
      title="Вход"
      subtitle="Используй почту или телефон и свой пароль."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Почта или телефон"
          name="identifier"
          value={values.identifier}
          placeholder="example@mail.com / +79991234567"
          onChange={handleChange}
          error={errors.identifier}
          autoComplete="username"
        />
        <FormInput
          label="Пароль"
          name="password"
          type="password"
          value={values.password}
          placeholder="••••••••"
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />
        <SubmitButton label="Войти" loading={loading} />
        {status && (
          <p className={`status-message status-message--${status.type}`}>
            {status.message}
          </p>
        )}
        <p className="form-footer">
          Нет аккаунта? <Link to="/register">Создай его</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default LoginPage;

