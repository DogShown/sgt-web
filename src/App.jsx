import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem('sgt_token'));

  const handleLogout = () => {
    localStorage.removeItem('sgt_token');
    localStorage.removeItem('sgt_user');
    setLogado(false);
  };

  return (
    <div>
      {logado ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSucesso={() => setLogado(true)} />
      )}
    </div>
  );
}