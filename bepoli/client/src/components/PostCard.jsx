import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function PostCard({ post, onChange }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const like = async () => { setBusy(true); await api.likePost(post._id); setBusy(false); onChange?.() }
  const comment = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true); await api.commentPost(post._id, text.trim()); setText(''); setBusy(false); onChange?.()
  }

  return (
    <article className="post-card">
      <header>
        <Link to={`/profile/${post.userId._id}`} className="author">{post.userId.username}</Link>
        <span className="location">{post.location}</span>
      </header>
      {post.imageUrl && <img src={post.imageUrl} alt="" />}
      {post.desc && <p>{post.desc}</p>}
      <div className="actions">
        <button onClick={like} disabled={busy}>❤️ {post.likes}</button>
        <span>💬 {post.comments}</span>
      </div>
      <div className="comments">
        {(post.commentsData || []).slice(-3).map((c, i) => (
          <div key={i}><b>{c.userId?.username || 'utente'}:</b> {c.text}</div>
        ))}
        <form onSubmit={comment} className="comment-form">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Aggiungi un commento..."/>
          <button disabled={busy || !text.trim()}>Invia</button>
        </form>
      </div>
    </article>
  )
}
