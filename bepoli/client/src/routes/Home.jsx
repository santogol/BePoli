import { useEffect, useState } from 'react'
import CreatePost from '../components/CreatePost.jsx'
import PostCard from '../components/PostCard.jsx'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocationCtx } from '../context/LocationContext.jsx'

export default function Home() {
  const { user } = useAuth()
  const { coords, zoneName, error } = useLocationCtx()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.feed(user.token)
      setPosts(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <section className="geo-banner">
        {error && <span className="warn">{error}</span>}
        {coords && <span>Lat {coords.latitude.toFixed(5)}, Lng {coords.longitude.toFixed(5)} — {zoneName}</span>}
      </section>

      <CreatePost onCreated={load} />

      {loading ? <p>Caricamento…</p> : posts.map(p =>
        <PostCard key={p._id} post={p} onChange={load}/>
      )}
    </div>
  )
}
