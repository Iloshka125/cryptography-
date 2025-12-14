import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import useForm from '../hooks/useForm.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  validateIdentifier,
  validatePassword,
  normalizePhoneForDB,
  isPhone
} from '../utils/validators.js';
import { login } from '../api/auth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();
  const { values, errors, handleChange, validate } = useForm({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        // Нормализуем номер телефона для БД (формат +7XXXXXXXXXX)
        credentials.phone = normalizePhoneForDB(values.identifier);
      }
      
      const response = await login(credentials);
      // Устанавливаем авторизацию с данными пользователя
      const userData = response.user || response;
      authLogin({
        user_id: userData.user_id || response.user_id,
        username: userData.nickname || response.nickname,
        email: userData.email || credentials.email,
        phone: userData.phone || credentials.phone,
        isAdmin: userData.isAdmin || false,
        balance: userData.balance || response.balance,
      });
      showToast(
        response.message || `Добро пожаловать, ${response.nickname || 'пользователь'}!`,
        'success'
      );
      console.log('Login successful:', response);
      // Перенаправляем на главную страницу
      setTimeout(() => {
        navigate('/enigma');
      }, 500);
    } catch (error) {
      showToast(
        error.message || 'Произошла ошибка при входе',
        'error'
      );
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in min-h-screen flex items-center justify-center p-4">
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
          <p className="form-footer">
            Нет аккаунта? <Link to="/register">Создай его</Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
};

export default LoginPage;
