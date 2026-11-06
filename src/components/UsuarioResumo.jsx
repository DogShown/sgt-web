export default function UsuarioResumo({ usuario, onPerfil, onSair }) {
  const iniciais = (usuario?.nome || 'Usuário').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  return <div className="user-overview-page">
    <header className="page-header"><div><p className="dashboard-eyebrow">SGT / CONTA</p><h1>Usuário</h1><p>Um resumo rápido da sua conta e dos seus dados.</p></div></header>
    <section className="user-overview-main">
      <div className="user-overview-avatar" style={{backgroundColor:usuario?.corCapa || '#075b70'}}>
        {usuario?.avatarUrl ? <img src={usuario.avatarUrl} alt="" /> : iniciais}
      </div>
      <div><h2>{usuario?.nome || 'Usuário'}</h2><p>{usuario?.email || 'E-mail não informado'}</p><span>{usuario?.turma || 'Turma não definida'}</span></div>
    </section>
    <div className="user-overview-actions"><button className="btn-primary" onClick={onPerfil}>Abrir meu perfil</button><button className="btn-outline" onClick={onSair}>Sair da conta</button></div>
    <p className="user-overview-note">Em Meu perfil você encontra suas informações e opções de personalização.</p>
  </div>;
}
