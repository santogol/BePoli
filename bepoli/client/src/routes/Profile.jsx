import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import PhotoGrid from '../components/PhotoGrid.jsx'

export default function Profile() {
  const { id: routeId } = useParams()
  const { user } = useAuth()
  const id = routeId || user._id
  const [info, setInfo] = useState(null)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [u, p] = await Promise.all([
        api.getUser(id, user.token),
        api.userPosts(id, user.token)
      ])
      if (!alive) return
      setInfo(u); setPosts(p)
    })()
    return () => { alive = false }
  }, [id, user.token])

  if (!info) return <p>Caricamento…</p>

  return (
    <div className="container">
      <section className="profile-header">
        <img className="avatar" src={info.avatar || '/avatar.png'} alt="avatar"/>
        <div>
          <h2>{info.username}</h2>
          <p>{info.bio}</p>
        </div>
      </section>
      <PhotoGrid photos={posts} />
    </div>
  )
}
