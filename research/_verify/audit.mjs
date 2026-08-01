#!/usr/bin/env node
/**
 * audit.mjs — rendered-DOM inventory of a concept page (rule 2: no grep).
 * For each URL: launches real Chrome headless, waits for load, then reports
 * every section-level block in document order with its id, classes, heading,
 * and whether it renders AFTER the final legal/disclaimer block. Flags
 * duplicate ids and duplicate headings. Captures console errors and a
 * full-page screenshot.
 *
 *   node audit.mjs <url> <shot.png>
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, shot] = process.argv.slice(2);
if (!url) { console.error('usage: node audit.mjs <url> [shot.png]'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1360, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 160)));

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));

const inv = await page.evaluate(() => {
  const rows = [];
  // section-level blocks: direct body children plus any <section> anywhere
  const nodes = new Set([...document.body.children, ...document.querySelectorAll('section')]);
  const ordered = [...nodes].filter((n) => !['SCRIPT', 'STYLE'].includes(n.tagName))
    .sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
  // the final legal block = the LAST element whose text carries the disclaimer register
  let legalIdx = -1;
  ordered.forEach((n, i) => {
    const t = (n.textContent || '').toLowerCase();
    if (t.includes('not affiliated') || t.includes('independent concept')) legalIdx = i;
  });
  ordered.forEach((n, i) => {
    const h = n.querySelector('h1,h2,h3');
    rows.push({
      i,
      tag: n.tagName.toLowerCase(),
      id: n.id || '',
      cls: (n.className && typeof n.className === 'string' ? n.className : '').split(/\s+/).filter(Boolean).slice(0, 3).join('.'),
      head: h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 58) : (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44),
      afterLegal: legalIdx >= 0 && i > legalIdx,
    });
  });
  // duplicates
  const byId = {}, byHead = {};
  rows.forEach((r) => {
    if (r.id) byId[r.id] = (byId[r.id] || 0) + 1;
    if (r.head && r.head.length > 12) byHead[r.head] = (byHead[r.head] || 0) + 1;
  });
  return {
    rows, legalIdx,
    dupIds: Object.entries(byId).filter(([, n]) => n > 1),
    dupHeads: Object.entries(byHead).filter(([, n]) => n > 1),
  };
});

console.log(`\n════ ${url}`);
console.log(`legal block at index ${inv.legalIdx} of ${inv.rows.length - 1}`);
for (const r of inv.rows) {
  const flag = r.afterLegal ? '  ⚠ AFTER-LEGAL' : '';
  console.log(`  [${String(r.i).padStart(2)}] <${r.tag}${r.id ? '#' + r.id : ''}${r.cls ? ' .' + r.cls : ''}>  ${r.head}${flag}`);
}
if (inv.dupIds.length) console.log('  DUPLICATE IDS: ' + inv.dupIds.map(([k, n]) => `${k}×${n}`).join(', '));
if (inv.dupHeads.length) console.log('  DUPLICATE HEADINGS: ' + inv.dupHeads.map(([k, n]) => `"${k}"×${n}`).join(' | '));
console.log(inv.dupIds.length || inv.dupHeads.length ? '' : '  no duplicates detected');
console.log(errors.length ? `  CONSOLE ERRORS (${errors.length}):\n    ` + errors.slice(0, 6).join('\n    ') : '  console: clean');

if (shot) { await page.screenshot({ path: shot, fullPage: true }); console.log('  screenshot → ' + shot); }
await browser.close();
