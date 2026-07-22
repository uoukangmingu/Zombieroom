const BUILD = '62.0';
const CACHE_NAME = `boxhead-backroom-low-v${BUILD}-network-first`;
const CORE_ASSETS = [
  `./index.html?build=${BUILD}`,
  './config.js',
  `./style.css?v=${BUILD}`,
  `./game.bundle.js?v=${BUILD}`,
  `./v59.patch.js?v=${BUILD}`,
  `./v60.patch.js?v=${BUILD}`,
  `./v61.patch.js?v=${BUILD}`,
  `./v62.patch.js?v=${BUILD}`, 
  './version.json',
  './manifest.webmanifest',
  './assets/boxhead-icon-64.png',
  './assets/boxhead-icon-192.png',
  './assets/boxhead-icon-256.png',
  './assets/boxhead-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async asset => {
      try {
        const response = await fetch(new Request(asset, { cache:'reload' }));
        if (response.ok) await cache.put(asset, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('boxhead-backroom-low-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache:'no-store' });
    if (response && response.ok) eventWaitlessPut(cache, request, response.clone());
    return response;
  } catch (_) {
    return (await cache.match(request)) || (request.mode === 'navigate' ? cache.match(`./index.html?build=${BUILD}`) : Response.error());
  }
}

function eventWaitlessPut(cache, request, response) {
  cache.put(request, response).catch(() => {});
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const mutable = event.request.mode === 'navigate' || ['document','script','style','manifest'].includes(event.request.destination) || /(?:version\.json|config\.js|sw\.js)$/.test(url.pathname);
  if (mutable) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response?.ok) eventWaitlessPut(cache, event.request, response.clone());
      return response;
    } catch (_) { return Response.error(); }
  })());
});
