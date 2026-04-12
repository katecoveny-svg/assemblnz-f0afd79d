import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KETE = ["pikau", "manaaki", "arataki", "auaha", "waihanga", "haven", "toroa", "helm"];
const FORMAT = process.argv[2] || "all"; // "grid", "story", or "all"
const ONLY = process.argv[3]; // optional: single kete slug

const VIDEOS = [];
for (const k of KETE) {
  if (ONLY && k !== ONLY) continue;
  if (FORMAT === "all" || FORMAT === "grid") {
    VIDEOS.push({ id: `${k}-race-grid`, out: `/mnt/documents/${k}-race-1080x1080.mp4` });
  }
  if (FORMAT === "all" || FORMAT === "story") {
    VIDEOS.push({ id: `${k}-race-story`, out: `/mnt/documents/${k}-race-1080x1920.mp4` });
  }
}

console.log(`Rendering ${VIDEOS.length} videos...`);

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
  publicDir: path.resolve(__dirname, "../public"),
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

for (const v of VIDEOS) {
  console.log(`Rendering ${v.id}...`);
  const composition = await selectComposition({ serveUrl: bundled, id: v.id, puppeteerInstance: browser });
  await renderMedia({ composition, serveUrl: bundled, codec: "h264", outputLocation: v.out, puppeteerInstance: browser, muted: true, concurrency: 1 });
  console.log(`Done: ${v.out}`);
}

await browser.close({ silent: false });
console.log(`All ${VIDEOS.length} race videos rendered!`);
