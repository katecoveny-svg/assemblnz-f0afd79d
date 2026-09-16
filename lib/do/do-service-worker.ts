/**
 * DO Progressive Web App — scoped service worker source.
 *
 * Scope is always `/do/` (never `/`). Follows the #431 lesson:
 * navigations are network-first so a live deploy always wins; offline
 * falls back to a tiny public shell for `/do` only. Never caches
 * `/api/*`, auth cookies payloads, or cross-scope pages — so signed-in
 * sessions stay on the network path.
 *
 * Served from `app/do/sw.js/route.ts`. Registered by `PwaRegister`
 * when the visitor is on a `/do` route.
 */

export const DO_SW_VERSION = 'do-v1';

const OFFLINE_SHELL = `<!doctype html>
<html lang="en-NZ">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#240B21"/>
<title>DO · offline</title>
<style>
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#FFFDFB;color:#240B21;
    font:18px/1.55 "Instrument Sans",ui-sans-serif,system-ui,sans-serif;padding:28px}
  main{max-width:28rem;text-align:center}
  .mark{width:64px;height:64px;margin:0 auto 18px;border-radius:22px;
    background:radial-gradient(ellipse at 25% 15%,#c995a8,#916a70 42%,#391333 72%,#240b21);
    box-shadow:0 0 22px #d6a5bd80}
  small{display:block;font:11px/1.4 "IBM Plex Mono",ui-monospace,monospace;
    letter-spacing:.12em;text-transform:uppercase;color:#916A70;margin-bottom:10px}
  h1{font-size:clamp(28px,6vw,40px);font-weight:500;letter-spacing:-.04em;margin:0 0 12px}
  p{margin:0 0 18px;color:#654A4E}
  a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 20px;
    border-radius:999px;background:#240B21;color:#FFFDFB;text-decoration:none;font-weight:500}
</style>
</head>
<body>
<main>
  <div class="mark" aria-hidden="true"></div>
  <small>assembl · DO</small>
  <h1>Ready when you reconnect.</h1>
  <p>You’re offline. DO needs a connection for prepare, transcribe and sign-in. Your device still has this shell — try again when you’re back online.</p>
  <a href="/do">Open DO</a>
</main>
</body>
</html>`;

/** Network-first DO worker — offline shell only; never shadows auth/API. */
export function doServiceWorkerSource(): string {
  return `// assembl DO PWA service worker (${DO_SW_VERSION})
// Scope: /do/ only. Navigations are network-first. See lib/do/do-service-worker.ts.
'use strict';

const CACHE = ${JSON.stringify(`do-pwa-${DO_SW_VERSION}`)};
const CACHE_PREFIX = 'do-pwa-';
const SCOPE_PATH = '/do';
const OFFLINE = ${JSON.stringify(OFFLINE_SHELL)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        const res = await fetch('/do', { credentials: 'same-origin' });
        if (res.ok) await cache.put('/do', res);
      } catch {
        /* install while offline — runtime fallback covers it */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function inDoScope(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname === SCOPE_PATH || url.pathname.startsWith(SCOPE_PATH + '/'))
  );
}

function isApiOrAuth(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/account')
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept APIs or auth — signed-in sessions stay network-only.
  if (isApiOrAuth(url)) return;

  // Dev Turbopack uses stable chunk names; stay hands-off locally.
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    if (req.mode === 'navigate' && inDoScope(url)) {
      event.respondWith(
        fetch(req).catch(
          () =>
            new Response(OFFLINE, {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
            }),
        ),
      );
    }
    return;
  }

  // Immutable content-hashed assets — cache-first.
  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone()).catch(() => undefined);
        }
        return res;
      })(),
    );
    return;
  }

  // DO navigations: network-first, then cached /do, then offline shell.
  if (req.mode === 'navigate' && inDoScope(url)) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok && (url.pathname === '/do' || url.pathname === '/do/')) {
            const cache = await caches.open(CACHE);
            cache.put('/do', res.clone()).catch(() => undefined);
          }
          return res;
        } catch {
          const cached = await caches.match('/do');
          if (cached) return cached;
          return new Response(OFFLINE, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
          });
        }
      })(),
    );
  }
});
`;
}

export function isDoPwaScope(scope: string): boolean {
  try {
    const path = new URL(scope).pathname;
    return path === '/do/' || path === '/do';
  } catch {
    return false;
  }
}

/** Cache-name prefix PwaRegister must preserve. */
export const DO_PWA_CACHE_PREFIX = 'do-pwa-';
