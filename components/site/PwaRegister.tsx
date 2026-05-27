"use client";

import { useEffect } from "react";

function manifestForPath(pathname: string) {
  if (pathname === "/electrify") return "/hapai/electrify/manifest.json";
  if (pathname === "/hapai/projects") return "/hapai/project-picker/manifest.json";

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

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installation should never block the site. If registration fails, the
      // app remains a normal website and can be retried on the next visit.
    });
  }, []);

  return null;
}
