#!/usr/bin/env node
/**
 * Assembl context-health check.
 *
 * Purpose:
 * - ensure the canonical memory spine exists
 * - make stale context visible
 * - report common company-brand drift without treating historical/client
 *   surfaces as authoritative
 *
 * This is intentionally conservative. Missing canonical context is fatal;
 * legacy-brand matches are reported for cleanup but do not yet fail CI.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const REQUIRED = [
  'START_HERE.md',
  'AGENTS.md',
  'config/context-manifest.json',
  'docs/context/README.md',
  'docs/context/CURRENT.md',
  'docs/assembl-context.md',
  'docs/assembl-brand-system.md',
  'docs/assembl-copy-standard.md',
  'docs/factory/FACTORY.md',
  'docs/factory/PRIMITIVES.md',
  'docs/factory/DECISIONS.md',
  'docs/factory/LEARNINGS.md',
];

const fatal = [];
const warnings = [];

for (const file of REQUIRED) {
  if (!existsSync(file)) fatal.push(`missing canonical context: ${file}`);
}

let manifest;
if (existsSync('config/context-manifest.json')) {
  try {
    manifest = JSON.parse(readFileSync('config/context-manifest.json', 'utf8'));
  } catch (error) {
    fatal.push(`invalid config/context-manifest.json: ${error.message}`);
  }
}

if (manifest?.updated_at) {
  const updated = new Date(`${manifest.updated_at}T00:00:00Z`);
  const ageDays = Math.floor((Date.now() - updated.getTime()) / 86_400_000);
  if (ageDays > 14) warnings.push(`context manifest is ${ageDays} days old; review CURRENT.md and accepted decisions`);
}

if (existsSync('docs/context/CURRENT.md')) {
  const current = readFileSync('docs/context/CURRENT.md', 'utf8');
  if (!/Pursuit/i.test(current) || !/DO/i.test(current) || !/(SHOW|Studio)/i.test(current) || !/Factory/i.test(current)) {
    warnings.push('CURRENT.md may no longer describe the full Pursuit / DO / SHOW / Factory structure');
  }
}

if (existsSync('docs/assembl-brand-system.md')) {
  const brand = readFileSync('docs/assembl-brand-system.md', 'utf8');
  for (const expected of ['#240B21', '#654A4E', '#916A70', '#F5F1F2', '#FFFDFB', 'Instrument Sans', 'IBM Plex Mono']) {
    if (!brand.includes(expected)) fatal.push(`brand canon missing expected token: ${expected}`);
  }
}

const COMPANY_SCOPE = [
  'app/page.tsx',
  'app/home.module.css',
  'app/how-it-works',
  'app/about',
  'app/pricing',
  'components/site',
  'components/v2',
  'components/assembl',
  'brand',
  'packages/canvas/src',
];
const EXT = new Set(['.ts', '.tsx', '.css', '.md', '.mdx', '.json']);
const LEGACY_CUES = [
  { re: /Cormorant Garamond/i, label: 'Cormorant Garamond' },
  { re: /champagne[- ]gold|champagne gold/i, label: 'champagne/gold direction' },
  { re: /#BFA37A/i, label: '#BFA37A champagne token' },
  { re: /#FFD42A|#F5C64B/i, label: 'canary token' },
];

function* walk(path) {
  if (!existsSync(path)) return;
  const stat = statSync(path);
  if (stat.isFile()) {
    if (EXT.has(extname(path))) yield path;
    return;
  }
  for (const entry of readdirSync(path)) yield* walk(join(path, entry));
}

const seen = new Set();
for (const root of COMPANY_SCOPE) {
  for (const file of walk(root)) {
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, 'utf8');
    for (const cue of LEGACY_CUES) {
      const match = text.match(cue.re);
      if (!match) continue;
      const line = text.slice(0, match.index).split('\n').length;
      warnings.push(`brand drift candidate: ${file}:${line} — ${cue.label}`);
    }
  }
}

if (fatal.length) {
  console.error('\ncontext-health: FAILED\n');
  fatal.forEach((item) => console.error(`  ERROR: ${item}`));
}

if (warnings.length) {
  console.warn('\ncontext-health: review recommended\n');
  warnings.forEach((item) => console.warn(`  WARN: ${item}`));
}

if (!fatal.length && !warnings.length) console.log('context-health: canonical context is present and no drift candidates were found');
else if (!fatal.length) console.log(`\ncontext-health: canonical context OK; ${warnings.length} review item(s) reported`);

if (fatal.length) process.exit(1);
