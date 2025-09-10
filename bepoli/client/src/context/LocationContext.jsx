import { createContext, useContext, useEffect, useState } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'

const LocationCtx = createContext(null)
export const useLocationCtx = () => useContext(LocationCtx)

export function LocationProvider({ children }) {
  const { coords, zoneName, error } = useGeolocation()
  return (
    <LocationCtx.Provider value={{ coords, zoneName, error }}>
      {children}
    </LocationCtx.Provider>
  )
}
