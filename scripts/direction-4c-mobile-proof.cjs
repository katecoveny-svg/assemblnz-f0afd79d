const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = 'output/playwright/mobile-recovery';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const engine = process.env.PROOF_BROWSER || 'chromium';
  const browser = await ({ chromium, webkit }[engine]).launch({ ...(process.env.PROOF_CHANNEL ? { channel: process.env.PROOF_CHANNEL } : {}), ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: engine === 'chromium' ? ['--enable-unsafe-swiftshader'] : [] });
  const results = [];
  try {
    for (const width of [375, 390, 430, 1440]) {
      for (const mode of width === 1440 ? ['normal', 'reduce'] : ['normal', 'blocked', 'denied', 'no-frame', 'reduce']) {
        const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: width === 1440 ? 1 : 3, reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        if (mode === 'blocked') await page.route('**/*.mp4', r => r.abort());
        if (mode === 'denied') await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError')); });
        if (mode === 'no-frame') await page.addInitScript(() => { HTMLVideoElement.prototype.requestVideoFrameCallback = () => 1; HTMLVideoElement.prototype.cancelVideoFrameCallback = () => {}; });
        await page.goto(process.env.HOMEPAGE_URL || 'http://127.0.0.1:3066/mobile-recovery-proof.html', { waitUntil: 'load' });
        if (mode === 'normal') {
          try { await page.waitForFunction(() => document.querySelector('.direction-4c')?.hasAttribute('data-video-ready'), undefined, { timeout: 15000 }); }
          catch (error) {
            await page.screenshot({ path: `${output}/${engine}-${width}-failure.jpg`, type: 'jpeg' });
            console.log(await page.evaluate(() => ({ title: document.title, url: location.href, state: document.querySelector('.direction-4c')?.dataset, media: [...document.querySelectorAll('video')].map(v => ({ ready: v.readyState, source: v.getAttribute('src'), error: v.error?.message, codec: v.canPlayType('video/mp4; codecs="avc1.42E01E"') })) })));
            console.log('Page errors', errors);
            throw error;
          }
        }
        if (mode === 'no-frame') await page.waitForFunction(() => document.querySelector('.direction-4c').hasAttribute('data-static'), undefined, { timeout: 10000 });
        await page.waitForTimeout(150);
        await page.evaluate(() => document.fonts.ready);
        assert(await page.locator('.clear-coastal-poster').evaluate(el => el.complete && el.naturalWidth >= 1280), 'coastal poster loaded');
        assert.equal(await page.locator('.direction-4c').evaluate(el => el.textContent.includes('↗')), false, 'no emoji arrows');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
        if (width < 901) {
          for (const y of [0, 200, 400, 650, 1000]) {
            await page.evaluate(y => scrollTo(0, y), y);
            const style = await page.locator('[data-ref="msgRef"]').evaluate(el => ({ opacity: getComputedStyle(el).opacity, visibility: getComputedStyle(el).visibility, background: getComputedStyle(el).backgroundColor }));
            assert.equal(style.opacity, '1'); assert.equal(style.visibility, 'visible'); assert.equal(style.background, 'rgb(36, 11, 33)');
          }
          assert.equal(await page.locator('[data-ref="canvasRef"]').evaluate(el => getComputedStyle(el).display), 'none');
          if (mode === 'normal') {
            await page.locator('[data-pause]').click();
            assert(await page.locator('video').evaluate(el => el.paused));
            await page.evaluate(() => scrollTo(0, 240));
            assert.equal(await page.locator('[data-ref="msgRef"]').evaluate(el => getComputedStyle(el).opacity), '1');
            await page.screenshot({ path: `${output}/${engine}-${width}-midscroll-paused.jpg`, type: 'jpeg', quality: 85 });
            await page.locator('[data-pause]').click();
            await page.waitForFunction(() => !document.querySelector('video').paused);
            await page.screenshot({ path: `${output}/${engine}-${width}-playing.jpg`, type: 'jpeg', quality: 85 });
            await page.locator('video').evaluate(el => el.dispatchEvent(new Event('waiting')));
            assert.equal(await page.locator('video').evaluate(el => getComputedStyle(el).opacity), '0', 'stall reveals poster');
          } else assert.equal(await page.locator('video').evaluate(el => getComputedStyle(el).opacity), '0');
        }
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${engine}-${width}-${mode}.jpg`, type: 'jpeg', quality: 85 });
        assert.deepEqual(errors, []);
        results.push({ width, mode, engine, passed: true });
        fs.writeFileSync(`${output}/${engine}-results.json`, JSON.stringify(results, null, 2));
        console.log(`PASS ${engine} ${width} ${mode}`);
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
