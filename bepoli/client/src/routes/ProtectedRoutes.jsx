import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null; // puoi mettere uno spinner
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
