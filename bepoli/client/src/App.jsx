import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from './routes/ProtectedRoutes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Pubbliche */}
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />

      {/* Protette */}
      <Route element={<ProtectedRoutes/>}>
        <Route path="/" element={<HomePage/>} />
      </Route>

      {/* Back-compat */}
      <Route path="/home" element={<Navigate to="/" replace/>} />

      {/* 404 */}
      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
}

