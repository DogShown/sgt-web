import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import api from './services/api';

function ThemeToggle({ tema, onToggle, className = '' }) {
  const escuro = tema === 'escuro';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={onToggle}
      aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">{escuro ? '☀' : '☾'}</span>
      <span className="theme-toggle-label">{escuro ? 'Claro' : 'Escuro'}</span>
    </button>
  );
}

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaPublica, setTelaPublica] = useState('home');
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [tema, setTema] = useState(() => localStorage.getItem('sgt_theme') || 'claro');

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem('sgt_theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((temaAtual) => temaAtual === 'escuro' ? 'claro' : 'escuro');
  };

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
          id: usuario.id, nome: usuario.nome, email: usuario.email, turma: usuario.turma
        }));
        setUsuarioLogado(usuario);
      } catch {
        localStorage.removeItem('sgt_token');
        localStorage.removeItem('sgt_user');
      } finally {
        setVerificandoSessao(false);
      }
    };

    verificarSessao();
  }, []);

  const handleLoginSucesso = () => {
    const user = localStorage.getItem('sgt_user');
    if (user) setUsuarioLogado(JSON.parse(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('sgt_token');
    localStorage.removeItem('sgt_user');
    setUsuarioLogado(null);
    setAbaAtiva('dashboard');
    setTelaPublica('home');
  };

  if (verificandoSessao) {
    return (
      <div className="session-loading">
        <div className="session-loader-card" role="status" aria-live="polite">
          <div className="session-loader-logo">✓</div>
          <strong>SGT</strong>
          <span>Preparando seu espaço...</span>
          <div className="session-loader-dots" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </div>
    );
  }

  const screenKey = usuarioLogado
    ? `private-${abaAtiva}`
    : `public-${telaPublica}`;

  if (!usuarioLogado) {
    return (
      <div className="screen-transition" key={screenKey}>
        <ThemeToggle className="theme-toggle-public" tema={tema} onToggle={alternarTema} />

        {telaPublica === 'login' && (
          <Login
            onLoginSucesso={handleLoginSucesso}
            onCadastro={() => setTelaPublica('cadastro')}
            onVoltarHome={() => setTelaPublica('home')}
          />
        )}

        {telaPublica === 'cadastro' && (
          <Cadastro
            onVoltarLogin={() => setTelaPublica('login')}
            onCadastroSucesso={() => setTelaPublica('login')}
          />
        )}

        {telaPublica === 'home' && (
          <Home
            onLogin={() => setTelaPublica('login')}
            onCadastro={() => setTelaPublica('cadastro')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="screen-transition" key={screenKey}>
      <div className="app-container">
        <aside className="sidebar">
          <div>
            <div className="sidebar-header"><h2>SGT</h2></div>
            <ul className="sidebar-menu">
              <li className={abaAtiva === 'dashboard' ? 'active' : ''}>
                <button type="button" onClick={() => setAbaAtiva('dashboard')}>Dashboard</button>
              </li>
              <li className={abaAtiva === 'tarefas' ? 'active' : ''}>
                <button type="button" onClick={() => setAbaAtiva('tarefas')}>Gerenciador de Tarefas</button>
              </li>
            </ul>
          </div>

          <div className="sidebar-user">
            <p>Usuário: <strong>{usuarioLogado.nome || 'Usuário'}</strong></p>
            <ThemeToggle tema={tema} onToggle={alternarTema} />
            <button onClick={handleLogout} className="logout-button">Sair</button>
          </div>
        </aside>

        <main className="main-content">
          {abaAtiva === 'dashboard'
            ? <Dashboard />
            : <GerenciadorTarefas onLogout={handleLogout} />}
        </main>
      </div>
    </div>
  );
}
