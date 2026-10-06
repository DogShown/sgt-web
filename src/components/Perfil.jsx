import React, { useEffect, useState } from 'react';
import { perfilService } from '../services/perfilService';

const turmas = ['INF1AM', 'INF1BM', 'INF2AM', 'INF2BM', 'INF3AM', 'INF3BM'];

export default function Perfil({ usuario, onUsuarioAtualizado }) {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [turma, setTurma] = useState(usuario?.turma || '');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    setNome(usuario?.nome || '');
    setTurma(usuario?.turma || '');
  }, [usuario]);

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      const atualizado = await perfilService.atualizar({ nome: nome.trim(), turma: turma.trim() });
      localStorage.setItem('sgt_user', JSON.stringify(atualizado));
      onUsuarioAtualizado(atualizado);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível atualizar seu perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const iniciais = (nome || 'Usuário').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

  return (
    <div className="profile-page">
      <header className="page-header">
        <div>
          <p className="dashboard-eyebrow">SGT • Minha conta</p>
          <h1>Meu perfil</h1>
          <p>Personalize suas informações para deixar o SGT com a sua cara.</p>
        </div>
      </header>
      <section className="profile-layout">
        <article className="profile-card profile-preview-card">
          <div className="profile-avatar-large">{iniciais}</div>
          <h2>{nome || 'Usuário'}</h2>
          <p>{usuario?.email}</p>
          <span className="profile-class-badge">{turma || 'Turma não definida'}</span>
        </article>
        <article className="profile-card">
          <div className="card-heading"><div><p className="section-kicker">Dados pessoais</p><h2>Personalizar perfil</h2><p>Atualize nome e turma sem alterar seu acesso.</p></div></div>
          {mensagem && <div className="form-message success" role="status">{mensagem}</div>}
          {erro && <div className="form-message error" role="alert">{erro}</div>}
          <form className="profile-form" onSubmit={salvar}>
            <label className="form-field"><span>Nome</span><input value={nome} onChange={e => setNome(e.target.value)} required maxLength={100} /></label>
            <label className="form-field"><span>E-mail</span><input value={usuario?.email || ''} disabled /></label>
            <label className="form-field">
              <span>Turma</span>
              <input list="sgt-turmas" value={turma} onChange={e => setTurma(e.target.value.toUpperCase())} placeholder="Ex.: INF3BM" required maxLength={50} />
              <datalist id="sgt-turmas">{turmas.map(item => <option value={item} key={item} />)}</datalist>
              <small className="field-help">Padrão técnico: curso + ano + turma + período. Ex.: INF3BM.</small>
            </label>
            <button className="btn-primary btn-full" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
          </form>
        </article>
      </section>
    </div>
  );
}
