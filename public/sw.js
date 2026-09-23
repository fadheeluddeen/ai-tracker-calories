self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Calorie Tracker', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Calorie Tracker';
  const options = { body: data.body || '' };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
