#!/usr/bin/env node
/**
 * Guard the user-confirmed 16 September recovery, plus the #1324 homepage
 * WorldScene / atelier.glb fly-through hero (AssemblWorldHero).
 *
 * Homepage hero dual-accept (intentional):
 *   A) legacy `<DoSpatialScene company />`, OR
 *   B) `<AssemblWorldHero />` wired to WorldScene + public/do/world/atelier.glb
 * Do not require both. Do not revert the fly-through to unblock builds.
 *
 * See docs/DO-VISUAL-BASELINE.md.
 */
import { existsSync, readFileSync } from 'node:fs';
const errors = [];
const read = path => readFileSync(path, 'utf8');
const checks = [
  ['app/page.tsx', /AssemblTheWorkHome/],
  ['app/do/page.tsx', /<DoHome\s*\/>/],
  ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', /<GlowDoWidget\s*\/>/],
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

// Homepage spatial hero: dual-accept legacy company DoSpatialScene OR WorldScene fly-through.
const homePath = 'components/site/assembl-the-work/AssemblTheWorkHome.tsx';
const home = read(homePath);
const hasLegacyCompanySpatial = /<DoSpatialScene\s+company/.test(home);
const hasWorldHero = /<AssemblWorldHero\b/.test(home);
if (!hasLegacyCompanySpatial && !hasWorldHero) {
  errors.push(
    `${homePath}: homepage hero must keep either <DoSpatialScene company /> or <AssemblWorldHero /> (WorldScene / atelier.glb fly-through)`,
  );
}
if (hasWorldHero) {
  const heroPath = 'components/site/assembl-the-work/AssemblWorldHero.tsx';
  if (!existsSync(heroPath)) {
    errors.push(`${heroPath}: AssemblWorldHero is referenced on home but the module is missing`);
  } else {
    const hero = read(heroPath);
    if (!/WorldScene/.test(hero)) {
      errors.push(`${heroPath}: AssemblWorldHero must load WorldScene (atelier.glb fly-through)`);
    }
  }
  if (!existsSync('public/do/world/atelier.glb')) {
    errors.push('public/do/world/atelier.glb: missing approved homepage fly-through asset');
  }
}

const publicFiles = ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', 'app/do/DoHome.tsx', 'app/do/DoReveal.tsx', 'app/do/page.tsx'];
for (const path of publicFiles) {
  const text = read(path);
  if (/OceanMedia|ocean-assembly|cinematic-nature|brand-rescue\.css|DoHomeCurrent/.test(text)) errors.push(`${path}: retired front door or nature film`);
  if (/\bDOO\b|\bDoo\b|Builderdoo/i.test(text)) errors.push(`${path}: product is DO; specialist is Builder DO`);
}
for (const asset of ['public/do/canvas/dimensional-d.png', 'public/do/cinema/do-orb-loop.mp4', 'public/do/office/harbour-studio.glb', 'public/do/office/office-poster.webp']) {
  if (!existsSync(asset)) errors.push(`${asset}: missing approved visual asset`);
}
const companyCss = read('components/site/assembl-the-work/assembl-the-work.css');
if (/font-family:Georgia|font-family:[^;}]*Times New Roman/.test(companyCss)) errors.push('Company typography must use Instrument Sans, not the retired serif font');
if (!read('app/do/DoHome.tsx').includes('Meet your To ')) errors.push('Preserve the approved To DO specialist heading');
if (errors.length) { console.error('public-front-door-guard: drift detected\n' + errors.join('\n')); process.exit(1); }
console.log('public-front-door-guard: assembl front door, WorldScene/AssemblWorldHero or DoSpatialScene company, dimensional DO and portable canvas present');
