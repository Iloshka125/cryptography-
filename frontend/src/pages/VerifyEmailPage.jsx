import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { verifyEmail } from '../api/auth.js';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      const msg = 'Ссылка недействительна — отсутствует токен';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    verifyEmail(token)
      .then((data) => {
        setStatus('success');
        const msg = data?.message || 'Почта подтверждена! Теперь вы можете войти.';
        showToast(msg, 'success');
      })
      .catch((err) => {
        setStatus('error');
        const msg = err.message || 'Не удалось подтвердить почту';
        setErrorMessage(msg);
        showToast(msg, 'error');
      });
  }, [token, showToast]);

  return (
    <div className="page-fade-in auth-page-wrap">
      <AuthCard title="Подтверждение почты">
        {status === 'loading' && (
          <p className="text-center text-gray-400">Проверяем ссылку...</p>
        )}
        {status === 'success' && (
          <div className="text-center space-y-4">
            <p className="text-green-400">Аккаунт подтверждён. Можете войти.</p>
            <Link
              to="/login"
              className="block w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-medium transition"
            >
              Войти
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="text-center space-y-4">
            <p className="text-red-400">{errorMessage}</p>
            <p className="text-sm text-gray-400">
              Запросите новое письмо на странице входа. Проверьте папку «Спам», если письмо не пришло.
            </p>
            <Link
              to="/login"
              className="block w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-medium transition"
            >
              К странице входа
            </Link>
          </div>
        )}
      </AuthCard>
    </div>
  );
};

export default VerifyEmailPage;
