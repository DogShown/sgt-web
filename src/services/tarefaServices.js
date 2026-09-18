import api from './api';

export const tarefaService = {
  // Busca as tarefas vinculadas ao ID do usuário logado
  listarPorUsuario: async (usuarioId) => {
    const response = await api.get(`/tarefas/usuario/${usuarioId}`);
    return response.data;
  },

  // Cria uma nova tarefa com título, categoria, prioridade e prazo
  criar: async (dadosTarefa) => {
    // dadosTarefa: { titulo, descricao, categoria, prioridade, dataEntrega, usuarioId }
    const response = await api.post('/tarefas', dadosTarefa);
    return response.data;
  },

  // Conclui uma tarefa (o backend define se foi no prazo ou com atraso)
  concluir: async (id) => {
    const response = await api.put(`/tarefas/${id}/concluir`);
    return response.data;
  },

  // Exclui uma tarefa do sistema
  deletar: async (id) => {
    await api.delete(`/tarefas/${id}`);
  }
};