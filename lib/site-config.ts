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

  // Q1 — display-friendly two-line headline distilled from the lede.
  // The hero word-reveal animation chunks against this.
  heroHeadlineLines: [
    'Quiet intelligence,',
    'on the record.',
  ] as const,

  // Q3 — Homepage pull quote
  pullQuote: 'Intelligent automation with adult supervision.',

  // Q2 — Trust strip (item 3 locked verbatim; 1 & 2 written to match canon §4)
  trustStrip: [
    'Built in Aotearoa',
    'Grounded in NZ legislation',
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
    eyebrow: 'Quiet intelligence, on tape.',
    body:
      'A short film about how assembl works. Cream paper. The vessel breathes. Kate explains it in 90 seconds.',
    cta: 'Sound on. Narrated in NZ English.',
    duration: '90 seconds',
  },
};

// ── How it works — 5 stages (sticky-side scroll narrative) ───────────────────

export const pipelineStages = [
  {
    id: 'intake',
    number: '01',
    title: 'Intake',
    body:
      'You hand us a workflow your team runs every week. The brief, the inputs, the people who sign it off. We listen, we map, we annotate.',
  },
  {
    id: 'draft',
    number: '02',
    title: 'Draft',
    body:
      'A specialist agent drafts the work end-to-end with every NZ Act and Section cited inline. Nothing is invented. Nothing is left unsourced.',
  },
  {
    id: 'review',
    number: '03',
    title: 'Review',
    body:
      'Draft mode. The named human in your team reviews every paragraph, edits in place, accepts or rejects with a single click. Reasoning is preserved.',
  },
  {
    id: 'evidence',
    number: '04',
    title: 'Evidence',
    body:
      'Every accepted paragraph is sealed into an evidence pack: source citations, prompt history, model version, reviewer name, timestamp, hash.',
  },
  {
    id: 'ship',
    number: '05',
    title: 'Ship',
    body:
      'You ship the document. We hand you the evidence pack alongside it — file it, forward it, footnote it. The audit trail comes in the box.',
  },
] as const;

// ── Evidence pack — what's in the box (sticky-side scroll narrative) ─────────

export const evidencePackContents = [
  {
    id: 'sources',
    number: '01',
    title: 'Source citations',
    body:
      'Every paragraph linked to the Act, Section, or council document it draws from. Hyperlinked, version-stamped, immutable.',
  },
  {
    id: 'reasoning',
    number: '02',
    title: 'Reasoning trace',
    body:
      'The prompt the agent received. The reasoning it produced. The version of the model that drafted it. Reproducible end-to-end.',
  },
  {
    id: 'reviewer',
    number: '03',
    title: 'Reviewer record',
    body:
      'The named human who accepted each paragraph. Their edits, their timestamps, their override notes. Not a rubber stamp — a record.',
  },
  {
    id: 'hash',
    number: '04',
    title: 'Cryptographic seal',
    body:
      'A SHA-256 hash of the final pack. Tamper-evident. If someone changes a single character after sign-off, the seal breaks.',
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

export const navCta = { href: '/contact', label: 'Book a pilot' };

// ── Footer disclaimer — Plugin Architecture Canon §4 (verbatim) ──────────────

export const footerDisclaimer =
  'assembl uses intelligent agents to draft, check, and document work — every output is reviewed by a named human in your team before it ships. We do not provide legal, tax, or medical advice. We do not generate karakia, whaikōrero, mihimihi, pepeha, or waiata.';
