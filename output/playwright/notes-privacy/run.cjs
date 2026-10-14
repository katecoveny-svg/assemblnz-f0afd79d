/* Portable CI runner for the frozen v1/v2 synthetic mounted-component checks.
 * No production server, auth, credential, media device or provider calls.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const repo = path.resolve(__dirname, '../../..');
const out = path.resolve(process.env.ASSEMBL_REVIEW_OUTPUT || path.join(repo, 'output/playwright/photo-notes-ci'));
const results = [];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  try {
    for (const version of ['privacy']) {
      const fixture = path.join(repo, 'output/playwright/notes-' + version);
      const evidence = path.join(out, version);
      fs.mkdirSync(evidence, { recursive: true });
      for (const file of fs.readdirSync(fixture).filter(file => file.endsWith('.json'))) fs.copyFileSync(path.join(fixture, file), path.join(evidence, file));
      execFileSync(process.execPath, [path.join(fixture, 'build.cjs')], { cwd: repo, env: process.env, stdio: 'inherit' });
      // Serve only the built harness, never arbitrary repository or environment files.
      const server = http.createServer((request, response) => {
        const name = new URL(request.url, 'http://localhost').pathname;
        const allowed = { '/': ['index.html', 'text/html'], '/bundle.js': ['bundle.js', 'text/javascript'], '/bundle.css': ['bundle.css', 'text/css'] }[name];
        if (request.method !== 'GET' || !allowed) { response.writeHead(404).end(); return; }
        response.setHeader('Content-Type', allowed[1]);
        response.end(fs.readFileSync(path.join(fixture, allowed[0])));
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      const origin = 'http://127.0.0.1:' + server.address().port;
      const context = await browser.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block', acceptDownloads: true });
      const blocked = []; const errors = [];
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === origin && route.request().method() === 'GET') return route.continue();
        // Downloads are generated locally; never permit a provider or other host.
        if (url.protocol === 'blob:' || url.protocol === 'data:') return route.continue();
        blocked.push(route.request().url()); return route.abort('blockedbyclient');
      });
      await context.routeWebSocket('**/*', socket => { blocked.push(socket.url()); socket.close(); });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(origin + (version === 'v2' ? '/?surface=life' : '/'));
        let code = fs.readFileSync(path.join(fixture, 'browser-checks.js'), 'utf8');
        code = code.replaceAll('repo/output/playwright/notes-' + version + '/', evidence.replaceAll('\\', '/') + '/');
        code = code.replaceAll('repo/output/playwright/notes/', path.join(repo, 'output/playwright/notes').replaceAll('\\', '/') + '/');
        code = code.replaceAll('http://127.0.0.1:4189', origin);
        await vm.runInThisContext('(' + code + ')', { filename: 'notes-' + version + '-checks.js' })(page);
        if (blocked.length || errors.length) throw new Error(JSON.stringify({ blocked, errors }));
        results.push({ version, status: 'passed', viewport: '375x812', blocked, pageErrors: errors });
        console.log('PASS photo notes ' + version);
      } finally {
        await context.close();
        await new Promise(resolve => server.close(resolve));
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
