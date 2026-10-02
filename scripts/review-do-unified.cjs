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
    page.on('pageerror', error => errors.push(page.url() + ": " + error.message));
    const visit = async path => { const response = await page.goto(origin + path, { waitUntil: 'networkidle' }); assert.ok(response?.ok(), path); await page.evaluate(() => document.fonts.ready); return response; };
    await visit('/');
    await page.getByRole('heading', { name: 'assembl the work.', level: 1, exact: true }).waitFor();
    check('homepage has one assembl invitation', await page.getByRole('heading', { name: 'assembl the work.', level: 1, exact: true }).count() === 1);
    check('Open DO goes directly to the product', await page.getByRole('link', { name: 'Open DO', exact: true }).first().getAttribute('href') === '/do');
    await page.waitForFunction(() => document.querySelector('[data-chapter][data-static="true"]'));
    check('reduced-motion homepage has a static scene and complete work loop', await page.locator('[data-world="atelier"] canvas').count() === 0 && await page.getByLabel('The complete work loop', { exact: true }).isVisible());
    check('deeper atelier remains optional and unmounted', !await page.locator('.refined-atelier').evaluate(el => el.open) && await page.locator('.refined-atelier canvas').count() === 0);
    await page.screenshot({ path: out + '/01-home-desktop.png' });
    await page.getByRole('link', { name: 'Open DO', exact: true }).first().click();
    await page.locator('#life-admin-source').waitFor();
    check('one click from Assembl reaches a working input', new URL(page.url()).pathname === '/do' && await page.locator('#life-admin-source').isVisible());
    const personal = page.locator('.do-app-shell > main[data-do-identity="assembled-glass"]');
    check('personal DO has the approved scoped chalk canvas and plum identity role', await personal.evaluate(el => {
      const style = getComputedStyle(el);
      return style.getPropertyValue('--do-chalk').trim().toUpperCase() === '#F5F1F2'
        && style.getPropertyValue('--do-plum').trim().toUpperCase() === '#240B21'
        && style.backgroundColor === 'rgb(245, 241, 242)' && style.backgroundImage === 'none';
    }));
    const artwork = personal.locator('[data-renderer="static-art"] img');
    await artwork.evaluate(el => el.decode());
    check('approved assembled plum glass artwork is loaded as static art in reduced motion', await artwork.evaluate(el =>
      new URL(el.src).pathname === '/brand/do-assembled-plum.webp' && el.complete && el.naturalWidth > 0)
      && await personal.locator('[data-renderer="static-art"] canvas').count() === 0);
    const mark = personal.getByRole('link', { name: 'DO by assembl, home', exact: true }).locator('[data-glass-identity="do"] img');
    await mark.evaluate(el => el.decode());
    check('personal DO loads the exact approved glass D artwork including its dot',
      await mark.evaluate(el => new URL(el.src).pathname === '/brand/do-assembled-plum.webp' && new URL(el.src).searchParams.get('v') === 'glass07'
        && el.complete && el.naturalWidth === 1200 && el.naturalHeight === 800));
    check('canonical title has no duplicated product suffix', await page.title() === 'DO by assembl');
    check('no duplicate floating app inside the app', await page.locator('[data-do-companion]').count() === 0);
    check('guest sees one composer', await page.locator('textarea:visible').count() === 1);
    await page.screenshot({ path: out + '/02-do-desktop.png' });
    await page.setViewportSize({ width: 375, height: 812 });
    check('mobile has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('mobile composer and action are above the fold', await page.locator('#life-admin-source').evaluate(e => e.getBoundingClientRect().bottom < innerHeight) && await page.getByRole('button', { name: 'Start', exact: true }).evaluate(e => e.getBoundingClientRect().bottom < innerHeight));
    await page.screenshot({ path: out + '/03-do-375.png' });
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
    for (const path of ['/', '/do', '/do/personal', '/do?open=1', '/do?task=plan', '/do/widget?task=rewrite', '/do/widget?tool=look', '/do/meetings', '/do/bills', '/do/enquiries', '/do/install', '/do/install#chrome', '/do/billing', '/do/share', '/do/live', '/do/travel', '/about', '/contact', '/pursuit', '/creative-studio', '/legal/privacy', '/login?redirect=%2Fdo']) {
      await clean.goto('about:blank'); // Force an HTTP navigation even for same-page hash routes.
      const response = await clean.goto(origin + path, { waitUntil: 'networkidle' });
      const title = await clean.title(); const final = new URL(clean.url());
      links.push({ path, status: response.status(), final: final.pathname + final.search + final.hash, title });
      check(`route ${path}`, response.ok());
      if (path === '/do?task=plan' || path === '/do/travel') check(`${path} retains task`, final.pathname === '/do/widget' && final.searchParams.get('task') === 'plan');
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
    // The company scene is distinct from DO's product identity renderer.
    await clean.setViewportSize({ width: 1440, height: 1000 }); await clean.emulateMedia({ reducedMotion: 'no-preference' });
    await clean.reload({ waitUntil: 'networkidle' });
    const scene = clean.locator('[data-world="atelier"]');
    await clean.waitForFunction(() => document.querySelector('[data-world="atelier"][data-scene-ready="true"] canvas'), null, { timeout: 15000 });
    const renderer = 'assembl-world-3d';
    check('normal motion renders the actual assembl scene', await scene.locator('canvas').isVisible());
    for (const [index, product] of ['Pursuit', 'DO', 'Studio'].entries()) {
      await clean.getByRole('button', { name: `View ${product} scene`, exact: true }).click();
      await clean.waitForFunction(index => document.querySelector('[data-chapter]')?.getAttribute('data-chapter') === String(index), index);
      check(`${product} chapter is selectable`, await clean.getByRole('button', { name: `View ${product} scene`, exact: true }).getAttribute('aria-pressed') === 'true');
    }
    await clean.getByRole('button', { name: 'Pause scene motion', exact: true }).click();
    check('scene pause is explicit', await clean.getByRole('button', { name: 'Resume scene motion', exact: true }).getAttribute('aria-pressed') === 'true');
    await clean.screenshot({ path: out + '/07-home-motion.png', animations: 'disabled', timeout: 60000 });
    await clean.getByRole('button', { name: 'Resume scene motion', exact: true }).click();
    check('scene resumes explicitly', await clean.getByRole('button', { name: 'Pause scene motion', exact: true }).getAttribute('aria-pressed') === 'false');
    await clean.evaluate(() => {
      const rail = document.querySelector('[data-chapter]');
      if (!rail) throw new Error('Missing assembl scene rail');
      scrollTo({ top: scrollY + rail.getBoundingClientRect().bottom + 1, behavior: 'instant' });
    });
    check('scene rail is offscreen before renderer teardown', await clean.locator('[data-chapter]').evaluate(el => el.getBoundingClientRect().bottom <= 0));
    await clean.waitForFunction(() => !document.querySelector('[data-world="atelier"] canvas'));
    check('offscreen scene releases its renderer', await scene.locator('canvas').count() === 0);
    await clean.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await clean.waitForFunction(() => document.querySelector('[data-world="atelier"][data-scene-ready="true"] canvas'));
    check('scene returns after offscreen teardown', await scene.locator('canvas').isVisible());
    await clean.emulateMedia({ reducedMotion: 'reduce' });
    await clean.waitForFunction(() => document.querySelector('[data-chapter][data-static="true"]') && !document.querySelector('[data-world="atelier"] canvas'));
    check('reduced motion retains the complete work loop', await clean.getByLabel('The complete work loop', { exact: true }).isVisible());
    await clean.emulateMedia({ reducedMotion: 'no-preference' });
    await clean.waitForFunction(() => document.querySelector('[data-world="atelier"][data-scene-ready="true"] canvas'));
    check('scene returns after reduced-motion preference changes', await scene.locator('canvas').isVisible());
    const fallback = await context.newPage();
    await fallback.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (String(type).startsWith('webgl')) return null; return original.call(this, type, ...args); }; });
    await fallback.emulateMedia({ reducedMotion: 'no-preference' });
    await fallback.goto(origin + '/', { waitUntil: 'networkidle' });
    await fallback.waitForFunction(() => document.querySelector('[data-chapter][data-static="true"]'));
    check('WebGL unavailable keeps the visible scene poster and complete work loop', await fallback.locator('[data-world="atelier"] img').last().evaluate(img => img.complete && img.naturalWidth > 0) && await fallback.getByLabel('The complete work loop', { exact: true }).isVisible() && await fallback.getByRole('link', { name: 'Open DO', exact: true }).first().isVisible());
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
        check(`no cross-product links on ${path} at ${width}px`, destinations.every(path => !/^\/(pursuit|creative-studio|hub|hubs|customers)(\/|$)/.test(path)));
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
