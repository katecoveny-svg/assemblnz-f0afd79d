#!/usr/bin/env node
/**
 * Brand guard — fails the build if deprecated brand tokens or old-era names
 * reappear on the marketing surfaces (DIRECTION-LOCKED-2026-07-01, palette
 * correction 2026-07-02: champagne gold #BFA37A replaces canary; old agent
 * names were renamed in the V4 cull; dash/Beat became Assembling).
 *
 * Scope is deliberately the NEW-direction surfaces only — legacy microsites,
 * pilot workspaces and the HAPAI tools are audited separately.
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

function* walk(path) {
  const st = statSync(path, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isFile()) {
    if ([...EXT].some((e) => path.endsWith(e))) yield path;
    return;
  }
  for (const entry of readdirSync(path)) yield* walk(join(path, entry));
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

if (violations.length) {
  console.error('brand-guard: deprecated brand tokens found on new-direction surfaces:\n');
  for (const v of violations) console.error('  ' + v);
  console.error('\nUse champagne gold #BFA37A for the accent role and the renamed agent/sub-brand names.');
  process.exit(1);
}
console.log('brand-guard: clean');
