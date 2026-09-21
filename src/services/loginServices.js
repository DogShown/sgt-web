import api from './api';

export const loginService = {
  // POST em /api/auth/login
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },

  // POST em /api/auth/cadastrar
  cadastrar: async (dadosUsuario) => {
    // dadosUsuario: { nome, email, senha, turma }
    const response = await api.post('/auth/cadastrar', dadosUsuario);
    return response.data;
  }
};