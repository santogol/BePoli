import { useEffect, useState } from 'react'
import { useLocationCtx } from '../context/LocationContext.jsx'
import { api } from '../services/api'
import CreatePost from '../components/CreatePost.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Home() {
  const { zoneName, coords, error } = useLocationCtx()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.feed(zoneName)
      setPosts(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [zoneName])

  return (
    <div className="container">
      <section className="geo-banner">
        {error && <span className="warn">{error}</span>}
        {coords && <span>Lat {coords.latitude.toFixed(5)}, Lng {coords.longitude.toFixed(5)} — {zoneName}</span>}
      </section>
      <CreatePost onCreated={load} />
      {loading ? <p>Caricamento…</p> : posts.map(p => (
        <PostCard key={p._id} post={p} onChange={load}/>
      ))}
    </div>
  )
}
