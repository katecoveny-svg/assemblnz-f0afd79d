/* Actual writing editor + mocked auth callback and delayed identity transport; no real accounts/providers. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require(process.env.ASSEMBL_ESBUILD_MODULE || 'esbuild');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/do-writing-owner-proof';
const A = '11111111-1111-4111-8111-111111111111', B = '22222222-2222-4222-8222-222222222222';
const entry = (owner, label) => ({ source: label + ' source', brief: '', draft: { version: 1, id: owner, task: 'extract', title: label, text: label + ' reviewed text', status: 'reviewed', reviewer: label, createdAt: '2026-10-13T00:00:00.000Z', evidence: { method: 'exact-extraction', model: null, sourceTitle: label, sourceUrl: '', sourceHash: 'a'.repeat(64), sourceCharacters: 10, instructionHash: 'b'.repeat(64), outputHash: 'c'.repeat(64), consentAt: '2026-10-13T00:00:00.000Z', boundary: 'Fictional test' } } });
const stubs = {
  'next/navigation': 'export const usePathname=()=>location.pathname;',
  '@/components/do/DoShareButton': 'export function DoShareButton(){return null;}',
  '@/lib/supabase/client': `export const createClient=()=>({auth:{onAuthStateChange(cb){window.__auth=cb;cb('INITIAL_SESSION',{user:{id:window.__owner}});return {data:{subscription:{unsubscribe(){window.__auth=null;}}}};}}});`,
};
(async () => {
  fs.mkdirSync(out, { recursive: true }); fs.rmSync(path.join(out, 'results.json'), { force: true });
  const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {DoTextWorkspace} from './app/do/DoTextWorkspace';createRoot(document.getElementById('root')).render(React.createElement(DoTextWorkspace,window.__props||{}));`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, loader: { '.css': 'empty', '.module.css': 'empty' }, platform: 'browser', format: 'iife', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'fictional-auth', setup(b) { b.onResolve({ filter: /.*/ }, a => stubs[a.path] ? { path: a.path, namespace: 'fixture' } : undefined); b.onLoad({ filter: /.*/, namespace: 'fixture' }, a => ({ contents: stubs[a.path], loader: 'js' })); } }] });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.ASSEMBL_CHROMIUM_PATH });
  const checks = [], errors = [];
  try {
    for (const phase of ['initial', 'post-invalidation']) for (const event of ['SIGNED_IN', 'USER_UPDATED']) {
      const context = await browser.newContext(); const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', r => r.request().resourceType() === 'document' ? r.fulfill({ contentType: 'text/html', body: '<div id="root"></div>' }) : r.abort());
      await page.addInitScript(({ A, B, entries, phase }) => {
        window.__owner = A; window.__hold = phase === 'initial'; window.__requests = 0;
        localStorage.setItem('assembl:do:drafts:v1:' + A, JSON.stringify([entries[0]])); localStorage.setItem('assembl:do:drafts:v1:' + B, JSON.stringify([entries[1]]));
        const legacyKey = 'assembl:do:drafts:v1' + (phase === 'initial' ? ':guest' : '');
        localStorage.setItem(legacyKey, 'Fictional unowned content: not even valid JSON');
        const get = Storage.prototype.getItem;
        window.__legacyReads = 0;
        Storage.prototype.getItem = function(key) {
          if (key === 'assembl:do:drafts:v1' || key === 'assembl:do:drafts:v1:guest') { window.__legacyReads++; throw Error('Legacy content must not be read'); }
          return get.call(this, key);
        };
        window.fetch = async url => {
          if (url === '/api/do/runtime') return Response.json({ signedIn: true });
          if (url !== '/api/do/session') throw Error('No provider request allowed');
          window.__requests++; const captured = window.__owner;
          if (window.__hold) { window.__hold = false; return new Promise(resolve => { window.__release = () => resolve(Response.json({ workspaceKey: captured })); }); }
          return Response.json({ workspaceKey: captured });
        };
      }, { A, B, entries: [entry(A, 'Owner A private'), entry(B, 'Owner B private')], phase });
      await page.goto('https://fixture.invalid/do/builder'); await page.addScriptTag({ content: bundle.outputFiles[0].text });
      if (phase === 'post-invalidation') {
        await page.getByRole('button', { name: /Owner A private.*Reviewed draft/ }).click();
        assert.equal(await page.locator('#do-result').inputValue(), 'Owner A private reviewed text');
        await page.evaluate(() => { window.__hold = true; window.__auth('SIGNED_OUT', null); });
      }
      await page.waitForFunction(() => typeof window.__release === 'function');
      await page.evaluate(({ B, event }) => { window.__owner = B; window.__auth(event, { user: { id: B } }); window.__release(); }, { B, event });
      try { await page.getByRole('button', { name: /Owner B private.*Reviewed draft/ }).waitFor({ timeout: 5000 }); } catch (error) { console.error(JSON.stringify({phase,event,errors,body:await page.locator('body').innerText(),state:await page.evaluate(()=>({owner:window.__owner,requests:window.__requests}))})); throw error; }
      assert.equal(await page.getByRole('button', { name: /Owner A private.*Reviewed draft/ }).count(), 0);
      assert.equal(await page.locator('#do-result').count(), 0);
      await page.getByRole('button', { name: /Owner B private.*Reviewed draft/ }).click();
      assert.equal(await page.locator('#do-result').inputValue(), 'Owner B private reviewed text');
      checks.push(`${phase}: ${event} supersedes delayed A identity; only B's populated draft can reopen`);
      console.log('PASS ' + checks.at(-1));
      if (phase === 'post-invalidation' && event === 'USER_UPDATED') {
        await page.getByRole('button', { name: 'Remove Owner B private from this browser', exact: true }).click();
        await page.waitForFunction(B => localStorage.getItem('assembl:do:drafts:v1:' + B) === null, B);
        await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
        await page.waitForFunction(B => localStorage.getItem('assembl:do:drafts:v1:' + B) !== null, B, { timeout: 5000 });
        assert.equal(await page.locator('#do-result').inputValue(), 'Owner B private reviewed text');
        checks.push('removing the current saved copy preserves its open draft and allows an explicit fresh save');
        console.log('PASS ' + checks.at(-1));
      }
      const recovery = page.getByRole('region', { name: 'Older draft recovery' });
      await recovery.locator('summary').click();
      const sourceBefore = await page.locator('#do-source').inputValue();
      await recovery.getByRole('button', { name: 'Continue with my own copy' }).click();
      assert.equal(await page.locator('#do-source').inputValue(), sourceBefore);
      assert.equal(await page.locator('#do-source').evaluate(e => e === document.activeElement), true);
      assert.equal(await page.evaluate(() => window.__legacyReads), 0);
      assert.equal((await page.locator('body').innerText()).includes('Fictional unowned content'), false);
      await page.evaluate(A => { window.__owner = A; window.__auth('SIGNED_IN', { user: { id: A } }); }, A);
      await page.getByRole('button', { name: /Owner A private.*Reviewed draft/ }).waitFor();
      assert.equal(await recovery.locator('details').evaluate(e => e.open), false);
      checks.push(`${phase}: recovery guidance never reads unowned bytes, preserves editor, and resets across accounts`);
      console.log('PASS ' + checks.at(-1));
      await context.close();
    }
    // Embedded specialist navigation must not replace the source/draft editor.
    {
      const context = await browser.newContext(); const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      await context.route('**/*', r => r.request().resourceType() === 'document' ? r.fulfill({ contentType: 'text/html', body: '<div id="root"></div>' }) : r.abort());
      await page.addInitScript(({ A, draft }) => {
        window.__owner = A; window.__props = { embedded: true, focus: true, initialTask: 'extract' };
        window.fetch = async url => {
          if (url === '/api/do/session') return Response.json({ workspaceKey: A });
          if (url === '/api/do/runtime') return Response.json({ signedIn: true });
          if (url === '/api/do/prepare') return Response.json({ draft });
          throw Error('No provider request allowed');
        };
      }, { A, draft: entry(A, 'Embedded test').draft });
      await page.goto('https://fixture.invalid/do/widget?embedded=1');
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await page.locator('#do-source').fill('Fictional source: school picnic Friday. Bring a hat.');
      await page.getByRole('checkbox', { name: /Use this text for this preparation/ }).check();
      await page.getByRole('button', { name: 'Find the details', exact: true }).click();
      await page.locator('#do-result').fill('Reviewed synthetic draft: bring a hat on Friday.');
      const source = await page.locator('#do-source').inputValue();
      const draft = await page.locator('#do-result').inputValue();
      for (const destination of ['/do/bills', '/do/bills/compare']) {
        const link = page.locator(`a[href="${destination}"]`);
        assert.equal(await link.getAttribute('target'), '_blank');
        assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
        const opened = context.waitForEvent('page'); await link.click(); const popup = await opened;
        await popup.waitForURL('https://fixture.invalid' + destination);
        assert.equal(page.url(), 'https://fixture.invalid/do/widget?embedded=1');
        assert.equal(await page.locator('#do-source').inputValue(), source);
        assert.equal(await page.locator('#do-result').inputValue(), draft);
        checks.push(`Embedded ${destination}: separate tab, source and edited draft preserved`);
        await popup.close();
      }
      await page.screenshot({ path: path.join(out, 'embedded-bills-preserved.jpg') });
      await context.close();
    }
    assert.deepEqual(errors, []); fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ checks, errors, scope: 'Actual standalone writing editor; fictional SDK events, delayed identity responses and populated draft storage.' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
