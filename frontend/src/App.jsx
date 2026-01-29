import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EnigmaPage from './pages/EnigmaPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import BattlePassPage from './pages/BattlePassPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import CompetitionsListPage from './pages/CompetitionsListPage.jsx';
import VersusPage from './pages/VersusPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LevelPage from './pages/LevelPage.jsx';
import CompetitionPage from './pages/CompetitionPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import HomePage from './pages/HomePage.jsx';

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
    return <Navigate to="/home" replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/enigma" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/enigma" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route index element={<Navigate to={isAuthenticated ? "/categories" : "/home"} replace />} />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute requireAuth={false}>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/enigma" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Navigate to="/categories" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/categories" 
        element={
          <ProtectedRoute requireAuth={true}>
            <CategoriesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/battle" 
        element={
          <ProtectedRoute requireAuth={true}>
            <BattlePassPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute requireAuth={true}>
            <LeaderboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/competitions" 
        element={
          <ProtectedRoute requireAuth={true}>
            <CompetitionsListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/1vs1" 
        element={
          <ProtectedRoute requireAuth={true}>
            <VersusPage />
          </ProtectedRoute>
        } 
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
        path="/competition/:competitionId" 
        element={
          <ProtectedRoute requireAuth={true}>
            <CompetitionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? "/categories" : "/home"} 
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

