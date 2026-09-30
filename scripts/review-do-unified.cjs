/** Real built pages; guest interactions use only fictional text. No provider or external action. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3117';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/personal-do-proof/unified';
const checks = [], links = [], errors = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); console.log('PASS ' + name); };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { const response = await page.goto(origin + path, { waitUntil: 'networkidle' }); assert.ok(response?.ok(), path); await page.evaluate(() => document.fonts.ready); return response; };
    await visit('/');
    check('homepage has one invitation', await page.getByRole('heading', { name: 'What needs doing?', exact: true }).count() === 1);
    check('Open DO goes directly to the product', await page.getByRole('link', { name: 'Open DO', exact: true }).first().getAttribute('href') === '/do');
    check('atelier is optional and not mounted', await page.locator('canvas').count() === 0);
    await page.screenshot({ path: out + '/01-home-desktop.png' });
    await page.getByRole('link', { name: 'Open DO', exact: true }).first().click();
    await page.locator('#life-admin-source').waitFor();
    check('one click from Assembl reaches a working input', new URL(page.url()).pathname === '/do' && await page.locator('#life-admin-source').isVisible());
    check('canonical title has no duplicated product suffix', await page.title() === 'DO by assembl');
    check('no duplicate floating app inside the app', await page.locator('[data-do-companion]').count() === 0);
    check('guest sees one composer', await page.locator('textarea:visible').count() === 1);
    await page.screenshot({ path: out + '/02-do-desktop.png' });
    await page.setViewportSize({ width: 375, height: 812 });
    check('mobile has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('mobile composer and action are above the fold', await page.locator('#life-admin-source').evaluate(e => e.getBoundingClientRect().bottom < innerHeight) && await page.getByRole('button', { name: 'Start', exact: true }).evaluate(e => e.getBoundingClientRect().bottom < innerHeight));
    await page.screenshot({ path: out + '/03-do-375.png' });
    await page.getByRole('button', { name: 'See an example', exact: false }).click();
    await page.getByRole('button', { name: 'Try school notice', exact: true }).click();
    check('example produces real reviewable local work', await page.locator('#personal-do-result').isVisible());
    check('example remains labelled fictional', (await page.locator('body').innerText()).includes('Fictional example'));
    await page.screenshot({ path: out + '/04-local-result-375.png', fullPage: true });
    await page.getByRole('navigation', { name: 'DO', exact: true }).getByRole('link', { name: 'Sign in', exact: false }).click();
    check('sign-in does not discard guest work silently', await page.getByRole('dialog').isVisible());
    await page.getByRole('button', { name: 'Stay and keep my work' }).click();
    check('cancel keeps the same local work', await page.locator('#personal-do-result').isVisible());
    // Fresh tab avoids accepting the browser's unsaved-work warning in test cleanup.
    const clean = await context.newPage(); clean.on('pageerror', e => errors.push(e.message));
    for (const path of ['/', '/do', '/do/personal', '/do?open=1', '/do?task=plan', '/do/widget?task=rewrite', '/do/widget?tool=look', '/do/meetings', '/do/bills', '/do/enquiries', '/do/install', '/do/install#chrome', '/do/share', '/do/live', '/do/travel', '/about', '/contact', '/pursuit', '/creative-studio', '/legal/privacy', '/login?redirect=%2Fdo']) {
      const response = await clean.goto(origin + path, { waitUntil: 'domcontentloaded' });
      const title = await clean.title(); const final = new URL(clean.url());
      links.push({ path, status: response.status(), final: final.pathname + final.search + final.hash, title });
      check(`route ${path}`, response.ok());
      if (path === '/do?task=plan' || path === '/do/travel') check(`${path} retains task`, final.pathname === '/do/widget' && final.searchParams.get('task') === 'plan');
    }
    await clean.goto(origin + '/do/widget?tool=look', { waitUntil: 'networkidle' });
    await clean.locator('summary[aria-label="More DO tools"]').click();
    const signIn = clean.getByRole('link', { name: 'Sign in', exact: true }).first();
    check('sign-in retains the selected portable tool', (await signIn.getAttribute('href')).includes('%3Ftool%3Dlook'));
    check('consumer menu does not expose seeded developer board', await clean.getByRole('link', { name: 'Saved tasks', exact: true }).count() === 0);
    await clean.goto(origin + '/do/install#chrome', { waitUntil: 'networkidle' });
    check('existing Chrome anchor opens secondary setup', await clean.locator('#chrome').isVisible());
    await clean.setViewportSize({ width: 375, height: 812 });
    check('install page fits 375px', await clean.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await clean.goto(origin + '/do/install', { waitUntil: 'networkidle' });
    await clean.screenshot({ path: out + '/05-install-375.png' });
    await clean.goto(origin + '/', { waitUntil: 'networkidle' });
    await clean.screenshot({ path: out + '/06-home-375.png' });
    // Normal-motion view must either render real 3D or retain the complete visible fallback.
    await clean.setViewportSize({ width: 1440, height: 1000 }); await clean.emulateMedia({ reducedMotion: 'no-preference' });
    await clean.reload({ waitUntil: 'networkidle' });
    await clean.locator('[data-renderer]').waitFor();
    await clean.waitForFunction(() => document.querySelector('[data-renderer="3d"]'), null, { timeout: 15000 });
    const renderer = await clean.locator('[data-renderer]').getAttribute('data-renderer');
    check('normal motion renders actual 3D', renderer === '3d');
    check('3D enhancement does not hide the primary action', await clean.getByRole('link', { name: 'Open DO', exact: true }).first().isVisible());
    await clean.screenshot({ path: out + '/07-home-motion.png' });
    await clean.locator('#products').scrollIntoViewIfNeeded();
    await clean.waitForFunction(() => !document.querySelector('[data-renderer] canvas'));
    // R3F intentionally disposes the old GL context 500ms after unmount.
    await clean.waitForTimeout(650);
    await clean.locator('[data-renderer]').scrollIntoViewIfNeeded();
    await clean.waitForFunction(() => document.querySelector('[data-renderer="3d"]'));
    check('3D returns after offscreen teardown', await clean.locator('[data-renderer="3d"]').isVisible());
    await clean.emulateMedia({ reducedMotion: 'reduce' });
    await clean.waitForFunction(() => !document.querySelector('[data-renderer] canvas'));
    // R3F intentionally disposes the old GL context 500ms after unmount.
    await clean.waitForTimeout(650);
    check('reduced motion has a complete static mark', await clean.locator('[data-renderer="static"]').isVisible());
    await clean.emulateMedia({ reducedMotion: 'no-preference' });
    await clean.waitForFunction(() => document.querySelector('[data-renderer="3d"]'));
    check('3D returns after reduced-motion preference changes', await clean.locator('[data-renderer="3d"]').isVisible());
    const fallback = await context.newPage();
    await fallback.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (String(type).startsWith('webgl')) return null; return original.call(this, type, ...args); }; });
    await fallback.emulateMedia({ reducedMotion: 'no-preference' });
    await fallback.goto(origin + '/', { waitUntil: 'networkidle' });
    check('WebGL unavailable keeps complete static identity', await fallback.locator('[data-renderer="static"]').isVisible() && await fallback.getByRole('link', { name: 'Open DO', exact: true }).first().isVisible());
    await fallback.screenshot({ path: out + '/08-webgl-fallback.png' });
    check('no unexpected runtime page errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, links, errors, renderer, claims: 'Real anonymous HTTP and guest local interaction. No provider, signed-in account, real microphone, native install or external execution tested.' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); fs.writeFileSync(out + '/failure.json', JSON.stringify({ checks, links, errors, error: String(error) }, null, 2)); process.exitCode = 1; });
