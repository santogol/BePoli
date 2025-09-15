import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: '', username: '', password: '' });
  const [err, setErr] = useState('');
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(form);
      // login immediato
      await login(form.username.trim(), form.password);
      nav('/', { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.message || 'Errore registrazione');
    }
  };

  return (
    <div className="auth-wrap">
      <h1>Crea account</h1>
      <form onSubmit={onSubmit} className="auth-form">
        <input name="nome" placeholder="Nome" value={form.nome} onChange={onChange} />
        <input name="username" placeholder="Username" value={form.username} onChange={onChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />
        <button type="submit">Registrati</button>
        {err && <p className="error">{err}</p>}
      </form>
      <p>Hai già un account? <Link to="/login">Accedi</Link></p>
    </div>
  );
}
