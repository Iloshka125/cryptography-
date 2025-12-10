import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EnigmaPage from './pages/EnigmaPage.jsx';

const App = () => (
  <div className="app-shell">
    <Routes>
      <Route index element={<Navigate to="/enigma" replace />} />
      <Route path="/enigma" element={<EnigmaPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/enigma" replace />} />
    </Routes>
  </div>
);

export default App;

