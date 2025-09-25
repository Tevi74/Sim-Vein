const CACHE_NAME = 'simvein-v2';
const OFFLINE_URL = '/public/offline.html';

// Assets críticos - CAMINHOS CORRETOS para sua estrutura
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css', 
  '/scripts.js',
  '/manifest.webmanifest',
  '/public/offline.html',
  '/public/assets/branding/logo-sim.png',
  '/public/assets/branding/logo-capacita.png',
  '/public/assets/branding/logo-haras.png'
];

// Extensões para cache dinâmico
const CACHEABLE_EXTENSIONS = [
  '.css', '.js', '.html', '.json', 
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot'
];

// Domínios permitidos para cache
const ALLOWED_DOMAINS = [
  self.location.hostname,
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

class SWManager {
  constructor() {
    this.isOnline = true;
  }

  // Verifica se a URL é cacheável
  isCacheable(request) {
    const url = new URL(request.url);
    
    // Apenas requisições GET e mesmo origem/domínios permitidos
    if (request.method !== 'GET') return false;
    if (!ALLOWED_DOMAINS.some(domain => url.hostname.includes(domain))) return false;
    
    // Verifica extensões cacheáveis
    return CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
  }

  // Estratégia: Cache First com fallback para network
  async cacheFirst(request) {
    try {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      const response = await fetch(request);
      
      if (response && response.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      console.warn('Cache First failed:', error);
      throw error;
    }
  }

  // Estratégia: Network First com fallback para cache
  async networkFirst(request) {
    try {
      const response = await fetch(request);
      
      if (response && response.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      }
      
      throw new Error('Network response not OK');
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      
      // Para páginas, retorna offline page
      if (request.destination === 'document') {
        return caches.match(OFFLINE_URL);
      }
      
      throw error;
    }
  }

  // Estratégia: Stale While Revalidate (Performance)
  async staleWhileRevalidate(request) {
    try {
      const [cached, network] = await Promise.allSettled([
        caches.match(request),
        fetch(request).then(async response => {
          if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
      ]);

      return cached.status === 'fulfilled' && cached.value ? 
             cached.value : network.value;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw error;
    }
  }
}

const swManager = new SWManager();

// === EVENT LISTENERS ===

// Instalação
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache de assets críticos
      await Promise.allSettled(
        CRITICAL_ASSETS.map(url => 
          cache.add(url).catch(err => 
            console.warn(`Failed to cache ${url}:`, err)
          )
        )
      );
      
      // Ativação imediata
      await self.skipWaiting();
      console.log('Service Worker installed successfully');
    })()
  );
});

// Ativação
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      // Limpa caches antigos
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
      
      // Assume controle de todas as abas abertas
      await self.clients.claim();
      console.log('Service Worker activated and controlling clients');
    })()
  );
});

// Fetch
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET e não-cacheáveis
  if (!swManager.isCacheable(event.request)) {
    return;
  }

  const request = event.request;
  const url = new URL(request.url);

  // Estratégias diferentes por tipo de recurso
  let strategy;
  
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    // Páginas HTML: Network First (para conteúdo atualizado)
    strategy = 'networkFirst';
  } else if (url.pathname.includes('/assets/')) {
    // Assets estáticos: Cache First (não mudam frequentemente)
    strategy = 'cacheFirst';
  } else {
    // Demais recursos: Stale While Revalidate (balanceado)
    strategy = 'staleWhileRevalidate';
  }

  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case 'cacheFirst':
            return await swManager.cacheFirst(request);
          case 'networkFirst':
            return await swManager.networkFirst(request);
          case 'staleWhileRevalidate':
            return await swManager.staleWhileRevalidate(request);
          default:
            return await fetch(request);
        }
      } catch (error) {
        console.error(`Strategy ${strategy} failed:`, error);
        
        // Fallback genérico
        if (request.destination === 'document') {
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
        }
        
        // Retorna resposta de erro genérica
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Mensagens (para comunicação com a app)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Controle de conectividade
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});

// Notificações push (se necessário no futuro)
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Nova notificação',
    icon: '/public/assets/branding/logo-sim.png',
    badge: '/public/assets/branding/logo-sim.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('SimVein', options)
  );
});
