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
    if (process.env.NODE_ENV !== "production") return;

    // Reload exactly once when a new worker takes control, so a visitor still
    // being served by a stale (legacy) worker lands on the fresh app without a
    // manual hard-refresh.
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        // Force an update check on every load. This is what evicts the legacy
        // "assembl-agent-*" worker that some returning visitors are still stuck
        // on — it re-fetches /sw.js from the network (updateViaCache: "none"),
        // installs the new worker, which skipWaiting()s and claims the page.
        registration.update().catch(() => undefined);
      })
      .catch(() => {
        // Installation should never block the site. If registration fails, the
        // app remains a normal website and can be retried on the next visit.
      });
  }, []);

  return null;
}
