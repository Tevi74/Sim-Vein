const CACHE_NAME = 'simvein-v6';
const OFFLINE_URL = '/offline.html';

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css?v=6',
  '/scripts.js?v=6',
  '/manifest.webmanifest?v=6',
  '/assets/branding/logo-sim.png',
  '/assets/branding/logo-capacita.png',
  '/assets/branding/logo-haras.png'
];

const CACHEABLE_EXTENSIONS = [
  '.css', '.js', '.html', '.json',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot'
];

const ALLOWED_DOMAINS = [
  self.location.hostname,
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'aframe.io'
];

class SWManager {
  isCacheable(request) {
    if (request.method !== 'GET') return false;
    const url = new URL(request.url);
    if (!ALLOWED_DOMAINS.some(d => url.hostname.includes(d))) return false;
    return CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext)) || url.pathname === '/' ;
  }

  async cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const resp = await fetch(request);
    if (resp && resp.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, resp.clone());
    }
    return resp;
  }

  async networkFirst(request) {
    try {
      const resp = await fetch(request);
      if (resp && resp.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, resp.clone());
      }
      return resp;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.destination === 'document') return caches.match(OFFLINE_URL);
      return new Response('Offline', { status: 503 });
    }
  }

  async staleWhileRevalidate(request) {
    const cachedPromise = caches.match(request);
    const networkPromise = fetch(request).then(async resp => {
      if (resp && resp.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, resp.clone());
      }
      return resp;
    });
    const cached = await cachedPromise;
    return cached || networkPromise;
  }
}

const sw = new SWManager();

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CRITICAL_ASSETS.map(u => cache.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (!sw.isCacheable(req)) return;

  const url = new URL(req.url);
  let strategy = 'staleWhileRevalidate';
  if (url.pathname === '/' || url.pathname.endsWith('.html')) strategy = 'networkFirst';
  else if (url.pathname.startsWith('/assets/')) strategy = 'cacheFirst';

  event.respondWith((async () => {
    if (strategy === 'cacheFirst') return sw.cacheFirst(req);
    if (strategy === 'networkFirst') return sw.networkFirst(req);
    return sw.staleWhileRevalidate(req);
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Nova notificação',
    icon: '/assets/branding/logo-sim.png',
    badge: '/assets/branding/logo-sim.png'
  };
  event.waitUntil(self.registration.showNotification('SimVein', options));
});
