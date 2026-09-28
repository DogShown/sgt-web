import React, { useState } from 'react';
import { loginService } from '../services/loginServices';

const Login = ({ onLoginSucesso }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [turma, setTurma] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const limparCampos = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setTurma('');
    setMensagem('');
    setErro('');
  };

  const handleToggle = (modoCadastro) => {
    setIsRegister(modoCadastro);
    limparCampos();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (isRegister) {
      try {
        await loginService.cadastrar({
          nome,
          email,
          senha,
          turma
        });

        setMensagem('Cadastro realizado com sucesso! Faça login para continuar.');
        setIsRegister(false);
        setSenha('');
      } catch (err) {
        setErro(
          err.response?.data?.message ||
          err.response?.data ||
          'Erro ao realizar cadastro. Verifique os dados.'
        );
      }

      return;
    }

    try {
      const usuario = await loginService.login(email, senha);

      localStorage.setItem('sgt_token', usuario.token);
      localStorage.setItem('sgt_user', JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        turma: usuario.turma
      }));

      setMensagem(`Bem-vindo, ${usuario.nome}!`);
      onLoginSucesso?.();
    } catch (err) {
      setErro(
        err.response?.data?.message ||
        'E-mail ou senha inválidos.'
      );
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => handleToggle(false)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: !isRegister ? '#007bff' : '#e0e0e0',
            color: !isRegister ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => handleToggle(true)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: isRegister ? '#007bff' : '#e0e0e0',
            color: isRegister ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Cadastrar
        </button>
      </div>

      <h2>{isRegister ? 'Criar Conta' : 'Acessar Conta'}</h2>

      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: '15px' }}>
            <label>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {isRegister && (
          <div style={{ marginBottom: '15px' }}>
            <label>Turma:</label>
            <input
              type="text"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              required
              placeholder="Ex: 3º Ano A"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isRegister ? 'Finalizar Cadastro' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;