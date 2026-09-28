import React, { useState, useEffect } from 'react';
import { tarefaService } from '../services/tarefaService';

export default function Dashboard({ onLogout }) {
  const usuario = JSON.parse(localStorage.getItem('sgt_user') || '{}');
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Form de nova tarefa
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('TCC');
  const [prioridade, setPrioridade] = useState('ALTA');
  const [dataEntrega, setDataEntrega] = useState('');

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      const data = await tarefaService.listarPorUsuario();
      setTarefas(data);
    } catch (err) {
      alert('Erro ao carregar tarefas.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCriarTarefa = async (e) => {
    e.preventDefault();
    try {
      await tarefaService.criar({
        titulo,
        descricao,
        categoria,
        prioridade,
        dataEntrega,
      });
      setTitulo('');
      setDescricao('');
      setDataEntrega('');
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
        <h2>Painel SGT - {usuario.nome} (Turma: {usuario.turma})</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>Sair</button>
      </header>

      {/* Form de Cadastro de Tarefa */}
      <section style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '32px' }}>
        <h3>Nova Tarefa</h3>
        <form onSubmit={handleCriarTarefa}>
          <input type="text" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} required style={{ width: '100%', marginBottom: '8px', padding: '8px' }} />
          <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} style={{ width: '100%', marginBottom: '8px', padding: '8px' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
            <select value={prioridade} onChange={e => setPrioridade(e.target.value)} style={{ padding: '8px' }}>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Adicionar Tarefa</button>
        </form>
      </section>

      {/* Lista de Tarefas */}
      <section>
        <h3>Suas Tarefas</h3>
        {carregando ? <p>Carregando...</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tarefas.map(t => (
              <li key={t.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{t.titulo}</strong> - <small>{t.categoria} ({t.prioridade})</small>
                  <br />
                  <small>Entrega: {t.dataEntrega} | Status: <b>{t.status}</b></small>
                </div>
                {t.status === 'PENDENTE' && (
                  <button onClick={() => handleConcluir(t.id)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Concluir</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}