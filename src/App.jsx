import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import Notificacoes from './components/Notificacoes';
import Perfil from './components/Perfil';
import Frequencia from './components/Frequencia';
import UsuarioResumo from './components/UsuarioResumo';
import LoadingFeedback from './components/LoadingFeedback';
import api from './services/api';
import logo from './assets/logo.jpg';

const ROTAS_PRIVADAS = ['dashboard', 'tarefas', 'frequencia', 'notificacoes', 'perfil', 'usuario'];

function NavIcon({ name }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="8" height="7" rx="1.5" /></>,
    tarefas: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M8 2v4M16 2v4M8 11h8M8 15h5" /></>,
    notificacoes: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    perfil: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    frequencia: <><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" /></>,
  };
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ThemeToggle({ tema, onToggle, className = '' }) {
  const escuro = tema === 'escuro';
  return (
    <button type="button" className={`theme-toggle ${className}`} onClick={onToggle}
      aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'} title={escuro ? 'Tema claro' : 'Tema escuro'}>
      <span className="theme-toggle-icon" aria-hidden="true">{escuro ? '☀' : '☾'}</span>
      <span className="theme-toggle-label">{escuro ? 'Claro' : 'Escuro'}</span>
    </button>
  );
}

function PrivateLayout({ usuarioLogado, tema, alternarTema, onUsuarioAtualizado, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const segmento = location.pathname.split('/')[2] || 'dashboard';
  const abaAtiva = ROTAS_PRIVADAS.includes(segmento) ? segmento : 'dashboard';
  const irPara = (aba) => navigate(`/app/${aba}`);

  return (
    <div className="screen-transition">
      <div className="app-container">
        <aside className="sidebar" aria-label="Barra lateral do SGT">
          <div className="sidebar-main">
            <div className="sidebar-brand"><img src={logo} alt="" className="sidebar-brand-logo" /><span className="sidebar-brand-copy"><strong>SGT</strong><small>Organize sua rotina</small></span></div>
            <div className="sidebar-nav-label">MENU PRINCIPAL</div>
            <nav aria-label="Navegação principal">
              <ul className="sidebar-menu">
                <li className={abaAtiva === 'dashboard' ? 'active' : ''}><button type="button" className="sidebar-link" aria-current={abaAtiva === 'dashboard' ? 'page' : undefined} onClick={() => irPara('dashboard')}><span className="sidebar-link-icon"><NavIcon name="dashboard" /></span><span>Dashboard</span></button></li>
                <li className={abaAtiva === 'tarefas' ? 'active' : ''}><button type="button" className="sidebar-link" aria-current={abaAtiva === 'tarefas' ? 'page' : undefined} onClick={() => irPara('tarefas')}><span className="sidebar-link-icon"><NavIcon name="tarefas" /></span><span>Tarefas</span></button></li>
                <li className={abaAtiva === 'frequencia' ? 'active' : ''}><button type="button" className="sidebar-link" aria-current={abaAtiva === 'frequencia' ? 'page' : undefined} onClick={() => irPara('frequencia')}><span className="sidebar-link-icon"><NavIcon name="frequencia" /></span><span>Frequência</span></button></li>
                <li className={abaAtiva === 'notificacoes' ? 'active' : ''}><button type="button" className="sidebar-link" aria-current={abaAtiva === 'notificacoes' ? 'page' : undefined} onClick={() => irPara('notificacoes')}><span className="sidebar-link-icon"><NavIcon name="notificacoes" /></span><span>Notificações</span></button></li>
                <li className={abaAtiva === 'perfil' ? 'active' : ''}><button type="button" className="sidebar-link" aria-current={abaAtiva === 'perfil' ? 'page' : undefined} onClick={() => irPara('perfil')}><span className="sidebar-link-icon"><NavIcon name="perfil" /></span><span>Meu perfil</span></button></li>
              </ul>
            </nav>
          </div>
          <div className="sidebar-footer">
            <button type="button" className="sidebar-profile-button" onClick={() => irPara('usuario')}>
              <span className="sidebar-avatar" style={{ backgroundColor: usuarioLogado.corCapa || '#075b70' }}>
                {usuarioLogado.avatarUrl ? <img src={usuarioLogado.avatarUrl} alt="" /> : (usuarioLogado.nome || 'U').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()}
              </span>
              <span className="sidebar-user-copy"><small>Minha conta</small><strong>{usuarioLogado.nome || 'Usuário'}</strong><em>{usuarioLogado.turma || 'Turma não definida'}</em></span>
              <span className="sidebar-profile-chevron" aria-hidden="true">↗</span>
            </button>
            <div className="sidebar-footer-actions"><ThemeToggle tema={tema} onToggle={alternarTema} /></div>
          </div>
        </aside>
        <main id="conteudo-principal" className="main-content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tarefas" element={<GerenciadorTarefas />} />
            <Route path="frequencia" element={<Frequencia />} />
            <Route path="notificacoes" element={<Notificacoes />} />
            <Route path="perfil" element={<Perfil usuario={usuarioLogado} onUsuarioAtualizado={onUsuarioAtualizado} onSair={onLogout} />} />
            <Route path="usuario" element={<UsuarioResumo usuario={usuarioLogado} onPerfil={() => irPara('perfil')} onSair={onLogout} />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [tema, setTema] = useState(() => localStorage.getItem('sgt_theme') || 'claro');
  const [mensagemSessao, setMensagemSessao] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem('sgt_theme', tema);
  }, [tema]);

  useEffect(() => {
    const encerrarSessaoExpirada = () => {
      localStorage.removeItem('sgt_token');
      sessionStorage.removeItem('sgt_token');
      localStorage.removeItem('sgt_user');
      setUsuarioLogado(null);
      setMensagemSessao('Sua sessão expirou ou não é mais válida. Entre novamente para continuar.');
      navigate('/login', { replace: true });
    };
    window.addEventListener('sgt:session-expired', encerrarSessaoExpirada);
    return () => window.removeEventListener('sgt:session-expired', encerrarSessaoExpirada);
  }, [navigate]);

  useEffect(() => {
    let ativo = true;
    const verificarSessao = async () => {
      const token = localStorage.getItem('sgt_token') || sessionStorage.getItem('sgt_token');
      if (!token) {
        if (ativo) setVerificandoSessao(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        let usuario = response.data;
        const usuarioSalvo = JSON.parse(localStorage.getItem('sgt_user') || '{}');
        const temPersonalizacaoLocal = Boolean(usuarioSalvo.avatarUrl || usuarioSalvo.imagemCapa ||
          (usuarioSalvo.corCapa && usuarioSalvo.corCapa !== '#075b70'));
        const perfilServidorVazio = !usuario.avatarUrl && !usuario.imagemCapa &&
          (!usuario.corCapa || usuario.corCapa === '#075b70');

        if (temPersonalizacaoLocal && perfilServidorVazio) {
          try {
            const migracao = await api.put('/auth/me', {
              nome: usuario.nome,
              turma: usuario.turma,
              avatarUrl: usuarioSalvo.avatarUrl || null,
              corCapa: usuarioSalvo.corCapa || '#075b70',
              imagemCapa: usuarioSalvo.imagemCapa || null
            });
            usuario = migracao.data;
          } catch {
            // A falha na migração opcional não invalida uma sessão autenticada.
          }
        }

        const usuarioCompleto = {
          id: usuario.id, nome: usuario.nome, email: usuario.email, turma: usuario.turma,
          avatarUrl: usuario.avatarUrl || '', corCapa: usuario.corCapa || '#075b70',
          imagemCapa: usuario.imagemCapa || ''
        };
        localStorage.setItem('sgt_user', JSON.stringify(usuarioCompleto));
        if (ativo) setUsuarioLogado(usuarioCompleto);
      } catch {
        localStorage.removeItem('sgt_token');
        sessionStorage.removeItem('sgt_token');
        localStorage.removeItem('sgt_user');
      } finally {
        if (ativo) setVerificandoSessao(false);
      }
    };
    verificarSessao();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (verificandoSessao) return;
    const caminhoPublico = ['/','/login','/cadastro'].includes(location.pathname);
    if (usuarioLogado && caminhoPublico) navigate('/app/dashboard', { replace: true });
    if (!usuarioLogado && location.pathname.startsWith('/app')) navigate('/login', { replace: true });
  }, [usuarioLogado, verificandoSessao, location.pathname, navigate]);

  const alternarTema = () => setTema(atual => atual === 'escuro' ? 'claro' : 'escuro');
  const handleLoginSucesso = () => {
    const user = localStorage.getItem('sgt_user');
    if (user) setUsuarioLogado(JSON.parse(user));
    setMensagemSessao('');
    navigate('/app/dashboard', { replace: true });
  };
  const handleUsuarioAtualizado = usuarioAtualizado => {
    localStorage.setItem('sgt_user', JSON.stringify(usuarioAtualizado));
    setUsuarioLogado(usuarioAtualizado);
  };
  const handleLogout = () => {
    localStorage.removeItem('sgt_token');
    sessionStorage.removeItem('sgt_token');
    localStorage.removeItem('sgt_user');
    setUsuarioLogado(null);
    setMensagemSessao('');
    navigate('/', { replace: true });
  };

  if (verificandoSessao) {
    return <div className="session-loading" aria-label="Preparando o SGT"><div className="session-loader-card"><strong>SGT</strong><LoadingFeedback variant="dashboard" label="Validando sua sessão" /></div></div>;
  }

  if (usuarioLogado) {
    return <Routes>
      <Route path="/app/*" element={<PrivateLayout usuarioLogado={usuarioLogado} tema={tema} alternarTema={alternarTema} onUsuarioAtualizado={handleUsuarioAtualizado} onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>;
  }

  return <Routes>
    <Route path="/" element={<Home onLogin={() => navigate('/login')} onCadastro={() => navigate('/cadastro')} themeToggle={<ThemeToggle className="landing-theme-toggle" tema={tema} onToggle={alternarTema} />} />} />
    <Route path="/login" element={<div className="screen-transition"><ThemeToggle className="theme-toggle-public" tema={tema} onToggle={alternarTema} /><Login onLoginSucesso={handleLoginSucesso} onCadastro={() => navigate('/cadastro')} onVoltarHome={() => { setMensagemSessao(''); navigate('/'); }} mensagemInicial={mensagemSessao} /></div>} />
    <Route path="/cadastro" element={<div className="screen-transition"><ThemeToggle className="theme-toggle-public" tema={tema} onToggle={alternarTema} /><Cadastro onVoltarLogin={() => navigate('/login')} onCadastroSucesso={() => navigate('/login')} /></div>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}
