import { useEffect, useMemo, useState } from 'react';
import { tarefaService } from '../services/tarefaService';

const STATUS_CONCLUIDOS = ['CONCLUIDA', 'CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'];
const CATEGORIAS = { TRABALHO: 'Trabalho', ESTUDO: 'Estudo', PESSOAL: 'Pessoal' };
const dataLocal = (valor) => {
  if (!valor) return null;
  const [ano, mes, dia] = valor.slice(0, 10).split('-').map(Number);
  return ano && mes && dia ? new Date(ano, mes - 1, dia) : null;
};
const formatarData = (valor) => {
  const data = dataLocal(valor);
  return data ? data.toLocaleDateString('pt-BR') : 'Sem prazo';
};
const obterUsuarioSalvo = () => {
  try { return JSON.parse(localStorage.getItem('sgt_user') || '{}'); }
  catch { return {}; }
};

export default function Dashboard() {
  const usuario = obterUsuarioSalvo();
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [periodo, setPeriodo] = useState('semestre');

  useEffect(() => {
    let ativo = true;
    tarefaService.listarPorUsuario()
      .then((dados) => { if (ativo) setTarefas(Array.isArray(dados) ? dados : []); })
      .catch(() => { if (ativo) setErro('Não foi possível carregar os dados do dashboard.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const meses = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: 6 }, (_, indice) => {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + indice, 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      return {
        chave,
        nome: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        nomeCompleto: data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        total: 0,
        concluidas: 0,
      };
    });
  }, []);

  const graficoMensal = useMemo(() => {
    const resultado = meses.map((mes) => ({ ...mes }));
    tarefas.forEach((tarefa) => {
      const chave = tarefa.dataEntrega ? tarefa.dataEntrega.slice(0, 7) : '';
      const mes = resultado.find((item) => item.chave === chave);
      if (!mes) return;
      mes.total += 1;
      if (STATUS_CONCLUIDOS.includes(tarefa.status)) mes.concluidas += 1;
    });
    return resultado;
  }, [meses, tarefas]);

  const metricas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = periodo === 'mes'
      ? new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      : new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    const doPeriodo = tarefas.filter((tarefa) => {
      const data = dataLocal(tarefa.dataEntrega);
      return data && data >= inicio && data < fim;
    });
    const concluidas = doPeriodo.filter((tarefa) => STATUS_CONCLUIDOS.includes(tarefa.status));
    const pendentes = doPeriodo.filter((tarefa) => !STATUS_CONCLUIDOS.includes(tarefa.status));
    const atrasadas = pendentes.filter((tarefa) => {
      const data = dataLocal(tarefa.dataEntrega);
      return data && data < hoje;
    });
    const categorias = doPeriodo.reduce((acc, tarefa) => {
      const nome = CATEGORIAS[tarefa.categoria] || tarefa.categoria || 'Outras';
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {});
    const proximas = tarefas
      .filter((tarefa) => !STATUS_CONCLUIDOS.includes(tarefa.status) && dataLocal(tarefa.dataEntrega))
      .sort((a, b) => String(a.dataEntrega).localeCompare(String(b.dataEntrega)))
      .slice(0, 5);
    return {
      total: doPeriodo.length,
      concluidas: concluidas.length,
      pendentes: pendentes.length,
      atrasadas: atrasadas.length,
      taxa: doPeriodo.length ? Math.round((concluidas.length / doPeriodo.length) * 100) : 0,
      categorias,
      proximas,
    };
  }, [tarefas, periodo]);

  const maximoMensal = Math.max(...graficoMensal.map((mes) => mes.total), 1);
  const categoriasOrdenadas = Object.entries(metricas.categorias).sort((a, b) => b[1] - a[1]);
  const maxCategoria = Math.max(...categoriasOrdenadas.map((item) => item[1]), 1);

  return (
    <div className="dashboard-page dashboard-redesign">
      <header className="dashboard-header">
        <div className="dashboard-heading-copy">
          <p className="dashboard-eyebrow">SGT / VISÃO GERAL</p>
          <h1>Seu desempenho</h1>
          <p>Acompanhe seu ritmo e saiba o que merece atenção.</p>
        </div>
        <div className="period-toggle" role="group" aria-label="Período do dashboard">
          <button type="button" aria-pressed={periodo === 'mes'} className={periodo === 'mes' ? 'active' : ''} onClick={() => setPeriodo('mes')}>Este mês</button>
          <button type="button" aria-pressed={periodo === 'semestre'} className={periodo === 'semestre' ? 'active' : ''} onClick={() => setPeriodo('semestre')}>6 meses</button>
        </div>
      </header>

      {usuario.turma && <p className="dashboard-context">Resumo acadêmico <strong>{usuario.turma}</strong></p>}
      {erro && <div className="dashboard-alert" role="alert">{erro}</div>}

      <section className="dashboard-stats" aria-label="Indicadores do período">
        <article className="stat-card stat-card-completed"><span className="stat-label">Concluídas</span><strong>{carregando ? '—' : metricas.concluidas}</strong><span className="stat-helper">de {metricas.total} tarefas no período</span></article>
        <article className="stat-card stat-card-pending"><span className="stat-label">Em aberto</span><strong>{carregando ? '—' : metricas.pendentes}</strong><span className="stat-helper">ainda precisam de atenção</span></article>
        <article className="stat-card stat-card-overdue"><span className="stat-label">Atrasadas</span><strong>{carregando ? '—' : metricas.atrasadas}</strong><span className="stat-helper">com prazo ultrapassado</span></article>
        <article className="stat-card stat-card-rate"><span className="stat-label">Conclusão</span><strong>{carregando ? '—' : `${metricas.taxa}%`}</strong><span className="stat-helper">do total do período</span></article>
      </section>

      <section className="dashboard-card dashboard-performance">
        <div className="dashboard-card-heading">
          <div><p className="dashboard-section-kicker">EVOLUÇÃO</p><h2>Desempenho recente</h2><p>Quantidade de tarefas por mês, separadas por situação.</p></div>
          <div className="chart-legend"><span><i className="legend-total" /> Em aberto</span><span><i className="legend-done" /> Concluídas</span></div>
        </div>
        <div className="performance-chart" role="img" aria-label="Gráfico dos últimos seis meses. Cada barra mostra tarefas concluídas e em aberto.">
          {graficoMensal.map((mes) => {
            const abertas = mes.total - mes.concluidas;
            const altura = (mes.total / maximoMensal) * 100;
            const alturaConcluida = mes.total ? (mes.concluidas / mes.total) * altura : 0;
            return (
              <div className="performance-column" key={mes.chave} title={`${mes.nomeCompleto}: ${mes.concluidas} concluídas de ${mes.total}`}>
                <strong className="performance-value">{mes.total}</strong>
                <div className="performance-track">
                  {mes.total > 0 ? <>
                    <span className="performance-bar-open" style={{ height: `${Math.max(0, altura - alturaConcluida)}%` }} />
                    <span className="performance-bar-done" style={{ height: `${alturaConcluida}%` }} />
                  </> : <span className="performance-no-data" />}
                </div>
                <span className="performance-month">{mes.nome}</span>
                <small className="performance-detail">{mes.concluidas}/{mes.total}</small>
                <span className="sr-only">{abertas} em aberto</span>
              </div>
            );
          })}
        </div>
        <p className="chart-footnote">Os números consideram o mês do prazo de entrega de cada tarefa.</p>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-heading"><div><p className="dashboard-section-kicker">ORGANIZAÇÃO</p><h2>Tarefas por categoria</h2><p>Como suas atividades estão distribuídas.</p></div></div>
          {carregando ? <p className="dashboard-empty">Carregando dados...</p> : categoriasOrdenadas.length === 0 ? <p className="dashboard-empty">Ainda não há tarefas neste período.</p> :
            <div className="category-chart">
              {categoriasOrdenadas.map(([categoria, quantidade], indice) => (
                <div className="category-row" key={categoria}>
                  <div className="category-row-label"><span>{categoria}</span><strong>{quantidade}</strong></div>
                  <div className="category-bar"><span className={`category-fill category-fill-${indice % 3}`} style={{ width: `${(quantidade / maxCategoria) * 100}%` }} /></div>
                </div>
              ))}
            </div>}
        </article>
        <article className="dashboard-card">
          <div className="dashboard-card-heading"><div><p className="dashboard-section-kicker">PRÓXIMOS PRAZOS</p><h2>O que vem a seguir</h2><p>Suas próximas atividades em aberto.</p></div></div>
          {carregando ? <p className="dashboard-empty">Carregando...</p> : metricas.proximas.length === 0 ? <p className="dashboard-empty">Nenhuma tarefa pendente com prazo.</p> :
            <div className="upcoming-list">
              {metricas.proximas.map((tarefa) => (
                <div className="upcoming-item" key={tarefa.id}>
                  <div><strong>{tarefa.titulo}</strong><span>{CATEGORIAS[tarefa.categoria] || tarefa.categoria || 'Outras'}</span></div>
                  <time dateTime={tarefa.dataEntrega}>{formatarData(tarefa.dataEntrega)}</time>
                </div>
              ))}
            </div>}
        </article>
      </section>
    </div>
  );
}
