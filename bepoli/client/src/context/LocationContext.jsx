import { createContext, useContext } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'

const Ctx = createContext(null)
export const useLocationCtx = () => useContext(Ctx)

export function LocationProvider({ children }) {
  const geo = useGeolocation()
  return <Ctx.Provider value={geo}>{children}</Ctx.Provider>
}

