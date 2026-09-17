#!/usr/bin/env node
/**
 * Guard the user-confirmed 16 September recovery, plus the #1324 homepage
 * WorldScene / atelier.glb fly-through hero (AssemblWorldHero), plus the
 * 2026-09-17 Kate lock: public DO shelf = Meeting + Household only.
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
    ['components/site/assembl-the-work/AssemblTheWorkHome.tsx', /<DoFilm\s*\/>/],
  ['app/do/DoHome.tsx', /PUBLIC_DO_SPECIALISTS/],
  ['app/do/DoHome.tsx', /href="\/do\/meetings"/],
  ['app/do/DoHome.tsx', /href="\/do\/household"/],
  ['app/do/DoBuilder.tsx', /<DoCanvas/],
  ['components/site/assembl-the-work/GlowDoWidget.tsx', /COMPANION_POSITION_KEY/],
  ['components/do/DoMark.tsx', /do-identity-dot/],
  ['lib/do/public-do-specialists.ts', /Meeting DO/],
  ['lib/do/public-do-specialists.ts', /Household DO/],
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
const homeSource = read(homePath);
if (/<GlowDoWidget\b/.test(homeSource)) {
  errors.push(`${homePath}: public homepage must not mount GlowDoWidget (Kate nav lock — omit unless context/vision works)`);
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

const publicFiles = [
  'components/site/assembl-the-work/AssemblTheWorkHome.tsx',
  'app/do/DoHome.tsx',
  'app/do/page.tsx',
  'components/site/assembl-the-work/GlowDoWidget.tsx',
  'components/do/DoPortableStarters.tsx',
  'components/do/DoSpatialScene.tsx',
  'app/do/DoUtilityDock.tsx',
  'components/site/assembl-the-work/AssemblWorldHero.tsx',
];
const bannedPromos = ['Personal DO', 'Inbox DO', 'Bills DO', 'Writing DO', 'Creative DO', 'Detail DO', 'Builder DO'];
const bannedHrefs = [
  'href="/pursuit"',
  'href="/pursuit/playground"',
  'href="/studio/do-maker"',
  'href="/do/family"',
  'href="/do/bills"',
  'href="/do/builder"',
  'href="/do/office"',
  'href="/do/tasks"',
  'href="/do/connections"',
  'href="/do/sponsored"',
  'href="/do/browser"',
];
for (const path of publicFiles) {
  const text = read(path);
  if (/OceanMedia|ocean-assembly|cinematic-nature|brand-rescue\.css|DoHomeCurrent/.test(text)) {
    errors.push(`${path}: retired front door or nature film`);
  }
  if (/\bDOO\b|\bDoo\b|Builderdoo/i.test(text)) {
    errors.push(`${path}: product is DO; specialist is Builder DO`);
  }
  for (const promo of bannedPromos) {
    if (text.includes(promo)) errors.push(`${path}: banned public promo "${promo}"`);
  }
  for (const href of bannedHrefs) {
    if (text.includes(href)) errors.push(`${path}: banned public ${href}`);
  }
}
for (const asset of ['public/do/canvas/dimensional-d.png', 'public/do/cinema/do-orb-loop.mp4', 'public/do/office/harbour-studio.glb', 'public/do/office/office-poster.webp']) {
  if (!existsSync(asset)) errors.push(`${asset}: missing approved visual asset`);
}
const companyCss = read('components/site/assembl-the-work/assembl-the-work.css');
if (/font-family:Georgia|font-family:[^;}]*Times New Roman/.test(companyCss)) {
  errors.push('Company typography must use Instrument Sans, not the retired serif font');
}
if (!read('app/do/DoHome.tsx').includes('Meet your To ')) {
  errors.push('Preserve the approved To DO specialist heading');
}

// Public DO honesty — never ship owner-private household PII or operator backlog hosts in shared seeds.
const householdTemplates = read('apps/do/shared/household-floor-templates.ts');
if (/Kate Hudson|Geraldine Place|Kohimarama|Daldy|Sacred Heart|Baradene|Coveny/i.test(householdTemplates)) {
  errors.push('apps/do/shared/household-floor-templates.ts: owner/public templates must not embed personal household PII');
}
const doTasks = read('apps/do/shared/do-tasks.ts');
if (/github\.com\/katecoveny-svg\/assemblnz/i.test(doTasks)) {
  errors.push('apps/do/shared/do-tasks.ts: public task seeds must not link private operator PRs');
}
const meetingDo = read('app/do/meetings/MeetingDo.tsx');
if (/Kate and Adrian/i.test(meetingDo)) {
  errors.push('app/do/meetings/MeetingDo.tsx: sample notes must use fictional names on the public demo');
}

if (errors.length) {
  console.error('public-front-door-guard: drift detected\n' + errors.join('\n'));
  process.exit(1);
}
console.log(
  'public-front-door-guard: assembl front door, WorldScene hero, public DO = Meeting + Household only',
);
