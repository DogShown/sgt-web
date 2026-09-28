import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import api from './services/api';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  useEffect(() => {
    const verificarSessao = async () => {
      const token = localStorage.getItem('sgt_token');

      if (!token) {
        setVerificandoSessao(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const usuario = response.data;

        localStorage.setItem('sgt_user', JSON.stringify({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          turma: usuario.turma
        }));

        setUsuarioLogado(usuario);
      } catch (error) {
        localStorage.removeItem('sgt_token');
        localStorage.removeItem('sgt_user');
        setUsuarioLogado(null);
      } finally {
        setVerificandoSessao(false);
      }
    };

    verificarSessao();
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
    setAbaAtiva('dashboard');
  };

  if (verificandoSessao) {
    return <p style={{ padding: '20px' }}>Verificando sessão...</p>;
  }

  if (!usuarioLogado) {
    return <Login onLoginSucesso={handleLoginSucesso} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <h2>SGT</h2>
          </div>

          <ul className="sidebar-menu">
            <li className={abaAtiva === 'dashboard' ? 'active' : ''}>
              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setAbaAtiva('dashboard');
                }}
              >
                Dashboard
              </a>
            </li>

            <li className={abaAtiva === 'tarefas' ? 'active' : ''}>
              <a
                href="#tarefas"
                onClick={(e) => {
                  e.preventDefault();
                  setAbaAtiva('tarefas');
                }}
              >
                Gerenciador de Tarefas
              </a>
            </li>
          </ul>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '16px'
          }}
        >
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--sidebar-text)',
              marginBottom: '8px'
            }}
          >
            Usuário:{' '}
            <strong style={{ color: '#fff' }}>
              {usuarioLogado.nome || 'Usuário'}
            </strong>
          </p>

          <button
            onClick={handleLogout}
            className="btn-primary"
            style={{
              backgroundColor: 'var(--accent-red)',
              padding: '8px 12px',
              fontSize: '0.85rem'
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        {abaAtiva === 'dashboard' ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <GerenciadorTarefas onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}
