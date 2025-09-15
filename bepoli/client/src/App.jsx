import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from './routes/ProtectedRoutes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Rotte pubbliche */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotte protette */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Redirect vecchio /home → / */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

