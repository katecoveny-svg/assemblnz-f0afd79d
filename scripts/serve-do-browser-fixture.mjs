/** Controlled loopback proof only. No retailer traffic, credentials or installed extension. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('tsx'))('esbuild');
const root = process.cwd();
await mkdir('output/playwright', { recursive: true });
await build({ entryPoints: ['test/fixtures/do-browser/entry.ts'], bundle: true, format: 'esm', outfile: 'output/playwright/fixture-bundle.js' });
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1:4198').pathname;
  let file = pathname === '/cart-fixture.html' ? 'test/fixtures/do-browser/cart-fixture.html'
    : pathname === '/fixture-bundle.js' ? 'output/playwright/fixture-bundle.js'
    : 'apps/do/extension' + pathname;
  file = path.resolve(root, file);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' }[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(body);
  } catch { response.writeHead(404).end(); }
}).listen(4198, '127.0.0.1', () => console.log('Controlled fixture: http://127.0.0.1:4198/cart-fixture.html'));
