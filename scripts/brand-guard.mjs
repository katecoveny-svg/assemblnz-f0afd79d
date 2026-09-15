#!/usr/bin/env node
/**
 * Assembl brand guard.
 *
 * Canonical source: docs/assembl-brand-system.md
 * Current company palette: deep plum / muted plum / dusty rose / chalk / paper.
 * Current type: Instrument Sans + IBM Plex Mono for evidence/proof metadata.
 *
 * This guard still blocks known deprecated canary tokens and retired names on
 * selected company surfaces. It deliberately does not attempt to ban every
 * historical colour/font repo-wide because legacy/client surfaces coexist in
 * this monorepo. Use scripts/context-health.mjs to report broader drift.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SCOPE = [
  'app/page.tsx',
  'app/how-it-works',
  'app/about',
  'app/pricing',
  'app/trust',
  'app/bundles',
  'app/login',
  'app/account/security',
  'components/v2',
  'components/site/site-footer.tsx',
  'components/assembl',
  'packages/canvas/src',
];

const BANNED = [
  /#FFD42A/i,
  /#F5C64B/i,
  /canary/i,
  /Care Scribe/,
  /Voice CS/,
  /9am Brief/,
  /Care Captain/,
  /dash by/i,
  /Beat by/i,
  /Larry Loop/,
];

const EXT = new Set(['.ts', '.tsx', '.css', '.mdx', '.md']);

const HEX_SCOPE = ['app', 'components', 'lib', 'packages', 'public', 'styles'];
const HEX_BANNED = [/#FFD42A/i, /#F5C64B/i];
const HEX_EXT = new Set([...EXT, '.html', '.svg', '.json']);
const HEX_EXEMPT = new Set([
  // asserts on the banned patterns themselves
  'lib/customers/toa-architects/canary-guard.test.ts',
  // Historical surface pending explicit migration. Keep exemption local and
  // remove it when the surface is brought onto current canon.
  'components/ops/hero3d/HappyTailsHero.tsx',
]);

function* walk(path, ext = EXT) {
  const st = statSync(path, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isFile()) {
    if ([...ext].some((e) => path.endsWith(e))) yield path;
    return;
  }
  for (const entry of readdirSync(path)) yield* walk(join(path, entry), ext);
}

const violations = [];
for (const root of SCOPE) {
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of BANNED) {
      const m = text.match(pattern);
      if (m) {
        const line = text.slice(0, m.index).split('\n').length;
        violations.push(`${file}:${line} — banned pattern ${pattern}`);
      }
    }
  }
}
for (const root of HEX_SCOPE) {
  for (const file of walk(root, HEX_EXT)) {
    if (HEX_EXEMPT.has(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const pattern of HEX_BANNED) {
      const m = text.match(pattern);
      if (m) {
        const line = text.slice(0, m.index).split('\n').length;
        violations.push(`${file}:${line} — banned legacy canary hex ${pattern}`);
      }
    }
  }
}

if (violations.length) {
  console.error('brand-guard: deprecated brand tokens found on guarded surfaces:\n');
  for (const v of violations) console.error('  ' + v);
  console.error('\nFollow docs/assembl-brand-system.md. Do not substitute another historical palette.');
  process.exit(1);
}
console.log('brand-guard: clean — canonical source is docs/assembl-brand-system.md');
