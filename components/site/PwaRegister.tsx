"use client";

import { useEffect } from "react";

function manifestForPath(pathname: string) {
  const hapaiMatch = pathname.match(/^\/hapai\/([^/]+)$/);
  if (hapaiMatch?.[1]) return `/hapai/${hapaiMatch[1]}/manifest.json`;

  const workflowMatch = pathname.match(/^\/w\/([^/]+)$/);
  if (workflowMatch?.[1]) return `/w/${workflowMatch[1]}/manifest.json`;

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

    // We no longer ship a caching service worker. A worker at scope "/" is what
    // repeatedly served returning visitors a stale app shell (the homepage
    // rendering as the old narrow-strip layout); see public/sw.js and PRs #398
    // and #418. Instead of registering one, we proactively tear down any worker
    // that is still registered on this origin and purge every cache, so each
    // load comes straight from the live network build. /sw.js itself is now a
    // self-unregistering kill switch that covers visitors who never reach this
    // code (their browser auto-updates the worker script on navigation).
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => undefined);
        });
      })
      .catch(() => undefined);

    if (typeof caches !== "undefined") {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined);
    }
  }, []);

  return null;
}
