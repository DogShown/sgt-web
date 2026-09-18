import api from './api';

export const loginService = {
  // Autentica no endpoint do AuthController (/api/auth/login)
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data; // Devolve { token, id, nome, email, turma }
  },

  // Cadastra novos usuários (/api/usuarios/cadastrar)
  cadastrar: async (dadosUsuario) => {
    // dadosUsuario: { nome, email, senha, turma }
    const response = await api.post('/usuarios/cadastrar', dadosUsuario);
    return response.data;
  }
};