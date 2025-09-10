import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './routes/Home.jsx'
import Login from './routes/Login.jsx'
import Profile from './routes/Profile.jsx'
import EditProfile from './routes/EditProfile.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Header />
        <Routes>
          <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile/></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><EditProfile/></PrivateRoute>} />
        </Routes>
      </LocationProvider>
    </AuthProvider>
  )
}
