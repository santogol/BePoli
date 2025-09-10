import { useEffect, useRef, useState } from 'react'

// mappa come nel tuo progetto: bbox o poligoni -> nome zona
const ZONES = [
  { name: 'Aula Magna', bbox: { minLat: 41.108, maxLat: 41.109, minLng: 16.878, maxLng: 16.879 } },
  { name: 'Cortile', bbox: { minLat: 41.1075, maxLat: 41.1082, minLng: 16.8782, maxLng: 16.8790 } },
  // ...altre
]

function inBox({ latitude, longitude }, box) {
  return latitude >= box.minLat && latitude <= box.maxLat &&
         longitude >= box.minLng && longitude <= box.maxLng
}

function resolveZone(c) {
  if (!c) return null
  const z = ZONES.find(z => inBox(c, z.bbox))
  return z ? z.name : 'Fuori dalle zone'
}

export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)
  const [zoneName, setZoneName] = useState(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalizzazione non supportata')
      return
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const c = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }
        setCoords(c)
        setZoneName(resolveZone(c))
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  return { coords, zoneName, error }
}
