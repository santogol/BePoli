import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'

export default function EditProfile() {
  const { user, login } = useAuth()
  const [bio, setBio] = useState(user?.bio || '')
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!user) return
    setBio(user.bio || '')
  }, [user])

  const save = async (e) => {
    e.preventDefault()
    setErr(null); setMsg(null)
    try {
      await api.updateProfile({ bio, file })
      const me = await api.me()
      login(me)
      setMsg('Profilo aggiornato!')
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <div className="form-card">
      <h1>Modifica profilo</h1>
      <form onSubmit={save}>
        <label>Bio</label>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} />
        <label>Foto profilo</label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button>Salva</button>
      </form>
      {msg && <div className="ok">{msg}</div>}
      {err && <div className="error">{err}</div>}
    </div>
  )
}
