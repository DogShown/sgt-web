import React, { useState } from 'react';
import { loginService } from '../services/loginServices';

export default function Cadastro({ onVoltarLogin, onCadastroSucesso }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [turma, setTurma] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setMensagem('');
    setEnviando(true);

    try {
      await loginService.cadastrar({ nome, email, senha, turma });
      setMensagem('Cadastro realizado com sucesso! Agora você pode entrar.');
      setSenha('');
      setTimeout(() => onCadastroSucesso?.(), 700);
    } catch (err) {
      setErro(err.response?.data?.message || err.response?.data || 'Não foi possível realizar o cadastro.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main id="conteudo-principal" className="auth-page" aria-labelledby="cadastro-titulo">
      <section className="auth-brand-panel">
        <div className="brand-mark brand-mark-light"><span>✓</span><strong>SGT</strong></div>
        <div className="auth-brand-copy">
          <span className="home-kicker light">Comece sua organização</span>
          <h1>Tenha sua rotina escolar em um só lugar.</h1>
          <p>Cadastre-se para acompanhar tarefas, prazos e seu desempenho acadêmico.</p>
          <ul className="auth-benefits">
            <li>Organize suas tarefas e prioridades</li>
            <li>Acompanhe seus prazos</li>
            <li>Visualize seu progresso</li>
          </ul>
        </div>
        <small>SGT • Sistema de Gestão de Tarefas</small>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <button type="button" className="back-link" onClick={onVoltarLogin}>← Voltar para o login</button>
          <div className="auth-heading">
            <h2 id="cadastro-titulo">Criar sua conta</h2>
            <p>Preencha seus dados para começar.</p>
          </div>

          {mensagem && <div className="form-message success" role="status" aria-live="polite">{mensagem}</div>}
          {erro && <div className="form-message error" role="alert" aria-live="assertive">{erro}</div>}

          <form onSubmit={handleSubmit}>
            <label className="form-field"><span>Nome completo</span><input id="cadastro-nome" name="nome" autoComplete="name" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required /></label>
            <label className="form-field"><span>E-mail</span><input id="cadastro-email" name="email" autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="form-field"><span>Turma</span><input id="cadastro-turma" name="turma" type="text" value={turma} onChange={(e) => setTurma(e.target.value)} placeholder="Ex.: 3º C" required /></label>
            <label className="form-field"><span>Senha</span><input id="cadastro-senha" name="senha" autoComplete="new-password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} required /></label>
            <button className="btn-primary btn-full" type="submit" disabled={enviando} aria-busy={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</button>
          </form>

          <p className="auth-switch">Já possui uma conta? <button type="button" onClick={onVoltarLogin}>Entrar</button></p>
        </div>
      </section>
    </main>
  );
}
