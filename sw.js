const CACHE_NAME = 'sim-vein-cache-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/sim/engine.js',
  '/ia/tutor.js',
  '/public/imagens/logo-sim.png',
  '/public/imagens/logo-instituto.png',
  '/public/imagens/logo-harastech.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((resp) => resp || fetch(e.request)));
});
