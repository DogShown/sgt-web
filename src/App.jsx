import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('dashboard'); // 'dashboard' ou 'tarefas'

  // Verifica se o usuário já fez login previamente
  useEffect(() => {
    const user = localStorage.getItem('sgt_user');
    if (user) {
      setUsuarioLogado(JSON.parse(user));
    }
  }, []);

  const handleLoginSucesso = () => {
    const user = localStorage.getItem('sgt_user');
    if (user) {
      setUsuarioLogado(JSON.parse(user));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sgt_token');
    localStorage.removeItem('sgt_user');
    setUsuarioLogado(null);
  };

  // Se não estiver logado, exibe apenas a tela de Login
  if (!usuarioLogado) {
    return <Login onLoginSucesso={handleLoginSucesso} />;
  }

  // Se estiver logado, exibe o layout completo com Sidebar e Conteúdo
  return (
    <div className="app-container">
      {/* Barra Lateral (Sidebar) */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <h2>SGT</h2>
          </div>

          <ul className="sidebar-menu">
            <li className={abaAtiva === 'dashboard' ? 'active' : ''}>
              <a 
                href="#dashboard" 
                onClick={(e) => { e.preventDefault(); setAbaAtiva('dashboard'); }}
              >
                Dashboard
              </a>
            </li>
            <li className={abaAtiva === 'tarefas' ? 'active' : ''}>
              <a 
                href="#tarefas" 
                onClick={(e) => { e.preventDefault(); setAbaAtiva('tarefas'); }}
              >
                Gerenciador de Tarefas
              </a>
            </li>
          </ul>
        </div>

        {/* Informações do Utilizador e Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', marginBottom: '8px' }}>
            Usuário: <strong style={{ color: '#fff' }}>{usuarioLogado.nome || 'Utilizador'}</strong>
          </p>
          <button 
            onClick={handleLogout} 
            className="btn-primary" 
            style={{ backgroundColor: 'var(--accent-red)', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal Alternável */}
      <main className="main-content">
        {/* Substitua apenas esta parte onde exibe a aba ativa: */}
{abaAtiva === 'dashboard' ? (
  <Dashboard onLogout={handleLogout} />
) : (
  <GerenciadorTarefas onLogout={handleLogout} />
)}
      </main>
    </div>
  );
}