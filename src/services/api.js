import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// O mesmo token é consultado nos dois mecanismos usados pelo "Lembrar de mim".
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgt_token') || sessionStorage.getItem('sgt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Uma única resposta 401 encerra a sessão local; falhas de credenciais no login
// são tratadas pelo próprio formulário e não disparam o evento global.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      window.dispatchEvent(new CustomEvent('sgt:session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
