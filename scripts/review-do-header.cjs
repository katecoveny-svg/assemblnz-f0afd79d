/* Read-only header/paint regression. No sharing, uploads or provider submissions. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require('sharp');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const output = process.env.DO_HEADER_RESULTS || 'visual-evidence/do-header';
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const report = [];
  try {
    for (const width of [320, 375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().method() === 'GET' ? route.continue() : route.abort());
      await page.goto(`${process.env.DO_REVIEW_ORIGIN || 'http://127.0.0.1:3000'}/do/widget`, { waitUntil: 'networkidle' });
      const header = page.locator('main > header');
      const geometry = () => header.evaluate(node => {
        const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
        return { scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, brand: rect(node.querySelector('a')), share: rect(node.querySelector('button')), more: rect(node.querySelector('summary')) };
      });
      const before = await geometry();
      if (process.env.DO_HEADER_CSS_PREVIEW === '1') {
        await page.screenshot({ path: path.join(output, `before-${width}.png`), fullPage: false });
        const classes = await header.evaluate(node => ({ header: node.classList[0], actions: node.lastElementChild.classList[0] }));
        const source = fs.readFileSync('components/do/do-product-focus.module.css', 'utf8');
        const narrow = source.slice(source.indexOf('/* Short phones keep the brand'));
        assert(narrow.includes('@media(max-width:374px)'), 'missing candidate narrow rule');
        await page.addStyleTag({ content: narrow.replaceAll('.headerActions', `.${classes.actions}`).replace(/\.header(?=[{>])/g, `.${classes.header}`) });
      }
      if (process.env.DO_PAPER_CSS_PREVIEW === '1') await page.addStyleTag({ content: '.do-app-shell{background:var(--do-atmo-paper)}' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const after = await geometry();
      assert(after.scrollWidth <= width, `${width}: horizontal overflow`);
      if (width >= 375 && process.env.DO_HEADER_CSS_PREVIEW === '1') assert.deepEqual(after, before, 'wide header geometry changed');
      const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      assert(!overlaps(after.brand, after.share) && !overlaps(after.brand, after.more) && !overlaps(after.share, after.more), `${width}: header overlap`);
      for (const control of [after.share, after.more]) assert(control.width >= 44 && control.height >= 44, `${width}: header touch target`);
      if (width < 375) assert(after.brand.height >= 44, 'short phone brand target');
      const more = header.getByLabel('More DO tools');
      await more.focus(); await more.press('Enter');
      assert(await header.getByRole('link', { name: 'Sign in', exact: true }).isVisible());
      await more.press('Enter');
      await page.screenshot({ path: path.join(output, `after-${width}.png`), fullPage: false });
      const label = page.getByText('Text DO can use', { exact: true });
      const textarea = page.locator('#do-source');
      const submit = page.locator('.do-preparation-form button[type="submit"]');
      const paint = [];
      for (const [name, element, threshold] of [['label', label, 650], ['textarea', textarea, 650], ['submit', submit, 700]]) {
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        const file = path.join(output, `paint-${name}-${width}.png`);
        await element.screenshot({ path: file });
        const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        let pixels = 0;
        for (let y = 4; y < info.height - 4; y++) for (let x = 4; x < info.width - 4; x++) {
          const offset = (y * info.width + x) * info.channels;
          const sum = data[offset] + data[offset + 1] + data[offset + 2];
          if (name === 'submit' ? sum > threshold : sum < threshold) pixels++;
        }
        assert(pixels >= 20, `${width}: ${name} has no painted content`);
        paint.push({ name, pixels, width: info.width, height: info.height });
      }
      await page.locator('.do-preparation-form').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `settled-form-${width}.png`), fullPage: false });
      assert.deepEqual(errors, []);
      report.push({ width, before, after, paint, errors });
      await page.close();
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
