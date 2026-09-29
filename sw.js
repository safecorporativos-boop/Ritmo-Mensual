// Ritmo Mensual - Service Worker (basic offline cache)
const CACHE = 'ritmo-mensual-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/css/variables.css',
  '/src/css/base.css',
  '/src/css/themes.css',
  '/src/css/layout.css',
  '/src/css/board.css',
  '/src/css/components.css',
  '/src/js/main.js',
  '/src/js/config.js',
  '/src/js/storage.js',
  '/src/js/board.js',
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
