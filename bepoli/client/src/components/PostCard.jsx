import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

export default function PostCard({ post, onChange }) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const like = async () => {
    setBusy(true)
    await api.likePost(user.token, post._id)
    onChange?.()
    setBusy(false)
  }

  const send = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setBusy(true)
    await api.commentPost(user.token, post._id, comment.trim())
    setComment('')
    onChange?.()
    setBusy(false)
  }

  return (
    <article className="post-card">
      <header className="post-header">
        <Link to={`/profile/${post.author._id}`} className="author">{post.author.username}</Link>
        <span className="zone">{post.zone}</span>
      </header>
      {post.image && <img className="post-image" src={post.image} alt="post"/>}
      <p className="post-text">{post.text}</p>

      <div className="actions">
        <button onClick={like} disabled={busy}>❤️ {post.likesCount || 0}</button>
      </div>

      <div className="comments">
        {(post.comments || []).map(c => (
          <div key={c._id} className="comment">
            <b>{c.author.username}:</b> {c.text}
          </div>
        ))}
        <form onSubmit={send} className="comment-form">
          <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Aggiungi un commento..."/>
          <button disabled={busy || !comment.trim()}>Invia</button>
        </form>
      </div>
    </article>
  )
}
