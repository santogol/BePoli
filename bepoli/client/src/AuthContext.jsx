// bepoli/client/src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext({ user: null, refresh: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const refresh = async () => {
    try {
      const { data } = await api.get('/api/user');
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    try { await api.post('/logout'); } finally { setUser(null); }
  };

  useEffect(() => { refresh(); }, []);

  return <Ctx.Provider value={{ user, refresh, logout }}>{children}</Ctx.Provider>;
}

export function ProtectedRoute({ children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback ?? null;
  return children;
}
