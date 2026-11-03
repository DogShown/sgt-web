import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Registra o service worker em produção para habilitar a experiência instalável (PWA)
// e manter o suporte a notificações push nos navegadores compatíveis.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const registrarServiceWorker = () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Não foi possível registrar o service worker do SGT:', error);
    });
  };

  if (document.readyState === 'complete') {
    registrarServiceWorker();
  } else {
    window.addEventListener('load', registrarServiceWorker, { once: true });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
