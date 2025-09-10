import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api'
import PhotoGrid from '../components/PhotoGrid.jsx'

export default function Profile() {
  const { id: routeId } = useParams()
  const { user } = useAuth()
  const userId = routeId || user?._id
  const [info, setInfo] = useState(null)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!userId) return
    let alive = true
    ;(async () => {
      const [u, p] = await Promise.all([
        api.userPublic(userId),
        api.userPosts(userId)
      ])
      if (!alive) return
      setInfo(u); setPosts(p)
    })()
    return () => { alive = false }
  }, [userId])

  if (!info) return <p>Caricamento…</p>

  return (
    <div className="container">
      <section className="profile-header">
        <img className="avatar" src={api.userPhotoUrl(info._id)} alt="" onError={(e)=>{ e.currentTarget.style.visibility='hidden' }}/>
        <div>
          <h2>{info.username}</h2>
          <p>{info.bio}</p>
          <small>Followers: {info.followersCount} — Following: {info.followingCount}</small>
        </div>
      </section>
      <PhotoGrid photos={posts} />
    </div>
  )
}
