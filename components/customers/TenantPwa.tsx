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
    const href = `${base}/manifest.webmanifest`;
    const existing = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (existing) {
      existing.href = href;
    } else {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = href;
      document.head.appendChild(link);
    }

    // Scoped service worker. Scope defaults to the script's directory —
    // exactly the workspace base on this host.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch(() => undefined);
    }
  }, [slug]);

  return null;
}
