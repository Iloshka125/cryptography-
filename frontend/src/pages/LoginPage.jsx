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
import { login } from '../api/auth.js';

const LoginPage = () => {
  const { values, errors, handleChange, validate } = useForm({
    identifier: '',
    password: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
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
    
    try {
      // Определяем, является ли identifier email или телефоном
      const isEmail = values.identifier.includes('@');
      const credentials = {
        password: values.password,
      };
      
      if (isEmail) {
        credentials.email = values.identifier;
      } else {
        credentials.phone = values.identifier;
      }
      
      const response = await login(credentials);
      setStatus({
        type: 'success',
        message: response.message || `Добро пожаловать, ${response.nickname || 'пользователь'}!`
      });
      console.log('Login successful:', response);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Произошла ошибка при входе'
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in">
      <AuthCard
        title="Вход"
        
      >
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Почта или телефон"
            name="identifier"
            value={values.identifier}
            placeholder="example@mail.com / +7(999)999-99-99"
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
            allowToggle
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
    </div>
  );
};

export default LoginPage;
