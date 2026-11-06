import { useEffect, useState } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import Notificacoes from './components/Notificacoes';
import Perfil from './components/Perfil';
import api from './services/api';
import logo from './assets/logo.jpg';

function NavIcon({ name }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="8" height="7" rx="1.5" /></>,
    tarefas: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M8 2v4M16 2v4M8 11h8M8 15h5" /></>,
    notificacoes: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    perfil: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

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
  const [abaAtiva, setAbaAtiva] = useState(() => (
    new URLSearchParams(window.location.search).get('tab') === 'notificacoes'
      ? 'notificacoes'
      : 'dashboard'
  ));
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [tema, setTema] = useState(() => localStorage.getItem('sgt_theme') || 'claro');
  const [mensagemSessao, setMensagemSessao] = useState('');

  useEffect(() => {
    const encerrarSessaoExpirada = () => {
      localStorage.removeItem('sgt_token');
      sessionStorage.removeItem('sgt_token');
      localStorage.removeItem('sgt_user');
      setUsuarioLogado(null);
      setTelaPublica('login');
      setMensagemSessao('Sua sessão expirou ou não é mais válida. Entre novamente para continuar.');
    };
    window.addEventListener('sgt:session-expired', encerrarSessaoExpirada);
    return () => window.removeEventListener('sgt:session-expired', encerrarSessaoExpirada);
  }, []);

  useEffect(() => {
    // A aba é lida da URL uma única vez; remove o parâmetro para não reaplicá-lo
    // em recargas futuras depois que a pessoa navegar para outra seção.
    const url = new URL(window.location.href);
    if (url.searchParams.has('tab')) {
      url.searchParams.delete('tab');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem('sgt_theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((temaAtual) => temaAtual === 'escuro' ? 'claro' : 'escuro');
  };

  useEffect(() => {
    const verificarSessao = async () => {
      const token = localStorage.getItem('sgt_token') || sessionStorage.getItem('sgt_token');
      if (!token) {
        setVerificandoSessao(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const usuario = response.data;
        const usuarioSalvo = JSON.parse(localStorage.getItem('sgt_user') || '{}');
        const usuarioCompleto = {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          turma: usuario.turma,
          avatarUrl: usuarioSalvo.avatarUrl || ''
        };
        localStorage.setItem('sgt_user', JSON.stringify(usuarioCompleto));
        setUsuarioLogado(usuarioCompleto);
      } catch {
        localStorage.removeItem('sgt_token');
        sessionStorage.removeItem('sgt_token');
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
    setMensagemSessao('');
  };

  const handleUsuarioAtualizado = (usuarioAtualizado) => {
    localStorage.setItem('sgt_user', JSON.stringify(usuarioAtualizado));
    setUsuarioLogado(usuarioAtualizado);
  };

  const handleLogout = () => {
    localStorage.removeItem('sgt_token');
    sessionStorage.removeItem('sgt_token');
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
        {telaPublica !== 'home' && (
          <ThemeToggle className="theme-toggle-public" tema={tema} onToggle={alternarTema} />
        )}

        {telaPublica === 'login' && (
          <Login
            onLoginSucesso={handleLoginSucesso}
            onCadastro={() => setTelaPublica('cadastro')}
            onVoltarHome={() => { setMensagemSessao(''); setTelaPublica('home'); }}
            mensagemInicial={mensagemSessao}
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
            themeToggle={<ThemeToggle className="landing-theme-toggle" tema={tema} onToggle={alternarTema} />}
          />
        )}
      </div>
    );
  }

  return (
    <div className="screen-transition" key={screenKey}>
      <div className="app-container">
        <aside className="sidebar" aria-label="Barra lateral do SGT">
          <div className="sidebar-main">
            <div className="sidebar-brand">
              <img src={logo} alt="" className="sidebar-brand-logo" />
              <span className="sidebar-brand-copy">
                <strong>SGT</strong>
                <small>Organize sua rotina</small>
              </span>
            </div>

            <div className="sidebar-nav-label">MENU PRINCIPAL</div>
            <nav aria-label="Navegação principal">
              <ul className="sidebar-menu">
                <li className={abaAtiva === 'dashboard' ? 'active' : ''}>
                  <button type="button" className="sidebar-link" aria-current={abaAtiva === 'dashboard' ? 'page' : undefined} onClick={() => setAbaAtiva('dashboard')}>
                    <span className="sidebar-link-icon"><NavIcon name="dashboard" /></span><span>Dashboard</span>
                  </button>
                </li>
                <li className={abaAtiva === 'tarefas' ? 'active' : ''}>
                  <button type="button" className="sidebar-link" aria-current={abaAtiva === 'tarefas' ? 'page' : undefined} onClick={() => setAbaAtiva('tarefas')}>
                    <span className="sidebar-link-icon"><NavIcon name="tarefas" /></span><span>Tarefas</span>
                  </button>
                </li>
                <li className={abaAtiva === 'notificacoes' ? 'active' : ''}>
                  <button type="button" className="sidebar-link" aria-current={abaAtiva === 'notificacoes' ? 'page' : undefined} onClick={() => setAbaAtiva('notificacoes')}>
                    <span className="sidebar-link-icon"><NavIcon name="notificacoes" /></span><span>Notificações</span>
                  </button>
                </li>
                <li className={abaAtiva === 'perfil' ? 'active' : ''}>
                  <button type="button" className="sidebar-link" aria-current={abaAtiva === 'perfil' ? 'page' : undefined} onClick={() => setAbaAtiva('perfil')}>
                    <span className="sidebar-link-icon"><NavIcon name="perfil" /></span><span>Meu perfil</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="sidebar-footer">
            <button type="button" className="sidebar-profile-button" onClick={() => setAbaAtiva('perfil')}>
              <span className="sidebar-avatar">{usuarioLogado.avatarUrl ? <img src={usuarioLogado.avatarUrl} alt="" /> : (usuarioLogado.nome || 'U').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()}</span>
              <span className="sidebar-user-copy">
                <small>Usuário</small>
                <strong>{usuarioLogado.nome || 'Usuário'}</strong>
                <em>{usuarioLogado.turma || 'Turma não definida'}</em>
              </span>
              <span className="sidebar-profile-chevron" aria-hidden="true">↗</span>
            </button>
            <div className="sidebar-footer-actions">
              <ThemeToggle tema={tema} onToggle={alternarTema} />
              <button type="button" onClick={handleLogout} className="logout-button"><span aria-hidden="true">↪</span> Sair</button>
            </div>
          </div>
        </aside>

        <main id="conteudo-principal" className="main-content">
          {abaAtiva === 'dashboard'
            ? <Dashboard />
            : abaAtiva === 'tarefas'
              ? <GerenciadorTarefas />
              : abaAtiva === 'notificacoes'
                ? <Notificacoes />
                : <Perfil usuario={usuarioLogado} onUsuarioAtualizado={handleUsuarioAtualizado} />}
        </main>
      </div>
    </div>
  );
}
