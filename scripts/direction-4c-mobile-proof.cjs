const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = 'output/playwright/mobile-recovery';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const engine = process.env.PROOF_BROWSER || 'chromium';
  const browser = await ({ chromium, webkit }[engine]).launch({ ...(process.env.PROOF_CHANNEL ? { channel: process.env.PROOF_CHANNEL } : {}), ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: engine === 'chromium' ? ['--enable-unsafe-swiftshader'] : [] });
  const results = [], captures = [];
  const scroll = async (page, y) => {
    await page.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; document.body.style.scrollBehavior = 'auto'; scrollTo({ top: y, behavior: 'instant' }); }, y);
    await page.waitForFunction(y => Math.abs(scrollY - Math.min(y, document.documentElement.scrollHeight - innerHeight)) < 1, y);
  };
  const capture = async (page, width, mode, label, y) => {
    await scroll(page, y);
    const file = `${engine}-${width}-${mode}-${label}.jpg`;
    const state = await page.evaluate(() => { const v = document.querySelector('[data-coastal-video]'); return { scrollY, currentTime: v.currentTime, source: v.currentSrc || v.src, readyState: v.readyState, paused: v.paused, videoReady: document.querySelector('.direction-4c').dataset.videoReady || null, posterVisible: getComputedStyle(v).opacity === '0' }; });
    await page.screenshot({ path: `${output}/${file}`, type: 'jpeg', quality: 85 });
    captures.push({ file, width, mode, ...state });
    fs.writeFileSync(`${output}/${engine}-captures.json`, JSON.stringify(captures, null, 2));
    return state;
  };
  try {
    for (const width of [375, 390, 430, 1440]) {
      for (const mode of width === 1440 ? ['normal', 'reduce'] : ['normal', 'blocked', 'denied', 'no-frame', 'reduce', ...(width === 390 ? ['webm'] : [])]) {
        const playingMode = mode === 'normal' || mode === 'webm';
        const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: width === 1440 ? 1 : 3, reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        if (mode === 'blocked') await page.route(/\.(mp4|webm)(?:\?|$)/, r => r.abort());
        if (mode === 'webm') await page.addInitScript(() => { const original = HTMLMediaElement.prototype.canPlayType; HTMLMediaElement.prototype.canPlayType = function(type) { return type.includes('video/mp4') ? '' : original.call(this, type); }; });
        if (mode === 'denied') await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError')); });
        if (mode === 'no-frame') await page.addInitScript(() => { HTMLVideoElement.prototype.requestVideoFrameCallback = () => 1; HTMLVideoElement.prototype.cancelVideoFrameCallback = () => {}; });
        await page.goto(process.env.HOMEPAGE_URL || 'http://127.0.0.1:3066/mobile-recovery-proof.html', { waitUntil: 'load' });
        if (playingMode) {
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
        const top = await capture(page, width, mode, 'top', 0);
        assert.equal(top.scrollY, 0);
        if (playingMode) { assert.equal(top.paused, false); assert(top.readyState >= 2); assert.equal(top.videoReady, 'true'); }
        if (mode === 'webm') assert.match(await page.locator('video').evaluate(v => v.currentSrc), /\.webm$/);
        if (width < 901) {
          await capture(page, width, mode, 'midscroll', 240);
          for (const y of [0, 200, 400, 650, 1000]) {
            await scroll(page, y);
            const style = await page.locator('[data-ref="msgRef"]').evaluate(el => ({ opacity: getComputedStyle(el).opacity, visibility: getComputedStyle(el).visibility, background: getComputedStyle(el).backgroundImage }));
            assert.equal(style.opacity, '1'); assert.equal(style.visibility, 'visible'); assert(style.background.includes('linear-gradient'), 'opaque text on a dark glass surface');
          }
          assert.equal(await page.locator('[data-ref="canvasRef"]').evaluate(el => getComputedStyle(el).display), 'none');
          if (playingMode) {
            await page.locator('[data-pause]').click();
            assert(await page.locator('video').evaluate(el => el.paused));
            await scroll(page, 240);
            assert.equal(await page.locator('[data-ref="msgRef"]').evaluate(el => getComputedStyle(el).opacity), '1');
            await capture(page, width, mode, 'midscroll-paused', 240);
            await page.setViewportSize({ width: 1000, height: 844 });
            await page.waitForTimeout(200);
            assert(await page.locator('video').evaluate(el => el.paused), 'resize must preserve pause');
            await page.setViewportSize({ width, height: 844 });
            await page.waitForTimeout(200);
            assert(await page.locator('video').evaluate(el => el.paused), 'return to mobile must preserve pause');
            await page.locator('[data-pause]').click();
            await page.waitForFunction(() => !document.querySelector('video').paused);
            await page.waitForFunction(() => document.querySelector('.direction-4c').dataset.videoReady === 'true');
            await page.locator('video').evaluate(el => el.dispatchEvent(new Event('stalled')));
            assert.equal(await page.locator('video').evaluate(el => getComputedStyle(el).opacity), '1', 'buffered stall preserves visible footage');
            const waitingHidden = await page.locator('video').evaluate(el => {
              el.dispatchEvent(new Event('waiting'));
              return !document.querySelector('.direction-4c').hasAttribute('data-video-ready');
            });
            assert(waitingHidden, 'actual waiting reveals poster');
            await page.waitForFunction(() => document.querySelector('.direction-4c').dataset.videoReady === 'true');
            await capture(page, width, mode, 'recovered', 240);
          } else assert.equal(await page.locator('video').evaluate(el => getComputedStyle(el).opacity), '0');
        }

        const entryTargets = [], pausedCopyChecks = [];
        if (mode === 'normal' && width < 901) {
          const actions = page.locator('.clear-do-actions');
          await actions.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
          for (const link of await actions.locator('a').all()) {
            await link.click({ trial: true });
            const box = await link.boundingBox();
            assert(box.width >= 44 && box.height >= 48, 'DO entry has usable touch targets');
            const previous = entryTargets.at(-1);
            if (previous) assert(box.y - (previous.y + previous.height) >= 11, 'DO entry targets are separated');
            entryTargets.push({ href: await link.getAttribute('href'), ...box });
          }
          await page.screenshot({ path: `${output}/${engine}-${width}-do-entry.jpg`, type: 'jpeg', quality: 85 });
        }
        if (mode === 'normal' && width === 1440) {
          await page.waitForFunction(() => document.querySelector('.direction-4c').hasAttribute('data-ready'));
          const copyState = () => page.locator('[data-ref="msgRef"], [data-ref="kickRef"], [data-ref="subRef"], [data-ref="cueRef"], [data-ref="markRef"]').evaluateAll(els => els.map(el => ({ ref: el.dataset.ref, opacity: getComputedStyle(el).opacity, visibility: getComputedStyle(el).visibility, transform: getComputedStyle(el).transform })));
          for (const progress of [0, .72, .95]) {
            const y = await page.locator('#top').evaluate((el, p) => Math.round((el.getBoundingClientRect().height - innerHeight) * p), progress);
            await scroll(page, y); await page.waitForTimeout(100);
            await page.locator('[data-pause]').click();
            const frozen = await copyState();
            assert(frozen.every(s => s.opacity === '0' || s.opacity === '1'), 'paused copy is never left translucent');
            assert(await page.locator('video').evaluate(v => v.paused));
            for (const target of [0, 700, 1500]) {
              await scroll(page, target); await page.waitForTimeout(100);
              assert.deepEqual(await copyState(), frozen, 'paused scroll cannot fade or move desktop copy');
            }
            await scroll(page, y);
            await page.screenshot({ path: `${output}/${engine}-1440-paused-${progress}.jpg`, type: 'jpeg', quality: 85 });
            pausedCopyChecks.push({ progress, scrollY: y, frozen });
            await page.locator('[data-pause]').click();
            await page.waitForFunction(() => !document.querySelector('video').paused);
          }
        }

        for (const href of ['/do?tool=write', '/do?tool=talk', '/do']) assert(await page.locator(`#try a[href="${href}"]`).count(), `real DO link ${href}`);
        for (const href of ['/legal/terms', '/legal/privacy', '/legal/disclaimer', '/legal/meta-data-deletion']) assert(await page.locator(`.clear-legal a[href="${href}"]`).count());
        if (width === 390 && mode === 'normal') {
          await page.locator('.clear-demo-disclosure > summary').click();
          const demo = page.locator('#try-demo');
          assert.match(await demo.locator('.td-demo-notice').textContent(), /Fictional walkthrough only/);
          await demo.getByRole('tab', { name: 'Talk', exact: true }).click();
          await demo.getByRole('button', { name: 'Play simulated voice example' }).click();
          await page.waitForTimeout(650);
          await demo.getByRole('tab', { name: 'Write', exact: true }).click();
          const input = demo.getByRole('textbox', { name: 'What would you like done?' });
          await input.fill('Keep this new typed draft');
          await page.waitForTimeout(4000);
          assert.equal(await input.inputValue(), 'Keep this new typed draft', 'interrupted simulated Talk cannot overwrite typing');
          await page.screenshot({ path: `${output}/${engine}-390-interrupted-talk.jpg`, type: 'jpeg', quality: 85 });
          await demo.getByRole('tab', { name: 'Talk', exact: true }).click();
          await demo.getByRole('button', { name: 'Play simulated voice example' }).click();
          await page.waitForTimeout(650);
          await demo.getByRole('tab', { name: 'Add', exact: true }).click();
          await page.waitForTimeout(4000);
          assert.equal(await demo.getByRole('tab', { name: 'Add', exact: true }).getAttribute('aria-selected'), 'true');
          await demo.getByRole('button', { name: 'Try a fictional example' }).click();
          await demo.getByRole('button', { name: 'Simulate approval' }).waitFor();
          await demo.getByRole('button', { name: 'Not now', exact: true }).click();
          await demo.getByRole('link', { name: 'Open the full DO' }).waitFor();
          assert.match(await demo.locator('.td-line').textContent(), /No draft is saved/);
        }
        assert.deepEqual(errors, []);
        results.push({ width, mode, engine, passed: true, entryTargets, pausedCopyChecks });
        fs.writeFileSync(`${output}/${engine}-results.json`, JSON.stringify(results, null, 2));
        console.log(`PASS ${engine} ${width} ${mode}`);
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
