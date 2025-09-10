import { useState } from 'react'

export default function PhotoGrid({ photos=[] }) {
  const [active, setActive] = useState(null)
  return (
    <>
      <div className="photo-grid">
        {photos.map(p => (
          <button key={p._id} className="tile" onClick={() => setActive(p)}>
            {p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy" /> : <div className="noimg"/>}
          </button>
        ))}
      </div>
      {active && (
        <div className="lightbox" onClick={()=>setActive(null)}>
          <div className="content" onClick={e=>e.stopPropagation()}>
            {active.imageUrl && <img src={active.imageUrl} alt="" />}
            {active.desc && <p>{active.desc}</p>}
          </div>
        </div>
      )}
    </>
  )
}


