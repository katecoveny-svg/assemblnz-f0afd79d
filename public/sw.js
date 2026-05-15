const CACHE_NAME = 'toro-shell-v1';
const APP_SHELL_ASSETS = [
  '/manifest.webmanifest',
  '/icons/toro-192.png',
  '/icons/toro-512.png',
  '/icons/toro-maskable-512.png',
];

function isToroRequest(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname === '/app/toro' || url.pathname.startsWith('/app/toro/'))
  );
}

function isToroAsset(url) {
  return (
    url.origin === self.location.origin &&
    APP_SHELL_ASSETS.includes(url.pathname)
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isToroRequest(url) && !isToroAsset(url)) return;

  if (request.mode === 'navigate' && isToroRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isToroAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}
