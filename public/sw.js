self.addEventListener('push', (event) => {
  let data;

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: 'SGT',
      body: event.data?.text() || 'Você recebeu uma nova notificação.',
    };
  }

  const title = data.title || 'SGT';
  const options = {
    body: data.body || 'Você recebeu uma nova notificação.',
    data: { url: '/' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // O SGT usa navegação por estado, não rotas de URL para as abas internas.
  // Abrir a raiz evita enviar o usuário para uma rota que não existe no frontend.
  const targetUrl = new URL('/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const sameOriginClient = clientList.find((client) => client.url.startsWith(self.location.origin));
      if (sameOriginClient) {
        sameOriginClient.navigate(targetUrl);
        return sameOriginClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
