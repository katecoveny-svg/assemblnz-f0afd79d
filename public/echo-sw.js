// Bumped to v2 for the glass rebrand — forces installed apps to re-cache the new
// echo.html on next launch (activate purges every older cache).
const CACHE = 'echo-v2';
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
  // Only the cached launcher assets are served cache-first. The new /echo chat
  // route (and everything else) goes straight to the network — never cached, so
  // the SW can't serve a stale chat shell.
  if (ASSETS.includes(url.pathname)) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
