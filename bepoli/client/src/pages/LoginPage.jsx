// bepoli/client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { refresh } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/login', { username, password });
      await refresh();
      // dopo il login, la Home mostrerà il feed (o quello che vuoi)
      window.location.href = '/';
    } catch (e) {
      setErr(e?.response?.data?.message || 'Errore login');
    }
  };

  return (
    <div style={styles.wrap}>
      <h1>Accedi</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        <input
          style={styles.input}
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          style={styles.input}
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <button style={styles.btn} type="submit">Entra</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      <p style={{marginTop: 10}}>
        Non hai un account? <a href="/register">Registrati</a>
      </p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 360, margin: '60px auto', fontFamily: 'system-ui, sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: 10, border: '1px solid #ccc', borderRadius: 6 },
  btn: { padding: 10, border: '1px solid #222', background: '#222', color: 'white', borderRadius: 6, cursor: 'pointer' }
};
