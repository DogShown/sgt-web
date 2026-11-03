import React, { useEffect, useState } from 'react';
import { perfilService } from '../services/perfilService';

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
      const atualizado = await perfilService.atualizar({
        nome: nome.trim(),
        turma: turma.trim()
      });
      localStorage.setItem('sgt_user', JSON.stringify(atualizado));
      onUsuarioAtualizado(atualizado);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível atualizar seu perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const iniciais = (nome || 'Usuário')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();

  return (
    <div className="profile-page">
      <header className="page-header profile-header">
        <div>
          <p className="dashboard-eyebrow">SGT • Minha conta</p>
          <h1>Meu perfil</h1>
          <p>Seus dados e informações acadêmicas em um só lugar.</p>
        </div>
        <span className="profile-header-mark" aria-hidden="true">◎</span>
      </header>

      <section className="profile-layout">
        <article className="profile-summary-card">
          <div className="profile-avatar" aria-label={`Iniciais de ${nome || 'Usuário'}`}>{iniciais}</div>
          <span className="profile-status"><span aria-hidden="true" /> Conta SGT</span>
          <h2>{nome || 'Usuário'}</h2>
          <p className="profile-email">{usuario?.email || 'E-mail não informado'}</p>
          <div className="profile-summary-divider" />
          <div className="profile-summary-detail">
            <span>Turma</span>
            <strong>{turma || 'Não definida'}</strong>
          </div>
          <p className="profile-summary-note">Mantenha seus dados atualizados para personalizar sua experiência no SGT.</p>
        </article>

        <article className="profile-form-card">
          <div className="profile-section-heading">
            <span className="profile-section-icon" aria-hidden="true">✎</span>
            <div>
              <h2>Informações pessoais</h2>
              <p>Atualize seu nome e sua turma. Seu acesso continuará o mesmo.</p>
            </div>
          </div>

          {mensagem && <div className="profile-feedback success" role="status"><span aria-hidden="true">✓</span>{mensagem}</div>}
          {erro && <div className="profile-feedback error" role="alert"><span aria-hidden="true">!</span>{erro}</div>}

          <form className="profile-form" onSubmit={salvar}>
            <label className="profile-field">
              <span>Nome completo</span>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                maxLength={100}
                placeholder="Digite seu nome completo"
                autoComplete="name"
              />
            </label>

            <label className="profile-field">
              <span>E-mail</span>
              <input
                type="email"
                value={usuario?.email || ''}
                disabled
                autoComplete="email"
                aria-describedby="profile-email-help"
              />
              <small id="profile-email-help">O e-mail não pode ser alterado nesta tela.</small>
            </label>

            <label className="profile-field">
              <span>Turma</span>
              <input
                type="text"
                value={turma}
                onChange={(event) => setTurma(event.target.value.toUpperCase())}
                placeholder="Ex.: INF3BM"
                required
                maxLength={50}
                autoComplete="organization"
              />
              <small>Informe o código da sua turma, como curso, ano e período.</small>
            </label>

            <div className="profile-form-footer">
              <span>Suas alterações só serão aplicadas após salvar.</span>
              <button type="submit" className="profile-save-button" disabled={salvando}>
                {salvando ? <><span className="profile-spinner" aria-hidden="true" /> Salvando...</> : <>Salvar alterações <span aria-hidden="true">→</span></>}
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
