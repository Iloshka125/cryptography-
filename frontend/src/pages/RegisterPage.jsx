import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import useForm from '../hooks/useForm.js';
import {
  validateEmailOptional,
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
  validatePhoneOptional
} from '../utils/validators.js';

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

  const handleSubmit = (event) => {
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

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus({
        type: 'success',
        message:
          'Пользователь собран. Подключи сюда реальный запрос.'
      });
      console.log('register payload', {
        nickname: values.nickname,
        email: values.email || null,
        phone: values.phone || null,
        password: values.password
      });
    }, 800);
  };

  return (
    <AuthCard
      title="Регистрация"
      subtitle="Заполни контакты и придумай никнейм."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Никнейм"
          name="nickname"
          value={values.nickname}
          placeholder="grek_hyek"
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
            placeholder="+79991234567"
            onChange={handleChange}
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
          placeholder="Придумай пароль"
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          label="Повтори пароль"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          placeholder="Повтори тот же пароль"
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <SubmitButton label="Создать аккаунт" loading={loading} />
        {status && (
          <p className={`status-message status-message--${status.type}`}>
            {status.message}
          </p>
        )}
        <p className="form-footer">
          Уже есть аккаунт? <Link to="/login">Войди</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;

