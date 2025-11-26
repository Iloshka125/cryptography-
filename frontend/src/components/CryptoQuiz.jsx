import { useState } from 'react';
import AuthCard from './AuthCard.jsx';
import FormInput from './FormInput.jsx';

const questions = [
  {
    id: 1,
    type: 'multiple-choice',
    question: 'Что такое симметричное шифрование?',
    description: 'Выберите правильное определение симметричного шифрования.',
    options: [
      'Метод шифрования, при котором используется один и тот же ключ для шифрования и расшифровки',
      'Метод шифрования, при котором используются разные ключи для шифрования и расшифровки',
      'Метод шифрования, который не требует ключей',
      'Метод шифрования, основанный только на математических операциях'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'Что такое криптографический хеш?',
    description: 'Выберите наиболее точное определение криптографического хеша.',
    options: [
      'Обратимая функция, которая преобразует данные в фиксированную длину',
      'Односторонняя функция, которая преобразует данные произвольной длины в строку фиксированной длины',
      'Метод шифрования данных с использованием ключа',
      'Алгоритм для генерации случайных чисел'
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    type: 'text-input',
    question: 'Расшифруйте шифр Цезаря',
    description: 'Зашифрованный текст: "HQLJPD". Используйте сдвиг на 3 позиции назад в алфавите. Введите расшифрованное слово.',
    correctAnswer: 'ENIGMA',
    hint: 'Шифр Цезаря со сдвигом +3 означает, что каждая буква сдвинута на 3 позиции вперед. Для расшифровки нужно сдвинуть на 3 позиции назад.'
  }
];

const CryptoQuiz = ({ userData, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleNext = () => {
    setError(null);

    if (question.type === 'multiple-choice') {
      if (selectedAnswer === null) {
        setError('Пожалуйста, выберите ответ');
        return;
      }
      if (selectedAnswer !== question.correctAnswer) {
        setError('Неверный ответ. Попробуйте еще раз.');
        return;
      }
    } else if (question.type === 'text-input') {
      if (!textAnswer.trim()) {
        setError('Пожалуйста, введите ответ');
        return;
      }
      if (textAnswer.trim().toUpperCase() !== question.correctAnswer) {
        setError('Неверный ответ. Попробуйте еще раз.');
        return;
      }
    }

    if (isLastQuestion) {
      handleRegister();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setError(null);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await onComplete(userData);
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации');
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={`Задание №${currentQuestion + 1}`}
      subtitle={question.description}
    >
      <div className="quiz-container">
        <div className="quiz-question">
          <h3 className="quiz-question__text">{question.question}</h3>
        </div>

        {question.type === 'multiple-choice' && (
          <div className="quiz-options">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`quiz-option ${selectedAnswer === index ? 'quiz-option--selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={selectedAnswer === index}
                  onChange={() => {
                    setSelectedAnswer(index);
                    setError(null);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'text-input' && (
          <div className="quiz-text-input">
            <FormInput
              label="Введите расшифрованное слово"
              name="textAnswer"
              value={textAnswer}
              placeholder="Введите ответ"
              onChange={(e) => {
                setTextAnswer(e.target.value.toUpperCase());
                setError(null);
              }}
              error={null}
              autoComplete="off"
            />
            <p className="quiz-hint">{question.hint}</p>
          </div>
        )}

        {error && (
          <p className="status-message status-message--error">{error}</p>
        )}

        <div className="quiz-actions">
          <button
            type="button"
            className="quiz-button quiz-button--secondary"
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
                setSelectedAnswer(null);
                setTextAnswer('');
                setError(null);
              } else {
                onBack();
              }
            }}
            disabled={loading}
          >
            {currentQuestion > 0 ? 'Назад' : 'Вернуться к форме'}
          </button>
          <button
            type="button"
            className="submit-button"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? 'Отправляю...' : isLastQuestion ? 'Зарегистрироваться' : 'Далее'}
          </button>
        </div>
      </div>
    </AuthCard>
  );
};

export default CryptoQuiz;