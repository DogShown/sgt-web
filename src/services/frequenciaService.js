import api from './api';

export const frequenciaService = {
  listar: async () => (await api.get('/frequencia')).data,
  criar: async (registro) => (await api.post('/frequencia', registro)).data,
  excluir: async (id) => api.delete(`/frequencia/${id}`)
};