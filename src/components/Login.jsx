import React, { useState } from 'react';
import { loginService } from '../services/loginServices';

export default function Login({ onLoginSucesso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const data = await loginService.login(email, senha);
      
      // Armazena a sessão do usuário no navegador
      localStorage.setItem('sgt_token', data.token);
      localStorage.setItem('sgt_user', JSON.stringify(data));

      alert(`Bem-vindo(a), ${data.nome} (Turma: ${data.turma})!`);
      
      if (onLoginSucesso) {
        onLoginSucesso();
      }
    } catch (err) {
      setErro(err.response?.data?.message || 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>SGT - Entrar</h2>
      {erro && <p style={styles.erro}>{erro}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={styles.campo}>
          <label>E-mail institucional:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.campo}>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={carregando} style={styles.botao}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' },
  campo: { marginBottom: '16px' },
  input: { width: '100%', padding: '10px', marginTop: '6px', boxSizing: 'border-box' },
  botao: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  erro: { color: 'red', marginBottom: '12px' }
};