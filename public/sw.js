self.addEventListener('push', (event) => {
  let data = {};

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
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: data.url || '/notificacoes' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/notificacoes',
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const sameOriginClient = clientList.find((client) => client.url.startsWith(self.location.origin));
      if (sameOriginClient) {
        sameOriginClient.navigate(targetUrl);
        return sameOriginClient.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});
