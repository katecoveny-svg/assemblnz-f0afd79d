/* Local review: start the dev server and browser in one process namespace.
 * ASSEMBL_PLAYWRIGHT_MODULE and ASSEMBL_CHROMIUM_PATH support managed runtimes.
 * No model calls, live account data, purchases, publishing or microphone capture.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const out = path.resolve(process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/assembl-do-studio-review');
const port = process.env.ASSEMBL_REVIEW_PORT || '3018';
const origin = `http://127.0.0.1:${port}`;
const checks = [];
const check = (name, pass) => { assert.ok(pass, name); checks.push(name); console.log(`PASS ${name}`); };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const log = fs.openSync(path.join(out, 'server.log'), 'w');
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', process.env.ASSEMBL_REVIEW_SERVER || 'dev', '--hostname', '127.0.0.1', '--port', port], { stdio: ['ignore', log, log] });
  let browser;
  try {
    let started = false;
    for (let i = 0; i < 90; i++) {
      try { await fetch(origin + '/creative-studio', { signal: AbortSignal.timeout(60000) }); started = true; break; }
      catch { await new Promise(r => setTimeout(r, 500)); }
    }
    assert.ok(started, 'Dev server starts');
    browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || undefined, headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const visit = route => page.goto(origin + route, { waitUntil: 'networkidle', timeout: 120000 });
    const fit = async name => check(name + ' has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const snap = async name => { await page.addStyleTag({content:'nextjs-portal{display:none!important}'}); await page.screenshot({ path: path.join(out, name + '.png'), fullPage: false, animations: 'disabled' }); };
    await visit('/creative-studio');
    await fit('Studio desktop'); await snap('studio-desktop');
    check('New Studio art loaded', await page.locator('img[src*="creative-work-taking-shape"]').evaluate(img => img.complete && img.naturalWidth > 0));
    await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
    check('Hero motion can be paused', await page.getByRole('button', { name: 'Resume motion' }).getAttribute('aria-pressed') === 'true');
    const tour = page.getByRole('button', { name: 'Play spatial tour' });
    await tour.scrollIntoViewIfNeeded(); await tour.click();
    await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 25000 });
    check('Actual 3D scene loads', await page.locator('[data-world="atelier"] canvas').count() === 1);
    await page.getByRole('button', { name: 'Pause tour' }).click();
    const range = page.getByRole('slider', { name: 'Tour position' });
    await range.fill('75');
    check('Tour scrubs into Studio chapter', await page.getByText('Studio / the possibility', { exact: true }).isVisible());
    await page.waitForTimeout(1500); await snap('studio-tour');
    await page.setViewportSize({ width: 375, height: 812 });
    await visit('/creative-studio'); await fit('Studio 375px'); await snap('studio-mobile');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByText('Still view · reduced motion is on').scrollIntoViewIfNeeded();
    check('Reduced motion uses still view', await page.locator('[data-world="atelier"] canvas').count() === 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await visit('/do/meetings');
    await fit('Meeting 375px'); await snap('meeting-mobile');
    check('Recording requires consent', await page.getByRole('button', { name: 'Start recording' }).isDisabled());
    await page.getByLabel('What should this meeting resolve?').fill('Agree the pilot scope');
    await page.getByLabel('My notes', { exact: true }).fill('Keep the first release focused. Fictional review data.');
    await page.getByRole('button', { name: 'Before we wrap', exact: false }).click();
    await page.getByLabel('What did you decide?').fill('Prepare one read-only integration pilot.');
    await page.getByRole('button', { name: 'Add a next step' }).click();
    await page.getByLabel('Work to do', { exact: true }).fill('Prepare a pilot proposal');
    check('Missing owner is surfaced', await page.getByText('Next step 1: agree who owns it.', {exact:true}).isVisible());
    await page.getByLabel('Owner', { exact: true }).fill('Kate');
    await page.getByLabel('Due', { exact: true }).fill('Friday, date to confirm');
    check('Completed fields are acknowledged', await page.getByText('The closing fields are complete.').isVisible());
    await page.getByRole('button', { name: 'Prepare my work pack' }).click();
    const share = page.getByRole('button', { name: 'Share work pack', exact: true });
    check('Pack sharing starts disabled', await share.isDisabled());
    await page.getByLabel('I checked this pack and want to share these details.').check();
    check('Review enables sharing', await share.isEnabled());
    // Native sheet invocation is simulated; actual phone share sheets need device QA.
    await page.evaluate(() => { window.__reviewShared = null; Object.defineProperty(navigator, 'share', { configurable:true, value:async data => { window.__reviewShared = {title:data.title,text:data.text,files:data.files?.length || 0}; } }); Object.defineProperty(navigator, 'canShare', { configurable:true, value:() => false }); });
    await share.click();
    check('Only the reviewed pack is shared', await page.evaluate(() => window.__reviewShared?.text?.includes('Prepare a pilot proposal') && !window.__reviewShared?.files));
    await page.getByLabel('Due', { exact: true }).fill('2026-10-02');
    check('Editing invalidates share review', await share.isDisabled());
    await page.getByLabel('I checked this pack and want to share these details.').check();
    await page.getByRole('heading', {name:'Before we wrap.'}).scrollIntoViewIfNeeded();
    await fit('Work pack 375px'); await snap('meeting-wrap-mobile');
    await page.getByRole('button', {name:'Prepare a follow-up from this'}).click();
    check('Work pack reaches existing transcript preparation', await page.getByRole('textbox').filter({visible:true}).count() > 0 && (await page.locator('body').innerText()).includes('transcript'));
    await page.setViewportSize({width:1440,height:1000});
    await visit('/creative-studio/assembl?tool=image');
    const frame = page.getByRole('group', {name:'Frame background'});
    await page.getByRole('button', {name:'Keep the whole image',exact:true}).click();
    await page.getByRole('slider', {name:/Frame space/}).fill('8');
    await frame.getByRole('button', {name:'Plum',exact:true}).click();
    await page.getByRole('button', {name:/^original/}).click();
    const canvas = page.getByLabel('Filtered image preview');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => { const c=document.querySelector('canvas[aria-label="Filtered image preview"]'); return c && c.getContext('2d').getImageData(0,0,1,1).data[0]===36; });
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name:'download full-size PNG',exact:true}).click();
    await (await download).saveAs(path.join(out,'framed-export.png'));
    check('Framing exports a real PNG', fs.statSync(path.join(out,'framed-export.png')).size>10000);
    await canvas.scrollIntoViewIfNeeded();await snap('maker-frame-desktop');
    await page.getByRole('button', {name:'Use image in my post',exact:true}).click();
    await page.getByRole('button', {name:'01 / Design a post'}).and(page.locator('[aria-pressed="true"]')).waitFor();
    check('Framed image hands into post maker', true);
    await page.setViewportSize({width:375,height:812});
    await page.getByRole('button', {name:'02 / Prepare an image'}).click();
    await page.getByRole('slider', {name:/Frame space/}).scrollIntoViewIfNeeded();
    await fit('Image maker 375px');await snap('maker-frame-mobile');
    check('No uncaught page errors', errors.length === 0);
    fs.writeFileSync(path.join(out,'result.json'), JSON.stringify({checkedAt:new Date().toISOString(),checks,errors,limitations:['Native phone share sheet simulated; physical audio and authenticated providers not exercised.']},null,2));
  } finally { if(browser) await browser.close(); server.kill('SIGTERM'); }
})().catch(error => { console.error(error); process.exitCode=1; });
