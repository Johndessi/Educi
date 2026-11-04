// Version injectée par le serveur (sw-version.js) : elle change à chaque modification
// de index.html, sw.js ou manifest.json, ce qui renouvelle le cache.
const VERSION = '__SW_VERSION__';
const CACHE = 'educi-' + VERSION;
// Délai au-delà duquel une page est servie depuis le cache si le réseau ne répond pas
// (réveil du serveur Render, réseau mobile lent). La réponse réseau met quand même
// le cache à jour pour la visite suivante.
const NAV_TIMEOUT_MS = 4000;
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

  // Pages (index.html et autres navigations) : réseau d'abord, repli sur le cache
  // hors ligne, en cas d'erreur serveur ou au-delà de NAV_TIMEOUT_MS.
  if (e.request.mode === 'navigate') {
    // Pas de mise en cache des URL avec paramètres (ex. /admin?key=…)
    const cacheable = !new URL(url).search;
    let majCache = Promise.resolve();
    const reseau = fetch(e.request).then(r => {
      if (r.ok && cacheable) {
        const copie = r.clone();
        majCache = caches.open(CACHE).then(c => c.put(e.request, copie));
      }
      return r;
    });
    e.waitUntil(reseau.then(() => majCache).catch(() => {}));
    const depuisCache = () => caches.match(e.request).then(c => c || caches.match('/'));
    e.respondWith(new Promise(resolve => {
      let fini = false;
      const repondre = r => { if (!fini) { fini = true; clearTimeout(minuteur); resolve(r); } };
      // Délai dépassé : on sert le cache s'il existe, sinon on continue d'attendre le réseau
      const minuteur = setTimeout(() => depuisCache().then(c => { if (c) repondre(c); }), NAV_TIMEOUT_MS);
      reseau
        .then(r => r.ok ? repondre(r) : depuisCache().then(c => repondre(c || r)))
        .catch(() => depuisCache().then(c => repondre(c || Response.error())));
    }));
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

  // Cache First pour le reste des ressources same-origin (hors navigations)
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
