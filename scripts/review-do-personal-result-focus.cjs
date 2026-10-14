/* Commit-order regression using the actual assistant and production React.
 * Fictional API only; no account/provider/audio. CSS is stubbed: not visual proof.
 * ASSEMBL_PLAYWRIGHT_MODULE / ASSEMBL_ESBUILD_MODULE may select existing tools.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require(process.env.ASSEMBL_ESBUILD_MODULE || 'esbuild');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const repo = path.resolve(__dirname, '..');
const out = process.env.ASSEMBL_REVIEW_OUTPUT;
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); console.log('PASS ' + name); };

(async () => {
  const build = await esbuild.build({
    stdin: {
      contents: `import React from 'react';
        import {createRoot} from 'react-dom/client';
        import {PersonalDoAssistant} from ${JSON.stringify(path.join(repo, 'app/do/personal/PersonalDoAssistant.tsx'))};
        function Cost(){const end=performance.now()+0.15;while(performance.now()<end){}return null;}
        function Fixture(){const[working,setWorking]=React.useState(false);const[bump,setBump]=React.useState(0);
          React.useEffect(()=>{window.__fixtureBump=()=>setBump(n=>n+1);},[]);
          return <><PersonalDoAssistant profile={{displayName:'Pip'}} onWorkingChange={setWorking}/>
            {Array.from({length:500},(_,i)=><Cost key={i}/>)}<span data-fixture-parent-render={bump} hidden>{String(working)} {bump}</span></>;}
        createRoot(document.getElementById('root')).render(<Fixture/>);`,
      resolveDir: repo, loader: 'tsx',
    },
    bundle: true, write: false, platform: 'browser', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' }, alias: { '@': repo },
    plugins: [{ name: 'isolated-focus-fixture', setup(builder) {
      builder.onLoad({ filter: /\.css$/ }, () => ({ contents: 'export default {}', loader: 'js' }));
      builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
        contents: 'import React from "react";export default function Link(props){return React.createElement("a",props)}',
        loader: 'js', resolveDir: repo,
      }));
    } }],
  });
  const server = http.createServer((request, response) => {
    response.setHeader('Content-Type', request.url === '/bundle.js' ? 'application/javascript' : 'text/html; charset=utf-8');
    response.end(request.url === '/bundle.js' ? build.outputFiles[0].text : '<!doctype html><div id="root"></div><script src="/bundle.js"></script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(15_000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__focusTimeline = [];
      const record = event => window.__focusTimeline.push({ event, at: performance.now(), heading: Boolean(document.querySelector('h3')), active: document.activeElement?.tagName });
      // Hold React scheduler tasks, not RAF or focus. Real frames can precede commit.
      const NativeMessageChannel = window.MessageChannel;
      window.MessageChannel = class extends NativeMessageChannel {
        constructor() {
          super(); const post = this.port2.postMessage.bind(this.port2);
          this.port2.postMessage = (...args) => setTimeout(() => post(...args), 40);
        }
      };
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => raf(time => { record('native-frame'); callback(time); });
      document.addEventListener('focusin', () => record('focusin'), true);
      new MutationObserver(() => record('dom-commit')).observe(document, { childList: true, subtree: true });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [], addEventListener() {}, removeEventListener() {}, cancel() {}, speak() { throw new Error('Audio must not start in focus proof'); } } });
    });
    let posts = 0;
    await page.route('**/api/do/personal/assistant', route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { signedIn: true, ready: true, message: 'Fictional configured status.' } });
      posts++;
      return route.fulfill({ json: { result: {
        // Repeated ID deliberately tests a new result object, not only an ID change.
        id: 'fictional-repeated-id', state: 'draft', reviewRequired: true, externalActions: false,
        reply: `Fictional reply ${posts}.`, rationale: 'Fictional fixture only.', evidence: [], missingInformation: [],
        nextStep: { kind: 'review_draft', label: 'Your draft', draft: `Fictional editable draft ${posts}.` },
        reasoning: { provider: 'typesafe', model: 'jev-1.13.0', note: 'Fictional check.' },
      } } });
    });
    await page.goto(origin);
    const input = page.locator('#personal-assistant-input');
    const draft = page.locator('#personal-assistant-draft');
    async function send(number) {
      await input.fill(`Fictional request ${number}.`);
      await page.getByRole('button', { name: 'Start', exact: false }).click();
      await page.getByRole('checkbox', { name: /Share this message, added notes/ }).check();
      await page.getByRole('button', { name: 'Ask DO', exact: false }).click();
      await page.getByText(`Fictional reply ${number}.`, { exact: true }).waitFor();
      // Same focus assertion as the existing full-app proof, no timeout change.
      await page.waitForFunction(() => document.activeElement?.tagName === 'H3' && document.activeElement.textContent.includes('for your review'));
    }
    await send(1);
    check('delayed React commit still focuses the first result heading', true);
    await draft.fill('My reviewed fictional edit.');
    await page.evaluate(() => window.__fixtureBump());
    await page.waitForFunction(() => document.querySelector('[data-fixture-parent-render]')?.getAttribute('data-fixture-parent-render') === '1');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    check('draft editing and a parent rerender do not refocus the result', await draft.evaluate(element => element === document.activeElement));
    await page.evaluate(() => dispatchEvent(new Event('assembl:do-focus')));
    check('portable focus still synchronously returns to the composer', await input.evaluate(element => element === document.activeElement));
    await draft.evaluate(element => { dispatchEvent(new Event('assembl:do-focus')); element.focus(); });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    check('draft focus survives the portable handoff frame', await draft.evaluate(element => element === document.activeElement));
    await send(2);
    check('newer result with a repeated ID receives heading focus', true);
    await page.getByRole('button', { name: 'New', exact: false }).click();
    check('new conversation clears the result and focuses the composer', await draft.count() === 0 && await input.evaluate(element => element === document.activeElement));
    await send(3);
    check('a result after a new conversation receives heading focus', true);
    check('exactly three explicit fictional requests were dispatched', posts === 3);
    check('no browser runtime errors', errors.length === 0);
    if (out) {
      fs.mkdirSync(out, { recursive: true });
      fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ checks, errors, fixtureOnly: true, providerCalls: false, audioProduced: false, visualProof: false, timeline: await page.evaluate(() => window.__focusTimeline) }, null, 2));
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
