#!/usr/bin/env node
/**
 * Guard the user-confirmed recovery + #1346 homepage WorldScene / atelier.glb
 * fly-through, plus the 2026-09-20 user-requested DO entry correction.
 *
 * Public /do opens the hosted workspace and Meeting DO before the story.
 * Keep the atelier, private-data protections and honest capability boundaries.
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
  ['app/do/DoHome.tsx', /Work from the place/],
  ['app/do/DoHome.tsx', /small agent that sits where you already work/],
  ['app/do/DoHome.tsx', /atelier-poster\.png/],
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
const homeSource = read(homePath);
if (/<GlowDoWidget\b/.test(homeSource)) {
  errors.push(`${homePath}: public homepage must not mount GlowDoWidget (Kate nav lock — omit unless context/vision works)`);
}
if (/atw-companion-story|Two small tools|Your DOs|Just these two|Meeting notes\.\s*<br|Open Meeting DO|Open Household DO|\/do#your-dos/.test(homeSource)) {
  errors.push(`${homePath}: public homepage must not sell the Meeting/Household / Your DOs shelf`);
}
if (/DoIntentInput/.test(homeSource)) {
  errors.push(`${homePath}: public homepage must not mount DoIntentInput while the DO shelf is off`);
}
if (hasWorldHero) {
  const heroPath = 'components/site/assembl-the-work/AssemblWorldHero.tsx';
  if (!existsSync(heroPath)) {
    errors.push(`${heroPath}: AssemblWorldHero is referenced on home but the module is missing`);
  } else {
    const hero = read(heroPath);
    if (!/WorldScene|WorldAtelierStage/.test(hero)) {
      errors.push(`${heroPath}: AssemblWorldHero must load WorldScene / WorldAtelierStage (atelier.glb fly-through)`);
    }
    if (/DoIntentInput|Open Meeting or Household|\/do\/meetings|\/do\/household/.test(hero)) {
      errors.push(`${heroPath}: hero must not open the Meeting/Household shelf`);
    }
    if (/\bpaused\b/i.test(hero.replace(/setPaused|const \[paused|paused,/g, ''))) {
      // Allow React pause/play motion state; ban product “paused” copy in JSX strings.
      if (/try-it DO tools are paused|DO is paused|tools are paused|shelf is paused/i.test(hero)) {
        errors.push(`${heroPath}: must not use “paused” product copy (Kate craft fail)`);
      }
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
  'href="/do/household"',
];
const bannedShelfCopy = [
  'Two small tools',
  'Your DOs',
  'Just these two',
  'PUBLIC_DO_SPECIALISTS',
  'DoLivingBlob',
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
  if (path === 'app/do/DoHome.tsx' || path === 'components/site/assembl-the-work/AssemblTheWorkHome.tsx') {
    for (const phrase of bannedShelfCopy) {
      if (text.includes(phrase)) errors.push(`${path}: banned shelf copy/component "${phrase}"`);
    }
  }
}
for (const asset of ['public/do/canvas/dimensional-d.png', 'public/do/cinema/do-orb-loop.mp4', 'public/do/office/harbour-studio.glb', 'public/do/office/office-poster.webp', 'public/do/world/atelier-poster.png']) {
  if (!existsSync(asset)) errors.push(`${asset}: missing approved visual asset`);
}
const companyCss = read('components/site/assembl-the-work/assembl-the-work.css');
if (/font-family:Georgia|font-family:[^;}]*Times New Roman/.test(companyCss)) {
  errors.push('Company typography must use Instrument Sans, not the retired serif font');
}
const doHome = read('app/do/DoHome.tsx');
const doHomePublic = doHome
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  // Allow motion-hold props; ban product “paused” copy only.
  .replace(/\bpaused=\{[^}]*\}/g, '');
if (/Household board\.|Open Household DO|DoLivingBlob|PUBLIC_DO_SPECIALISTS/i.test(doHome)) {
  errors.push('Public /do must not present the fictional household board as a working family product');
}
if (/Whisper-class|Deepgram nova-2|Smart notes|Granola-class/i.test(doHome)) {
  errors.push('Public /do must not expose vendor/model theatre in UI chrome');
}
if (/\bpaused\b|coming soon|HOLDING/i.test(doHomePublic)) {
  errors.push('Public /do must not say paused / coming soon / HOLDING (Kate craft fail)');
}
if (/motion experiment|craft demo|prototype theatre|PREVIEW badge theatre|\blab\b/i.test(doHomePublic)) {
  errors.push('Public /do must not narrate technique (experiment / lab / craft demo / theatre)');
}
if (!/DoHoverCards/.test(doHome) || !/DoAtelierHeroStage/.test(doHome)) {
  errors.push('Public /do must keep interactive craft (hover cards + atelier hero stage)');
}
if (!/small agent that sits where you already work/.test(doHome)) {
  errors.push('Public /do must explain DO as a small agent where you already work');
}
if (!/atelier-poster\.png/.test(doHome)) {
  errors.push('Public /do must use the daylight atelier still (atelier-poster.png)');
}
// Product access must not regress to a contact-only explanation page again.
for (const href of ['/do/widget', '/do/meetings', '/do/widget?task=plan']) {
  if (!doHome.includes(`href="${href}"`)) errors.push(`Public /do is missing its task entry: ${href}`);
}
if (!doHome.includes('SIGN IN FOR NOTES')) errors.push('Meeting entry must explain the sign-in requirement');

const meetingUi = read('app/do/meetings/MeetingDo.tsx') + (existsSync('app/do/meetings/MeetingDoExperience.tsx') ? read('app/do/meetings/MeetingDoExperience.tsx') : '');
const meetingChrome = meetingUi.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
if (/Whisper-class|Deepgram nova-2|Granola-class|sharing this audio with Deepgram|Deepgram is not configured/i.test(meetingChrome)) {
  errors.push('Meeting DO UI chrome must not name Whisper/Deepgram/Granola (Kate audit 2026-09-17)');
}
if (!/Turn audio into notes|Create transcript/.test(meetingChrome)) {
  errors.push('Meeting DO must explain transcription in plain language');
}
if (/Meet your To|PUBLIC DO\s*·\s*TWO TOOLS/i.test(doHome)) {
  errors.push('Public /do must not revive sparse Lovable hero (Meet your To / PUBLIC DO · TWO TOOLS)');
}
if (/Take DO with you/i.test(doHome)) {
  errors.push('Public /do first viewport must not open with Take DO with you banner (Kate sparse-Lovable fail)');
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
  'public-front-door-guard: working DO entry links, preserved atelier, private-data and capability boundaries',
);
