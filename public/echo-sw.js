const CACHE = 'echo-v1';
const ASSETS = [
  '/echo.html',
  '/echo-manifest.webmanifest',
  '/echo-icon-180.png',
  '/echo-icon-192.png',
  '/echo-icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/echo')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
