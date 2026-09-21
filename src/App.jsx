import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GerenciadorTarefas from './components/GerenciadorTarefas';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);

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

  return (
    <div>
      {!usuarioLogado ? (
        /* Se não estiver logado, exibe a tela de Login */
        <Login onLoginSucesso={handleLoginSucesso} />
      ) : (
        /* Se estiver logado, exibe o Dashboard, o Gerenciador de Tarefas e o botão de Sair */
        <div>
          <header style={styles.header}>
            <span>Usuário: <strong>{usuarioLogado.nome}</strong></span>
            <button onClick={handleLogout} style={styles.botaoSair}>Sair</button>
          </header>

          <main style={styles.conteudo}>
            {/* Dashboard com as métricas */}
            <Dashboard />
            <hr style={{ margin: '30px 0' }} />
            {/* CRUD completo de tarefas */}
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