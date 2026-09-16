#!/usr/bin/env node
/** Guard the user-confirmed 16 September recovery. See docs/DO-VISUAL-BASELINE.md. */
import { existsSync, readFileSync } from 'node:fs';
const errors = [];
const read = path => readFileSync(path, 'utf8');
const checks = [
  ['app/page.tsx', /AssemblTheWorkHome/],
  ['app/do/page.tsx', /<DoHome\s*\/>/],
  ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', /<GlowDoWidget\s*\/>/],
  ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', /<DoSpatialScene\s+company/],
  ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', /<DoFilm\s*\/>/],
  ['app/do/DoHome.tsx', /<DoReveal/],
  ['app/do/DoHome.tsx', /href="\/do\/office"/],
  ['app/do/DoBuilder.tsx', /<DoCanvas/],
  ['components/site/assembl-the-work/GlowDoWidget.tsx', /COMPANION_POSITION_KEY/],
  ['components/do/DoMark.tsx', /do-identity-dot/],
];
for (const [path, pattern] of checks) {
  if (!pattern.test(read(path))) errors.push(`${path}: the accepted front-door feature is missing (${pattern})`);
}
const publicFiles = ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', 'app/do/DoHome.tsx', 'app/do/DoReveal.tsx', 'app/do/page.tsx'];
for (const path of publicFiles) {
  const text = read(path);
  if (/OceanMedia|ocean-assembly|cinematic-nature|brand-rescue\.css|DoHomeCurrent/.test(text)) errors.push(`${path}: retired front door or nature film`);
  if (/\bDOO\b|\bDoo\b/.test(text)) errors.push(`${path}: product is DO; Builderdoo is the specialist's name`);
}
for (const asset of ['public/do/canvas/dimensional-d.png', 'public/do/cinema/do-orb-loop.mp4', 'public/do/office/harbour-studio.glb', 'public/do/office/office-poster.webp']) {
  if (!existsSync(asset)) errors.push(`${asset}: missing approved visual asset`);
}
if (errors.length) { console.error('public-front-door-guard: drift detected\n' + errors.join('\n')); process.exit(1); }
console.log('public-front-door-guard: assembl front door, dimensional DO and portable canvas present');
