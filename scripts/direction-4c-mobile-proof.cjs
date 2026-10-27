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
    const state = await page.evaluate(() => { const v = document.querySelector('[data-coastal-video]'); return { scrollY, currentTime: v.currentTime, source: v.currentSrc || v.src, readyState: v.readyState, paused: v.paused, videoReady: document.querySelector('.direction-4c').dataset.videoReady || null, rawVideoVisible: getComputedStyle(v).opacity !== '0' }; });
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
        // A frame that never decodes drops the footage, not the scene: the flock still arrives.
        if (mode === 'no-frame') await page.waitForFunction(() => document.querySelector('.direction-4c').hasAttribute('data-ready') && !document.querySelector('.direction-4c').hasAttribute('data-video-ready'), undefined, { timeout: 20000 });
        await page.waitForTimeout(150);
        await page.evaluate(() => document.fonts.ready);
        assert(await page.locator('.clear-coastal-poster').evaluate(el => el.complete && el.naturalWidth >= 1280), 'coastal poster loaded');
        assert.equal(await page.locator('.direction-4c').evaluate(el => el.textContent.includes('↗')), false, 'no emoji arrows');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
        const top = await capture(page, width, mode, 'top', 0);
        assert.equal(top.scrollY, 0);
        if (playingMode) {
          assert.equal(top.paused, false);
          // A looping clip reports HAVE_METADATA for a moment at its seam; wait for the next decoded frame instead of sampling one instant.
          if (top.readyState < 2 || top.videoReady !== 'true') await page.waitForFunction(() => document.querySelector('[data-coastal-video]').readyState >= 2 && document.querySelector('.direction-4c').dataset.videoReady === 'true', undefined, { timeout: 5000 });
        }
        if (mode === 'webm') assert.match(await page.locator('video').evaluate(v => v.currentSrc), /\.webm$/);
        if (width < 901) {
          await capture(page, width, mode, 'midscroll', 240);
          if (mode !== 'reduce') {
            // The design's flock flies on phones too, and footage never blocks it.
            await page.waitForFunction(() => document.querySelector('.direction-4c').hasAttribute('data-ready'), undefined, { timeout: 20000 });
            assert.equal(await page.locator('[data-ref="canvasRef"]').evaluate(el => getComputedStyle(el).display), 'block', 'tide canvas renders on phones');
            const end = await page.locator('#top').evaluate(el => { const box = el.getBoundingClientRect(); return Math.round(box.top + scrollY + box.height - innerHeight) - 8; });
            await scroll(page, end); await page.waitForTimeout(300);
            const style = await page.locator('[data-ref="msgRef"]').evaluate(el => ({ opacity: getComputedStyle(el).opacity, visibility: getComputedStyle(el).visibility }));
            assert.equal(style.opacity, '1', 'useful work message is fully visible at the end of the hero'); assert.equal(style.visibility, 'visible');
            await capture(page, width, mode, 'message', end);
            await scroll(page, 0);
          }
          if (playingMode) {
            await page.locator('[data-pause]').click();
            assert(await page.locator('video').evaluate(el => el.paused));
            await scroll(page, 240);
            assert(['0', '1'].includes(await page.locator('[data-ref="msgRef"]').evaluate(el => getComputedStyle(el).opacity)), 'paused copy is never left translucent');
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
            // Dispatch the stall only while a frame is actually buffered, in the same task as the check, so the clip's loop seam cannot fall in between.
            const afterStall = await (await page.waitForFunction(() => {
              const v = document.querySelector('[data-coastal-video]');
              if (v.readyState < 2 || document.querySelector('.direction-4c').dataset.videoReady !== 'true') return false;
              v.dispatchEvent(new Event('stalled'));
              return document.querySelector('.direction-4c').dataset.videoReady ?? 'dropped';
            }, undefined, { timeout: 5000 })).jsonValue();
            assert.equal(afterStall, 'true', 'buffered stall preserves the canvas video source');
            assert.equal(await page.locator('video').evaluate(el => getComputedStyle(el).opacity), '0', 'raw footage stays behind the composed scene');
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
          const actions = page.locator('#try');
          await actions.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
          for (const link of await actions.locator('button').all()) {
            await link.click({ trial: true });
            const box = await link.boundingBox();
            assert(box.width >= 44 && box.height >= 48, 'Guide entry has usable touch targets');
            const previous = entryTargets.at(-1);
            if (previous) assert(box.y - (previous.y + previous.height) >= 11, 'Guide entry targets are separated');
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

        assert.equal(await page.locator('a[href^="/do"],a[href^="/pursuit"],a[href^="/studio"],a[href^="/creative-studio"]').count(), 0);
        assert.equal(await page.locator('nav[aria-label="Primary"] a').getAttribute('href'), '/lab');
        for (const href of ['/legal/terms', '/legal/privacy', '/legal/disclaimer', '/legal/meta-data-deletion']) assert(await page.locator(`.clear-legal a[href="${href}"]`).count());
        if (width === 390 && mode === 'normal') {
          const guide = page.locator('#try');
          assert.match(await guide.locator('.td-kicker').textContent(), /about assembl/i);
          await guide.getByRole('button', { name: 'Ask DO about assembl', exact: true }).click();
          const panel = page.locator('#site-do-workspace');
          await panel.getByRole('region', { name: 'Prepared company guide' }).waitFor();
          const input = panel.getByRole('textbox', { name: 'Your question about assembl' });
          await input.fill('What is assembl?');
          assert.equal(await input.inputValue(), 'What is assembl?');
          assert.equal(await panel.getByRole('checkbox').isChecked(), false);
          assert(await panel.getByRole('button', { name: 'Ask DO', exact: true }).isDisabled());
          assert.equal(await panel.locator('a[href^="/do"]').count(), 0);
          await page.screenshot({ path: `${output}/${engine}-390-public-guide.jpg`, type: 'jpeg', quality: 85 });
          await page.getByRole('button', { name: 'Close DO', exact: true }).click();
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
