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

const PUB = 'https://pub.hyperagent.com/api/published';

// ── Vessel imagery — Sculptural canon (locked 2026-05-08) ────────────────────

export const heroVessel = {
  // 16:9 hero — cinematic video first frame fallback, deck cover, OG fallback
  wide:    `${PUB}/pbf01KQZNN17F_QZ7P4QPVS1EWX8S1/4526e124-051e-4988-8a31-7fdb7e7848fe.png`,
  // 1:1 square — OG image, Twitter card
  square:  `${PUB}/pbf01KQZNN69D_F1PZY6EP7VFA8XVD/4118cc7f-6f94-40ef-87db-90369503d433.png`,
  // 4:5 portrait — mobile hero
  portrait:`${PUB}/pbf01KQZNNA9Y_M0EN4QRNCEG2PGZE/1ae4a0f5-54a3-4664-a9a7-50ae2097c2c4.png`,
  // Brand mark — favicon, footer
  mark:    `${PUB}/pbf01KQZNXVE1_NA5K5MPCQGCJEK7W/adfe1b92-a290-4c42-9a30-a79a2f2bd764.png`,
  // Cinematic vessel video — homepage signature scrub-bound video.
  // Compressed locally to /videos/vessel-rotate-720p.mp4 (525 KB, 8s, 720p, no audio).
  // Original 5.6 MB MP4 retained as remote fallback only.
  videoLocal: '/videos/vessel-rotate-720p.mp4',
  videoRemote: `${PUB}/pbf01KR29660W_5AV6EQQS47E3598Y/89dcf58c-d2ce-4d06-aeeb-64dcfb564fb1.mp4`,
};

// Painterly anchor — /about hero only.
export const painterlyAnchor = `${PUB}/pbf01KR2C71SD_5DYB1N0ZR3DG7GFQ/assembl-waihanga-1778139014339.jpg`;

// 8 kete vessels — 1:1 (card) + 16:9 (page hero)
export const ketes: Record<KeteSlug, { square: string; wide: string }> = {
  waihanga: {
    square: `${PUB}/pbf01KR2AKJMZ_ZMB5AHZX86C6TQ7T/011e070e-7833-400c-9498-0c234754b478.png`,
    wide:   `${PUB}/pbf01KR2CBWET_F7B9400XCPHSV7D5/432bd719-89c4-4c2d-80f9-3d025e5ab2cf.png`,
  },
  manaaki: {
    square: `${PUB}/pbf01KR2BSMDJ_BR0EP5N10R6EX0XC/c673028f-a89e-4cd0-9196-adf28bc153a8.png`,
    wide:   `${PUB}/pbf01KR2BTTQ1_S3GJ2XTY65FSAE5K/9c6d5f78-65e2-4aed-89b7-10d6422a7d78.png`,
  },
  pikau: {
    square: `${PUB}/pbf01KR2BG4H6_6XZX51NHYJJ75VC2/111b5a32-524b-4952-8f17-80f22f0cddf2.png`,
    wide:   `${PUB}/pbf01KR2BV3EY_YDM7PKXG517CBA0B/cbcc555f-f337-450c-b7b4-3fb50f8f5225.png`,
  },
  arataki: {
    square: `${PUB}/pbf01KR2BSVX1_01E40PSVVTMDGWPP/295c0f3e-869e-45cb-bfdd-eada375ee298.png`,
    wide:   `${PUB}/pbf01KR2BVBNP_33WTR87FXHETVFQN/8f792c3f-9811-4eb3-a3d2-fa8479f74145.png`,
  },
  auaha: {
    square: `${PUB}/pbf01KR2BT3R6_BSW3ABA8N5RRXTXW/9da45672-f0be-4d86-8a81-c34d990ca2dc.png`,
    wide:   `${PUB}/pbf01KR2BVJPD_N1H5BGJW58TH7Y25/99360b8b-e45e-4725-8427-b133ead1feff.png`,
  },
  ako: {
    square: `${PUB}/pbf01KR2BTBT3_QEQEW35JCRW9XDSH/393cb7d8-5d02-43c2-a348-524802131e8f.png`,
    wide:   `${PUB}/pbf01KR2BVT12_DH7K493ABBKV1W1N/da0ccaf5-6e2e-4b9c-bba3-e1da41289d22.png`,
  },
  hoko: {
    square: `${PUB}/pbf01KR2BGCDD_D34G6SMA3SDM4ANN/1a53a74a-1e57-4963-8e39-557317b86c67.png`,
    wide:   `${PUB}/pbf01KR2BW3CT_Q1F4AF22ZB86N9AP/0b247f34-ad05-42e8-b392-58f1337dbb9d.png`,
  },
  toro: {
    square: `${PUB}/pbf01KR2BTKQH_T3ZX2E53SHG1FTAD/9b7eb4e3-a0d7-46c3-aa4f-d10a947b66d6.png`,
    wide:   `${PUB}/pbf01KR2BWA94_7PQ7R1ZPYB9MFNXE/46a806d9-7af3-4300-b18f-a0a25d627c49.png`,
  },
};

// ── Locked Reo Phase 1 (signed off 2026-05-08, do not edit lightly) ──────────

export const reo = {
  // Q1 — Homepage hero lede (Variant A locked)
  heroLede:
    'New Zealanders use intelligent agents everywhere. Few of us trust what they do. assembl runs every workflow in the open and ends each one with an evidence pack you can file, forward, or footnote.',

  // Q1 — locked Variant A H1 (signed off 2026-05-08): "quiet intelligence for Aotearoa".
  // Lowercase q, capital A on the proper noun, no other punctuation.
  // Two-line presentation so the gilded last line carries "for Aotearoa".
  heroHeadlineLines: [
    'quiet intelligence',
    'for Aotearoa',
  ] as const,

  // Q3 — Homepage pull quote
  pullQuote: 'Intelligent automation with adult supervision.',

  // Q2 — Trust strip. Item 3 locked verbatim. Items 1 & 2 reframed 2026-05-09
  // under the vertical-AI strategy memo: surface the governance substrate
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
    eyebrow: 'Quiet intelligence, in motion.',
    body:
      'A short film about how assembl works. Cream paper. The vessel breathes. Kate explains it in 90 seconds.',
    cta: 'Sound on. Narrated in NZ English.',
    duration: '90 seconds',
  },

  // ── Strategic positioning copy (added 2026-05-09 per vertical-AI strategy
  // memo). These are NEW strings — they sit ALONGSIDE the locked Reo, never
  // replacing it. Three customer-facing labels are introduced:
  //   Mana Receipts       → "evidence ledger and AI work diary"
  //   Plugin Canon        → "NZ policy runtime"
  //   A2A email substrate → "agent-to-agent collection loop"

  // /evidence-pack — sub-paragraph below the locked H1 ("Not an output. / A record.")
  evidenceLedgerSubcopy:
    'The evidence ledger captures every workflow’s signed receipt, source citations, and tikanga and Privacy Act attestations. Pack-grade output, hand-it-to-your-insurer ready.',

  // /agents — positioning paragraph below the existing lede. Reframes the
  // marketplace as specialist kete on a shared NZ policy runtime.
  agentsPolicyRuntimeIntro:
    'Each kete sits on the same NZ policy runtime — Privacy Act 2020 controls, tikanga and Te Tiriti governance, full audit trail, and signed receipts built into the substrate. What works for one industry is consistent across all eight.',

  // /about — strategic positioning sentence per the vertical-AI strategy memo.
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
  'assembl uses intelligent agents to draft, check, and document work — every output is reviewed by a named human in your team before it ships. We do not provide legal, tax, or medical advice. We do not generate karakia, whaikōrero, mihimihi, pepeha, or waiata.';
