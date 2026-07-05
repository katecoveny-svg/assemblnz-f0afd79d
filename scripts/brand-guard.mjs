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

/**
 * Repo-wide hex sweep (canary → champagne, 2026-07-05): the deprecated canary
 * hexes are banned EVERYWHERE under these roots, not just the new-direction
 * surfaces. Word-level bans (old agent names, the word "canary") stay scoped
 * to SCOPE above — legacy customer configs keep a `canary:` KEY name for the
 * assembl crossover token, but its VALUE must be champagne #BFA37A.
 */
const HEX_SCOPE = ['app', 'components', 'lib', 'packages', 'public', 'styles'];
const HEX_BANNED = [/#FFD42A/i, /#F5C64B/i];
const HEX_EXT = new Set([...EXT, '.html', '.svg', '.json']);
const HEX_EXEMPT = new Set([
  // asserts on the banned patterns themselves
  'lib/customers/toa-architects/canary-guard.test.ts',
  // DEFERRED (canary sweep 2026-07-05): uncommitted local work in flight on
  // these files — migrate to #BFA37A and delete the exemption when it lands.
  'components/ops/hero3d/HappyTailsHero.tsx',
  'lib/brand/configs/happy-tails.ts',
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
        violations.push(`${file}:${line} — banned hex ${pattern} (use champagne #BFA37A)`);
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
