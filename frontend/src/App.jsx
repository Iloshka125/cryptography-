import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EnigmaPage from './pages/EnigmaPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LevelPage from './pages/LevelPage.jsx';

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
      {children}
    </div>
  );
};

const ProtectedRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated } = useAuth();
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/enigma" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route index element={<Navigate to="/enigma" replace />} />
      <Route 
        path="/enigma" 
        element={<EnigmaPage />} 
      />
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <ProtectedRoute requireAuth={false}>
            <RegisterPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute requireAuth={true}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/level/:categoryId/:levelId" 
        element={
          <ProtectedRoute requireAuth={true}>
            <LevelPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? "/enigma" : "/login"} 
            replace 
          />
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app-shell">
          <PageTransition>
            <AppRoutes />
          </PageTransition>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;

