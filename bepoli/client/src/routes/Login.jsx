import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  useEffect(() => { /* pre-carica CSRF */ api.authToken().catch(()=>{}) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await api.login(username, password)
      const me = await api.me()
      login(me)
      nav('/')
    } catch (ex) { setErr(ex.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="form-card">
      <h1>Accedi</h1>
      <form onSubmit={submit}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={busy}>Entra</button>
        {err && <div className="error">{err}</div>}
      </form>
      {/* Placeholder Google login: servirà integrazione SDK client o flusso popup */}
      {/* <button onClick={handleGoogle}>Accedi con Google</button> */}
    </div>
  )
}
