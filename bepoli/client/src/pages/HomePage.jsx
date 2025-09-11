// bepoli/client/src/pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div style={{maxWidth: 600, margin: '40px auto', fontFamily:'system-ui, sans-serif'}}>
      <h1>Ciao {user?.nome}</h1>
      <p>Se vedi questa pagina, sei autenticato. Qui metteremo il feed.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
