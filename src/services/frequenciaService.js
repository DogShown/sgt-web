import api from './api';

export const frequenciaService = {
  listar: async () => (await api.get('/frequencia')).data,
  obterConfiguracao: async () => { const response = await api.get('/frequencia/configuracao'); return response.status === 204 ? null : response.data; },
  salvarConfiguracao: async (config) => (await api.put('/frequencia/configuracao', config)).data,
  criar: async (registro) => (await api.post('/frequencia', registro)).data,
  excluir: async (id) => api.delete(`/frequencia/${id}`)
};