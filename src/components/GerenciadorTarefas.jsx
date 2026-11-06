import { useEffect, useState } from 'react';
import { tarefaService } from '../services/tarefaService';
import LoadingFeedback from './LoadingFeedback';

const formatarData = (data) => {
  if (!data) return 'Sem prazo';
  const [ano, mes, dia] = data.split('-');
  if (!ano || !mes || !dia) return data;
  return new Date(Number(ano), Number(mes) - 1, Number(dia)).toLocaleDateString('pt-BR');
};

const labelCategoria = {
  TRABALHO: 'Trabalho',
  ESTUDO: 'Estudo',
  PESSOAL: 'Pessoal'
};

const labelPrioridade = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta'
};

const statusColunas = [
  { id: 'NAO_INICIADO', titulo: 'Não iniciado' },
  { id: 'EM_ANDAMENTO', titulo: 'Em andamento' },
  { id: 'CONCLUIDA', titulo: 'Concluída' }
];

const normalizarStatus = (status) => {
  const valor = (status || '').toUpperCase();

  if (['PENDENTE', 'NAO_INICIADO', 'NAO_INICIADA'].includes(valor)) return 'NAO_INICIADO';
  if (['EM_ANDAMENTO', 'ANDAMENTO'].includes(valor)) return 'EM_ANDAMENTO';
  if (['CONCLUIDA', 'CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'].includes(valor)) return 'CONCLUIDA';

  return 'NAO_INICIADO';
};

const labelStatus = {
  NAO_INICIADO: 'Não iniciado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  PENDENTE: 'Não iniciado',
  CONCLUIDA_NO_PRAZO: 'Concluída',
  CONCLUIDA_COM_ATRASO: 'Concluída com atraso'
};

function GerenciadorTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [criando, setCriando] = useState(false);
  const [tarefaEmOperacao, setTarefaEmOperacao] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('TRABALHO');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [dataEntrega, setDataEntrega] = useState('');

  const carregarTarefas = async () => {
    try {
      const dados = await tarefaService.listarPorUsuario();
      const tarefasNormalizadas = Array.isArray(dados)
        ? dados.map((tarefa) => ({ ...tarefa, status: normalizarStatus(tarefa.status) }))
        : [];
      setTarefas(tarefasNormalizadas);
    } catch {
      setErro('Erro ao carregar a lista de tarefas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // A carga é assíncrona; os estados mudam após a resposta da API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarTarefas();
  }, []);

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setCategoria('TRABALHO');
    setPrioridade('MEDIA');
    setDataEntrega('');
  };

  const tarefasPorColuna = statusColunas.reduce((acumulador, coluna) => {
    acumulador[coluna.id] = tarefas.filter((tarefa) => normalizarStatus(tarefa.status) === coluna.id);
    return acumulador;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    if (!titulo.trim()) {
      setErro('Informe um título válido para a tarefa.');
      return;
    }
    setCriando(true);

    const novaTarefaDTO = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      prioridade,
      dataEntrega,
      status: 'NAO_INICIADO'
    };

    try {
      await tarefaService.criar(novaTarefaDTO);
      limparFormulario();
      setSucesso('Tarefa criada com sucesso.');
      await carregarTarefas();
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar a tarefa.');
    } finally {
      setCriando(false);
    }
  };

  const handleAlterarStatus = async (id, status) => {
    if (tarefaEmOperacao === id) return;
    try {
      setTarefaEmOperacao(id);
      setErro('');
      setSucesso('');
      const anterior = tarefas.find(t => t.id === id);
      setTarefas(lista => lista.map(t => t.id === id ? { ...t, status: normalizarStatus(status) } : t));
      setSucesso(status === 'EM_ANDAMENTO' ? 'Tarefa movida para Em andamento.' : 'Tarefa movida para Não iniciado.');
      await tarefaService.alterarStatus(id, status);
      if (anterior) await carregarTarefas();
    } catch (error) {
      await carregarTarefas();
      setErro(error.response?.data?.message || 'Não foi possível atualizar o status da tarefa. A alteração foi revertida.');
    } finally {
      setTarefaEmOperacao(null);
    }
  };

  const handleConcluir = async (id) => {
    if (tarefaEmOperacao === id) return;
    try {
      setTarefaEmOperacao(id);
      setErro('');
      setSucesso('');
      setTarefas(lista => lista.map(t => t.id === id ? { ...t, status: 'CONCLUIDA' } : t));
      setSucesso('Tarefa marcada como concluída.');
      await tarefaService.concluir(id);
      await carregarTarefas();
    } catch (error) {
      await carregarTarefas();
      setErro(error.response?.data?.message || 'Erro ao concluir a tarefa. A alteração foi revertida.');
    } finally {
      setTarefaEmOperacao(null);
    }
  };

  const handleDeletar = async (id) => {
    if (tarefaEmOperacao === id || !window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) return;
    try {
      setTarefaEmOperacao(id);
      setErro('');
      setSucesso('');
      const tarefaRemovida = tarefas.find(t => t.id === id);
      setTarefas(lista => lista.filter(t => t.id !== id));
      await tarefaService.deletar(id);
      setSucesso('Tarefa excluída.');
      if (tarefaRemovida) await carregarTarefas();
    } catch (error) {
      await carregarTarefas();
      setErro(error.response?.data?.message || 'Erro ao excluir a tarefa. A tarefa foi restaurada na lista.');
    } finally {
      setTarefaEmOperacao(null);
    }
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <p className="dashboard-eyebrow">SGT • Organização</p>
          <h1>Tarefas</h1>
          <p>Organize, acompanhe e conclua suas atividades em um só lugar.</p>
        </div>
        <div className="tasks-summary">
          <span>{tarefas.length}</span>
          <small>{tarefas.length === 1 ? 'tarefa cadastrada' : 'tarefas cadastradas'}</small>
        </div>
      </header>

      {erro && <div className="dashboard-alert" role="alert">{erro}</div>}
      {sucesso && <div className="task-success-message" role="status" aria-live="polite">{sucesso}</div>}

      <section className="tasks-layout">
        <article className="task-form-card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Nova atividade</p>
              <h2>Criar tarefa</h2>
              <p>Adicione os detalhes e defina o prazo.</p>
            </div>
            <span className="task-form-icon" aria-hidden="true">+</span>
          </div>

          <form className="task-form" onSubmit={handleSubmit} aria-busy={criando}>
            <label className="form-field">
              <span>Título</span>
              <input
                id="titulo"
                name="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Trabalho de Matemática"
                maxLength={100}
                required
              />
            </label>

            <label className="form-field">
              <span>Descrição</span>
              <textarea
                id="descricao"
                name="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o que precisa ser feito..."
                rows="4"
              />
            </label>

            <div className="task-form-row">
              <label className="form-field">
                <span>Categoria</span>
                <select id="categoria" name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="TRABALHO">Trabalho</option>
                  <option value="ESTUDO">Estudo</option>
                  <option value="PESSOAL">Pessoal</option>
                </select>
              </label>

              <label className="form-field">
                <span>Prioridade</span>
                <select id="prioridade" name="prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                </select>
              </label>
            </div>

            <label className="form-field">
              <span>Prazo de entrega</span>
              <input
                id="dataEntrega"
                name="dataEntrega"
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                required
              />
            </label>

            <button className="btn-primary btn-full task-submit" type="submit" disabled={criando}>
              <span aria-hidden="true">{criando ? '…' : '+'}</span>
              {criando ? 'Criando tarefa...' : 'Criar tarefa'}
            </button>
          </form>
        </article>

        <section className="task-list-section">
          <div className="section-title-row">
            <div>
              <p className="section-kicker">Sua rotina</p>
              <h2>Minhas tarefas</h2>
            </div>
            {!loading && <span className="task-count">{tarefas.length}</span>}
          </div>

          {loading ? (
            <LoadingFeedback variant="tasks" label="Carregando suas tarefas" />
          ) : (
            <div className="kanban-board">
              {statusColunas.map((coluna) => (
                <div key={coluna.id} className="kanban-column">
                  <div className="kanban-column-header">
                    <div className="kanban-column-title">
                      <span className={`kanban-dot ${coluna.id.toLowerCase()}`} aria-hidden="true" />
                      <h3>{coluna.titulo}</h3>
                    </div>
                    <span className="kanban-count">{tarefasPorColuna[coluna.id]?.length || 0}</span>
                  </div>
                  <div className="kanban-column-body">
                    {(!tarefasPorColuna[coluna.id] || tarefasPorColuna[coluna.id].length === 0) ? (
                      <div className="kanban-empty-state"><p>Nenhuma tarefa nesta etapa.</p></div>
                    ) : (
                      tarefasPorColuna[coluna.id].map((tarefa) => {
                        const concluida = normalizarStatus(tarefa.status) === 'CONCLUIDA';
                        const prioridadeClass = (tarefa.prioridade || 'MEDIA').toLowerCase();
                        return (
                          <article className={`task-card ${concluida ? 'concluida' : ''}`} key={tarefa.id}>
                            <div className="task-card-top">
                              <div className="task-title-wrap">
                                <span className={`task-status-dot ${concluida ? 'concluida' : ''}`} aria-hidden="true" />
                                <div><h3>{tarefa.titulo}</h3>{tarefa.descricao && <p>{tarefa.descricao}</p>}</div>
                              </div>
                              <button className="task-delete" type="button" onClick={() => handleDeletar(tarefa.id)} disabled={tarefaEmOperacao === tarefa.id} aria-label={`Excluir tarefa ${tarefa.titulo}`}>×</button>
                            </div>
                            <div className="task-meta">
                              <span className="task-badge category">{labelCategoria[tarefa.categoria] || tarefa.categoria || 'Outras'}</span>
                              <span className={`task-badge priority-${prioridadeClass}`}>{labelPrioridade[tarefa.prioridade] || tarefa.prioridade || 'Média'}</span>
                              <span className="task-date"><span aria-hidden="true">📅</span> {formatarData(tarefa.dataEntrega)}</span>
                            </div>
                            <div className="task-card-bottom">
                              <span className={`task-status-label ${concluida ? 'concluida' : ''}`}>{labelStatus[normalizarStatus(tarefa.status)] || 'Pendente'}</span>
                              {!concluida && (
                                <div className="task-actions">
                                  {normalizarStatus(tarefa.status) === 'NAO_INICIADO' ? (
                                    <button className="task-status-action" type="button" onClick={() => handleAlterarStatus(tarefa.id, 'EM_ANDAMENTO')} disabled={tarefaEmOperacao === tarefa.id}>Iniciar</button>
                                  ) : (
                                    <button className="task-status-action" type="button" onClick={() => handleAlterarStatus(tarefa.id, 'PENDENTE')} disabled={tarefaEmOperacao === tarefa.id}>Não iniciado</button>
                                  )}
                                  <button className="task-complete" type="button" onClick={() => handleConcluir(tarefa.id)} disabled={tarefaEmOperacao === tarefa.id} aria-label={`Marcar "${tarefa.titulo}" como concluída`}>✓ Concluir</button>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default GerenciadorTarefas;
