import React, { useEffect, useState } from 'react';
import { tarefaService } from '../services/tarefaService';

function GerenciadorTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do formulário alinhados com o TarefaRequestDTO
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('TRABALHO');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [dataEntrega, setDataEntrega] = useState('');

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      const dados = await tarefaService.listarPorUsuario();
      setTarefas(dados);
    } catch (err) {
      setErro('Erro ao carregar a lista de tarefas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  // Enviar formulário (Criar Tarefa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    const novaTarefaDTO = {
      titulo,
      descricao,
      categoria,
      prioridade,
      dataEntrega
    };

    try {
      await tarefaService.criar(novaTarefaDTO);
      setTitulo('');
      setDescricao('');
      setDataEntrega('');
      carregarTarefas(); // Atualiza a lista
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar a tarefa.');
    }
  };

  // Concluir Tarefa
  const handleConcluir = async (id) => {
    try {
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
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

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
      ) : (
        <ul>
          {tarefas.map((t) => (
            <li key={t.id} style={{ marginBottom: '15px', padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{t.titulo}</strong> - {t.categoria} | Prioridade: {t.prioridade} | Status: {t.status}
              <br />
              <small>Entrega: {t.dataEntrega}</small>
              <div style={{ marginTop: '5px' }}>
                {!['CONCLUIDA_NO_PRAZO', 'CONCLUIDA_COM_ATRASO'].includes(t.status) && (
                  <button onClick={() => handleConcluir(t.id)} style={{ marginRight: '10px' }}>
                    Concluir
                  </button>
                )}
                <button onClick={() => handleDeletar(t.id)} style={{ color: 'red' }}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GerenciadorTarefas;
