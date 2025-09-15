// client/src/routes/ProtectedRoutes.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoutes() {
  const { user, ready } = useAuth()

  if (!ready) return <div>Caricamento…</div>
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
