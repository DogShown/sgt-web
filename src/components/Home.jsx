import React from 'react';

export default function Home({ onLogin, onCadastro }) {
  return (
    <main id="conteudo-principal" className="home-page">
      <section className="home-hero">
        <header className="public-header">
          <div className="brand-mark">
            <span>✓</span>
            <strong>SGT</strong>
          </div>
          <div className="public-actions">
            <button type="button" className="btn-ghost" onClick={onLogin}>Entrar</button>
            <button type="button" className="btn-primary" onClick={onCadastro}>Criar conta</button>
          </div>
        </header>

        <div className="home-content">
          <div className="home-copy">
            <span className="home-kicker">Sistema de Gestão de Tarefas</span>
            <h1>Organize suas tarefas. <span>Estude com mais tranquilidade.</span></h1>
            <p>
              O SGT ajuda estudantes a acompanhar atividades, prazos e prioridades
              em um só lugar, deixando sua rotina escolar mais organizada.
            </p>
            <div className="home-actions">
              <button type="button" className="btn-primary btn-large" onClick={onCadastro}>Começar agora</button>
              <button type="button" className="btn-outline btn-large" onClick={onLogin}>Já tenho uma conta</button>
            </div>
          </div>

          <div className="home-preview" aria-label="Prévia do painel do SGT">
            <div className="preview-window">
              <div className="preview-top">
                <div>
                  <small>SGT</small>
                  <strong>Meu desempenho</strong>
                </div>
                <span className="preview-badge">Hoje</span>
              </div>
              <div className="preview-stats">
                <div><strong>18</strong><span>Concluídas</span></div>
                <div><strong>6</strong><span>Pendentes</span></div>
                <div><strong>82%</strong><span>Conclusão</span></div>
              </div>
              <div className="preview-list">
                <div><span className="preview-dot" /><div><strong>Trabalho de Matemática</strong><small>Entrega amanhã</small></div></div>
                <div><span className="preview-dot" /><div><strong>Projeto de História</strong><small>Entrega sexta-feira</small></div></div>
                <div><span className="preview-dot" /><div><strong>Exercícios de Programação</strong><small>Entrega próxima semana</small></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Informações do Projeto e Integrantes com letras menores */}
      <footer className="home-footer-info" style={{ padding: '1.5rem 1rem', background: '#f8f9fa', borderTop: '1px solid #e9ecef', marginTop: '2rem', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h4 style={{ marginBottom: '0.3rem', color: '#333', fontSize: '0.95rem' }}>Projeto: SGT - Sistema de Gerenciamento de Tarefas</h4>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.8rem' }}><strong>Turma:</strong> INF2GM | <strong>Grupo:</strong> 2</p>
          
          <h5 style={{ marginBottom: '0.75rem', color: '#444', fontSize: '0.85rem' }}>Equipe do Projeto</h5>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', textAlign: 'left' }}>
            <li style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}>
              <strong>N° 7</strong> - Ewerton Vagner da Silva<br /><span style={{ fontSize: '0.75rem', color: '#555' }}>RM: 99750 | Product Owner</span>
            </li>
            <li style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}>
              <strong>N° 28</strong> - Stephany dos Santos Bandeira<br /><span style={{ fontSize: '0.75rem', color: '#555' }}>RM: 100423 | Scrum Master</span>
            </li>
            <li style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}>
              <strong>N° 1</strong> - Antônio Nunes da Silva<br /><span style={{ fontSize: '0.75rem', color: '#555' }}>RM: 99080 | Time de Desenvolvimento</span>
            </li>
            <li style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}>
              <strong>N° 4</strong> - Deryk Henry dos Santos Silva<br /><span style={{ fontSize: '0.75rem', color: '#555' }}>RM: 99760 | Time de Desenvolvimento</span>
            </li>
            <li style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}>
              <strong>N° 5</strong> - Eloá Raquel Pereira Silva<br /><span style={{ fontSize: '0.75rem', color: '#555' }}>RM: 95281 | Time de Desenvolvimento</span>
            </li>
            <li style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}>
              <strong>N° 6</strong> - Ester Beserra dos Santos<br /><span style={{ fontSize: '0.75rem', color: '#555' }}>RM: 99877 | Time de Desenvolvimento</span>
            </li>
          </ul>
        </div>
      </footer>
    </main>
  );
}