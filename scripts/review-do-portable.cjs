/* Exact generated companion in a browser. Fictional DOM only; no account/provider requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = 'https://www.assembl.co.nz';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/assembl-do-portable-review';
const source = fs.readFileSync('apps/do/extension/floating.js', 'utf8');
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); console.log('PASS ' + label); };
const fixture = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>DO portability fixture</title>
<style>body{margin:0;background:#fffdfb;color:#240b21;font:16px/1.6 system-ui}main{padding:28px;min-height:1800px}h1{font-size:36px;line-height:1.1}textarea{box-sizing:border-box;width:100%;font:16px system-ui;padding:16px;min-height:150px;border:1px solid #916a70;border-radius:16px}.space{height:900px}</style>
<main><h1>Same DO, within reach.</h1><p id="brief">Fictional fixture: prepare a short reply about Thursday.</p><label for="personal-assistant-input">Your task</label><textarea id="personal-assistant-input" data-do-primary-input>Keep this unsent draft</textarea><textarea id="do-source" aria-label="Existing writing workspace">Existing draft stays here</textarea><div class="space"></div><p>Page scrolling remains available.</p></main>`;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
    const errors = [], requests = [];
    // Every request is intercepted: fixture pages and source only, never live data.
    await context.route('**/*', route => { requests.push(route.request().url()); return route.fulfill({ contentType: 'text/html', body: fixture }); });
    page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path); await page.addScriptTag({ content: source }); };
    const focused = async id => { await page.waitForFunction(value => document.activeElement?.id === value, id); return true; };
    const touch = async (start, end) => {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * i / 8, y: start.y + (end.y - start.y) * i / 8 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await cdp.detach();
    };
    await visit('/do/personal');
    let launch = page.locator('.launch');
    await launch.tap();
    check('Personal D focuses the same composer', await focused('personal-assistant-input'));
    check('Personal D never loads another workspace', await page.locator('.panel iframe').getAttribute('src') === null);
    await launch.tap();
    check('Repeated taps keep the same draft', await page.locator('#personal-assistant-input').inputValue() === 'Keep this unsent draft');
    const before = await launch.boundingBox();
    await touch({ x: before.x + 30, y: before.y + 30 }, { x: 50, y: 160 });
    const moved = await launch.boundingBox();
    check('Touch drag moves D without opening a panel', Math.abs(moved.y - before.y) > 100 && !(await page.locator('.panel').isVisible()));
    check('Dragging never loads context or workspace', await page.locator('.panel iframe').getAttribute('src') === null);
    await launch.focus(); await page.keyboard.press('Alt+ArrowDown');
    const keyboardMoved = await launch.boundingBox();
    check('Alt and arrows move D without touch', Math.abs(keyboardMoved.y - moved.y - 24) < 1);
    await page.keyboard.press('Enter');
    check('Enter returns to existing composer', await focused('personal-assistant-input'));
    await page.evaluate(() => document.activeElement.blur());
    await touch({ x: 170, y: 650 }, { x: 170, y: 300 });
    await page.waitForFunction(() => scrollY > 50);
    check('Ordinary phone page scrolling remains available', await page.evaluate(() => scrollY > 50));
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: out + '/portable-personal-mobile-fixture.png', animations: 'disabled' });
    await page.reload(); await page.addScriptTag({ content: source });
    const restored = await page.locator('.launch').boundingBox();
    check('Only D position survives reload', Math.abs(restored.y - keyboardMoved.y) < 1 && await page.evaluate(() => Object.keys(localStorage).every(k => k === 'assembl:do:portable-position:v2')));
    await visit('/do/widget'); await page.locator('.launch').tap();
    check('Full-window D focuses its existing editor', await focused('do-source'));
    check('Full-window workspace has no nested workspace request', await page.locator('.panel iframe').getAttribute('src') === null);
    await visit('/do/install'); await page.locator('.launch').tap();
    check('Other pages retain the movable workspace', await page.locator('.panel').isVisible() && (await page.locator('.panel iframe').getAttribute('src')) === origin + '/do/widget');
    const panel = page.locator('.panel'), grab = page.locator('.grab');
    await grab.focus(); const panelBefore = await panel.boundingBox(); await page.keyboard.press('ArrowDown'); const panelAfter = await panel.boundingBox();
    check('Workspace drag handle is keyboard movable', panelAfter.y > panelBefore.y);
    await page.evaluate(() => { Object.defineProperty(window, 'visualViewport', { configurable: true, value: { width: 375, height: 350, offsetLeft: 0, offsetTop: 0 } }); dispatchEvent(new Event('resize')); });
    const small = await panel.boundingBox();
    check('Workspace stays within software-keyboard viewport', small.y >= 8 && small.y + small.height <= 343);
    await page.locator('.dock').tap();
    check('Reset keeps controls reachable', (await panel.boundingBox()).y === 8);
    await page.evaluate(() => { delete window.visualViewport; dispatchEvent(new Event('resize')); });
    await page.locator('.tools button').first().tap(); await page.locator('#brief').tap();
    check('Pointing requires local text review', await page.locator('.review').isVisible() && (await page.locator('.review textarea').inputValue()).startsWith('Fictional fixture:'));
    await page.screenshot({ path: out + '/portable-context-mobile-fixture.png', animations: 'disabled' });
    await page.locator('.close').tap();
    check('Minimise preserves existing workspace', !(await panel.isVisible()) && (await page.locator('.panel iframe').getAttribute('src')) === origin + '/do/widget');
    await page.evaluate(() => history.pushState({}, '', '/do/personal'));
    await page.locator('.launch').tap();
    check('SPA navigation returns to the same DO', await focused('personal-assistant-input') && !(await panel.isVisible()));
    const beforeResize = await page.locator('.launch').boundingBox();
    await page.setViewportSize({ width: 320, height: 640 });
    const immediateResize = await page.locator('.launch').boundingBox();
    // setViewportSize updates layout before the browser is guaranteed to dispatch resize.
    // Wait for the real handler to satisfy the same strict 8px bounds; do not force it.
    try {
      await page.waitForFunction(() => {
        const launcher = document.querySelector('[data-do-companion]')?.shadowRoot?.querySelector('.launch');
        if (!launcher) return false;
        const r = launcher.getBoundingClientRect();
        return innerWidth === 320 && innerHeight === 640 && r.left >= 8 && r.top >= 8 && r.right <= 312 && r.bottom <= 632;
      }, null, { timeout: 3000 });
    } finally {
      fs.writeFileSync(out + '/resize-geometry.json', JSON.stringify({ beforeResize, immediateResize, settled: await page.locator('.launch').boundingBox(), viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })) }, null, 2));
    }
    const narrow = await page.locator('.launch').boundingBox();
    check('D stays reachable at 320px', narrow.x >= 8 && narrow.y >= 8 && narrow.x + narrow.width <= 312 && narrow.y + narrow.height <= 632);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    check('Reduced motion disables glow transform transition', await page.locator('.spark').evaluate(e => getComputedStyle(e).transitionDuration === '0s'));
    check('No provider or API request from opening and moving', requests.every(url => !new URL(url).pathname.startsWith('/api/')));
    check('No browser runtime errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, fixtureOnly: true, physicalPhoneTested: false }, null, 2));
  } catch (error) {
    if (page) await page.screenshot({ path: out + '/failure.png', fullPage: true }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
