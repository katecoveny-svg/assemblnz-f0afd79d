/**
 * lib/site-config.ts — Single source of truth for the Interactive Web Canon.
 *
 * Every component reads content from this file. No hardcoded customer-facing
 * strings in components. Locked Reo copy and vessel imagery URLs live here.
 *
 * Canon: doc id cmow22ynm021706adg5g6l0dt (Interactive Web)
 * Reo:   doc id cmow2cxmq006107ad2lc3mj41 (Phase 1 locked variants)
 */

import type { KeteSlug } from './kete';

// ── Vessel imagery — Sculptural canon (locked 2026-05-08) ────────────────────

export const heroVessel = {
  // 16:9 hero — cinematic video first frame fallback, deck cover, OG fallback
  wide:    '/img/kete/home-vessel-pounamu.jpg',
  // 1:1 square — OG image, Twitter card
  square:  '/img/kete/waihanga-vessel-square.jpg',
  // 4:5 portrait — mobile hero
  portrait:'/img/kete/toro-vessel-charcoal.jpg',
  // Brand mark — favicon, footer
  mark:    '/img/kete/waihanga-vessel-square.jpg',
  // Cinematic vessel video — homepage signature scrub-bound video.
  // Compressed locally to /videos/vessel-rotate-720p.mp4 (525 KB, 8s, 720p, no audio).
  // Original 5.6 MB MP4 retained as remote fallback only.
  videoLocal: '/videos/vessel-rotate-720p.mp4',
  videoRemote: '/videos/vessel-rotate-720p.mp4',
};

// Painterly anchor — /about hero only.
export const painterlyAnchor = '/img/kete/waihanga-vessel.jpg';

// Nine kete vessels — 1:1 (card) + 16:9 (page hero)
export const ketes: Record<KeteSlug, { square: string; wide: string }> = {
  waihanga: {
    square: '/img/kete/waihanga-vessel-square.jpg',
    wide:   '/img/kete/waihanga-vessel.jpg',
  },
  manaaki: {
    square: '/img/kete/manaaki-vessel-warm.jpg',
    wide:   '/img/kete/manaaki-vessel-warm.jpg',
  },
  pikau: {
    square: '/img/kete/pikau-vessel-blue.jpg',
    wide:   '/img/kete/pikau-vessel-blue.jpg',
  },
  arataki: {
    square: '/img/kete/arataki-vessel-amber.jpg',
    wide:   '/img/kete/arataki-vessel-amber.jpg',
  },
  auaha: {
    square: '/img/kete/auaha-vessel-purple.jpg',
    wide:   '/img/kete/auaha-vessel-purple.jpg',
  },
  ako: {
    square: '/img/kete/ako-vessel-amber.jpg',
    wide:   '/img/kete/ako-vessel-amber.jpg',
  },
  matauranga: {
    square: '/img/kete/matauranga-vessel-tall.jpg',
    wide:   '/img/kete/matauranga-vessel-tall.jpg',
  },
  hoko: {
    square: '/img/kete/hoko-vessel-violet.jpg',
    wide:   '/img/kete/hoko-vessel-violet.jpg',
  },
  toro: {
    square: '/img/kete/toro-vessel-charcoal.jpg',
    wide:   '/img/kete/toro-vessel-charcoal.jpg',
  },
};

// ── Hero videos — moving backgrounds for major page heroes ───────────────────
//
// Map of route key → { src, poster }. `src` is null where Kate has not yet
// commissioned a route-specific video; the HeroVideo component falls through
// to img-only in that case. Posters reuse the locked vessel imagery from
// `ketes` and `heroVessel` — those are 16:9 stills.
//
// As Kate generates per-route videos via vessel-studio, replace the placeholder
// (Waihanga signature video) with the route-specific MP4 URL.

export type HeroVideoEntry = {
  src: string | null;
  poster: string;
};

export type HeroVideoKey =
  | 'home'
  | 'pilot-sprint'
  | 'how-it-works'
  | 'evidence-pack'
  | 'pricing'
  | 'agents'
  | 'about'
  | `kete:${KeteSlug}`;

// Placeholder Waihanga video — used wherever a kete-specific MP4 has not
// yet been commissioned. ~5.6 MB; the HeroVideo component gates it to
// (min-width: 768px) so it does not load on mobile.
const PLACEHOLDER_VIDEO = '/videos/vessel-rotate-720p.mp4';

export const heroVideos: Record<HeroVideoKey, HeroVideoEntry> = {
  home:           { src: PLACEHOLDER_VIDEO, poster: heroVessel.wide },
  'pilot-sprint': { src: '/videos/pilot-sprint-hero.mp4', poster: '/videos/pilot-sprint-hero-poster.jpg' },
  'how-it-works': { src: null,              poster: heroVessel.wide },
  'evidence-pack':{ src: null,              poster: heroVessel.wide },
  pricing:        { src: null,              poster: heroVessel.wide },
  agents:         { src: null,              poster: heroVessel.wide },
  about:          { src: null,              poster: painterlyAnchor },
  'kete:waihanga':{ src: PLACEHOLDER_VIDEO, poster: ketes.waihanga.wide },
  'kete:manaaki': { src: null,              poster: ketes.manaaki.wide },
  'kete:pikau':   { src: null,              poster: ketes.pikau.wide },
  'kete:arataki': { src: null,              poster: ketes.arataki.wide },
  'kete:auaha':   { src: null,              poster: ketes.auaha.wide },
  'kete:ako':     { src: null,              poster: ketes.ako.wide },
  'kete:matauranga': { src: null,           poster: ketes.matauranga.wide },
  'kete:hoko':    { src: null,              poster: ketes.hoko.wide },
  'kete:toro':    { src: null,              poster: ketes.toro.wide },
};

// ── Locked Reo Phase 1 (signed off 2026-05-08, do not edit lightly) ──────────

export const reo = {
  heroLede:
    'assembl runs operational compliance work in the open: every workflow is grounded in New Zealand legislation, reviewed by a named person on your team, and sealed with an evidence pack you can file, forward, or footnote.',

  heroHeadlineLines: [
    'Mahi that earns',
    'its proof.',
  ] as const,

  // Q3 — Homepage pull quote
  pullQuote: 'Time is the thing. We give it back.',

  // Q2 — Trust strip. Item 3 locked verbatim. Items 1 & 2 reframed 2026-05-09
  // under the vertical-agent strategy memo: surface the governance substrate
  // (Privacy Act 2020, tikanga + Te Tiriti) instead of geography.
  trustStrip: [
    'Privacy Act 2020 compliant',
    'Tikanga + Te Tiriti governance',
    'MBIE responsible automation guidance',
  ],

  // Q4 — /how-it-works headline
  howItWorksHeadline: [
    'Five stages.',
    'Nothing ships until a person says so.',
  ] as const,

  // Q5 — /evidence-pack headline
  evidencePackHeadline: [
    'Not an output.',
    'A record.',
  ] as const,

  // Brand-film section — homepage. Variant A locked.
  brandFilm: {
    eyebrow: 'assembl evidence vessel',
    body:
      'A short film about how assembl works. Cream paper. The vessel breathes. Kate explains it in 90 seconds.',
    cta: 'Sound on. Narrated in NZ English.',
    duration: '90 seconds',
  },

  // ── Strategic positioning copy (added 2026-05-09 per vertical-agent strategy
  // memo). These are NEW strings — they sit ALONGSIDE the locked Reo, never
  // replacing it. Three customer-facing labels are introduced:
  //   Mana Receipts       → "evidence ledger and agent work diary"
  //   Plugin Canon        → "NZ policy runtime"
  //   A2A email substrate → "agent-to-agent collection loop"

  // /evidence-pack — sub-paragraph below the locked H1 ("Not an output. / A record.")
  evidenceLedgerSubcopy:
    'The evidence ledger captures every workflow’s signed receipt, source citations, and tikanga and Privacy Act attestations. Pack-grade output, hand-it-to-your-insurer ready.',

  // /agents — positioning paragraph below the existing lede. Reframes the
  // marketplace as specialist kete on a shared NZ policy runtime.
  agentsPolicyRuntimeIntro:
    'Each kete sits on the same NZ policy runtime — Privacy Act 2020 controls, tikanga and Te Tiriti governance, full audit trail, and signed receipts built into the substrate. What works for one industry is consistent across all nine kete.',

  // /about — strategic positioning sentence per the vertical-agent strategy memo.
  aboutPositioning:
    'assembl is the cross-vertical trust-and-control layer for operational agents in New Zealand document-heavy workflows.',
};

// ── How it works — 5 canon stages (Kahu / Iho / Tā / Mahara / Mana) ─────────
// Phase 1 brief §11 — the five-stage pipeline as named in the canon.

export type PipelineStage = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  body: string;
  example: string;
};

export const pipelineStages: readonly PipelineStage[] = [
  {
    id: 'kahu',
    number: '01',
    title: 'Kahu',
    subtitle: 'Intent capture',
    body:
      'A request comes in. Kahu listens, transcribes, and frames it: what is being asked, who is asking, what context already lives in your kete. The brief never starts from a blank page.',
    example: 'The council asks for a variation.',
  },
  {
    id: 'iho',
    number: '02',
    title: 'Iho',
    subtitle: 'Routing',
    body:
      'Iho is the brain of the pipeline. It picks the right specialist agent for the work, the right model for the job, and the right pou — Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga — for the cultural pass.',
    example: 'Routes the variation to Whakaaē, citing NZS 3910:2013.',
  },
  {
    id: 'ta',
    number: '03',
    title: 'Tā',
    subtitle: 'Execution',
    body:
      'The specialist agent drafts the work end-to-end. Every Act, Section, and council document cited inline. Nothing invented, nothing left unsourced. This is where the time is given back to your team.',
    example: 'Drafts the variation pack — cost, time, contract impact.',
  },
  {
    id: 'mahara',
    number: '04',
    title: 'Mahara',
    subtitle: 'Review',
    body:
      'Draft Mode. The named reviewer in your team accepts, edits, or rejects each paragraph. Reasoning is preserved alongside the edit so the next reviewer — or the auditor — can see why.',
    example: 'Your project manager edits the rate, accepts the rest.',
  },
  {
    id: 'mana',
    number: '05',
    title: 'Mana',
    subtitle: 'Sign-off',
    body:
      'Nothing ships until a person says so. Mana captures the sign-off, seals the evidence pack, and hands the work to the system that needs it — the BCA, the customer, the auditor. Your name is on it. The evidence ledger — every output ends in a signed receipt you can file, forward, or footnote.',
    example: 'Your name on the sign-off line. Pack sealed. Variation sent.',
  },
] as const;

// ── Evidence pack — 4 reveals (Blank → Attribution → Citations → Sealed) ─────

export type EvidenceReveal = {
  id: string;
  number: string;
  title: string;
  body: string;
};

export const evidencePackContents: readonly EvidenceReveal[] = [
  {
    id: 'blank',
    number: '01',
    title: 'Blank',
    body:
      'A clean page. Your letterhead, your project name, the date, a draft watermark. Nothing else yet — the agents have not started. This is where every pack begins.',
  },
  {
    id: 'attribution',
    number: '02',
    title: 'Attribution',
    body:
      'The agent that drafted the work, the model version, the prompt it received, the reviewer assigned. Every paragraph stamped with the name of the agent that produced it and the human who is on the hook for it.',
  },
  {
    id: 'citations',
    number: '03',
    title: 'Citations',
    body:
      'Hyperlinked Acts, Sections, NZS standards, council documents — version-stamped to the day. If a clause is amended next month, your pack still shows what was law the day you signed off.',
  },
  {
    id: 'sealed',
    number: '04',
    title: 'Sealed',
    body:
      'A SHA-256 hash of the final document is calculated and written into the pack. The pou stamp goes on. The pack is sealed. Tamper-evident — change a single character and the seal breaks.',
  },
] as const;

// ── Site-wide nav (multi-page only — anchors are BANNED per canon §2.1) ──────

export const nav = [
  { href: '/pilot-sprint',  label: 'Pilot Sprint' },
  { href: '/how-it-works',  label: 'How it works' },
  { href: '/kete',          label: 'Kete' },
  { href: '/pricing',       label: 'Pricing' },
  { href: '/about',         label: 'About' },
] as const;

export const navCta = { href: '/pilot-sprint', label: 'Book a pilot' };

// ── Footer disclaimer — Plugin Architecture Canon §4 (verbatim) ──────────────

export const footerDisclaimer =
  'assembl evidence vessel. Built in Aotearoa. Time is the thing. We give it back. Every output is reviewed by a named human in your team before it ships. We do not provide legal, tax, or medical advice. We do not generate karakia, whaikōrero, mihimihi, pepeha, or waiata.';
