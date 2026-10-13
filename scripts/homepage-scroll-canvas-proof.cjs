// Deterministic state/paint proof against the running shipping page. No private/provider calls.
// PLAYWRIGHT_MODULE, CHROMIUM_PATH, PROOF_BROWSER, HOMEPAGE_URL and PROOF_OUTPUT are optional.
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const engine = process.env.PROOF_BROWSER || 'chromium';
const output = process.env.PROOF_OUTPUT || 'output/playwright/homepage-regression';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await ({ chromium, webkit }[engine]).launch({ ...(process.env.PROOF_CHANNEL ? { channel: process.env.PROOF_CHANNEL } : {}), ...(engine === 'chromium' && process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: engine === 'chromium' ? ['--enable-unsafe-swiftshader'] : [] });
  const results = [];
  const persist = () => fs.writeFileSync(`${output}/${engine}-results.json`, JSON.stringify(results, null, 2));
  try {
    for (const width of (process.env.PROOF_WIDTHS === 'none' ? [] : (process.env.PROOF_WIDTHS || '375,390,430').split(',').map(Number))) for (const mode of ['normal', 'blocked']) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const record = { width, mode, status: 'running', captures: [], errors: [] }; results.push(record); persist();
      page.on('pageerror', e => record.errors.push(e.message));
      await page.addInitScript(() => {
        let seed = 7; Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
        // Preserve only for pixel readback; production keeps its normal drawing buffer policy.
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, options) {
          const gl = get.call(this, type, /webgl/.test(type) ? { ...options, preserveDrawingBuffer: true } : options);
          if (gl && /webgl/.test(type) && !gl.__proof) {
            gl.__proof = true; window.__uploads = [];
            const sources = new WeakMap();
            for (const method of ['texImage2D', 'texSubImage2D']) {
            const upload = gl[method].bind(gl);
            gl[method] = (...args) => {
              const source = args.at(-1);
              if (source instanceof HTMLImageElement || source instanceof HTMLVideoElement) {
                const info = { tag: source.tagName, src: source.currentSrc || source.src };
                window.__uploads.push(info); sources.set(gl.getParameter(gl.TEXTURE_BINDING_2D), info);
              }
              return upload(...args);
            };
            }
            for (const method of ['drawElements', 'drawArrays']) {
              const draw = gl[method].bind(gl);
              gl[method] = (...args) => {
                const program = gl.getParameter(gl.CURRENT_PROGRAM);
                const sampler = program && gl.getUniformLocation(program, 'tPlate');
                if (sampler) {
                  const active = gl.getParameter(gl.ACTIVE_TEXTURE);
                  gl.activeTexture(gl.TEXTURE0 + gl.getUniform(program, sampler));
                  window.__plateDrawSource = sources.get(gl.getParameter(gl.TEXTURE_BINDING_2D));
                  gl.activeTexture(active);
                }
                return draw(...args);
              };
            }
          }
          return gl;
        };
      });
      await page.route('**/*', route => route.request().method() !== 'GET' || (mode === 'blocked' && /\.(mp4|webm)(?:\?|$)/.test(route.request().url())) ? route.abort() : route.continue());
      await page.goto(process.env.HOMEPAGE_URL || 'http://localhost:3077/', { waitUntil: 'load' });
      await page.waitForSelector('.direction-4c[data-ready]', { timeout: 45000 });
      if (mode === 'normal') await page.waitForSelector('.direction-4c[data-video-ready]');
      await page.evaluate(() => document.fonts.ready);
      const pixels = () => page.evaluate(() => {
        const canvas = document.querySelector('[data-ref="canvasRef"]');
        const scratch = document.createElement('canvas'); scratch.width = scratch.height = 8;
        const ctx = scratch.getContext('2d'); ctx.drawImage(canvas, 0, 0, 8, 8);
        return Array.from(ctx.getImageData(0, 0, 8, 8).data);
      });
      const shot = async label => {
        const painted = await pixels(); assert(painted.some((v, i) => i % 4 !== 3 && v > 0), `${label}: canvas must paint colour`);
        const file = `${engine}-${width}-${mode}-${label}.png`;
        await page.screenshot({ path: `${output}/${file}` });
        record.captures.push({ file, painted, state: await page.evaluate(() => ({ root: document.querySelector('.direction-4c').dataset, video: { paused: document.querySelector('video').paused, readyState: document.querySelector('video').readyState }, uploads: window.__uploads.slice(-4), paintedSource: window.__plateDrawSource })) }); persist();
      };
      const scroll = async p => {
        await page.evaluate(p => { document.documentElement.style.scrollBehavior = 'auto'; document.body.style.scrollBehavior = 'auto'; scrollTo({ top: (document.querySelector('#top').offsetHeight - innerHeight) * p, behavior: 'instant' }); }, p);
        await page.waitForFunction(p => Math.abs(scrollY / (document.querySelector('#top').offsetHeight - innerHeight) - p) < .002, p);
        await page.waitForTimeout(350);
      };
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('.direction-4c').evaluate(el => el.textContent.includes('↗')), false);
      for (const p of [0, .5, .65, .7, .76, .82, .95]) {
        await scroll(p);
        const opacity = await page.locator('[data-ref="msgRef"]').evaluate(el => Number(getComputedStyle(el).opacity));
        assert.equal(opacity, p >= .64 ? 1 : 0, `readability at ${p}`);
        await shot(`p${Math.round(p * 100)}`);
      }
      if (mode === 'blocked') assert(await page.evaluate(() => window.__plateDrawSource?.tag === 'IMG' && window.__plateDrawSource.src.includes('bay-of-islands-poster.jpg')), 'actual poster uploaded to canvas');
      if (width === 390 && mode === 'normal') {
        // Synthetic visibility event exercises the same browser gate without OS/device claims.
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
        assert(await page.locator('video').evaluate(v => v.paused));
        await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
        await page.waitForFunction(() => !document.querySelector('video').paused);
        await page.locator('[data-pause]').click();
        for (const nextWidth of [1000, 390, 430]) {
          await page.setViewportSize({ width: nextWidth, height: 844 });
          await page.waitForSelector('.direction-4c[data-ready]'); await page.waitForTimeout(400);
          assert(await page.locator('video').evaluate(v => v.paused));
          await shot(`paused-${nextWidth}`);
          const frozen = await pixels(); await page.waitForTimeout(250); assert.deepEqual(await pixels(), frozen, 'paused pixels stay frozen');
        }
        await page.setViewportSize({ width, height: 844 }); await page.waitForTimeout(400);
        await page.locator('[data-pause]').click(); await page.waitForSelector('.direction-4c[data-video-ready]');
        await page.locator('video').evaluate(v => v.dispatchEvent(new Event('stalled')));
        assert(await page.locator('.direction-4c').getAttribute('data-video-ready'), 'buffered stall keeps footage');
        await page.locator('video').evaluate(v => v.dispatchEvent(new Event('waiting')));
        await page.waitForSelector('.direction-4c[data-video-ready]');
        await page.locator('video').evaluate(v => v.dispatchEvent(new Event('error'))); await page.waitForTimeout(400);
        assert.equal(await page.locator('.direction-4c').getAttribute('data-video-ready'), null);
        await shot('failed-after-playing');
        assert(await page.evaluate(() => window.__plateDrawSource?.tag === 'IMG'), 'failed footage is replaced by the poster texture');
        const demo = page.locator('#try');
        await demo.getByRole('tab', { name: 'Talk', exact: true }).click();
        await demo.getByRole('button', { name: 'Play simulated voice example' }).click(); await page.waitForTimeout(650);
        await demo.getByRole('tab', { name: 'Write', exact: true }).click();
        const input = demo.getByRole('textbox', { name: 'What would you like done?' });
        await input.fill('Keep this new typed draft'); await page.waitForTimeout(4000);
        assert.equal(await input.inputValue(), 'Keep this new typed draft');
        await demo.getByRole('tab', { name: 'Talk', exact: true }).click();
        await demo.getByRole('button', { name: 'Play simulated voice example' }).click(); await page.waitForTimeout(650);
        await demo.getByRole('tab', { name: 'Add', exact: true }).click(); await page.waitForTimeout(4000);
        assert.equal(await demo.getByRole('tab', { name: 'Add', exact: true }).getAttribute('aria-selected'), 'true');
        await demo.getByRole('tab', { name: 'Write', exact: true }).click(); await input.fill('Write a reply');
        await demo.getByRole('button', { name: 'Start', exact: true }).click();
        await demo.getByRole('button', { name: 'Not now', exact: true }).click();
        await demo.getByText('Nothing was changed. This sample is not saved and will be lost on reload.', { exact: true }).waitFor();
        await shot('sample-not-saved');
      }
      const links = [];
      for (const href of ['/do?tool=write', '/do?tool=talk', '/do']) {
        const link = page.locator(`#try .clear-do-actions a[href="${href}"]`); await link.scrollIntoViewIfNeeded();
        await link.click({ trial: true }); const box = await link.boundingBox(); assert(box.height >= 48); links.push({ href, box });
      }
      record.links = links;
      await shot('do-entry');
      if (width === 390 && mode === 'normal') {
        await page.reload({ waitUntil: 'load' });
        assert.equal(await page.locator('#try').getByRole('textbox', { name: 'What would you like done?' }).inputValue(), '');
        record.sampleReloadCleared = true;
      }
      assert.deepEqual(record.errors, []); record.status = 'passed'; persist(); console.log(`PASS ${engine} ${width} ${mode}`); await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.route('**/*', route => route.request().method() === 'GET' ? route.continue() : route.abort());
    for (const tool of ['write', 'talk', '']) {
      await page.goto(process.env.HOMEPAGE_URL || 'http://localhost:3077/', { waitUntil: 'load' });
      const href = tool ? `/do?tool=${tool}` : '/do';
      await page.locator(`#try .clear-do-actions a[href="${href}"]`).click();
      await page.waitForURL(url => url.pathname === '/do' && (url.searchParams.get('tool') || '') === tool);
      await page.locator('#main-content').waitFor();
      await page.locator('main[aria-busy="true"]').waitFor({ state: 'detached' });
      const file = `${engine}-390-destination-${tool || 'open'}.png`;
      await page.screenshot({ path: `${output}/${file}` });
      results.push({ destination: href, url: page.url(), file, status: 'passed' }); persist();
    }
    await context.close();
  } finally { persist(); await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
