import React, { useEffect, useState, useCallback } from 'react';
import { tarefaService } from '../services/tarefaService';
import React, { useState, useEffect, useCallback } from 'react';
import { tarefaService } from '../services/tarefaService';

export default function GerenciadorTarefas({ onLogout }) {
  const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [filtroPrioridade, setFiltroPrioridade] = useState('TODAS');
  const [busca, setBusca] = useState('');

  const carregarTarefas = useCallback(async () => {
    if (!usuario?.id) {
      setCarregando(false);
      return;
    }
    try {
      setCarregando(true);
      const data = await tarefaService.listarPorUsuario(usuario.id);
      setTarefas(data || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setCarregando(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const handleConcluir = async (id) => {
    try {
      await tarefaService.concluir(id);
      carregarTarefas();
    } catch (err) {
      alert('Erro ao concluir tarefa.');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja excluir esta tarefa?')) return;
    try {
      if (tarefaService.excluir) {
        await tarefaService.excluir(id);
        carregarTarefas();
      }
    } catch (err) {
      alert('Erro ao excluir tarefa.');
    }
  };

  // Filtragem dinâmica
  const tarefasFiltradas = tarefas.filter((t) => {
    const atendeCategoria = filtroCategoria === 'TODAS' || t.categoria === filtroCategoria;
    const atendePrioridade = filtroPrioridade === 'TODAS' || t.prioridade === filtroPrioridade;
    const atendeBusca = t.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
                         t.descricao?.toLowerCase().includes(busca.toLowerCase());
    return atendeCategoria && atendePrioridade && atendeBusca;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Gerenciador de Tarefas</h2>
          <p style={{ margin: 0, color: '#666' }}>Filtre, organize e acompanhe seus prazos acadêmicos.</p>
        </div>
      </header>

      {/* Controles de Filtro e Busca */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <input 
          type="text" 
          placeholder="Buscar por título ou descrição..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ flex: 2, padding: '8px 12px', minWidth: '200px' }}
        />

        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '120px' }}>
          <option value="TODAS">Todas Categorias</option>
          <option value="TCC">TCC</option>
          <option value="TRABALHO">Trabalho</option>
          <option value="ESTUDO">Estudo</option>
          <option value="PESSOAL">Pessoal</option>
        </select>

        <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '120px' }}>
          <option value="TODAS">Todas Prioridades</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Média</option>
          <option value="BAIXA">Baixa</option>
        </select>
      </div>

      {/* Lista de Tarefas */}
      {carregando ? (
        <p>Carregando tarefas...</p>
      ) : tarefasFiltradas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '32px' }}>Nenhuma tarefa encontrada.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {tarefasFiltradas.map((t) => {
            const isConcluida = t.concluida || t.statusConclusao === 'CONCLUIDA' || t.status === 'CONCLUIDA';
            return (
              <div 
                key={t.id} 
                style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  backgroundColor: isConcluida ? '#f9f9f9' : '#fff',
                  opacity: isConcluida ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      backgroundColor: t.prioridade === 'ALTA' ? '#ffebee' : '#e8f5e9',
                      color: t.prioridade === 'ALTA' ? '#c62828' : '#2e7d32'
                    }}>
                      {t.prioridade}
                    </span>
                    <small style={{ color: '#666', fontWeight: 'bold' }}>{t.categoria}</small>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', textDecoration: isConcluida ? 'line-through' : 'none' }}>
                    {t.titulo}
                  </h3>
                  
                  {t.descricao && (
                    <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
                      {t.descricao}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
                  <small style={{ display: 'block', marginBottom: '8px', color: '#777' }}>
                    Entrega: <b>{t.dataEntrega ? new Date(t.dataEntrega).toLocaleDateString('pt-BR') : 'Sem data'}</b>
                  </small>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isConcluida && (
                      <button 
                        onClick={() => handleConcluir(t.id)} 
                        style={{ flex: 1, padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Concluir
                      </button>
                    )}
                    <button 
                      onClick={() => handleExcluir(t.id)} 
                      style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




export default function GerenciadorTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do formulário alinhados com o TarefaRequestDTO
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('TRABALHO');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [dataEntrega, setDataEntrega] = useState('');

  // Recupera dados do usuário logado (armazenado no Login.jsx)
  const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');

  const carregarTarefas = useCallback(async () => {
    if (!usuario || !usuario.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErro('');
      const dados = await tarefaService.listarPorUsuario(usuario.id);
      setTarefas(dados || []);
    } catch (err) {
      setErro('Erro ao carregar a lista de tarefas.');
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  // Enviar formulário (Criar Tarefa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!usuario?.id) {
      setErro('Sessão inválida. Faça login novamente.');
      return;
    }

    const novaTarefaDTO = {
      titulo,
      descricao,
      categoria,
      prioridade,
      dataEntrega,
      usuarioId: usuario.id
    };

    try {
      await tarefaService.criar(novaTarefaDTO);
      setTitulo('');
      setDescricao('');
      setDataEntrega('');
      setCategoria('TRABALHO');
      setPrioridade('MEDIA');
      carregarTarefas(); // Atualiza a lista
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar a tarefa.');
    }
  };

  // Concluir Tarefa
  const handleConcluir = async (id) => {
    try {
      setErro('');
      await tarefaService.concluir(id);
      carregarTarefas();
    } catch (err) {
      setErro('Erro ao concluir a tarefa.');
    }
  };

  // Deletar Tarefa
  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        setErro('');
        await tarefaService.deletar(id);
        carregarTarefas();
      } catch (err) {
        setErro('Erro ao excluir a tarefa.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px' }}>
      <h2>Gerenciador de Tarefas - SGT</h2>
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}

      {/* Formulário de Criação */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Nova Tarefa</h3>
        
        <div>
          <label htmlFor="titulo">Título:</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>

        <div>
          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            name="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label htmlFor="categoria">Categoria:</label>
            <select id="categoria" name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="TRABALHO">Trabalho</option>
              <option value="ESTUDO">Estudo</option>
              <option value="PESSOAL">Pessoal</option>
            </select>
          </div>

          <div>
            <label htmlFor="prioridade">Prioridade:</label>
            <select id="prioridade" name="prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>

          <div>
            <label htmlFor="dataEntrega">Prazo:</label>
            <input
              id="dataEntrega"
              name="dataEntrega"
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Criar Tarefa</button>
      </form>

      {/* Listagem de Tarefas */}
      <h3>Minhas Tarefas</h3>
      {loading ? (
        <p>Carregando tarefas...</p>
      ) : tarefas.length === 0 ? (
        <p>Nenhuma tarefa encontrada.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tarefas.map((t) => {
            const isConcluida = t.concluida || t.statusConclusao === 'CONCLUIDA';
            return (
              <li key={t.id} style={{ marginBottom: '15px', padding: '10px', borderBottom: '1px solid #eee' }}>
                <strong>{t.titulo}</strong> - {t.categoria} | Prioridade: {t.prioridade} | Status: {t.statusConclusao || (isConcluida ? 'Concluída' : 'Pendente')}
                <br />
                <small>Entrega: {t.dataEntrega}</small>
                <div style={{ marginTop: '5px' }}>
                  {!isConcluida && (
                    <button onClick={() => handleConcluir(t.id)} style={{ marginRight: '10px' }}>
                      Concluir
                    </button>
                  )}
                  <button onClick={() => handleDeletar(t.id)} style={{ color: 'red' }}>
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}