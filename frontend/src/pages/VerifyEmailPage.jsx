import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { verifyEmail } from '../api/auth.js';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const didRun = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Ссылка недействительна — отсутствует токен');
      showToast('Ссылка недействительна — отсутствует токен', 'error');
      return;
    }
    if (didRun.current) return;
    didRun.current = true;

    verifyEmail(token)
      .then((data) => {
        setStatus('success');
        if (data.user) {
          authLogin({
            user_id: data.user.user_id,
            username: data.user.nickname,
            email: data.user.email,
            phone: data.user.phone,
            isAdmin: data.user.isAdmin || false,
            balance: data.user.balance || { coins: 0, hints: 0 },
          });
          showToast('Почта подтверждена. Вы вошли в аккаунт.', 'success');
          navigate('/enigma', { replace: true });
        } else {
          showToast('Почта подтверждена! Теперь вы можете войти.', 'success');
        }
      })
      .catch((err) => {
        setStatus('error');
        const msg = err.message || 'Не удалось подтвердить почту';
        setErrorMessage(msg);
        showToast(msg, 'error');
      });
  }, [token, showToast, authLogin, navigate]);

  return (
    <div className="page-fade-in auth-page-wrap">
      <AuthCard title="Подтверждение почты">
        {status === 'loading' && (
          <p className="text-center text-gray-400">Проверяем ссылку...</p>
        )}
        {status === 'success' && (
          <div className="text-center space-y-4">
            <p className="text-green-400">Почта успешно подтверждена.</p>
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
