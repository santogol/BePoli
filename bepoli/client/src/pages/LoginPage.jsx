import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(form.username.trim(), form.password);
      nav('/', { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.message || 'Errore login');
    }
  };

  return (
    <div className="auth-wrap">
      <h1>BePoli — Login</h1>
      <form onSubmit={onSubmit} className="auth-form">
        <input name="username" placeholder="Username" value={form.username} onChange={onChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />
        <button type="submit">Entra</button>
        {err && <p className="error">{err}</p>}
      </form>
      <p>Non hai un account? <Link to="/register">Registrati</Link></p>
    </div>
  );
}
