import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type, text }

  // se hai già la sessione valida, vai in Home
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/user', { withCredentials: true });
        if (mounted && data?._id) {
          navigate('/', { replace: true });
        }
      } catch {
        // 401 è normale se non loggato: ignora
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.username || !form.password) {
      setMsg({ type: 'error', text: 'Inserisci username e password.' });
      return;
    }
    setLoading(true);
    try {
      await ensureCsrf();
      await api.post('/login', {
        username: form.username.trim(),
        password: form.password,
      });

      setMsg({ type: 'success', text: 'Login ok. Ti sto portando alla Home…' });
      navigate('/', { replace: true });
    } catch (err) {
      const text = err?.response?.data?.message || 'Username o password errati.';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h1>BePoli — Login</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        <label>
          Username
          <input name="username" value={form.username} onChange={onChange} autoComplete="username" />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={onChange} autoComplete="current-password" />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Accesso…' : 'Accedi'}
        </button>
      </form>

      {msg && (
        <p style={{ color: msg.type === 'error' ? 'crimson' : 'green', marginTop: 12 }}>
          {msg.text}
        </p>
      )}

      <p style={{ marginTop: 16 }}>
        Non hai un account? <Link to="/register">Registrati</Link>
      </p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 420, margin: '40px auto', padding: 16 },
  form: { display: 'grid', gap: 12 },
};
