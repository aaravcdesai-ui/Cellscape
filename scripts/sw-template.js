// Cellscape offline support. scripts/build_public.py fills in CACHE and PRECACHE; this file is
// only published in the public build, never served by the local backend.
const CACHE = '__CACHE__';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('cellscape-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    // Pages: always try the network so a new release shows up, and keep a copy for offline use.
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE),
        page = /\/about(\.html)?$/.test(url.pathname) ? 'about.html' : './';
      return await cache.match(request, {
        ignoreSearch: true
      }) || await cache.match(page) || Response.error();
    }));
    return;
  }
  // Scripts, styles, artwork and models: URLs carry a content version (?v=…), and the cache is
  // replaced with each release, so a cached copy is always the right one. Anything not precached
  // (such as a 3D model) is saved the first time it loads.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(request).then(hit => hit || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') cache.put(request, response.clone());
    return response;
  }))));
});
