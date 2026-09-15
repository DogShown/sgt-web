import { useState } from 'react';
import { login } from '../services/loginService';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      const usuario = await login(email, senha);
      setMensagem(`Bem-vindo, ${usuario.nome || 'usuário'}!`);
      console.log('Dados do usuário:', usuario);
    } catch (error) {
      if (error.response) {
        setMensagem(error.response.data.message || 'E-mail ou senha incorretos.');
      } else {
        setMensagem('Não foi possível conectar ao servidor.');
      }
      console.error('Erro de autenticação:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login - SGT</h2>
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>E-mail:</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="senha" style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input 
            id="senha"
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={carregando} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagem && <p style={{ marginTop: '15px', textAlign: 'center' }}>{mensagem}</p>}
    </div>
  );
}