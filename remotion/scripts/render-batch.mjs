import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIDEOS = [
  { id: "prism-grid", out: "/mnt/documents/PRISM-Grid-1080x1080.mp4" },
  { id: "haven-grid", out: "/mnt/documents/HAVEN-Grid-1080x1080.mp4" },
  { id: "helm-grid", out: "/mnt/documents/HELM-Grid-1080x1080.mp4" },
];

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
console.log("All 3 videos rendered!");
