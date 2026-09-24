import React, { useState, useEffect, useCallback } from 'react';
import { tarefaService } from '../services/tarefaService';
import { animate, stagger } from 'animejs'; // 👈 Sintaxe correta para Anime.js v4

export default function Dashboard({ onLogout }) {
  const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário de nova tarefa
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('TCC');
  const [prioridade, setPrioridade] = useState('ALTA');
  const [dataEntrega, setDataEntrega] = useState('');

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
      alert('Erro ao carregar tarefas.');
    } finally {
      setCarregando(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  // Animação com Anime.js v4
  useEffect(() => {
    if (!carregando) {
      animate('.metric-card', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(100), // 👈 Uso da função stagger importada
        easing: 'outQuad',
        duration: 600
      });
    }
  }, [carregando]);

  // Métricas calculadas dinamicamente
  const concluidas = tarefas.filter(t => t.concluida || t.statusConclusao === 'CONCLUIDA' || t.status === 'CONCLUIDA').length;
  const pendentes = tarefas.filter(t => !t.concluida && t.statusConclusao !== 'CONCLUIDA' && t.status !== 'CONCLUIDA').length;
  const total = tarefas.length;
  const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const handleCriarTarefa = async (e) => {
    e.preventDefault();
    if (!usuario?.id) return;

    try {
      await tarefaService.criar({
        titulo,
        descricao,
        categoria,
        prioridade,
        dataEntrega,
        usuarioId: usuario.id
      });
      setTitulo('');
      setDescricao('');
      setDataEntrega('');
      setCategoria('TCC');
      setPrioridade('ALTA');
      carregarTarefas();
    } catch (err) {
      alert('Erro ao criar tarefa.');
    }
  };

  const handleConcluir = async (id) => {
    try {
      await tarefaService.concluir(id);
      carregarTarefas();
    } catch (err) {
      alert('Erro ao concluir tarefa.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Painel SGT - {usuario.nome || 'Usuário'}</h2>
          {usuario.turma && <p style={{ margin: 0, color: '#666' }}>Turma: {usuario.turma}</p>}
        </div>
        {onLogout && (
          <button onClick={onLogout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        )}
      </header>

      {/* Cards de Métricas Animados */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <span className="value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block' }}>{concluidas}</span>
          <span className="label" style={{ fontSize: '14px', color: '#666' }}>Concluídas</span>
        </div>
        <div className="metric-card" style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <span className="value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block' }}>{pendentes}</span>
          <span className="label" style={{ fontSize: '14px', color: '#666' }}>Pendentes</span>
        </div>
        <div className="metric-card" style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <span className="value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block' }}>{taxaConclusao}%</span>
          <span className="label" style={{ fontSize: '14px', color: '#666' }}>Taxa de Conclusão</span>
        </div>
      </div>

      {/* Formulário de Cadastro de Tarefa */}
      <section style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '32px' }}>
        <h3>Nova Tarefa</h3>
        <form onSubmit={handleCriarTarefa}>
          <input 
            type="text" 
            placeholder="Título" 
            value={titulo} 
            onChange={e => setTitulo(e.target.value)} 
            required 
            style={{ width: '100%', marginBottom: '8px', padding: '8px', boxSizing: 'border-box' }} 
          />
          <textarea 
            placeholder="Descrição" 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
            style={{ width: '100%', marginBottom: '8px', padding: '8px', boxSizing: 'border-box' }} 
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input 
              type="date" 
              value={dataEntrega} 
              onChange={e => setDataEntrega(e.target.value)} 
              required 
              style={{ padding: '8px', flex: 1 }} 
            />
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ padding: '8px' }}>
              <option value="TCC">TCC</option>
              <option value="TRABALHO">Trabalho</option>
              <option value="ESTUDO">Estudo</option>
              <option value="PESSOAL">Pessoal</option>
            </select>
            <select value={prioridade} onChange={e => setPrioridade(e.target.value)} style={{ padding: '8px' }}>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Adicionar Tarefa
          </button>
        </form>
      </section>

      {/* Listagem de Tarefas */}
      <section>
        <h3>Suas Tarefas</h3>
        {carregando ? (
          <p>Carregando...</p>
        ) : tarefas.length === 0 ? (
          <p>Nenhuma tarefa cadastrada.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tarefas.map(t => {
              const isConcluida = t.concluida || t.statusConclusao === 'CONCLUIDA' || t.status === 'CONCLUIDA';
              return (
                <li key={t.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{t.titulo}</strong> - <small>{t.categoria} ({t.prioridade})</small>
                    <br />
                    <small>Entrega: {t.dataEntrega} | Status: <b>{isConcluida ? 'CONCLUÍDA' : 'PENDENTE'}</b></small>
                  </div>
                  {!isConcluida && (
                    <button onClick={() => handleConcluir(t.id)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Concluir
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}