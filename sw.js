// Ritmo Mensual - Service Worker (basic offline cache)
const CACHE = 'ritmo-mensual-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/variables.css',
  '/base.css',
  '/themes.css',
  '/layout.css',
  '/board.css',
  '/components.css',
  '/main.js',
  '/config.js',
  '/storage.js',
  '/board.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
