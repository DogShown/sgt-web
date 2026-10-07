import React, { useState } from 'react';
import { loginService } from '../services/loginServices';

export default function Login({ onLoginSucesso, onCadastro, onVoltarHome }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const usuario = await loginService.login(email, senha);
      localStorage.setItem('sgt_token', usuario.token);
      localStorage.setItem('sgt_user', JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        turma: usuario.turma
      }));
      onLoginSucesso?.();
    } catch (err) {
      setErro(err.response?.data?.message || 'E-mail ou senha inválidos.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth-page" aria-labelledby="login-titulo">
      <section className="auth-brand-panel">
        <div className="brand-mark brand-mark-light"><span>✓</span><strong>SGT</strong></div>
        <div className="auth-brand-copy">
          <span className="home-kicker light">Sua rotina, mais organizada</span>
          <h1>Menos desorganização. Mais foco nos estudos.</h1>
          <p>O SGT centraliza suas tarefas e prazos para você saber o que precisa fazer e quando.</p>
          <ul className="auth-benefits">
            <li>Organize suas tarefas</li>
            <li>Priorize seus prazos</li>
            <li>Acompanhe seu desempenho</li>
          </ul>
        </div>
        <small>SGT • Sistema de Gestão de Tarefas</small>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <button type="button" className="back-link" onClick={onVoltarHome}>← Voltar para início</button>
          <div className="auth-heading">
            <h2 id="login-titulo">Bem-vindo de volta!</h2>
            <p>Entre na sua conta para continuar.</p>
          </div>

          {erro && <div className="form-message error" role="alert" aria-live="assertive">{erro}</div>}

          <form onSubmit={handleSubmit} aria-busy={enviando}>
            <label className="form-field"><span>E-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
            <label className="form-field"><span>Senha</span><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required /></label>
            <div className="form-options"><label><input type="checkbox" /> <span>Lembrar de mim</span></label><button type="button" className="forgot-link" disabled>Esqueci minha senha</button></div>
            <button className="btn-primary btn-full" type="submit" disabled={enviando} aria-busy={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
          </form>

          <p className="auth-switch">Ainda não possui uma conta? <button type="button" onClick={onCadastro}>Criar conta</button></p>
        </div>
      </section>
    </main>
  );
}
