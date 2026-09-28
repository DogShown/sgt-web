import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';
import api from './services/api';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
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
  };

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
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#f4f4f9', borderBottom: '1px solid #ddd' },
  botaoSair: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
  conteudo: { padding: '20px' }
};