// Assembl service worker — intentionally a self-removing kill switch.
//
// History: a legacy Vite/Lovable build, and a later asset-caching worker, both
// registered a service worker at scope "/" on this origin. Returning visitors
// kept being served a STALE app shell out of the worker's cache — the homepage
// would render as the old layout (a narrow centre strip with a mis-sized
// wordmark in the corner) even though production was serving the correct new
// build. See PRs #398 and #418 for two earlier rounds of this same bug.
//
// To end this class of bug for good, this worker caches NOTHING and serves
// NOTHING. On activation it purges every cache and unregisters itself, then
// reloads any window it controls so the page comes straight from the network
// with no worker in the loop. After it has run once, the origin has no service
// worker at all, so a stale shell can never be served again.
//
// Migration: a visitor still stuck on an older worker gets fixed automatically.
// The browser re-fetches /sw.js on navigation, sees these new bytes, installs
// this worker, which immediately tears itself (and every cache) down and
// reloads the page onto the live network build.
//
// Trade-off: the SPARK "Save to home screen" prompt needs a registered service
// worker with a fetch handler, so the native install prompt will no longer fire
// (InstallPwaButton falls back to the manual "Add to Home Screen" hint). If
// richer PWA install is wanted back later, register a narrowly-scoped,
// NON-caching pass-through worker on the specific tool routes — never a
// site-wide caching worker, which is what caused the stale-shell bug.

self.addEventListener("install", () => {
  // Activate immediately instead of waiting for existing tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Delete every cache this origin ever stored — the legacy
      //    "assembl-agent-*" / "assembl-pwa-*" caches and any current one.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // 2. Remove this registration. After this, the origin is
      //    service-worker-free; no worker can intercept future loads.
      await self.registration.unregister();

      // 3. Reload the windows this worker still controls so they re-fetch from
      //    the network with no worker attached. This is what rescues a visitor
      //    who is currently looking at a stale shell.
      const clients = await self.clients.matchAll({ type: "window" });
      await Promise.all(
        clients.map((client) =>
          "navigate" in client
            ? Promise.resolve(client.navigate(client.url)).catch(() => undefined)
            : undefined,
        ),
      );
    })(),
  );
});

// Deliberately no "fetch" handler: while this worker is briefly alive it never
// calls respondWith, so it cannot serve anything — stale or otherwise — even
// before it unregisters.
