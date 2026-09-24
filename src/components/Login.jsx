import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSucesso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSucesso) {
      onLoginSucesso({ email, senha, lembrar });
    }
  };

  return (
    <div className="login-wrapper">
      {/* Painel Esquerdo */}
      <div className="login-banner">
        <div className="brand-header">
          <div className="brand-icon">🎓</div>
          <h2 className="brand-title">SGT</h2>
        </div>

        <div className="banner-content">
          <h1>Suas tarefas acadêmicas, organizadas por prazo e prioridade.</h1>
          <p className="banner-description">
            Vinculação automática à turma, filtros semanais e mensais, chat da turma e do grupo de TCC, e um dashboard com a evolução do seu desempenho.
          </p>
          <ul className="banner-features">
            <li>Controle de prazos e atrasos</li>
            <li>Chats em tempo real</li>
            <li>Sincronização web e mobile</li>
          </ul>
        </div>

        <div className="banner-footer">
          Acesso restrito aos dados da sua turma
        </div>
      </div>

      {/* Painel Direito (Formulário) */}
      <div className="login-form-container">
        <div className="login-card-content">
          <div className="form-header">
            <h2>Entrar</h2>
            <p>Use seu e-mail institucional para acessar o SGT.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail institucional</label>
              <input
                id="email"
                type="email"
                placeholder="aluno@instituicao.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                />
                Lembrar de mim
              </label>
              <a href="#esqueci" className="forgot-link">Esqueci a senha</a>
            </div>

            <button type="submit" className="btn-submit">
              Entrar
            </button>
          </form>

          <div className="register-prompt">
            Ainda não tem conta? <a href="#cadastre-se">Cadastre-se</a>
          </div>
        </div>
      </div>
    </div>
  );
}