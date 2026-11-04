// Version du cache : à incrémenter quand on modifie ce fichier, la liste PRECACHE,
// les icônes ou manifest.json. Changer ce numéro rend sw.js différent : le navigateur
// installe alors le nouveau service worker, qui supprime les anciens caches à l'activation.
// Inutile pour une simple modification de index.html : les pages passent par le réseau
// d'abord et leur copie en cache est mise à jour à chaque visite en ligne.
const CACHE_VERSION = 2;
const CACHE = 'educi-v' + CACHE_VERSION;
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];
// Au-delà de ce délai sans réponse du réseau, une page est servie depuis le cache
// (réveil du serveur Render, réseau mobile lent). La réponse réseau, quand elle
// arrive, met quand même le cache à jour pour la visite suivante.
const NAV_TIMEOUT_MS = 4000;

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

  // Appels API du serveur et requêtes autres que GET : jamais de cache.
  // Sans respondWith, le navigateur traite la requête normalement (réseau).
  const { origin, pathname, search } = new URL(url);
  if (e.request.method !== 'GET' ||
      (origin === self.location.origin && (pathname.startsWith('/api/') || pathname === '/verifier-acces'))) {
    return;
  }

  // Pages (index.html, /, /confidentialite…) : réseau d'abord, repli sur le cache
  // hors ligne, sur erreur serveur ou au-delà de NAV_TIMEOUT_MS.
  if (e.request.mode === 'navigate') {
    const cacheable = !search; // pas de mise en cache des URL avec paramètres (ex. /admin?key=…)
    let majCache = Promise.resolve();
    const reseau = fetch(e.request).then(r => {
      if (r.ok && cacheable) {
        const copie = r.clone(); // cloner avant de transmettre la réponse à la page
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

  // Cache First pour le reste des ressources same-origin (icônes, manifest)
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
