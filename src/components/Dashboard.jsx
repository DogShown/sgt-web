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
    const inicioPeriodo = periodo === 'mes'
      ? new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      : new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
    const fimPeriodo = periodo === 'mes'
      ? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const tarefasDoPeriodo = tarefas.filter((tarefa) => {
      if (!tarefa.dataEntrega) return false;
      const [ano, mes, dia] = tarefa.dataEntrega.split('-').map(Number);
      const dataEntrega = new Date(ano, mes - 1, dia);
      return dataEntrega >= inicioPeriodo && dataEntrega <= fimPeriodo;
    });
    const concluidas = tarefasDoPeriodo.filter((tarefa) => ['CONCLUIDA', 'CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'].includes(tarefa.status));
    const pendentes = tarefasDoPeriodo.filter((tarefa) => tarefa.status === 'PENDENTE');
    const atrasadas = pendentes.filter((tarefa) => {
      if (!tarefa.dataEntrega) return false;
      const [ano, mes, dia] = tarefa.dataEntrega.split('-').map(Number);
      return new Date(ano, mes - 1, dia) < hoje;
    });
    const taxa = tarefas.length ? Math.round((concluidas.length / tarefas.length) * 100) : 0;
    const categorias = tarefasDoPeriodo.reduce((acc, tarefa) => {
      const categoria = tarefa.categoria || 'Outras';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});
    const proximas = tarefasDoPeriodo
      .filter((tarefa) => tarefa.status === 'PENDENTE' && tarefa.dataEntrega)
      .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega))
      .slice(0, 5);

    return { concluidas: concluidas.length, pendentes: pendentes.length, atrasadas: atrasadas.length, taxa, categorias, proximas };
  }, [tarefas]);


  const graficoMensal = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const data = new Date();
      data.setMonth(data.getMonth() - (5 - i), 1);
      return { chave: data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0'), nome: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), total: 0, concluidas: 0 };
    });
    tarefas.forEach(tarefa => {
      const chave = tarefa.dataEntrega ? tarefa.dataEntrega.slice(0, 7) : '';
      const mes = meses.find(item => item.chave === chave);
      if (mes) {
        mes.total += 1;
        if (['CONCLUIDA', 'CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'].includes(tarefa.status)) mes.concluidas += 1;
      }
    });
    return meses;
  }, [tarefas]);

  const maiorBarra = Math.max(...graficoMensal.map(item => item.total), 1);

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
        <article className="stat-card"><span className="stat-card-icon success" aria-hidden="true">✓</span><span className="stat-label">Concluídas</span><strong>{carregando ? '—' : metricas.concluidas}</strong><span className="stat-helper">tarefas finalizadas</span></article>
        <article className="stat-card"><span className="stat-card-icon accent" aria-hidden="true">◷</span><span className="stat-label">Pendentes</span><strong>{carregando ? '—' : metricas.pendentes}</strong><span className="stat-helper">aguardando conclusão</span></article>
        <article className="stat-card stat-card-warning"><span className="stat-card-icon warning" aria-hidden="true">!</span><span className="stat-label">Atrasadas</span><strong>{carregando ? '—' : metricas.atrasadas}</strong><span className="stat-helper">prazo já ultrapassado</span></article>
        <article className="stat-card stat-card-accent"><span className="stat-card-icon accent" aria-hidden="true">↗</span><span className="stat-label">Taxa de conclusão</span><strong>{carregando ? '—' : `${metricas.taxa}%`}</strong><span className="stat-helper">{periodo === 'mes' ? 'visão atual' : 'visão do semestre'}</span></article>
      </section>


      <section className="dashboard-card dashboard-performance">
        <div className="card-heading">
          <div><h2>Desempenho recente</h2><p>Tarefas organizadas nos últimos seis meses</p></div>
          <span className="chart-caption">Concluídas / totais</span>
        </div>
        <div className="performance-chart" aria-label="Gráfico de tarefas por mês">
          {graficoMensal.map(item => (
            <div className="performance-column" key={item.chave}>
              <div className="performance-value">{item.total}</div>
              <div className="performance-track">
                <span className="performance-bar" style={{ height: (item.total / maiorBarra) * 100 + '%' }} />
                {item.total > 0 && <span className="performance-completed" style={{ height: (item.concluidas / item.total) * 100 + '%' }} />}
              </div>
              <span className="performance-month">{item.nome}</span>
            </div>
          ))}
        </div>
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
                  <div className="category-bar"><span style={{ width: `${(quantidade / maiorCategoria) * 100}%` }} /></div>
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
