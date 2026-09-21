import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  // Estado para alternar entre Login (false) e Cadastro (true)
  const [isRegister, setIsRegister] = useState(false);

  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [turma, setTurma] = useState('');

  // Mensagens de feedback
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
      // Requisição de CADASTRO -> POST /api/auth/cadastrar
      try {
        await axios.post('http://localhost:8080/api/auth/cadastrar', {
          nome,
          email,
          senha,
          turma
        });
        setMensagem('Cadastro realizado com sucesso! Faça login para continuar.');
        setIsRegister(false); // Alterna para a aba de login após o cadastro
      } catch (err) {
        setErro(err.response?.data || 'Erro ao realizar cadastro. Verifique os dados.');
      }
    } else {
      // Requisição de LOGIN -> POST /api/auth/login
      try {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          email,
          senha
        });
        setMensagem(`Bem-vindo, ${response.data.nome}!`);
        // Armazena o token e/ou dados do usuário no localStorage
        localStorage.setItem('usuario', JSON.stringify(response.data));
      } catch (err) {
        setErro('E-mail ou senha inválidos.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      {/* Botões de Alternância de Aba */}
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
        {/* Campo NOME (Apenas no cadastro) */}
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

        {/* Campo E-MAIL */}
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

        {/* Campo SENHA */}
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

        {/* Campo TURMA (Apenas no cadastro) */}
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