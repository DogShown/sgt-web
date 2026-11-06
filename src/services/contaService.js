import api from './api';

export const contaService = {
  solicitarRecuperacao: async (email) => api.post('/conta/recuperar-senha', { email }),
  redefinirSenha: async (token, novaSenha) => api.post('/conta/redefinir-senha', { token, novaSenha }),
  solicitarAlteracaoEmail: async (email) => api.post('/conta/alterar-email', { email }),
  confirmarEmail: async (token) => api.post('/conta/confirmar-email', { token }),
  excluirConta: async (senha) => api.delete('/conta', { data: { senha } })
};