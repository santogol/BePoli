import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // prova a riprendere sessione dal server
  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null))
  }, [])

  const login = (u) => setUser(u)
  const logout = async () => { await api.logout(); setUser(null) }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

