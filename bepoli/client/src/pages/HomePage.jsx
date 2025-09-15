import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="page">
      <h2>Ciao, {user.nome || user.username} 👋</h2>
      <p>Home minimale. Da qui poi inseriamo feed, post, ecc.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
