import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocationCtx } from '../context/LocationContext.jsx'
import { api } from '../services/api.js'

export default function CreatePost({ onCreated }) {
  const { user } = useAuth()
  const { zoneName } = useLocationCtx()
  const [text, setText] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setErr(null)
    try {
      await api.createPost(user.token, { text, image: imageDataUrl, zone: zoneName })
      setText(''); setImageDataUrl(null)
      onCreated?.()
    } catch (ex) {
      setErr(ex.message)
    } finally { setLoading(false) }
  }

  return (
    <form className="create-post-section" onSubmit={submit}>
      <textarea placeholder="Scrivi qualcosa..." value={text} onChange={e=>setText(e.target.value)} />
      <input type="file" accept="image/*" onChange={handleImage}/>
      {imageDataUrl && <img src={imageDataUrl} alt="preview" style={{maxWidth: '100%'}}/>}
      <button disabled={loading}>{loading ? 'Pubblico...' : 'Pubblica'}</button>
      {err && <div className="error">{err}</div>}
    </form>
  )
}
