import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import CryptoQuiz from '../components/CryptoQuiz.jsx';
import useForm from '../hooks/useForm.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  validateEmailOptional,
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
  validatePhoneOptional,
  normalizePhoneForDB
} from '../utils/validators.js';
import { register } from '../api/auth.js';

const formatPhoneNumber = (rawValue) => {
  const digitsOnly = rawValue.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  let normalized = digitsOnly;

  if (normalized.startsWith('8')) {
    normalized = `7${normalized.slice(1)}`;
  }

  if (!normalized.startsWith('7')) {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);

  let formatted = '+7';
  const totalLength = normalized.length;
  const area = normalized.slice(1, Math.min(4, totalLength));

  if (area) {
    formatted += `(${area}`;
    if (area.length === 3 && totalLength >= 4) {
      formatted += ')';
    }
  }

  if (totalLength > 4) {
    formatted += normalized.slice(4, Math.min(7, totalLength));
  }

  if (totalLength > 7) {
    formatted += `-${normalized.slice(7, Math.min(9, totalLength))}`;
  }

  if (totalLength > 9) {
    formatted += `-${normalized.slice(9, 11)}`;
  }

  return formatted;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();
  const { values, errors, handleChange, validate } = useForm({
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validate({
      nickname: (value) => validateNickname(value),
      email: (value, all) => validateEmailOptional(value, all),
      phone: (value, all) => validatePhoneOptional(value, all),
      password: (value) => validatePassword(value),
      confirmPassword: (value, all) =>
        validatePasswordConfirmation(value, all)
    });
    if (!isValid) {
      return;
    }

    // Сохраняем данные пользователя и показываем квиз
    const data = {
      nickname: values.nickname,
      password: values.password,
    };
    
    if (values.email) {
      data.email = values.email;
    }
    if (values.phone) {
      // Нормализуем номер телефона для БД (формат +7XXXXXXXXXX)
      data.phone = normalizePhoneForDB(values.phone);
    }
    
    setUserData(data);
    setShowQuiz(true);
  };

  const handleQuizComplete = async (data) => {
    setLoading(true);
    
    try {
      const response = await register(data);
      // Устанавливаем авторизацию с данными пользователя
      const userData = response.user || response;
      authLogin({
        user_id: userData.user_id || response.user_id,
        username: data.nickname,
        email: data.email,
        phone: data.phone,
        isAdmin: userData.isAdmin || false,
        balance: userData.balance || { coins: 1000, hints: 5 }, // Начальный баланс при регистрации
      });
      showToast(
        response.message || 'Пользователь успешно зарегистрирован!',
        'success'
      );
      console.log('Registration successful:', response);
      // Перенаправляем на главную страницу
      setTimeout(() => {
        navigate('/enigma');
      }, 1500);
    } catch (error) {
      showToast(
        error.message || 'Произошла ошибка при регистрации',
        'error'
      );
      console.error('Registration error:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleQuizBack = () => {
    setShowQuiz(false);
    setUserData(null);
  };

  const handlePhoneChange = (event) => {
    const formattedValue = formatPhoneNumber(event.target.value);
    handleChange({
      target: {
        name: 'phone',
        value: formattedValue
      }
    });
  };

  // Если показываем квиз, рендерим его
  if (showQuiz && userData) {
    return (
      <div className="page-fade-in min-h-screen flex items-center justify-center p-4">
        <div>
          <CryptoQuiz
            userData={userData}
            onComplete={handleQuizComplete}
            onBack={handleQuizBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade-in min-h-screen flex items-center justify-center p-4">
      <AuthCard
        title="Регистрация"
      >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Никнейм"
          name="nickname"
          value={values.nickname}
          placeholder="nickname"
          onChange={handleChange}
          error={errors.nickname}
          autoComplete="nickname"
          maxLength={32}
        />
        <div className="grid grid--2">
          <FormInput
            label="Почта"
            name="email"
            type="email"
            value={values.email}
            placeholder="example@mail.com"
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <FormInput
            label="Телефон"
            name="phone"
            value={values.phone}
            placeholder="+7(999)999-99-99"
            onChange={handlePhoneChange}
            error={errors.phone}
            autoComplete="tel"
            inputMode="tel"
            maxLength={16}
          />
        </div>
        <FormInput
          label="Пароль"
          name="password"
          type="password"
          value={values.password}
          placeholder="Придумайте пароль"
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          allowToggle
        />
        <FormInput
          label="Повтори пароль"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          placeholder="Повторите пароль"
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          allowToggle
        />
        <SubmitButton label="Далее" loading={loading} />
        <p className="form-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </AuthCard>
    </div>
  );
};

export default RegisterPage;
