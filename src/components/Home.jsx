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
    </main>
  );
}
