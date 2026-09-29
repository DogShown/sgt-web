import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import api from './services/api';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaPublica, setTelaPublica] = useState('home');
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

  if (verificandoSessao) return <div className="session-loading">Verificando sessão...</div>;

  if (!usuarioLogado) {
    if (telaPublica === 'login') return <Login onLoginSucesso={handleLoginSucesso} onCadastro={() => setTelaPublica('cadastro')} onVoltarHome={() => setTelaPublica('home')} />;
    if (telaPublica === 'cadastro') return <Cadastro onVoltarLogin={() => setTelaPublica('login')} onCadastroSucesso={() => setTelaPublica('login')} />;
    return <Home onLogin={() => setTelaPublica('login')} onCadastro={() => setTelaPublica('cadastro')} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div className="sidebar-header"><h2>SGT</h2></div>
          <ul className="sidebar-menu">
            <li className={abaAtiva === 'dashboard' ? 'active' : ''}><button type="button" onClick={() => setAbaAtiva('dashboard')}>Dashboard</button></li>
            <li className={abaAtiva === 'tarefas' ? 'active' : ''}><button type="button" onClick={() => setAbaAtiva('tarefas')}>Gerenciador de Tarefas</button></li>
          </ul>
        </div>
        <div className="sidebar-user">
          <p>Usuário: <strong>{usuarioLogado.nome || 'Usuário'}</strong></p>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </aside>
      <main className="main-content">
        {abaAtiva === 'dashboard' ? <Dashboard /> : <GerenciadorTarefas onLogout={handleLogout} />}
      </main>
    </div>
  );
}
