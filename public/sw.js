// Service Worker para Notificaciones Push Nativas - Clínicas Limatambo Soporte TI

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Escuchar eventos Push provenientes del servidor (Backend -> FCM / APNs -> Celular)
self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 Alerta Helpdesk Limatambo',
    body: 'Tienes una nueva notificación de soporte TI.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'helpdesk-push',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'helpdesk-push',
    renotify: true,
    requireInteraction: false,
    data: data.data || { url: '/' },
    actions: [
      { action: 'ver', title: '👀 Ver Ticket' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejar cuando el usuario toca la notificación en la cortina de su celular
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = event.notification.data?.url || '/';

  // Medida de seguridad: Validar que la URL pertenezca estrictamente al mismo origen (Anti-Phishing/Open-Redirect)
  try {
    const parsed = new URL(targetUrl, self.location.origin);
    if (parsed.origin !== self.location.origin) {
      targetUrl = '/';
    } else {
      targetUrl = parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (e) {
    targetUrl = '/';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta en alguna pestaña o PWA, la enfocamos y navegamos
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Si estaba cerrada en segundo plano, abrimos la PWA
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
