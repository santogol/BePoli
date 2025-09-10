import { createContext, useContext, useEffect, useState } from 'react'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { _id, username, token, ... }

  useEffect(() => {
    const raw = localStorage.getItem('auth')
    if (raw) setUser(JSON.parse(raw))
  }, [])

  const login = (authObj) => {
    setUser(authObj)
    localStorage.setItem('auth', JSON.stringify(authObj))
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth')
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
