const CACHE = 'educi-v1';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

// ── Install : précache des ressources statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate : supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Network only pour les appels API Claude
  if (url.includes('/api/claude') || url.includes('api.anthropic.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Ressources CDN externes : stale-while-revalidate
  if (!url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.open(CACHE).then(async c => {
        const cached = await c.match(e.request);
        const net = fetch(e.request).then(r => {
          if (r && r.status === 200) c.put(e.request, r.clone());
          return r;
        }).catch(() => null);
        return cached || await net;
      })
    );
    return;
  }

  // Cache First pour tout le reste (ressources same-origin)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }
        return r;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
