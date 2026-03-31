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
 * Called from AgentApp/HelmApp to dynamically set <link rel="manifest">.
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
    start_url: agentId === "operations" ? "/helm" : `/app/${agentId}`,
    display: "standalone",
    background_color: "#09090F",
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
 * Register the service worker. Call once on app startup.
 */
export async function registerServiceWorker(): Promise<void> {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    } catch (err) {
      console.warn("SW registration failed:", err);
    }
  }
}
