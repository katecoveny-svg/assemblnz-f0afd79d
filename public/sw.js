// Auto-rewritten on every build by vite.config.ts (swCacheBustPlugin).
// The CACHE_NAME suffix is replaced with a fresh build-time stamp at build
// start, so deploying a new build invalidates the previous cache and any
// stale kete hero / asset versions automatically.
const CACHE_NAME = "assembl-agent-moc66qj0";

const PRECACHE_URLS = ["/", "/index.html"];

// Install — precache shell, take over immediately.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Don't auto-skipWaiting on install — wait for the page to opt in via
  // postMessage("SKIP_WAITING") so we can coordinate a clean reload.
});

// Activate — delete every cache that isn't the current build's cache.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to ask the SW to skip waiting (used when a new SW is found).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/functions/")) return;
  if (url.hostname.includes("supabase")) return;

  // Stale-while-revalidate for static assets — serve cached instantly,
  // refresh from network in the background so the next visit is fresh.
  // This is what makes new kete images appear on the *next* load after a
  // deploy without forcing a hard refresh.
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request)
            .then((resp) => {
              if (resp && resp.status === 200 && resp.type === "basic") {
                cache.put(event.request, resp.clone());
              }
              return resp;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Network-first for HTML/navigation so deploys are picked up immediately.
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return resp;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((r) => r || caches.match("/index.html"))
      )
  );
});
