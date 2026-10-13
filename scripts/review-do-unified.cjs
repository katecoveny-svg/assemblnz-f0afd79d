/** Real built pages; guest interactions use only fictional text. No provider or external action. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3117';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/personal-do-proof/unified';
const checks = [], links = [], errors = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); console.log('PASS ' + name); };
const functionalAsset = '/brand/do-glass-D-transparent.png?v=cutout1';
const checkedAssets = new Set();
async function verifyFunctionalMark(page, root, label) {
  const mark = root.locator('[data-do-functional-mark] svg');
  await mark.waitFor({ state: 'visible' });
  check(`${label}: one decorative functional SVG with canonical viewBox`, await mark.count() === 1
    && await mark.getAttribute('viewBox') === '0 0 1254 1254'
    && await mark.getAttribute('aria-hidden') === 'true'
    && await mark.getAttribute('focusable') === 'false');
  check(`${label}: canonical artwork is displayed without colour masking or reconstructed paths`, await mark.evaluate((svg, asset) => {
    const images = svg.querySelectorAll('image');
    return images.length === 1 && svg.querySelectorAll('mask,path,rect').length === 0
      && images[0].getAttribute('href') === asset
      && images[0].getAttribute('width') === '1254' && images[0].getAttribute('height') === '1254';
  }, functionalAsset));
  const assetURL = new URL(functionalAsset, page.url()).href;
  if (!checkedAssets.has(assetURL)) {
    const response = await page.request.get(assetURL);
    check(`${label}: canonical PNG asset is served`, response.ok() && /image\/png/.test(response.headers()['content-type'] || ''));
    const source = await response.body();
    check(`${label}: exact locked glass D artwork`, require('node:crypto').createHash('sha256').update(source).digest('hex') === '1ac1808b169b631eb2a5cb3066a3935cfcea3f6bb4abf111822b9a74e5289091');
    checkedAssets.add(assetURL);
  }
  const decoded = await mark.evaluate(async svg => {
    const image = new Image();
    image.src = new URL(svg.querySelector('image').getAttribute('href'), document.baseURI).href;
    try { await image.decode(); } catch { return { loaded: false }; }
    return { loaded: image.complete, width: image.naturalWidth, height: image.naturalHeight };
  });
  check(`${label}: browser decodes the canonical glass artwork at the master dimensions`, decoded.loaded && decoded.width === 1254 && decoded.height === 1254);
  // Inspect actual browser paint, not a rasterisation of the master alone.
  const screenshot = await mark.screenshot({ animations: 'disabled' });
  const { data: pixels, info } = await require('sharp')(screenshot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const scale = Math.min(info.width / 1254, info.height / 1254);
  const sample = (x, y) => {
    const px = Math.min(info.width - 1, Math.max(0, Math.floor((info.width - 1254 * scale) / 2 + x * scale)));
    const py = Math.min(info.height - 1, Math.max(0, Math.floor((info.height - 1254 * scale) / 2 + y * scale)));
    return [...pixels.subarray((py * info.width + px) * info.channels, (py * info.width + px) * info.channels + 3)];
  };
  const outside = sample(20, 20), counter = sample(500, 420), body = sample(280, 640), bead = sample(640, 660);
  const distance = (a, b) => Math.max(...a.map((value, index) => Math.abs(value - b[index])));
  check(`${label}: tight screenshot paints the D and bead with an open counter and background`, distance(outside, counter) <= 24 && distance(body, outside) >= 30 && distance(bead, counter) >= 20);
  fs.writeFileSync(out + '/mark-' + label.replace(/[^a-z0-9]+/gi, '-') + '.png', screenshot);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(page.url() + ": " + error.message));
    const visit = async path => { const response = await page.goto(origin + path, { waitUntil: 'networkidle' }); assert.ok(response?.ok(), path); await page.evaluate(() => document.fonts.ready); return response; };
    await visit('/');
    await page.getByRole('heading', { name: 'assembl. Useful work.', level: 1, exact: true }).waitFor({ state: 'attached' });
    check('homepage has one accessible assembl invitation', await page.getByRole('heading', { name: 'assembl. Useful work.', level: 1, exact: true }).count() === 1);
    check('Open DO goes directly to the product', await page.getByRole('link', { name: 'Open DO', exact: true }).first().getAttribute('href') === '/do');
    await page.locator('.direction-4c[data-paused]').waitFor();
    check('reduced-motion homepage has a static scene and readable invitation', await page.locator('.direction-4c canvas').evaluate(el => getComputedStyle(el).display === 'none')
      && !await page.locator('.direction-4c').evaluate(el => el.hasAttribute('data-ready'))
      && await page.locator('[data-ref="msgRef"]').isVisible());
    check('all three product sections and public destinations remain available', await page.locator('#pursuit, #do, #studio').count() === 3
      && await page.getByRole('link', { name: 'Explore Pursuit', exact: true }).getAttribute('href') === '/pursuit'
      && await page.getByRole('link', { name: 'Explore Studio', exact: true }).getAttribute('href') === '/creative-studio');
    check('reduced motion does not start the decorative engine', await page.locator('script[src="/direction-4c/assembl-tide.js"]').count() === 0);
    await page.screenshot({ path: out + '/01-home-desktop.png' });
    await page.getByRole('link', { name: 'Open DO', exact: true }).first().click();
    await page.locator('#life-admin-source').waitFor();
    check('one click from Assembl reaches a working input', new URL(page.url()).pathname === '/do' && await page.locator('#life-admin-source').isVisible());
    const personal = page.locator('.do-app-shell > main[data-do-identity="assembled-glass"]');
    check('personal DO retains scoped brand tokens with the reviewed rose/lilac gradient', await personal.evaluate(el => {
      const style = getComputedStyle(el);
      return style.getPropertyValue('--do-chalk').trim().toUpperCase() === '#F5F1F2'
        && style.getPropertyValue('--do-plum').trim().toUpperCase() === '#240B21'
        && style.backgroundColor === 'rgb(250, 246, 247)' && style.backgroundImage.includes('radial-gradient');
    }));
    const artwork = personal.locator('[data-renderer="static-art"] img');
    await artwork.evaluate(el => el.decode());
    check('canonical D artwork loads without a canvas in reduced motion', await artwork.evaluate(el =>
      new URL(el.src).pathname === '/brand/do-glass-D-transparent.png' && el.complete && el.naturalWidth > 0)
      && await personal.locator('[data-renderer="static-art"] canvas').count() === 0);
    await verifyFunctionalMark(page, personal.getByRole('link', { name: 'DO by assembl, home', exact: true }), 'personal DO');
    check('canonical title has no duplicated product suffix', await page.title() === 'DO by assembl | Your personal agent for useful work');
    check('no duplicate floating app inside the app', await page.locator('[data-do-companion]').count() === 0);
    check('guest sees one composer', await page.locator('textarea:visible').count() === 1);
    await page.screenshot({ path: out + '/02-do-desktop.png' });
    await page.setViewportSize({ width: 375, height: 812 });
    check('mobile has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('mobile composer and action are above the fold', await page.locator('#life-admin-source').evaluate(e => e.getBoundingClientRect().bottom < innerHeight) && await page.getByRole('button', { name: 'Start', exact: true }).evaluate(e => e.getBoundingClientRect().bottom < innerHeight));
    await page.screenshot({ path: out + '/03-do-375.png' });
    await page.getByRole('button', { name: 'Try a fictional example', exact: true }).click();
    await page.getByRole('button', { name: 'Try fictional school notice', exact: true }).click();
    check('example produces real reviewable local work', await page.locator('#personal-do-result').isVisible());
    check('example remains labelled fictional', (await page.locator('body').innerText()).includes('Fictional example'));
    await page.screenshot({ path: out + '/04-local-result-375.png', fullPage: true });
    await page.getByRole('link', { name: 'Sign in', exact: true }).first().click();
    check('sign-in does not discard guest work silently', await page.getByRole('dialog').isVisible());
    await page.getByRole('button', { name: 'Stay and keep my work' }).click();
    check('cancel keeps the same local work', await page.locator('#personal-do-result').isVisible());
    // Fresh tab avoids accepting the browser's unsaved-work warning in test cleanup.
    const clean = await context.newPage(); clean.on('pageerror', e => errors.push(clean.url() + ": " + e.message));
    for (const path of ['/', '/do', '/do/personal', '/do?open=1', '/do?task=plan', '/do/widget?task=rewrite', '/do/widget?tool=look', '/do/meetings', '/do/bills', '/do/enquiries', '/do/install', '/do/install#chrome', '/do/billing', '/do/share', '/do/live', '/do/shop', '/do/travel', '/about', '/contact', '/pursuit', '/creative-studio', '/legal/privacy', '/login?redirect=%2Fdo']) {
      await clean.goto('about:blank'); // Force an HTTP navigation even for same-page hash routes.
      const response = await clean.goto(origin + path, { waitUntil: 'networkidle' });
      const title = await clean.title(); const final = new URL(clean.url());
      links.push({ path, status: response.status(), final: final.pathname + final.search + final.hash, title });
      check(`route ${path}`, response.ok());
      if (path === '/do?task=plan') check(`${path} retains task`, final.pathname === '/do/widget' && final.searchParams.get('task') === 'plan');
      if (path === '/do/shop' || path === '/do/travel') {
        check(`${path} retains its distinct preparation surface`, final.pathname === path);
        check(`${path} labels session-only preparation`, (await clean.locator('body').innerText()).toLowerCase().includes('session only'));
        if (path === '/do/shop') {
          await clean.getByLabel('I reviewed every pantry quantity').check();
          await clean.getByRole('button', { name: 'Prepare sample basket', exact: true }).dblclick();
          await clean.getByLabel('I reviewed quantities, substitutions, leftovers, allergen limits and uncertain fees/weights').check();
          await clean.getByRole('button', { name: 'Decline preparation', exact: true }).click();
          await clean.getByRole('button', { name: 'Prepare sample basket', exact: true }).click();
          check('Shop retry cannot revive declined preparation', !(await clean.getByRole('button', { name: 'Save prepared receipt', exact: true }).isEnabled()));
          await clean.getByRole('button', { name: 'Start new revision', exact: true }).click();
          await clean.getByRole('button', { name: 'Prepare sample basket', exact: true }).click();
          await clean.getByLabel('I chose to use pantry stock first').check();
          await clean.getByRole('button', { name: 'Record optional activity', exact: true }).click();
          await clean.getByLabel('Budget (NZD)', { exact: true }).fill('0');
          await clean.getByRole('button', { name: 'Prepare sample basket', exact: true }).click();
          await clean.getByLabel('Budget (NZD)', { exact: true }).fill('60');
          await clean.getByRole('button', { name: 'Prepare sample basket', exact: true }).click();
          check('Recoverable Shop validation preserves pending simulated utility', (await clean.locator('body').innerText()).includes('Simulated reward pending'));
          await clean.getByLabel('I reviewed quantities, substitutions, leftovers, allergen limits and uncertain fees/weights').check();
          await clean.getByRole('button', { name: 'Save prepared receipt', exact: true }).dblclick();
          check('Shop duplicate clicks leave one prepared receipt', await clean.getByRole('heading', { name: 'Prepared — nothing ordered', exact: true }).count() === 1);
          await clean.getByLabel('Budget (NZD)', { exact: true }).fill('65');
          check('Shop edit removes stale receipt', await clean.getByRole('heading', { name: 'Prepared — nothing ordered', exact: true }).count() === 0);
        } else {
          await clean.getByRole('button', { name: 'Prepare itinerary', exact: true }).dblclick();
          await clean.getByLabel('I reviewed every itinerary field, estimate and unknown fee').check();
          await clean.getByRole('button', { name: 'Save prepared receipt', exact: true }).dblclick();
          check('Travel duplicate clicks leave one prepared receipt', await clean.getByRole('heading', { name: 'Prepared — nothing booked', exact: true }).count() === 1);
          await clean.getByLabel('Budget (NZD)', { exact: true }).fill('550');
          check('Travel edit removes stale receipt', await clean.getByRole('heading', { name: 'Prepared — nothing booked', exact: true }).count() === 0);
        }
        check(`${path} has no horizontal overflow`, await clean.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    }
    await clean.goto(origin + '/login?redirect=%2Fdo', { waitUntil: 'networkidle' });
    check('ordinary login retains the DO return destination', new URL(clean.url()).pathname === '/login' && new URL(clean.url()).searchParams.get('redirect') === '/do' && await clean.getByRole('heading', { name: 'Sign in to DO', exact: true }).isVisible());
    const emailInput = clean.getByRole('textbox', { name: 'Email', exact: true });
    if (await emailInput.count()) {
      check('configured login has an email form', await emailInput.isVisible());
      check('login is not submitted by this proof', await clean.getByRole('button', { name: 'email me a link', exact: true }).isDisabled());
    } else {
      check('unconfigured login fails closed explicitly', await clean.getByText('Configuration missing', { exact: true }).isVisible());
      check('unconfigured login cannot submit', await clean.getByRole('button', { name: 'email me a link', exact: true }).count() === 0);
    }
    await clean.screenshot({ path: out + '/09-login-return.png' });
    await clean.goto(origin + '/do/billing', { waitUntil: 'networkidle' });
    check('unconfigured consumer billing offers no sale', (await clean.locator('main').innerText()).includes('Personal DO subscriptions are not available yet.') && await clean.getByRole('button', { name: 'Continue to secure checkout', exact: true }).count() === 0);
    await clean.screenshot({ path: out + '/10-billing-disabled.png' });
    await clean.setViewportSize({ width: 375, height: 812 });
    check('billing page fits 375px', await clean.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const shortcuts = clean.getByRole('navigation', { name: 'DO workspace shortcuts', exact: true });
    check('billing shortcut bar stays fixed within the phone viewport', await shortcuts.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return getComputedStyle(el).position === 'fixed' && rect.left >= 0 && rect.right <= innerWidth;
    }));
    check('billing retains both visible functional shortcuts', await shortcuts.getByRole('link', { name: 'DO home', exact: true }).isVisible() && await shortcuts.getByRole('link', { name: 'Privacy', exact: true }).isVisible() && await shortcuts.getByRole('link', { name: 'DO home', exact: true }).getAttribute('href') === '/do' && await shortcuts.getByRole('link', { name: 'Privacy', exact: true }).getAttribute('href') === '/legal/privacy');
    await clean.screenshot({ path: out + '/11-billing-disabled-375.png', fullPage: true });
    await shortcuts.getByRole('link', { name: 'DO home', exact: true }).click();
    await clean.locator('#life-admin-source').waitFor();
    check('billing phone shortcut opens the DO workspace', new URL(clean.url()).pathname === '/do');
    await clean.setViewportSize({ width: 1440, height: 1000 });

    await clean.goto(origin + '/do/widget?tool=look', { waitUntil: 'networkidle' });
    await clean.locator('details').filter({has:clean.locator('nav[aria-label="More DO tools"]')}).locator(':scope > summary').click();
    const signIn = clean.getByRole('link', { name: 'Sign in', exact: true }).first();
    check('sign-in retains the selected portable tool', (await signIn.getAttribute('href')).includes('%3Ftool%3Dlook'));
    check('consumer menu does not expose seeded developer board', await clean.getByRole('link', { name: 'Saved tasks', exact: true }).count() === 0);
    // Exercise the shared component on a real server route without hydration.
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const serverPage = await noJS.newPage();
    serverPage.on('pageerror', error => errors.push(serverPage.url() + ': ' + error.message));
    const installResponse = await serverPage.goto(origin + '/do/install', { waitUntil: 'networkidle' });
    check('no-JS /do/install is a real server page', installResponse?.ok() && await serverPage.getByRole('heading', { name: 'Keep DO close.', exact: true }).isVisible());
    const serverBrand = serverPage.getByRole('link', { name: 'DO by assembl, home', exact: true });
    check('no-JS install header retains its DO destination', await serverBrand.getAttribute('href') === '/do');
    await verifyFunctionalMark(serverPage, serverBrand, 'no-JS install header');
    check('no-JS install fits the phone viewport', await serverPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await serverPage.screenshot({ path: out + '/12-install-no-js-375.png' });
    await noJS.close();
    await clean.goto(origin + '/do/install', { waitUntil: 'networkidle' });
    await verifyFunctionalMark(clean, clean.getByRole('link', { name: 'DO by assembl, home', exact: true }), 'hydrated install header');
    for (const width of [1440, 375]) {
      await clean.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
      await clean.goto(origin + '/contact', { waitUntil: 'networkidle' });
      const trigger = clean.getByRole('button', { name: 'Ask DO', exact: true });
      await trigger.click();
      const panel = clean.getByRole('region', { name: 'DO drafting workspace', exact: true });
      check(`hydrated contact widget opens at ${width}px`, await panel.isVisible());
      await verifyFunctionalMark(clean, panel.getByRole('link', { name: 'DO by assembl, home', exact: true }), `contact widget ${width}px`);
      check(`contact widget fits ${width}px`, await panel.evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
      await clean.screenshot({ path: out + `/13-contact-widget-${width}.png` });
      await clean.keyboard.press('Escape');
      check(`contact widget closes and returns focus at ${width}px`, await panel.count() === 0 && await trigger.evaluate(el => el === document.activeElement));
    }
    await clean.setViewportSize({ width: 1440, height: 1000 });
    await clean.goto(origin + '/do/install#chrome', { waitUntil: 'networkidle' });
    check('existing Chrome anchor opens secondary setup', await clean.locator('#chrome').isVisible());
    await clean.setViewportSize({ width: 375, height: 812 });
    check('install page fits 375px', await clean.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await clean.goto(origin + '/do/install', { waitUntil: 'networkidle' });
    await clean.screenshot({ path: out + '/05-install-375.png' });
    await clean.goto(origin + '/', { waitUntil: 'networkidle' });
    await clean.screenshot({ path: out + '/06-home-375.png' });
    // The company scene is distinct from DO's product identity renderer.
    await clean.setViewportSize({ width: 1440, height: 1000 }); await clean.emulateMedia({ reducedMotion: 'no-preference' });
    await clean.reload({ waitUntil: 'networkidle' });
    const scene = clean.locator('.direction-4c');
    const renderer = 'direction-4c-tide';
    await clean.waitForFunction(() => document.querySelector('.direction-4c[data-ready="true"] canvas'), null, { timeout: 15000 });
    check('normal motion renders the supplied tide canvas', await scene.locator('canvas').isVisible());
    await clean.getByRole('button', { name: 'Pause motion', exact: true }).click();
    check('scene pause is explicit', await clean.getByRole('button', { name: 'Play motion', exact: true }).getAttribute('aria-pressed') === 'true');
    await clean.evaluate(() => scrollTo({ top: innerHeight, behavior: 'instant' }));
    check('paused parallax stays reset during scrolling', await clean.locator('[data-par]').evaluateAll(nodes => nodes.every(el => getComputedStyle(el).transform === 'none')));
    await clean.screenshot({ path: out + '/07-home-motion.png', animations: 'disabled', timeout: 60000 });
    await clean.getByRole('button', { name: 'Play motion', exact: true }).click();
    check('scene resumes explicitly', await clean.getByRole('button', { name: 'Pause motion', exact: true }).getAttribute('aria-pressed') === 'false');
    await clean.emulateMedia({ reducedMotion: 'reduce' });
    await clean.waitForFunction(() => !document.querySelector('.direction-4c[data-ready]') && getComputedStyle(document.querySelector('.direction-4c canvas')).display === 'none');
    check('dynamic reduced motion retains readable content', await clean.locator('[data-ref="msgRef"]').isVisible() && await clean.getByRole('link', { name: 'Open DO', exact: true }).isVisible());
    await clean.emulateMedia({ reducedMotion: 'no-preference' });
    await clean.waitForFunction(() => document.querySelector('.direction-4c[data-ready="true"]'));
    check('scene returns after reduced-motion preference changes', await scene.locator('canvas').isVisible());
    const fallback = await context.newPage();
    await fallback.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (String(type).startsWith('webgl')) return null; return original.call(this, type, ...args); }; });
    await fallback.emulateMedia({ reducedMotion: 'no-preference' });
    await fallback.goto(origin + '/', { waitUntil: 'networkidle' });
    await fallback.waitForFunction(() => document.querySelector('.direction-4c[data-static="true"]'));
    check('WebGL unavailable keeps readable content and product links', await fallback.locator('[data-ref="msgRef"]').isVisible() && await fallback.getByRole('link', { name: 'Open DO', exact: true }).isVisible() && await fallback.locator('.direction-4c canvas').evaluate(el => getComputedStyle(el).display === 'none'));
    await fallback.screenshot({ path: out + '/08-webgl-fallback.png', animations: 'disabled', timeout: 60000 });
    await fallback.close();
    await clean.emulateMedia({ reducedMotion: 'reduce' });
    await clean.waitForTimeout(650); // Dispose the earlier normal-motion GL context before static screenshots.
    for (const width of [1440, 375]) {
      await clean.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
      for (const path of ['/do', '/do/personal', '/do/bills', '/do/billing', '/do/install', '/do/typesafe']) {
        const response = await clean.goto(origin + path, { waitUntil: 'networkidle' });
        check(`standalone DO route ${path} responds at ${width}px`, response?.ok());
        const destinations = await clean.locator('a[href]').evaluateAll(nodes => nodes.map(node => new URL(node.href).pathname));
        // Existing main DoProductFrame intentionally exposes voice setup inside More DO tools.
        // Review this exact shared sub-tool while continuing to reject other product doors.
        const voiceSetup = clean.locator('a[href="/creative-studio/voices"]');
        if (await voiceSetup.count()) check(`voice setup stays inside More DO tools on ${path} at ${width}px`, await voiceSetup.count() === 1 && await voiceSetup.evaluate(el => Boolean(el.closest('nav[aria-label="More DO tools"]')&&el.closest('details'))));
        check(`no unrelated cross-product links on ${path} at ${width}px`, destinations.every(destination => destination === '/creative-studio/voices' || !/^\/(pursuit|creative-studio|hub|hubs|customers)(\/|$)/.test(destination)));
        check(`no horizontal overflow on ${path} at ${width}px`, await clean.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (path === '/do' || path === '/do/bills') {
          await clean.evaluate(() => document.fonts.ready);
          check(`Instrument Sans loaded on ${path} at ${width}px`, await clean.locator('h1').evaluate(el => /Instrument.?Sans/i.test(getComputedStyle(el).fontFamily) && document.fonts.check(`16px ${getComputedStyle(el).fontFamily.split(',')[0]}`)));
          await clean.screenshot({ path: out + `/pink-${path === '/do' ? 'home' : 'bills'}-${width}.png`, fullPage: true, animations: 'disabled', timeout: 60000 });
        }
      }
    }
    check('no unexpected runtime page errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, links, errors, renderer, claims: 'Real anonymous HTTP and guest local interaction. No provider, signed-in account, real microphone, native install or external execution tested.' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); fs.writeFileSync(out + '/failure.json', JSON.stringify({ checks, links, errors, error: String(error) }, null, 2)); process.exitCode = 1; });
