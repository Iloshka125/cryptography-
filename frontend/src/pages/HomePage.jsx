import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/enigma/HeroSection.jsx';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Перенаправляем на страницу регистрации
    navigate('/register');
  };

  return (
    <div className="min-h-screen">
      <HeroSection onStart={handleStartGame} />
    </div>
  );
};

export default HomePage;

