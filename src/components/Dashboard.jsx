import React, { useEffect, useMemo, useState } from 'react';
import { tarefaService } from '../services/tarefaService';

const formatarData = (data) => {
  if (!data) return 'Sem prazo';
  const [ano, mes, dia] = data.split('-');
  if (!ano || !mes || !dia) return data;
  return new Date(Number(ano), Number(mes) - 1, Number(dia)).toLocaleDateString('pt-BR');
};

const inicioDoDia = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
};

export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [periodo, setPeriodo] = useState('mes');

  const carregarTarefas = async () => {
    try {
      setErro('');
      setCarregando(true);
      const dados = await tarefaService.listarPorUsuario();
      setTarefas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro('Não foi possível carregar os dados do dashboard.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const metricas = useMemo(() => {
    const hoje = inicioDoDia();
    const concluidas = tarefas.filter((tarefa) => tarefa.status === 'CONCLUIDA');
    const pendentes = tarefas.filter((tarefa) => tarefa.status === 'PENDENTE');
    const atrasadas = pendentes.filter((tarefa) => {
      if (!tarefa.dataEntrega) return false;
      const [ano, mes, dia] = tarefa.dataEntrega.split('-').map(Number);
      return new Date(ano, mes - 1, dia) < hoje;
    });
    const taxa = tarefas.length ? Math.round((concluidas.length / tarefas.length) * 100) : 0;
    const categorias = tarefas.reduce((acc, tarefa) => {
      const categoria = tarefa.categoria || 'Outras';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});
    const proximas = tarefas
      .filter((tarefa) => tarefa.status === 'PENDENTE' && tarefa.dataEntrega)
      .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega))
      .slice(0, 5);

    return { concluidas: concluidas.length, pendentes: pendentes.length, atrasadas: atrasadas.length, taxa, categorias, proximas };
  }, [tarefas]);

  const categoriasOrdenadas = Object.entries(metricas.categorias)
    .sort(([, quantidadeA], [, quantidadeB]) => quantidadeB - quantidadeA)
    .slice(0, 4);
  const maiorCategoria = Math.max(...categoriasOrdenadas.map(([, quantidade]) => quantidade), 1);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">SGT • Sistema de Gestão de Tarefas</p>
          <h1>Dashboard de desempenho</h1>
          <p>Visão geral das suas tarefas{usuario.turma ? ` — Turma ${usuario.turma}` : ''}</p>
        </div>

        <div className="period-toggle" aria-label="Período do dashboard">
          <button type="button" className={periodo === 'mes' ? 'active' : ''} onClick={() => setPeriodo('mes')}>Mês</button>
          <button type="button" className={periodo === 'semestre' ? 'active' : ''} onClick={() => setPeriodo('semestre')}>Semestre</button>
        </div>
      </header>

      {erro && <div className="dashboard-alert">{erro}</div>}

      <section className="dashboard-stats">
        <article className="stat-card"><span className="stat-label">Concluídas</span><strong>{carregando ? '—' : metricas.concluidas}</strong><span className="stat-helper">tarefas finalizadas</span></article>
        <article className="stat-card"><span className="stat-label">Pendentes</span><strong>{carregando ? '—' : metricas.pendentes}</strong><span className="stat-helper">aguardando conclusão</span></article>
        <article className="stat-card stat-card-warning"><span className="stat-label">Atrasadas</span><strong>{carregando ? '—' : metricas.atrasadas}</strong><span className="stat-helper">prazo já ultrapassado</span></article>
        <article className="stat-card stat-card-accent"><span className="stat-label">Taxa de conclusão</span><strong>{carregando ? '—' : \`\${metricas.taxa}%\`}</strong><span className="stat-helper">{periodo === 'mes' ? 'visão atual' : 'visão do semestre'}</span></article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="card-heading"><div><h2>Distribuição das tarefas</h2><p>Suas tarefas por categoria</p></div></div>
          {carregando ? <p className="dashboard-empty">Carregando dados...</p> :
            categoriasOrdenadas.length === 0 ? <p className="dashboard-empty">Você ainda não possui tarefas cadastradas.</p> :
            <div className="category-chart">
              {categoriasOrdenadas.map(([categoria, quantidade]) => (
                <div className="category-row" key={categoria}>
                  <div className="category-row-label"><span>{categoria}</span><strong>{quantidade}</strong></div>
                  <div className="category-bar"><span style={{ width: \`\${(quantidade / maiorCategoria) * 100}%\` }} /></div>
                </div>
              ))}
            </div>}
        </article>

        <article className="dashboard-card">
          <div className="card-heading"><div><h2>Próximas tarefas</h2><p>Priorize o que precisa da sua atenção</p></div></div>
          {carregando ? <p className="dashboard-empty">Carregando...</p> :
            metricas.proximas.length === 0 ? <p className="dashboard-empty">Nenhuma tarefa pendente com prazo.</p> :
            <div className="upcoming-list">
              {metricas.proximas.map((tarefa) => (
                <div className="upcoming-item" key={tarefa.id}>
                  <div><strong>{tarefa.titulo}</strong><span>{tarefa.categoria || 'Outras'}</span></div>
                  <time dateTime={tarefa.dataEntrega}>{formatarData(tarefa.dataEntrega)}</time>
                </div>
              ))}
            </div>}
        </article>
      </section>
    </div>
  );
}
