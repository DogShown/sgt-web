import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Permite abrir o frontend por outro computador da mesma rede local.
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // O proxy roda na máquina que iniciou o Vite, onde o backend fica disponível.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws-sgt': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
