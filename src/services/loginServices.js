import api from './api';
import loginService from '../services/loginService.js'; // ou .jsx / .ts

export const login = async (email, senha) => {
  const response = await api.post('/usuarios/login', { 
    email, 
    senha 
  });
  
  if (response.data) {
    localStorage.setItem('usuario_logado', JSON.stringify(response.data));
  }
  
  return response.data;
};