"use client";

import { useEffect } from "react";
import { isTenantPwaScope, pwaBaseForPath, TENANT_CACHE_PREFIX } from "@/lib/pwa/tenants";

function manifestForPath(pathname: string) {
  const hapaiMatch = pathname.match(/^\/hapai\/([^/]+)$/);
  if (hapaiMatch?.[1]) return `/hapai/${hapaiMatch[1]}/manifest.json`;

  const workflowMatch = pathname.match(/^\/w\/([^/]+)$/);
  if (workflowMatch?.[1]) return `/w/${workflowMatch[1]}/manifest.json`;

  // Each marketplace agent's chat installs as its own app.
  const agentChatMatch = pathname.match(/^\/agents\/([^/]+)\/chat$/);
  if (agentChatMatch?.[1]) return `/agents/${agentChatMatch[1]}/manifest.json`;

  // PWA-enabled pilot workspaces install as their own tenant app. Host-aware:
  // matches both /customers/<slug>/* (www) and /<slug>/* (demo host rewrite).
  const tenant = pwaBaseForPath(pathname);
  if (tenant) return `${tenant.base}/manifest.webmanifest`;

  return "/manifest.webmanifest";
}

function setManifestLink(pathname: string) {
  const href = manifestForPath(pathname);
  const existing = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (existing) {
    existing.href = href;
    return;
  }

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = href;
  document.head.appendChild(link);
}

export function PwaRegister() {
  useEffect(() => {
    setManifestLink(window.location.pathname);

    if (!("serviceWorker" in navigator)) return;

    // We no longer ship a SITE-WIDE caching service worker. A worker at scope
    // "/" is what repeatedly served returning visitors a stale app shell (the
    // homepage rendering as the old narrow-strip layout); see public/sw.js and
    // PRs #398 and #418. We proactively tear down any root/legacy worker and
    // purge its caches so each load comes straight from the live network build.
    //
    // EXCEPTION (pilot PWAs, 2026-07): tenant workspaces register their own
    // NARROWLY-SCOPED workers (e.g. /customers/aironaut/), whose navigations
    // are network-first by design — they can never serve a stale shell for the
    // wider site because the browser only routes their own scope to them.
    // Those registrations and their `tenant-pwa-*` caches are preserved.
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          if (isTenantPwaScope(registration.scope)) return;
          registration.unregister().catch(() => undefined);
        });
      })
      .catch(() => undefined);

    if (typeof caches !== "undefined") {
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => !key.startsWith(TENANT_CACHE_PREFIX))
              .map((key) => caches.delete(key)),
          ),
        )
        .catch(() => undefined);
    }
  }, []);

  return null;
}
