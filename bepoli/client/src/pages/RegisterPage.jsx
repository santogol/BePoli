import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, ensureCsrf } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);     // { type: 'error'|'success', text: string }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.nome || !form.username || !form.password) {
      setMsg({ type: 'error', text: 'Compila tutti i campi.' });
      return;
    }
    setLoading(true);
    try {
      await ensureCsrf();
      await api.post('/register', {
        nome: form.nome.trim(),
        username: form.username.trim(),
        password: form.password,
      });

      // opzionale: auto-login subito dopo la registrazione
      await ensureCsrf();
      await api.post('/login', {
        username: form.username.trim(),
        password: form.password,
      });

      setMsg({ type: 'success', text: 'Registrazione riuscita! Ti sto portando alla Home…' });
      navigate('/', { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      const text =
        data?.message ||
        data?.error ||
        'Registrazione fallita. Riprova.';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h1>BePoli — Registrati</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        <label>
          Nome
          <input name="nome" value={form.nome} onChange={onChange} autoComplete="name" />
        </label>
        <label>
          Username
          <input name="username" value={form.username} onChange={onChange} autoComplete="username" />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={onChange} autoComplete="new-password" />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Invio…' : 'Crea account'}
        </button>
      </form>

      {msg && (
        <p style={{ color: msg.type === 'error' ? 'crimson' : 'green', marginTop: 12 }}>
          {msg.text}
        </p>
      )}

      <p style={{ marginTop: 16 }}>
        Hai già un account? <Link to="/login">Accedi</Link>
      </p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 420, margin: '40px auto', padding: 16 },
  form: { display: 'grid', gap: 12 },
};
