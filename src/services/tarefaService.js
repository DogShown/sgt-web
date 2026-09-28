import api from './api';

export const tarefaService = {
  // Busca as tarefas do usuário autenticado
  listarPorUsuario: async () => {
    const response = await api.get('/tarefas');
    return response.data;
  },

  // Cria uma nova tarefa para o usuário autenticado
  criar: async (dadosTarefa) => {
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