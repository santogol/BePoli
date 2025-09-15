import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading iniziale

  // tenta di leggere /api/user al mount per ripristinare la sessione
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/api/user');
        if (alive) setUser(data);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login = async (username, password) => {
    await api.post('/login', { username, password });
    const { data } = await api.get('/api/user');
    setUser(data);
  };

  const register = async ({ nome, username, password }) => {
    await api.post('/register', { nome, username, password });
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
