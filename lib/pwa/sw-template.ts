/**
 * Tenant service-worker source — generated per tenant slug and served from
 * app/customers/[slug]/sw.js/route.ts.
 *
 * ⚠️ #431 lesson (public/sw.js kill switch): a site-wide caching worker once
 * served a stale app shell for days. This worker is the opposite by design:
 *
 *   - SCOPED — registered at the workspace base (`/aironaut/` on the demo
 *     host, `/customers/aironaut/` on www), never at "/". The browser only
 *     lets it control pages inside that scope.
 *   - NAVIGATIONS are network-first. The cache is only ever a fallback when
 *     the phone is offline, so a stale shell can never shadow a live deploy.
 *   - The only cache-first traffic is content-hashed `/_next/static/*`
 *     (immutable by construction) and this tenant's own `/brand/*` images.
 *   - Cache names are versioned + tenant-prefixed (`tenant-pwa-<slug>-…`) so
 *     the global PwaRegister kill-switch can preserve exactly these and keep
 *     purging everything else.
 */

export const SW_VERSION = 'v1';

export function tenantServiceWorkerSource(slug: string): string {
  return `// assembl tenant PWA service worker — ${slug} (${SW_VERSION})
// Scoped to this workspace only. Navigations are ALWAYS network-first;
// see lib/pwa/sw-template.ts for the #431 rationale.
'use strict';

const SLUG = ${JSON.stringify(slug)};
const CACHE = 'tenant-pwa-' + SLUG + '-${SW_VERSION}';
const CACHE_PREFIX = 'tenant-pwa-' + SLUG + '-';
const MSG_DB = 'tenant-pwa-' + SLUG + '-chat';

// The scope pathname this registration actually got (host-dependent):
// '/aironaut/' on demo.assembl.co.nz, '/customers/aironaut/' on www.
const SCOPE_PATH = new URL(self.registration.scope).pathname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // Precache the workspace shell entry points (best-effort — a gate or
      // redirect response is fine to skip; runtime caching fills in later).
      const cache = await caches.open(CACHE);
      const shellUrls = [SCOPE_PATH.replace(/\\/$/, '') + '/ops'];
      await Promise.all(
        shellUrls.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (res.ok) await cache.put(url, res);
          } catch {
            /* offline install — runtime caching covers it */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop this tenant's OLD cache versions only. Never touch other keys —
      // the global kill switch owns those.
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

const isInScope = (url) => url.origin === self.location.origin && url.pathname.startsWith(SCOPE_PATH.replace(/\\/$/, ''));

// Immutable, content-hashed build assets + this workspace's brand images.
const isCacheFirstAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/brand/' + SLUG + '/') ||
    url.pathname.startsWith('/brand/pwa/' + SLUG + '/'));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1 · Navigations INSIDE the scope: network-first, cache fallback, then a
  //     tiny offline shell. Never cache-first — a live deploy always wins.
  if (req.mode === 'navigate') {
    if (!isInScope(url)) return; // outside scope: hands off entirely
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) {
            const cache = await caches.open(CACHE);
            cache.put(req, res.clone()).catch(() => undefined);
          }
          return res;
        } catch {
          const cached = await caches.match(req);
          if (cached) return cached;
          const shell = await caches.match(SCOPE_PATH.replace(/\\/$/, '') + '/ops');
          if (shell) return shell;
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>offline · assembl</title></head>' +
              '<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FBFAF6;color:#1A1918;font-family:Georgia,serif">' +
              '<div style="text-align:center"><div style="font-size:22px">you\\u2019re offline</div>' +
              '<div style="margin-top:8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.6;font-family:ui-monospace,monospace">reconnect to keep working \\u00b7 assembl</div></div></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          );
        }
      })(),
    );
    return;
  }

  // 2 · Immutable build assets + tenant brand images: cache-first.
  if (isCacheFirstAsset(url)) {
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

  // 3 · Everything else (APIs, cross-origin, other pages): untouched.
});

// ── Web push ──────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'assembl';
  const options = {
    body: payload.body || 'New activity in your workspace.',
    icon: '/brand/pwa/' + SLUG + '/icon-192.png',
    badge: '/brand/pwa/' + SLUG + '/icon-192.png',
    data: { url: payload.url || SCOPE_PATH.replace(/\\/$/, '') + '/ops' },
    tag: payload.tag || 'assembl-' + SLUG,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || SCOPE_PATH;
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if (new URL(client.url).pathname.startsWith(SCOPE_PATH.replace(/\\/$/, '')) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
`;
}
