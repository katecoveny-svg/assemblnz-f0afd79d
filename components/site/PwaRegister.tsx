'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  isTenantPwaScope,
  pwaBaseForPath,
  TENANT_CACHE_PREFIX,
} from '@/lib/pwa/tenants';
import { isVerticalWorkerScope, verticalForPath } from '@/lib/verticals/config';
import { DO_PWA_CACHE_PREFIX, isDoPwaScope } from '@/lib/do/do-service-worker';

function isDoPath(pathname: string) {
  return pathname === '/do' || pathname.startsWith('/do/');
}

function manifestForPath(pathname: string) {
  if (isDoPath(pathname)) return '/do/manifest.webmanifest';
  const vertical = verticalForPath(pathname);
  if (vertical) return `/agents/${vertical.slug}/manifest.webmanifest`;
  const hapaiMatch = pathname.match(/^\/hapai\/([^/]+)$/);
  if (hapaiMatch?.[1]) return `/hapai/${hapaiMatch[1]}/manifest.json`;

  const workflowMatch = pathname.match(/^\/w\/([^/]+)$/);
  if (workflowMatch?.[1]) return `/w/${workflowMatch[1]}/manifest.json`;

  const agentChatMatch = pathname.match(/^\/agents\/([^/]+)\/chat$/);
  if (agentChatMatch?.[1]) return `/agents/${agentChatMatch[1]}/manifest.json`;

  const tenant = pwaBaseForPath(pathname);
  if (tenant) return `${tenant.base}/manifest.webmanifest`;

  return '/manifest.webmanifest';
}

function setManifestLink(pathname: string) {
  const href = manifestForPath(pathname);
  const existing = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (existing) {
    existing.href = href;
    return;
  }

  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = href;
  document.head.appendChild(link);
}

function preserveWorker(scope: string) {
  return isTenantPwaScope(scope) || isVerticalWorkerScope(scope) || isDoPwaScope(scope);
}

function preserveCache(key: string) {
  return key.startsWith(TENANT_CACHE_PREFIX) || key.startsWith(DO_PWA_CACHE_PREFIX);
}

export function PwaRegister() {
  const pathname = usePathname();
  useEffect(() => {
    setManifestLink(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Site-wide caching workers at "/" caused stale shells (#398/#418/#431).
    // Tear down root/legacy workers, but preserve narrowly scoped PWAs:
    // tenant workspaces, vertical apps, and DO (/do/).
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          if (preserveWorker(registration.scope)) return;
          registration.unregister().catch(() => undefined);
        });
      })
      .catch(() => undefined);

    if (typeof caches !== 'undefined') {
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys.filter((key) => !preserveCache(key)).map((key) => caches.delete(key)),
          ),
        )
        .catch(() => undefined);
    }
  }, []);

  // Register DO-scoped worker on DO routes (installable PWA + offline shell).
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !isDoPath(pathname)) return;
    navigator.serviceWorker
      .register('/do/sw.js', { scope: '/do/', updateViaCache: 'none' })
      .catch(() => undefined);
  }, [pathname]);

  return null;
}
