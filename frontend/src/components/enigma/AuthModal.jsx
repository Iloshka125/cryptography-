import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Checkbox } from '../ui/checkbox.jsx';
import { Textarea } from '../ui/textarea.jsx';

const AuthModal = ({
  open,
  onOpenChange,
  modalState,
  setModalState,
  registrationStep,
  email,
  password,
  confirmPassword,
  task1Answers,
  task2Answer,
  task3Answer,
  isTask1AllChecked,
  setEmail,
  setPassword,
  setConfirmPassword,
  setTask1Answers,
  setTask2Answer,
  setTask3Answer,
  handleLogin,
  handleRegisterDataSubmit,
  handleTask1Submit,
  handleTask2Submit,
  handleTask3Submit,
  handleFinalRegistration,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md bg-[#0f0f1a] border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl">
      {modalState === 'login' && (
        <>
          <DialogHeader>
            <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              ВХОД В СИСТЕМУ
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Введите свои данные для доступа к терминалу
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@cybernet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            >
              ВОЙТИ
            </Button>
            <p className="text-center text-cyan-200">
              Если нет аккаунта, то{' '}
              <button
                type="button"
                onClick={() => setModalState('register')}
                className="text-cyan-300 hover:text-cyan-200 underline"
              >
                зарегистрируйтесь
              </button>
            </p>
          </form>
        </>
      )}

      {modalState === 'register' && registrationStep === 0 && (
        <>
          <DialogHeader>
            <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              РЕГИСТРАЦИЯ
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Создайте новый аккаунт для доступа к системе
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterDataSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="user@cybernet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Пароль</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="p-3 border border-cyan-400/30 rounded bg-[#0a0a0f]/50 text-cyan-200 text-sm">
              ⚠️ После ввода данных вам необходимо будет выполнить 3 задания для завершения регистрации
            </div>
            <Button
              type="submit"
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            >
              ПРОДОЛЖИТЬ
            </Button>
            <p className="text-center text-cyan-200">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => setModalState('login')}
                className="text-cyan-300 hover:text-cyan-200 underline"
              >
                Войти
              </button>
            </p>
          </form>
        </>
      )}

      {modalState === 'register' && registrationStep === 1 && (
        <>
          <DialogHeader>
            <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              ЗАДАНИЕ 1
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Пройдите верификацию для завершения регистрации
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTask1Submit} className="space-y-6 mt-4">
            <div className="border-2 border-cyan-400 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(0,255,255,0.4)]">
              <div className="bg-gradient-to-r from-cyan-400 to-cyan-300 px-4 py-3 flex items-center justify-between text-black">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                  <span className="uppercase tracking-wider">Задание 1 из 3</span>
                </div>
                <span className="text-xs">ID: #TSK-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="bg-[#0a0a0f]/80 p-4 border-b border-cyan-400/30 text-cyan-200 text-sm">
                Подтвердите согласие с условиями использования системы. Отметьте все пункты.
              </div>
              <div className="bg-[#0a0a0f]/80 p-4 space-y-4">
                {[
                  { key: 'question1', label: 'Я согласен с условиями использования сервиса' },
                  { key: 'question2', label: 'Я подтверждаю, что мне больше 18 лет' },
                  { key: 'question3', label: 'Я хочу получать новости и обновления на email' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-start space-x-3 cursor-pointer text-cyan-200">
                    <Checkbox
                      id={key}
                      checked={task1Answers[key]}
                      onCheckedChange={(checked) =>
                        setTask1Answers((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                    <span className="leading-relaxed">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-cyan-200 text-sm">
              <div className="h-1 flex-1 bg-[#0a0a0f] rounded-full overflow-hidden border border-cyan-400/30">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                  style={{
                    width: `${
                      (Object.values(task1Answers).filter(Boolean).length / 3) * 100
                    }%`,
                  }}
                />
              </div>
              <span>{Object.values(task1Answers).filter(Boolean).length}/3</span>
            </div>

            <Button
              type="submit"
              disabled={!isTask1AllChecked}
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] disabled:opacity-50"
            >
              ПРОДОЛЖИТЬ
            </Button>
          </form>
        </>
      )}

      {modalState === 'register' && registrationStep === 2 && (
        <>
          <DialogHeader>
            <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              ЗАДАНИЕ 2
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Выберите область применения системы
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTask2Submit} className="space-y-6 mt-4">
            <div className="border-2 border-cyan-400 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(0,255,255,0.4)]">
              <div className="bg-gradient-to-r from-cyan-400 to-cyan-300 px-4 py-3 flex items-center justify-between text-black">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                  <span className="uppercase tracking-wider">Задание 2 из 3</span>
                </div>
                <span className="text-xs">ID: #TSK-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="bg-[#0a0a0f]/80 p-4 border-b border-cyan-400/30 text-cyan-200 text-sm">
                Выберите область применения системы. Это поможет настроить интерфейс под ваши задачи.
              </div>
              <div className="bg-[#0a0a0f]/80 p-4">
                <Label className="text-sm mb-2 block">ВАШ ОТВЕТ:</Label>
                <Input
                  id="task2-answer"
                  placeholder="Введите вашу область применения..."
                  value={task2Answer}
                  onChange={(e) => setTask2Answer(e.target.value)}
                  required
                />
                <div className="mt-2 text-right text-cyan-200 text-xs">
                  {task2Answer.length} символов (минимум 10)
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={task2Answer.trim().length < 10}
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] disabled:opacity-50"
            >
              ПРОДОЛЖИТЬ
            </Button>
          </form>
        </>
      )}

      {modalState === 'register' && registrationStep === 3 && (
        <>
          <DialogHeader>
            <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              ЗАДАНИЕ 3
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Введите развернутый ответ для завершения
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTask3Submit} className="space-y-6 mt-4">
            <div className="border-2 border-cyan-400 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(0,255,255,0.4)]">
              <div className="bg-gradient-to-r from-cyan-400 to-cyan-300 px-4 py-3 flex items-center justify-between text-black">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                  <span className="uppercase tracking-wider">Задание 3 из 3</span>
                </div>
                <span className="text-xs">ID: #TSK-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="bg-[#0a0a0f]/80 p-4 border-b border-cyan-400/30 text-cyan-200 text-sm">
                Опишите причину, по которой вы хотите получить доступ к системе. Минимум 50 символов.
              </div>
              <div className="bg-[#0a0a0f]/80 p-4">
                <Label className="text-sm mb-2 block">ВАШ ОТВЕТ:</Label>
                <Textarea
                  id="task3-answer"
                  placeholder="Введите ваш ответ здесь..."
                  value={task3Answer}
                  onChange={(e) => setTask3Answer(e.target.value)}
                  required
                  rows={6}
                />
                <div className="mt-2 text-right text-cyan-200 text-xs">
                  {task3Answer.length} символов
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={task3Answer.trim().length < 50}
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] disabled:opacity-50"
            >
              ПРОДОЛЖИТЬ
            </Button>
          </form>
        </>
      )}

      {modalState === 'register' && registrationStep === 4 && (
        <>
          <DialogHeader>
            <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              РЕГИСТРАЦИЯ ЗАВЕРШЕНА
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Все задания успешно выполнены
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="p-6 border-2 border-green-500 rounded-lg bg-gradient-to-br from-green-500/20 to-green-400/10 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <div className="text-center space-y-4">
                <div className="text-6xl">✓</div>
                <p className="text-green-400">ВСЕ ЗАДАНИЯ ВЫПОЛНЕНЫ УСПЕШНО</p>
                <p className="text-cyan-200 text-sm">Email: {email}</p>
              </div>
            </div>
            <Button
              onClick={handleFinalRegistration}
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            >
              ЗАВЕРШИТЬ РЕГИСТРАЦИЮ
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  modalState: PropTypes.oneOf(['login', 'register']).isRequired,
  setModalState: PropTypes.func.isRequired,
  registrationStep: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  confirmPassword: PropTypes.string.isRequired,
  task1Answers: PropTypes.object.isRequired,
  task2Answer: PropTypes.string.isRequired,
  task3Answer: PropTypes.string.isRequired,
  isTask1AllChecked: PropTypes.bool.isRequired,
  setEmail: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  setConfirmPassword: PropTypes.func.isRequired,
  setTask1Answers: PropTypes.func.isRequired,
  setTask2Answer: PropTypes.func.isRequired,
  setTask3Answer: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleRegisterDataSubmit: PropTypes.func.isRequired,
  handleTask1Submit: PropTypes.func.isRequired,
  handleTask2Submit: PropTypes.func.isRequired,
  handleTask3Submit: PropTypes.func.isRequired,
  handleFinalRegistration: PropTypes.func.isRequired,
};

export default AuthModal;

