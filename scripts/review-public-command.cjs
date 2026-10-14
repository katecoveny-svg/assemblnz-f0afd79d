const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const doors = [
  ['Home', '/'], ['Pursuit', '/pursuit'], ['DO', '/do'],
  ['Studio', '/creative-studio'], ['Contact assembl', '/contact'],
];
const signatures = {
  '/': { title: 'assembl | Agentic AI solutions for your business', h1: 'Agentic AI solutions, assembled for your business.' },
  '/pursuit': { title: 'Pursuit by assembl | Research the opportunity', h1: 'See what’s changing. Find your next move.' },
  '/do': { title: 'DO by assembl | Your personal agent for useful work', selector: 'main[data-do-identity="assembled-glass"]' },
  '/creative-studio': { title: 'Studio by assembl | Give the idea a working version', h1: 'Give the idea a working version.' },
  '/contact': { title: 'Contact assembl | Discuss your project', h1: 'What would you like to make?' },
};

// Navigation readiness is bounded and requires the actual destination, not its URL alone.
const waitForSignature = async (page, destination) => page.waitForFunction(signature => {
  if (document.title !== signature.title) return false;
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (!canonical || new URL(canonical, location.href).pathname !== signature.destination) return false;
  if (signature.h1) return document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim() === signature.h1;
  const shell = document.querySelector(signature.selector);
  return Boolean(shell && shell.getClientRects().length && getComputedStyle(shell).display !== 'none' && getComputedStyle(shell).visibility !== 'hidden');
}, { ...signatures[destination], destination }, { timeout: 30000 });

// Hold deferred callbacks to reproduce close/reopen races deterministically.
const holdDismissTimers = async page => page.evaluate(() => {
  const set = window.setTimeout; const clear = window.clearTimeout;
  const queue = new Map(); let id = -1000000;
  window.__commandTimers = { queue, restore: () => { window.setTimeout = set; window.clearTimeout = clear; } };
  window.setTimeout = (fn, delay = 0, ...args) => {
    if (delay !== 0 || typeof fn !== 'function') return set.call(window, fn, delay, ...args);
    const key = id--; queue.set(key, () => fn.apply(window, args)); return key;
  };
  window.clearTimeout = key => { if (!queue.delete(key)) clear.call(window, key); };
});
const releaseDismissTimers = async (page, ids = null) => page.evaluate(ids => {
  const timers = window.__commandTimers;
  if (!ids) timers.restore();
  for (const id of ids || [...timers.queue.keys()]) {
    const fn = timers.queue.get(id); timers.queue.delete(id); if (fn) fn();
  }
  if (!ids) delete window.__commandTimers;
}, ids);

(async () => {
  const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:3000';
  const output = process.env.REVIEW_OUTPUT || 'output/public-command';
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  const rows = [];
  const report = { origin, rows, noCssInjection: true };
  try {
    for (const width of [375, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
      // Observe the real SSR-still -> hydrated motion transition; do not fake WebGL.
      await context.addInitScript(() => {
        window.__commandNormalMotionSeen = false;
        new MutationObserver(records => {
          for (const record of records) {
            if (record.target instanceof HTMLButtonElement && record.target.closest('section[data-chapter]') &&
              (record.target.getAttribute('aria-label') === 'Pause scene motion' || record.oldValue === 'Pause scene motion')) {
              window.__commandNormalMotionSeen = true;
            }
          }
        }).observe(document, { subtree: true, attributes: true, attributeFilter: ['aria-label'], attributeOldValue: true });
      });
      await context.route('**/*', route => {
        const request = route.request();
        return request.method() !== 'GET' || new URL(request.url()).pathname.startsWith('/api/')
          ? route.abort() : route.continue();
      });
      const page = await context.newPage();
      const row = { width, destinations: [], pageErrors: [] };
      page.on('pageerror', error => row.pageErrors.push(error.message));
      rows.push(row);
      try {
        await page.goto(origin + '/contact', { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const initiator = page.locator('header a[href="/"]').first();
        const dialog = page.getByRole('dialog', { name: 'Search assembl' });
        const input = page.getByRole('combobox', { name: 'Search assembl' });
        const open = async shortcut => {
          await initiator.focus();
          if (shortcut === 'event') await page.evaluate(() => window.dispatchEvent(new Event('assembl:open-command')));
          else await page.keyboard.press(shortcut);
          await dialog.waitFor({ state: 'visible' });
          await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Search assembl');
          assert(await input.evaluate(element => element === document.activeElement), 'Search receives focus');
        };
        const closed = async () => {
          await dialog.waitFor({ state: 'detached' });
          await page.waitForFunction(() => document.activeElement === document.querySelector('header a[href="/"]'));
          assert(await initiator.evaluate(element => element === document.activeElement), 'Dismissal restores usable initiating focus');
        };
        await open('Control+k');
        const values = await dialog.locator('[cmdk-item]').evaluateAll(elements => elements.map(element => element.getAttribute('data-value')));
        assert.deepEqual(values, doors.map(([label]) => label));
        assert.equal(await dialog.locator('img').count(), 0, 'No retired vessel thumbnails');
        assert(!/Kete packs|Specialist agents|SPARK|Founder|Pricing|Evidence pack|Arataki/.test(await dialog.innerText()));
        await page.screenshot({ path: `${output}/palette-${width}.png` });
        await input.fill('contact');
        await page.waitForFunction(() => document.querySelectorAll('[cmdk-item]').length === 1);
        assert.equal(await dialog.locator('[cmdk-item]').count(), 1);
        assert.equal(await dialog.locator('[cmdk-item]').getAttribute('data-value'), 'Contact assembl');
        await input.fill('no-such-public-destination-9581');
        await page.getByText('No result found.', { exact: true }).waitFor();
        assert.equal(await dialog.locator('[cmdk-item]').count(), 0);
        await page.screenshot({ path: `${output}/no-results-${width}.png` });
        await input.fill('');
        await page.waitForFunction(() => document.querySelectorAll('[cmdk-item]').length === 5);
        const selected = dialog.locator('[cmdk-item][aria-selected="true"]');
        const before = await selected.getAttribute('data-value');
        await page.keyboard.press('ArrowDown');
        await page.waitForFunction(value => document.querySelector('[cmdk-item][aria-selected="true"]')?.getAttribute('data-value') !== value, before);
        assert.notEqual(await selected.getAttribute('data-value'), before, 'ArrowDown changes selection');
        await page.keyboard.press('ArrowUp');
        await page.waitForFunction(value => document.querySelector('[cmdk-item][aria-selected="true"]')?.getAttribute('data-value') === value, before);
        assert.equal(await selected.getAttribute('data-value'), before, 'ArrowUp restores selection');
        for (let index = 0; index < 8; index++) {
          await page.keyboard.press(index < 4 ? 'Tab' : 'Shift+Tab');
          assert(await dialog.evaluate(element => element.contains(document.activeElement)), 'Tab focus stays inside dialog');
        }
        await page.keyboard.press('Escape');
        await closed();
        await open('Meta+k');
        await page.getByRole('button', { name: 'Close command palette' }).click();
        await closed();
        await open('event');
        await page.keyboard.press('Escape');
        await closed();
        await open('Control+k');
        await page.keyboard.press('Control+k');
        await closed();
        await page.evaluate(() => {
          const opener = document.createElement('button');
          opener.id = 'command-detached-opener'; opener.textContent = 'Temporary test opener';
          document.body.append(opener); opener.focus();
          window.dispatchEvent(new Event('assembl:open-command'));
        });
        await dialog.waitFor({ state: 'visible' });
        await page.evaluate(() => document.getElementById('command-detached-opener').remove());
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        assert.equal(await page.locator('#command-detached-opener').count(), 0);
        // Older callbacks must not consume a newer session, even after both close.
        await open('Control+k');
        await holdDismissTimers(page);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        const oldTimers = await page.evaluate(() => [...window.__commandTimers.queue.keys()]);
        assert(oldTimers.length > 0, 'Deferred close callback was captured');
        const secondOpener = page.locator('header a[href="/do"]').first();
        await secondOpener.focus();
        await page.evaluate(() => window.dispatchEvent(new Event('assembl:open-command')));
        await dialog.waitFor();
        await secondOpener.evaluate(element => {
          window.__commandSecondFocusCalls = 0; const original = element.focus;
          element.focus = function (...args) { window.__commandSecondFocusCalls++; return original.apply(this, args); };
        });
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        await releaseDismissTimers(page, oldTimers);
        assert.equal(await page.evaluate(() => window.__commandSecondFocusCalls), 0, 'Old session cannot consume the new opener');
        await releaseDismissTimers(page);
        await page.waitForFunction(() => document.activeElement === document.querySelector('header a[href="/do"]'));
        assert.equal(await page.evaluate(() => window.__commandSecondFocusCalls), 1);
        // Respect focus deliberately moved elsewhere during deferred dismissal.
        await open('Control+k');
        await holdDismissTimers(page);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        await secondOpener.focus();
        await releaseDismissTimers(page);
        assert(await secondOpener.evaluate(element => element === document.activeElement));
        row.dismissalInterruptions = { closeReopen: true, intentionalFocusMove: true };
        row.keyboardAndDismissal = true;
        for (const [label, destination] of doors) {
          await page.goto(origin + '/contact', { waitUntil: 'networkidle' });
          // Record actual focus calls to the old opener; do not alter their behavior.
          await initiator.evaluate(element => {
            const original = element.focus;
            window.__commandOldOpenerFocusCalls = 0;
            element.focus = function (...args) {
              window.__commandOldOpenerFocusCalls++;
              return original.apply(this, args);
            };
          });
          await open('Control+k');
          await input.fill(label);
          await page.evaluate(() => { window.__commandOldOpenerFocusCalls = 0; });
          await page.keyboard.press('Enter');
          await page.waitForURL(url => url.pathname === destination);
          await page.waitForLoadState('networkidle');
          await dialog.waitFor({ state: 'detached' });
          assert.equal(await dialog.count(), 0, 'Selection dismisses the palette');
          await page.waitForTimeout(50); // Include Radix's deferred unmount focus callback.
          assert.equal(await page.evaluate(() => window.__commandOldOpenerFocusCalls), 0, 'Navigation never restores the old page opener');
          const signature = signatures[destination];
          await waitForSignature(page, destination);
          assert.equal(await page.title(), signature.title);
          if (signature.h1) assert.equal((await page.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim(), signature.h1);
          else assert.equal(await page.locator(signature.selector).count(), 1);
          assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).pathname, destination);
          row.destinations.push({ label, pathname: new URL(page.url()).pathname, title: await page.title(), contentSignatureVerified: true });
        }
        const response = await context.request.get(origin + '/evidence-pack', { maxRedirects: 0 });
        assert.equal(response.status(), 308);
        assert.equal(new URL(response.headers().location, origin).pathname, '/');
        await page.goto(origin + '/evidence-pack', { waitUntil: 'networkidle' });
        await waitForSignature(page, '/');
        await page.evaluate(() => document.fonts.ready);
        await open('Control+k');
        await page.keyboard.press('Escape');
        await closed();
        await page.waitForFunction(() => window.__commandNormalMotionSeen === true, null, { timeout: 30000 });
        assert.equal(new URL(page.url()).pathname, '/');
        assert.equal((await page.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim(), 'Agentic AI solutions, assembled for your business.');
        assert.equal(await page.getByRole('navigation', { name: 'Primary', exact: true }).count(), 1);
        assert.equal(await page.locator('header nav').count(), 1, 'No legacy primary navigation wrapper');
        assert.equal(await page.locator('[data-watch-route], .watch-site, .watch-scene').count(), 0);
        assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).pathname, '/');
        const still = page.getByRole('button', { name: 'Still view; scene motion unavailable', exact: true });
        let sceneMotion;
        if (await still.count()) {
          assert(await still.isDisabled(), 'Static fallback must not offer unavailable motion');
          assert.equal(await page.locator('section[data-chapter]').getAttribute('data-static'), 'true');
          sceneMotion = 'static fallback';
        } else {
          const pause = page.getByRole('button', { name: 'Pause scene motion', exact: true });
          await pause.focus();
          await pause.press('Enter');
          const resume = page.getByRole('button', { name: 'Resume scene motion', exact: true });
          await resume.waitFor();
          assert.equal(await resume.getAttribute('aria-pressed'), 'true');
          sceneMotion = 'pause verified';
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.screenshot({ path: `${output}/retired-redirect-home-${width}.png` });
        // Prove hydration through a working HTML control even without WebGL.
        await open('Control+k');
        await page.keyboard.press('Escape');
        await closed();
        // Deliberately exercise the supported static route, rather than relying
        // on whether this runner happens to have a working GPU.
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(origin + '/evidence-pack', { waitUntil: 'networkidle' });
        await waitForSignature(page, '/');
        await still.waitFor();
        assert(await still.isDisabled());
        assert.equal(new URL(page.url()).pathname, '/');
        assert.equal(await page.locator('section[data-chapter]').getAttribute('data-static'), 'true');
        assert.equal(await page.getByRole('navigation', { name: 'Primary', exact: true }).count(), 1);
        assert.equal(await page.locator('[data-watch-route], .watch-site, .watch-scene').count(), 0);
        await open('Control+k');
        await page.keyboard.press('Escape');
        await closed();
        await page.screenshot({ path: `${output}/static-redirect-home-${width}.png` });
        row.redirect = { status: response.status(), finalPath: '/', onePrimaryNav: true, noWatchFrame: true,
          sceneMotion, normalHydrationTransitionVerified: true, reducedStaticVerified: true, hydratedCommandControl: true };
        row.interactionsPassed = true;
        if (row.pageErrors.length) {
          row.pageErrorsRequireReview = true;
          throw new Error('Browser page errors require review: ' + row.pageErrors.join(' | '));
        }
        row.passed = true;
      } catch (error) {
        row.error = error.message;
        row.pageAtFailure = { pathname: new URL(page.url()).pathname, title: await page.title(), text: (await page.locator('body').innerText()).slice(0,500) };
        row.dialogAtFailure = await page.locator('[role="dialog"]').evaluateAll(elements => elements.map(element => ({ state: element.getAttribute('data-state'), text: element.textContent?.slice(0,160) })));
        await page.screenshot({ path: `${output}/failure-${width}.png` }).catch(() => {});
        throw error;
      } finally {
        await context.close();
      }
    }
    const capturedErrors = rows.flatMap(row => row.pageErrors);
    if (capturedErrors.length) {
      report.pageErrorsRequireReview = true;
      throw new Error('Captured browser page errors require review: ' + capturedErrors.join(' | '));
    }
  } finally {
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
