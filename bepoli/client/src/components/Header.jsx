import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocationCtx } from '../context/LocationContext.jsx'

export default function Header() {
  const { user, logout } = useAuth()
  const { zoneName } = useLocationCtx()
  const nav = useNavigate()

  return (
    <header className="header">
      <div className="logo">BePoli</div>
      <nav className="nav">
        {user && <>
          <Link to="/">Home</Link>
          <Link to={`/profile/${user._id}`}>Profilo</Link>
          <Link to="/profile/edit">Modifica</Link>
          <button onClick={() => { logout(); nav('/login') }}>Esci</button>
        </>}
        {!user && <Link to="/login">Accedi</Link>}
      </nav>
      {zoneName && <div className="zone-badge">{zoneName}</div>}
    </header>
  )
}
