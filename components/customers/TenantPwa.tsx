'use client';

import { useEffect } from 'react';
import { pwaBaseForPath } from '@/lib/pwa/tenants';

/**
 * TenantPwa — mounts inside a pilot workspace layout and wires that
 * workspace up as an installable, SCOPED PWA.
 *
 *   1. Points the <link rel="manifest"> at this workspace's manifest
 *      (host-aware: `/aironaut/manifest.webmanifest` on the demo host,
 *      `/customers/aironaut/manifest.webmanifest` on www).
 *   2. Registers the tenant service worker at the SAME base, so its scope is
 *      exactly this workspace — never "/" (the #431 stale-shell bug class).
 *
 * The global PwaRegister in the root layout knows to leave tenant-scoped
 * registrations and `tenant-pwa-*` caches alone (see lib/pwa/tenants.ts).
 */
export function TenantPwa({ slug }: { slug: string }) {
  useEffect(() => {
    const hit = pwaBaseForPath(window.location.pathname);
    if (!hit || hit.slug !== slug) return;
    const base = hit.base;

    // Manifest link — host-aware, replaces whatever the root layout set.
    // Next streams the root metadata <link rel="manifest"> in late, so keep a
    // short watch and rewrite EVERY manifest link to the tenant one (a stray
    // second link pointing at "/" would make the install non-deterministic).
    const href = `${base}/manifest.webmanifest`;
    const applyManifest = () => {
      const links = document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]');
      if (links.length === 0) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = href;
        document.head.appendChild(link);
        return;
      }
      links.forEach((link, i) => {
        if (i === 0) {
          if (link.getAttribute('href') !== href) link.href = href;
        } else {
          link.remove();
        }
      });
    };
    applyManifest();
    const observer = new MutationObserver(applyManifest);
    observer.observe(document.head, { childList: true });
    const stop = window.setTimeout(() => observer.disconnect(), 10000);

    // Scoped service worker. Scope defaults to the script's directory —
    // exactly the workspace base on this host.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch(() => undefined);
    }

    return () => {
      observer.disconnect();
      window.clearTimeout(stop);
    };
  }, [slug]);

  return null;
}
