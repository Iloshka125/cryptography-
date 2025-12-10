import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import CryptoQuiz from '../components/CryptoQuiz.jsx';
import useForm from '../hooks/useForm.js';
import {
  validateEmailOptional,
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
  validatePhoneOptional
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
  const { values, errors, handleChange, validate } = useForm({
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
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
      data.phone = values.phone;
    }
    
    setUserData(data);
    setShowQuiz(true);
  };

  const handleQuizComplete = async (data) => {
    setLoading(true);
    setStatus(null);
    
    try {
      const response = await register(data);
      setStatus({
        type: 'success',
        message: response.message || 'Пользователь успешно зарегистрирован!'
      });
      console.log('Registration successful:', response);
      // Можно добавить редирект на страницу входа через несколько секунд
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Произошла ошибка при регистрации'
      });
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
      <>
        <CryptoQuiz
          userData={userData}
          onComplete={handleQuizComplete}
          onBack={handleQuizBack}
        />
        {status && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p className={`status-message status-message--${status.type}`}>
              {status.message}
            </p>
          </div>
        )}
      </>
    );
  }

  return (
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
        {status && (
          <p className={`status-message status-message--${status.type}`}>
            {status.message}
          </p>
        )}
        <p className="form-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
