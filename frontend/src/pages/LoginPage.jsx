import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { login, resendVerificationEmail } from '../api/auth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();
  const [pendingEmail, setPendingEmail] = useState(null); // email, ожидающий подтверждения
  const [resendLoading, setResendLoading] = useState(false);
  const { values, errors, handleChange, validate, setValues } = useForm({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Сообщение и email с редиректа после регистрации
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, 'success');
      if (location.state.email) {
        setPendingEmail(location.state.email);
        setValues((prev) => ({ ...prev, identifier: location.state.email }));
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const handleResendVerification = async () => {
    const email = pendingEmail || values.identifier;
    if (!email || !email.includes('@')) {
      showToast('Введите email для повторной отправки', 'error');
      return;
    }
    setResendLoading(true);
    try {
      await resendVerificationEmail(email.trim());
      showToast('Письмо отправлено. Проверьте почту и папку «Спам».', 'success');
      setPendingEmail(null);
    } catch (err) {
      showToast(err.message || 'Не удалось отправить письмо', 'error');
    } finally {
      setResendLoading(false);
    }
  };

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
      // Перенаправляем на главную страницу
      setTimeout(() => {
        navigate('/enigma');
      }, 500);
    } catch (error) {
      const isEmailNotVerified =
        error.message?.includes('Подтвердите почту') || error.message?.includes('EMAIL_NOT_VERIFIED');
      if (isEmailNotVerified) {
        setPendingEmail(values.identifier?.includes('@') ? values.identifier : null);
        showToast(
          'Сначала подтвердите почту. Проверьте письмо и папку «Спам» или нажмите «Отправить повторно» ниже.',
          'info'
        );
      } else {
        showToast(error.message || 'Произошла ошибка при входе', 'error');
      }
      if (!isEmailNotVerified) console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in auth-page-wrap flex flex-col items-center gap-6 py-8">
      <AuthCard title="Вход">
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

      {pendingEmail && (
        <section
          className="w-full max-w-[520px] rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-5 py-5 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
          aria-label="Подтверждение почты"
        >
          <h2 className="mb-3 text-base font-semibold text-amber-200">
            Подтвердите почту
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-amber-100/90">
            Мы отправили письмо на <span className="font-medium text-cyan-300">{pendingEmail}</span>. Откройте его и перейдите по ссылке или нажмите кнопку в письме — после этого войти будет можно.
          </p>
          <p className="mb-4 text-sm font-medium text-red-400">
            Не видите письмо? Обязательно проверьте папку «Спам» и «Промоакции».
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="w-full rounded-lg border-2 border-cyan-400/60 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-200 shadow-[0_0_12px_rgba(0,255,255,0.2)] transition hover:border-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_16px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Отправка...' : 'Отправить письмо повторно'}
          </button>
        </section>
      )}
    </div>
  );
};

export default LoginPage;
