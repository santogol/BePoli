import { useState } from 'react'
import { useLocationCtx } from '../context/LocationContext.jsx'
import { api } from '../services/api'

export default function CreatePost({ onCreated }) {
  const { zoneName } = useLocationCtx()
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await api.createPost({ desc, imageFile:file, location: zoneName })
      setDesc(''); setFile(null)
      onCreated?.()
    } catch (ex) { setErr(ex.message) }
    finally { setBusy(false) }
  }

  return (
    <form className="create-post" onSubmit={submit}>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Scrivi qualcosa..."/>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
      <button disabled={busy}>{busy ? 'Pubblico...' : 'Pubblica'}</button>
      {err && <div className="error">{err}</div>}
    </form>
  )
}
