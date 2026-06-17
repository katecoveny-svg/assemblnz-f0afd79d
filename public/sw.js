// Assembl service worker.
//
// History: an earlier Vite/Lovable build registered a service worker at this
// same scope ("/") that did NETWORK-FIRST navigation with a cached-HTML
// fallback. On the apex origin (assembl.co.nz) the apex→www 308/307 redirect
// is cross-origin, so a navigation fetch through the SW could not be satisfied
// by the redirected response and fell back to the SW's cached "/index.html" —
// i.e. the OLD app shell. That is why some returning visitors kept seeing the
// legacy site at assembl.co.nz while www.assembl.co.nz served the new one.
//
// Fix: this worker NEVER intercepts navigation requests. Top-level navigations
// always go straight to the network (and the browser, not the SW, handles the
// apex→www redirect), so a stale document can never be served. The SW only
// caches same-origin static assets, and on activation it deletes every cache
// that isn't the current one — which purges the legacy "assembl-agent-*" and
// "assembl-pwa-v1" caches from returning visitors automatically.
const CACHE_NAME = "assembl-pwa-v2";
const PRECACHE_URLS = [
  "/icons/assembl-icon-192x192.png",
  "/icons/assembl-icon-512x512.png",
];

const ASSET_RE = /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico|gif)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => undefined),
  );
  // Take over as soon as possible so the legacy worker stops controlling pages.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Never intercept navigations — let the browser hit the network directly so
  // redirects (notably apex→www) resolve natively and no stale HTML is served.
  if (request.mode === "navigate") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/")) return; // already content-hashed
  if (!ASSET_RE.test(url.pathname)) return; // only cache static assets

  // Stale-while-revalidate for static assets.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === "basic") {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      }),
    ),
  );
});
