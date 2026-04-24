import { agents } from "@/data/agents";

interface ManifestData {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  orientation: string;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
}

/**
 * Generate a PWA manifest for a specific agent.
 * Called from AgentApp/ToroaApp to dynamically set <link rel="manifest">.
 */
export function getAgentManifest(agentId: string): ManifestData {
  const agent = agents.find((a) => a.id === agentId);
  const name = agent ? `${agent.name} by Assembl` : "Assembl Agent";
  const shortName = agent?.name || "Agent";
  const color = agent?.color || "#1A3A5C";
  const role = agent?.role || "AI Assistant";

  return {
    name,
    short_name: shortName,
    description: `${shortName} — ${role}. Powered by Assembl, NZ's business intelligence platform.`,
    start_url: agentId === "operations" ? "/toroa" : `/app/${agentId}`,
    display: "standalone",
    background_color: "#F7F3EE",
    theme_color: color,
    orientation: "any",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

/**
 * Inject a dynamic manifest blob URL into the document head.
 * Returns a cleanup function to revoke the blob URL.
 */
export function setDynamicManifest(agentId: string): () => void {
  const manifest = getAgentManifest(agentId);
  const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
  const url = URL.createObjectURL(blob);

  // Remove any existing manifest link
  const existing = document.querySelector('link[rel="manifest"]');
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = url;
  document.head.appendChild(link);

  // Also update theme-color meta tag
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = manifest.theme_color;

  return () => {
    URL.revokeObjectURL(url);
    link.remove();
  };
}

/**
 * Register the service worker and wire up auto-update on new deploys.
 *
 * Behaviour:
 *  - On every page load we call `registration.update()` so a freshly-deployed
 *    sw.js is detected immediately (the SW file itself is fetched bypassing
 *    the HTTP cache because Vite + the browser treat it as the SW resource).
 *  - When a new worker reaches `installed` while there's already an active
 *    controller, we tell it to `skipWaiting` and reload the page once it
 *    takes control. End result: a deploy lands → next page load shows the
 *    new build, no manual hard-refresh required.
 */
export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    // Trigger an update check on every load.
    registration.update().catch(() => {});

    const promptUpdate = (worker: ServiceWorker) => {
      // Only prompt once an existing controller is present — first install
      // doesn't need a reload.
      if (navigator.serviceWorker.controller) {
        worker.postMessage("SKIP_WAITING");
      }
    };

    if (registration.waiting) promptUpdate(registration.waiting);

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed") promptUpdate(installing);
      });
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  } catch (err) {
    console.warn("SW registration failed:", err);
  }
}
