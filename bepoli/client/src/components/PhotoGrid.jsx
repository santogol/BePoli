import { useState } from 'react'

export default function PhotoGrid({ photos = [] }) {
  const [active, setActive] = useState(null) // { src, text, _id, ... }

  return (
    <>
      <div className="photo-grid">
        {photos.map(p => (
          <button key={p._id} className="photo-tile" onClick={() => setActive(p)}>
            <img src={p.image} alt="" loading="lazy"/>
          </button>
        ))}
      </div>

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <div className="lightbox-content" onClick={e=>e.stopPropagation()}>
            <img src={active.image} alt=""/>
            {active.text && <p>{active.text}</p>}
          </div>
        </div>
      )}
    </>
  )
}
