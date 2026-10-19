const CACHE = 'reino-encantado-v3';
const CORE = [
  './', './index.html', './styles/app.css',
  './js/config.js', './js/store.js', './js/audio.js', './js/art-core.js',
  './js/art-library.js', './js/ads.js', './js/app.js',
  './manifest.webmanifest', './icons/app-icon.svg', './icons/app-icon-maskable.svg',
  './privacy.html', './support.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* rede primeiro: garante que uma atualização do app chega sem depender de limpar cache.
     sem rede (modo avião), cai no cache — o jogo inteiro funciona offline. */
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
