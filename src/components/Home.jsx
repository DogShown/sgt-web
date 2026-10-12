import logo from '../assets/logo.jpg';

export default function Home({ onLogin, onCadastro, themeToggle }) {
  return (
    <main id="conteudo-principal" className="home-page landing-page">
      <section className="landing-hero">
        <header className="landing-header">
          <div className="landing-brand">
            <img className="landing-brand-logo" src={logo} alt="" />
            <span className="landing-brand-copy">
              <strong>SGT</strong>
              <small>Sistema de Gestão de Tarefas</small>
            </span>
          </div>

          <div className="landing-header-actions">
            {themeToggle}
            <button type="button" className="btn-outline landing-login" onClick={onLogin}>Entrar</button>
          </div>
        </header>

        <div className="landing-content">
          <span className="landing-kicker">Para estudantes e universitários</span>
          <h1>
            Suas tarefas acadêmicas,
            <span>organizadas de verdade.</span>
          </h1>
          <p>
            Organize tarefas, acompanhe prazos e visualize seu desempenho em um só lugar,
            feito para simplificar sua rotina de estudos.
          </p>
          <div className="landing-actions">
            <button type="button" className="btn-primary landing-signup" onClick={onCadastro}>
              Criar conta gratuita <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="btn-outline landing-existing-account" onClick={onLogin}>
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer landing-project-footer">
        <div className="landing-project-info">
          <h2>Projeto: SGT - Sistema de Gerenciamento de Tarefas</h2>
          <p><strong>Turma:</strong> INF2GM <span aria-hidden="true">|</span> <strong>Grupo:</strong> 2</p>
          <h3>Equipe do Projeto</h3>
          <ul className="landing-team-list">
            
            <li><strong>Nº 1 - Antônio Nunes da Silva</strong><span>RM: 99080 | Time de Desenvolvimento</span></li>
            <li><strong>Nº 4 - Deryk Henry dos Santos Silva</strong><span>RM: 99760 | Time de Desenvolvimento</span></li>
            <li><strong>Nº 5 - Eloá Raquel Pereira Silva</strong><span>RM: 95281 | Time de Desenvolvimento</span></li>
            <li><strong>Nº 6 - Ester Beserra dos Santos</strong><span>RM: 99877 | Time de Desenvolvimento</span></li>
            <li><strong>Nº 7 - Ewerton Vagner da Silva</strong><span>RM: 99750 | Product Owner</span></li>
            <li><strong>Nº 28 - Stephany dos Santos Bandeira</strong><span>RM: 100423 | Scrum Master</span></li>

          </ul>
        </div>
        <p className="landing-footer-note">SGT <span aria-hidden="true">•</span> Organize sua rotina de estudos</p>
      </footer>
    </main>
  );
}