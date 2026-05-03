import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Build-time version stamp. Stable per build, changes on every fresh build.
// Used to (a) bust the service worker cache on new deploys and (b) version
// kete hero asset URLs so browsers re-fetch them after a deploy.
const BUILD_ID = Date.now().toString(36);

/**
 * Vite plugin: rewrite public/sw.js at build start so the deployed service
 * worker has a fresh CACHE_NAME for every build. The browser detects the
 * byte-different sw.js, runs `activate`, deletes old caches, and from that
 * point on serves the freshly-fetched assets.
 */
function swCacheBustPlugin() {
  return {
    name: "sw-cache-bust",
    buildStart() {
      const swPath = path.resolve(__dirname, "public/sw.js");
      if (!fs.existsSync(swPath)) return;
      const src = fs.readFileSync(swPath, "utf8");
      const next = src.replace(
        /const CACHE_NAME = "assembl-agent-[^"]+";/,
        `const CACHE_NAME = "assembl-agent-${BUILD_ID}";`,
      );
      if (next !== src) fs.writeFileSync(swPath, next);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    swCacheBustPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  define: {
    // Exposed to the app as `import.meta.env.VITE_BUILD_ID` and
    // as a global `__BUILD_ID__` constant.
    __BUILD_ID__: JSON.stringify(BUILD_ID),
    "import.meta.env.VITE_BUILD_ID": JSON.stringify(BUILD_ID),
  },
}));
