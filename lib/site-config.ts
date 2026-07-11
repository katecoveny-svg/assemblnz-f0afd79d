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
  // Compressed locally from Kate's 2026-05-16 vessel clips.
  videoLocal: '/videos/vessel-canon-landscape-720p.mp4',
  videoRemote: '/videos/vessel-canon-landscape-720p.mp4',
  videoPortrait: '/videos/vessel-canon-portrait-720p.mp4',
};

// Painterly anchor — /about hero only.
export const painterlyAnchor = '/img/kete/heroes-vessel/waihanga-hero-vessel.jpg';

// Nine kete vessels — 1:1 (card) + 16:9 (page hero). All on the locked
// `heroes-vessel` set: one cream/sage/gold stacked-disc form per kete, so every
// surface (cards, hero stills, social) reads as one brand. (Manaaki, Pīkau,
// Auaha, Hoko previously drifted to red/blue/purple renders — now retired.)
export const ketes: Record<KeteSlug, { square: string; wide: string }> = {
  waihanga: {
    square: '/img/kete/heroes-vessel/waihanga-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/waihanga-hero-vessel.jpg',
  },
  manaaki: {
    square: '/img/kete/heroes-vessel/manaaki-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/manaaki-hero-vessel.jpg',
  },
  pikau: {
    square: '/img/kete/heroes-vessel/pikau-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/pikau-hero-vessel.jpg',
  },
  arataki: {
    square: '/img/kete/heroes-vessel/arataki-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/arataki-hero-vessel.jpg',
  },
  auaha: {
    square: '/img/kete/heroes-vessel/auaha-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/auaha-hero-vessel.jpg',
  },
  ako: {
    square: '/img/kete/heroes-vessel/ako-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/ako-hero-vessel.jpg',
  },
  matauranga: {
    square: '/img/kete/heroes-vessel/matauranga-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/matauranga-hero-vessel.jpg',
  },
  hoko: {
    square: '/img/kete/heroes-vessel/hoko-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/hoko-hero-vessel.jpg',
  },
  toro: {
    square: '/img/kete/heroes-vessel/toro-hero-vessel.jpg',
    wide:   '/img/kete/heroes-vessel/toro-hero-vessel.jpg',
  },
};

export const footerKeteCutouts: Record<KeteSlug, string> = {
  waihanga: '/img/kete/footer-cutouts/waihanga.png',
  manaaki: '/img/kete/footer-cutouts/manaaki.png',
  pikau: '/img/kete/footer-cutouts/pikau.png',
  arataki: '/img/kete/footer-cutouts/arataki.png',
  auaha: '/img/kete/footer-cutouts/auaha.png',
  ako: '/img/kete/footer-cutouts/ako.png',
  matauranga: '/img/kete/footer-cutouts/matauranga.png',
  hoko: '/img/kete/footer-cutouts/hoko.png',
  toro: '/img/kete/footer-cutouts/toro.png',
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

const CANON_LANDSCAPE_VIDEO = '/videos/vessel-canon-landscape-720p.mp4';
const CANON_LANDSCAPE_POSTER = '/videos/vessel-canon-landscape-poster.jpg';

export const heroVideos: Record<HeroVideoKey, HeroVideoEntry> = {
  home:           { src: CANON_LANDSCAPE_VIDEO, poster: CANON_LANDSCAPE_POSTER },
  'pilot-sprint': { src: '/videos/pilot-sprint-hero.mp4', poster: '/videos/pilot-sprint-hero-poster.jpg' },
  'how-it-works': { src: null,              poster: heroVessel.wide },
  'evidence-pack':{ src: null,              poster: heroVessel.wide },
  pricing:        { src: null,              poster: heroVessel.wide },
  agents:         { src: null,              poster: heroVessel.wide },
  about:          { src: null,              poster: painterlyAnchor },
  'kete:waihanga':{ src: CANON_LANDSCAPE_VIDEO, poster: ketes.waihanga.wide },
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
    'assembl runs operational compliance work in the open: every workflow is built on New Zealand legislation, reviewed by a named person on your team, and sealed with an evidence pack you can file, forward, or footnote.',

  heroHeadlineLines: [
    'Mahi that earns',
    'its proof.',
  ] as const,

  // Q3 — Homepage pull quote.
  // "Time is the thing. We give it back." line retired 2026-05-17)
  pullQuote: 'Mahi that earns its proof.',

  // Q2 — Trust strip. Item 3 locked verbatim. Items 1 & 2 reframed 2026-05-09
  // under the vertical-agent strategy memo: surface the governance substrate
  // (Privacy Act 2020, tikanga + Te Tiriti) instead of geography.
  trustStrip: [
    'Privacy Act 2020 compliant',
    'Cultural review when needed',
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
    src: '/videos/assembl-brand-vessel-film-720p.mp4',
    poster: '/videos/assembl-brand-vessel-film-poster.jpg',
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
    'Each pack sits on the same NZ policy runtime: Privacy Act 2020 controls, cultural review when needed, a full audit trail, and signed receipts built into the substrate. What works for one industry is consistent across all nine packs.',

  // /about — strategic positioning sentence per the vertical-agent strategy memo.
  aboutPositioning:
    'assembl is the cross-vertical trust-and-control layer for operational agents in New Zealand document-heavy workflows.',
};

// ── How it works — 5 canon stages (Kahu / Iho / Tā / Mahara / Mana) ─────────
// Phase 1 brief §11 — the five-stage pipeline as named in the canon.

export type PipelineStage = {
  id: string;
  number: string;
  /** English lead — the headline of the stage (canon: English always headlines). */
  title: string;
  /** Quiet te reo stage name, shown as a small label beside the English title. */
  reoLabel: string;
  body: string;
  example: string;
};

export const pipelineStages: readonly PipelineStage[] = [
  {
    id: 'kahu',
    number: '01',
    title: 'Capture',
    reoLabel: 'Kahu',
    body:
      'A request comes in. It gets listened to, transcribed, and framed: what is being asked, who is asking, and what context already lives in your workspace. The brief never starts from a blank page.',
    example: 'The council asks for a variation.',
  },
  {
    id: 'iho',
    number: '02',
    title: 'Route',
    reoLabel: 'Iho',
    body:
      'The routing brain of the pipeline picks the right specialist agent for the work, the right model for the job, and applies a cultural pass — Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga — where it is needed.',
    example: 'Routes the variation to the consenting agent, citing NZS 3910:2013.',
  },
  {
    id: 'ta',
    number: '03',
    title: 'Draft',
    reoLabel: 'Tā',
    body:
      'The specialist agent drafts the work end-to-end. Every Act, Section, and council document cited inline. Nothing invented, nothing left unsourced. This is where the time is given back to your team.',
    example: 'Drafts the variation pack — cost, time, contract impact.',
  },
  {
    id: 'mahara',
    number: '04',
    title: 'Review',
    reoLabel: 'Mahara',
    body:
      'Draft Mode. The named reviewer on your team accepts, edits, or rejects each paragraph. Reasoning is preserved alongside the edit so the next reviewer — or the auditor — can see why.',
    example: 'Your project manager edits the rate, accepts the rest.',
  },
  {
    id: 'mana',
    number: '05',
    title: 'Sign-off',
    reoLabel: 'Mana',
    body:
      'Nothing ships until a person says so. The sign-off is captured, the evidence pack is sealed, and the work is handed to the system that needs it — the BCA, the customer, the auditor. Your name is on it, and every output ends in a signed receipt you can file, forward, or footnote.',
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

// Living Business OS direction (locked 2026-07-10, chrome aligned
// 2026-07-11): the global nav matches the homepage's own nav — the living
// site story, never the marketplace. Lowercase on-brand (only micro-labels
// are uppercase).
export const nav = [
  { href: '/how-it-works', label: 'how it works' },
  { href: '/living-site',  label: 'living site' },
  { href: '/pricing',      label: 'pricing' },
  { href: '/about',        label: 'about' },
] as const;

export const navCta = { href: '/living-site', label: 'see a living site' };

// ── Footer disclaimer — Plugin Architecture Canon §4 (verbatim) ──────────────

export const footerDisclaimer =
  'assembl — the living business operating system. Built in Aotearoa. Nothing sends without your yes: every email, booking, and post is a draft until a person on your team approves it. We do not provide legal, tax, or medical advice. We do not generate karakia, whaikōrero, mihimihi, pepeha, or waiata.';
