import React, { useEffect, useState } from 'react';
import { tarefaService } from '../services/tarefaService';

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

const labelStatus = {
  PENDENTE: 'Pendente',
  CONCLUIDA_NO_PRAZO: 'Concluída',
  CONCLUIDA_COM_ATRASO: 'Concluída com atraso'
};

function GerenciadorTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('TRABALHO');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [dataEntrega, setDataEntrega] = useState('');

  const carregarTarefas = async () => {
    try {
      setErro('');
      setLoading(true);
      const dados = await tarefaService.listarPorUsuario();
      setTarefas(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setErro('Erro ao carregar a lista de tarefas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setCategoria('TRABALHO');
    setPrioridade('MEDIA');
    setDataEntrega('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCriando(true);

    const novaTarefaDTO = {
      titulo,
      descricao,
      categoria,
      prioridade,
      dataEntrega
    };

    try {
      await tarefaService.criar(novaTarefaDTO);
      limparFormulario();
      await carregarTarefas();
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar a tarefa.');
    } finally {
      setCriando(false);
    }
  };

  const handleConcluir = async (id) => {
    try {
      setErro('');
      await tarefaService.concluir(id);
      await carregarTarefas();
    } catch (err) {
      setErro('Erro ao concluir a tarefa.');
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        setErro('');
        await tarefaService.deletar(id);
        await carregarTarefas();
      } catch (err) {
        setErro('Erro ao excluir a tarefa.');
      }
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
            <div className="task-list">
              {[1, 2, 3].map((item) => (
                <article className="task-card task-skeleton" key={item}>
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-short" />
                  <div className="skeleton-line skeleton-meta" />
                </article>
              ))}
            </div>
          ) : tarefas.length === 0 ? (
            <div className="tasks-empty">
              <div className="tasks-empty-icon" aria-hidden="true">✓</div>
              <h3>Nenhuma tarefa por aqui</h3>
              <p>Crie sua primeira tarefa para começar a organizar sua rotina.</p>
            </div>
          ) : (
            <div className="task-list">
              {tarefas.map((tarefa) => {
                const concluida = ['CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'].includes(tarefa.status);
                const prioridadeClass = (tarefa.prioridade || 'MEDIA').toLowerCase();
                const statusClass = concluida ? 'concluida' : 'pendente';

                return (
                  <article className={`task-card ${statusClass}`} key={tarefa.id}>
                    <div className="task-card-top">
                      <div className="task-title-wrap">
                        <span className={`task-status-dot ${statusClass}`} aria-hidden="true" />
                        <div>
                          <h3>{tarefa.titulo}</h3>
                          {tarefa.descricao && <p>{tarefa.descricao}</p>}
                        </div>
                      </div>
                      <button className="task-delete" type="button" onClick={() => handleDeletar(tarefa.id)} aria-label={`Excluir tarefa ${tarefa.titulo}`}>
                        ×
                      </button>
                    </div>

                    <div className="task-meta">
                      <span className="task-badge category">{labelCategoria[tarefa.categoria] || tarefa.categoria || 'Outras'}</span>
                      <span className={`task-badge priority-${prioridadeClass}`}>{labelPrioridade[tarefa.prioridade] || tarefa.prioridade || 'Média'}</span>
                      <span className="task-date">📅 {formatarData(tarefa.dataEntrega)}</span>
                    </div>

                    <div className="task-card-bottom">
                      <span className={`task-status-label ${statusClass}`}>
                        {labelStatus[tarefa.status] || tarefa.status || 'Pendente'}
                      </span>

                      {!concluida && (
                        <button className="task-complete" type="button" onClick={() => handleConcluir(tarefa.id)} aria-label={`Marcar "${tarefa.titulo}" como concluída`}>
                          ✓ Concluir
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default GerenciadorTarefas;
