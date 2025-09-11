import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import SearchPage from './pages/SearchPage';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/" element={<ProtectedRoute><FeedPage/></ProtectedRoute>} />
        <Route path="/me" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
        <Route path="/u/:id" element={<ProtectedRoute><UserPage/></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage/></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
