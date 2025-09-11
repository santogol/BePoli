// bepoli/client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { api } from '../api';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await api.post('/register', { nome, username, password });
      setMsg('Registrazione completata. Ora puoi accedere.');
      setTimeout(() => { window.location.href = '/login'; }, 800);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Errore registrazione');
    }
  };

  return (
    <div style={styles.wrap}>
      <h1>Registrati</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        <input style={styles.input} value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Nome" />
        <input style={styles.input} value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username" />
        <input style={styles.input} value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Password" />
        <button style={styles.btn}>Crea</button>
      </form>
      {msg && <p style={{ color: 'seagreen' }}>{msg}</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      <p style={{marginTop: 10}}>
        Hai già un account? <a href="/login">Accedi</a>
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
