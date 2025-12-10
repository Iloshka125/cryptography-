import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EnigmaPage from './pages/EnigmaPage.jsx';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const onTransitionEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={transitionStage === 'fadeOut' ? 'page-fade-out' : 'page-fade-in'}
      onAnimationEnd={onTransitionEnd}
    >
      <Routes location={displayLocation}>
        {children}
      </Routes>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route index element={<Navigate to="/enigma" replace />} />
    <Route path="/enigma" element={<EnigmaPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="*" element={<Navigate to="/enigma" replace />} />
  </Routes>
);

const App = () => {
  return (
    <div className="app-shell">
      <PageTransition>
        <AppRoutes />
      </PageTransition>
    </div>
  );
};

export default App;

