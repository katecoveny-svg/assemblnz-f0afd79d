import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exportBanner(htmlFile, outputFile, width, height) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });

  const filePath = path.resolve(__dirname, htmlFile);
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.resolve(__dirname, outputFile),
    type: 'png',
    clip: { x: 0, y: 0, width, height }
  });

  console.log(`Exported: ${outputFile} (${width}x${height})`);
  await browser.close();
}

await exportBanner('linkedin-banner.html', 'assembl-linkedin-banner.png', 1584, 396);
await exportBanner('instagram-banner.html', 'assembl-instagram-banner.png', 1080, 1080);
console.log('Done! Both banners exported.');
