import api from './api';

export const perfilService = {
  atualizar: async (dados) => {
    const response = await api.put('/auth/me', dados);
    return response.data;
  }
};
