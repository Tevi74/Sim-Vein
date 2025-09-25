const CACHE = 'simvein-v1';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/scripts.js', '/manifest.webmanifest',
  '/public/assets/branding/logo-sim.png',
  '/public/assets/branding/logo-capacita.png',
  '/public/assets/branding/logo-haras.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=> r))
  );
});
