import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import api from './services/api';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
<<<<<<< HEAD
  const [abaAtiva, setAbaAtiva] = useState('dashboard'); // 'dashboard' ou 'tarefas'
=======
  const [verificandoSessao, setVerificandoSessao] = useState(true);
>>>>>>> f97ed626d67d653de6321eea92f8df33a11b295f

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
  };

<<<<<<< HEAD
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
=======
  if (verificandoSessao) {
    return <p style={{ padding: '20px' }}>Verificando sessão...</p>;
  }

  return (
    <div>
      {!usuarioLogado ? (
        <Login onLoginSucesso={handleLoginSucesso} />
      ) : (
        <div>
          <header style={styles.header}>
            <span>Usuário: <strong>{usuarioLogado.nome}</strong></span>
            <button onClick={handleLogout} style={styles.botaoSair}>Sair</button>
          </header>

          <main style={styles.conteudo}>
            <Dashboard />
            <hr style={{ margin: '30px 0' }} />
            <GerenciadorTarefas />
          </main>
>>>>>>> f97ed626d67d653de6321eea92f8df33a11b295f
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