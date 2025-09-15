// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

// Default non nullo
const defaultAuth = {
  user: null,
  ready: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
}
const AuthCtx = createContext(defaultAuth)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    api.me()
      .then(u => { if (alive) setUser(u) })
      .catch(() => { if (alive) setUser(null) })
      .finally(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [])

  const login = async (username, password) => {
    await api.login(username, password)
    const me = await api.me()
    setUser(me)
  }

  const register = async (nome, username, password) => {
    await api.register(nome, username, password)
    const me = await api.me()
    setUser(me)
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)

