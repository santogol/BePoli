import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function EditProfile() {
  const { user, login } = useAuth()
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [msg, setMsg] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    const updated = await api.updateMe(user.token, { bio, avatar })
    // aggiorna il contesto auth se il backend ritorna i dati utente
    login({ ...user, ...updated })
    setMsg('Profilo aggiornato!')
  }

  return (
    <div className="form-card">
      <h1>Modifica profilo</h1>
      <form onSubmit={save}>
        <label>Bio</label>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} />
        <label>Avatar (URL)</label>
        <input value={avatar} onChange={e=>setAvatar(e.target.value)} />
        <button>Salva</button>
      </form>
      {msg && <div className="ok">{msg}</div>}
    </div>
  )
}
