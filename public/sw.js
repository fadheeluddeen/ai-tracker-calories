// Minimal service worker, only present so iOS/Chrome consider the app
// installable. No offline caching logic yet — everything just passes
// through to the network.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
