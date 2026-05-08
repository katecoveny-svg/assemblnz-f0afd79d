// lib/site-config.ts — assembl single source of truth
// Phase 1 Canon Rebuild · v2026-05-08
// All components read from this file. No hardcoded strings in components.

export const SITE = {
  wordmark: 'assembl',
  tagline: 'quiet intelligence for Aotearoa',
  domain: 'assembl.co.nz',
  versionStamp: 'Mārama Whenua · v2026-05-08',
} as const;

export const HEADER_NAV = [
  { label: 'Pilot Sprint', href: '/pilot-sprint' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Kete', href: '/kete', hasMenu: true },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
] as const;

export const HEADER_CTA = {
  label: 'Book a pilot',
  href: '/pilot-sprint',
} as const;

// ─── Locked vessel imagery (Sculptural canon) ───────────────────────────────
export const VESSEL_ASSETS = {
  hero16x9:
    'https://pub.hyperagent.com/api/published/pbf01KQZNN17F_QZ7P4QPVS1EWX8S1/4526e124-051e-4988-8a31-7fdb7e7848fe.png',
  square1x1:
    'https://pub.hyperagent.com/api/published/pbf01KQZNN69D_F1PZY6EP7VFA8XVD/4118cc7f-6f94-40ef-87db-90369503d433.png',
  portrait4x5:
    'https://pub.hyperagent.com/api/published/pbf01KQZNNA9Y_M0EN4QRNCEG2PGZE/1ae4a0f5-54a3-4664-a9a7-50ae2097c2c4.png',
  brandMark:
    'https://pub.hyperagent.com/api/published/pbf01KQZNXVE1_NA5K5MPCQGCJEK7W/adfe1b92-a290-4c42-9a30-a79a2f2bd764.png',
  // Cinematic vessel rotation — 5.6 MB source; compress before deploy (see PR notes)
  cinematicVideo:
    'https://pub.hyperagent.com/api/published/pbf01KR29660W_5AV6EQQS47E3598Y/89dcf58c-d2ce-4d06-aeeb-64dcfb564fb1.mp4',
  // Painterly anchor — for /about only
  painterlyAnchor:
    'https://pub.hyperagent.com/api/published/pbf01KR2C71SD_5DYB1N0ZR3DG7GFQ/assembl-waihanga-1778139014339.jpg',
} as const;

// ─── Hero copy (Reo Phase 1, locked) ────────────────────────────────────────
export const HERO_COPY = {
  eyebrow: 'assembl · quiet intelligence',
  headlineLines: ['quiet intelligence', 'for the work that keeps', 'Aotearoa moving'],
  lede:
    'New Zealanders use intelligent agents everywhere. Few of us trust what they do. assembl runs every workflow in the open and ends each one with an evidence pack you can file, forward, or footnote.',
  ctaPrimary: { label: 'Start a Pilot Sprint →', href: '/pilot-sprint' },
  ctaSecondary: { label: 'See how it works', href: '/how-it-works' },
  trustStrip: 'NZ Privacy Act 2020 compliant · Te Mana Raraunga aligned · MBIE responsible automation guidance · Sydney-hosted',
  bottomLabels: 'signal in · evidence held · decision out · trail kept',
} as const;

// ─── Kete data ───────────────────────────────────────────────────────────────
export type KeteSlug =
  | 'waihanga'
  | 'manaaki'
  | 'pikau'
  | 'arataki'
  | 'auaha'
  | 'ako'
  | 'hoko'
  | 'toro';

export interface Kete {
  slug: KeteSlug;
  name: string;
  industry: string;
  tagline: string;
  body: string;
  status: 'pilot' | 'shortly' | 'roadmap';
  pilotClient: string | null;
  accentTint: string;
  vesselSquare: string;
  vesselHero: string;
}

const BASE = 'https://pub.hyperagent.com/api/published/';

export const KETES: Kete[] = [
  {
    slug: 'waihanga',
    name: 'Waihanga',
    industry: 'Construction',
    tagline: 'Design is the job. Consent paperwork is the tax. assembl pays the tax.',
    body: 'Three SSSPs. Zero needed their 25 years of experience. Building Act 2004, HSWA 2015, MBIE Building Code — watched daily, drafted on demand, approved by your name.',
    status: 'pilot',
    pilotClient: 'TOA Architecture',
    accentTint: '#C8D4C0',
    vesselSquare: `${BASE}pbf01KR2AKJMZ_ZMB5AHZX86C6TQ7T/011e070e-7833-400c-9498-0c234754b478.png`,
    vesselHero: `${BASE}pbf01KR2CBWET_F7B9400XCPHSV7D5/432bd719-89c4-4c2d-80f9-3d025e5ab2cf.png`,
  },
  {
    slug: 'manaaki',
    name: 'Manaaki',
    industry: 'Hospitality',
    tagline: 'Food Act obligations without the paper trail anxiety.',
    body: 'Food Control Plans, allergen disclosure, licence renewals — Manaaki watches the Food Act 2014 and Health and Safety at Work Act 2015 so your front-of-house can watch the guests.',
    status: 'shortly',
    pilotClient: null,
    accentTint: '#E0B8A8',
    vesselSquare: `${BASE}pbf01KR2BSMDJ_BR0EP5N10R6EX0XC/c673028f-a89e-4cd0-9196-adf28bc153a8.png`,
    vesselHero: `${BASE}pbf01KR2BTTQ1_S3GJ2XTY65FSAE5K/9c6d5f78-65e2-4aed-89b7-10d6422a7d78.png`,
  },
  {
    slug: 'pikau',
    name: 'Pikau',
    industry: 'Freight & Customs',
    tagline: 'Every tariff classification. Every entry. Evidence by default.',
    body: 'Customs and Excise Act 2018, General Interpretive Rules, Schedule 4 — Pikau drafts classifications, entry declarations, and seven-year audit trails so your broker signs off, not starts over.',
    status: 'pilot',
    pilotClient: 'Aironaut Customs',
    accentTint: '#BDD3DE',
    vesselSquare: `${BASE}pbf01KR2BG4H6_6XZX51NHYJJ75VC2/111b5a32-524b-4952-8f17-80f22f0cddf2.png`,
    vesselHero: `${BASE}pbf01KR2BV3EY_YDM7PKXG517CBA0B/cbcc555f-f337-450c-b7b4-3fb50f8f5225.png`,
  },
  {
    slug: 'arataki',
    name: 'Arataki',
    industry: 'Automotive',
    tagline: 'Consumer Guarantees Act claims resolved with evidence, not arguments.',
    body: 'Consumer Guarantees Act 1993, Motor Vehicle Sales Act 2003, Fair Trading Act 1986 — Arataki drafts response letters, warranty positions, and dispute evidence packs.',
    status: 'shortly',
    pilotClient: null,
    accentTint: '#E0BC8E',
    vesselSquare: `${BASE}pbf01KR2BSVX1_01E40PSVVTMDGWPP/295c0f3e-869e-45cb-bfdd-eada375ee298.png`,
    vesselHero: `${BASE}pbf01KR2BVBNP_33WTR87FXHETVFQN/8f792c3f-9811-4eb3-a3d2-fa8479f74145.png`,
  },
  {
    slug: 'auaha',
    name: 'Auaha',
    industry: 'Creative',
    tagline: 'Contracts, briefs, and IP records — without the legal overhead.',
    body: 'Copyright Act 1994, contract law, independent contractor agreements — Auaha drafts project briefs, creative agreements, and IP assignment records so the work is yours on paper.',
    status: 'shortly',
    pilotClient: null,
    accentTint: '#B8A8C8',
    vesselSquare: `${BASE}pbf01KR2BT3R6_BSW3ABA8N5RRXTXW/9da45672-f0be-4d86-8a81-c34d990ca2dc.png`,
    vesselHero: `${BASE}pbf01KR2BVJPD_N1H5BGJW58TH7Y25/99360b8b-e45e-4725-8427-b133ead1feff.png`,
  },
  {
    slug: 'ako',
    name: 'Ako',
    industry: 'Early Childhood',
    tagline: 'Licensing renewals and ERO preparation without the weekend panic.',
    body: 'Education and Training Act 2020, Licensing Criteria for Early Childhood Services 2008 — Ako drafts self-review evidence, licensing checklists, and ERO preparation packs.',
    status: 'roadmap',
    pilotClient: null,
    accentTint: '#C9B8A4',
    vesselSquare: `${BASE}pbf01KR2BTBT3_QEQEW35JCRW9XDSH/393cb7d8-5d02-43c2-a348-524802131e8f.png`,
    vesselHero: `${BASE}pbf01KR2BVT12_DH7K493ABBKV1W1N/da0ccaf5-6e2e-4b9c-bba3-e1da41289d22.png`,
  },
  {
    slug: 'hoko',
    name: 'Hoko',
    industry: 'Retail',
    tagline: 'Fair Trading Act compliance drafted before the complaint arrives.',
    body: 'Fair Trading Act 1986, Consumer Guarantees Act 1993, Returns and refund obligations — Hoko drafts product descriptions, returns policies, and complaint response letters.',
    status: 'roadmap',
    pilotClient: null,
    accentTint: '#2B6B57',
    vesselSquare: `${BASE}pbf01KR2BGCDD_D34G6SMA3SDM4ANN/1a53a74a-1e57-4963-8e39-557317b86c67.png`,
    vesselHero: `${BASE}pbf01KR2BW3CT_Q1F4AF22ZB86N9AP/0b247f34-ad05-42e8-b392-58f1337dbb9d.png`,
  },
  {
    slug: 'toro',
    name: 'Tōro',
    industry: 'Whānau / Consumer',
    tagline: 'KiwiSaver, tenancy rights, and plain-English answers for everyday Aotearoa.',
    body: 'KiwiSaver Act 2006, Residential Tenancies Act 1986, Credit Contracts and Consumer Finance Act 2003 — Tōro drafts plain-English advice, rights summaries, and dispute evidence packs for everyday New Zealanders.',
    status: 'roadmap',
    pilotClient: null,
    accentTint: '#3A3530',
    vesselSquare: `${BASE}pbf01KR2BTKQH_T3ZX2E53SHG1FTAD/9b7eb4e3-a0d7-46c3-aa4f-d10a947b66d6.png`,
    vesselHero: `${BASE}pbf01KR2BWA94_7PQ7R1ZPYB9MFNXE/46a806d9-7af3-4300-b18f-a0a25d627c49.png`,
  },
];

// ─── How it works — 5 stage cards (Reo Phase 1, locked) ─────────────────────
export const HOW_IT_WORKS = {
  hero: {
    eyebrow: '02 — HOW IT WORKS',
    headline: ['Five stages.', 'Nothing ships', 'until a person says so.'],
    lede: 'Every request that enters assembl runs through a fixed five-stage pipeline before it reaches you. Citations verified. NZ legislation checked. Plain English output staged for your sign-off. The pipeline is the promise.',
    ctaPrimary: { label: 'Start a Pilot Sprint →', href: '/pilot-sprint' },
    ctaSecondary: { label: 'See the evidence pack', href: '/evidence-pack' },
  },
  stages: [
    {
      eyebrow: '01 — KAHU',
      name: 'Kahu',
      subtitle: 'signal in',
      body: 'Every request arrives here. Kahu validates it, logs it, and gives it a session ID that follows it through every subsequent stage. Nothing proceeds without a clean entry record. Garbage in, garbage out — Kahu is the first gate.',
      example:
        `When a customs broker asks "what's the tariff classification for this consignment?", Kahu picks up the question, timestamps it, and hands it forward with a clean audit entry already written.`,
    },
    {
      eyebrow: '02 — IHO',
      name: 'Iho',
      subtitle: 'the router',
      body: 'Iho reads the intent of the request and dispatches it to the right specialist. A building consent question goes to the Waihanga agent. A tariff classification goes to Pikau. A KiwiSaver query goes to Tōro. Routing is precise, not probabilistic — the decision is logged and reviewable.',
      example:
        'A construction project manager asks about payment claim timelines. Iho identifies Construction Contracts Act intent and routes to the Waihanga specialist — not to a generic agent.',
    },
    {
      eyebrow: '03 — TĀ',
      name: 'Tā',
      subtitle: 'drafting',
      body: 'The specialist agent works the problem. It reads legislation, checks its knowledge base, drafts an output, and cites every claim to an Act, section, and year. It does not ship autonomously — the draft sits, waiting. Tā is where the work happens, not where it ends.',
      example:
        'The Pikau customs agent drafts three tariff classification candidates, each citing Schedule 4 of the Customs and Excise Act 2018 and applying the General Interpretive Rules in order. None are presented as definitive.',
    },
    {
      eyebrow: '04 — MAHARA',
      name: 'Mahara',
      subtitle: 'memory and audit',
      body: `Every step of every draft is written to the audit log — the source, the tool call, the citation, the output. Mahara holds a seven-year record: not because we think you'll need it, but because the Customs Act and Tax Administration Act say you will. The record exists before you ask for it.`,
      example:
        `Three months after a freight entry, a Customs officer queries the classification. The audit log returns the original question, the three candidates Tā drafted, which one the broker chose, and the sign-off record. The broker's time in the meeting is twenty minutes.`,
    },
    {
      eyebrow: '05 — MANA',
      name: 'Mana',
      subtitle: 'sign-off',
      body: 'Nothing leaves assembl without a named human signing off. Mana is the final stage — a review screen, a named approver, a timestamp, and a hash. The evidence pack is sealed only after you say so. This is not a courtesy step. It is the architecture.',
      example:
        'The project coordinator reviews the payment schedule draft, edits one figure, and approves. Their name, role, and the timestamp of approval appear in the sealed evidence pack. That record is immutable.',
    },
  ],
} as const;

// ─── Evidence pack — 4 reveal cards (Reo Phase 1, locked) ───────────────────
export const EVIDENCE_PACK = {
  hero: {
    eyebrow: '04 — EVIDENCE PACK',
    headline: ['Not an output.', 'A record.'],
    lede: `Every consequential output assembl produces is an evidence pack — a watermarked, hashed, signed document that tells you exactly what was drafted, who drafted it, what legislation it relied on, and who approved it before it shipped. You don't have to trust us. The pack is the proof.`,
    ctaPrimary: { label: 'Start a Pilot Sprint →', href: '/pilot-sprint' },
  },
  frames: [
    {
      eyebrow: '01 — THE STARTING POINT',
      body: 'Every evidence pack begins as a clean sheet — the request, the timestamp, and the session ID. Before any drafting happens, the record exists. This is not a post-hoc summary. It is a live log from the first second of the workflow.',
    },
    {
      eyebrow: '02 — WHO DRAFTED IT',
      body: 'The agent that worked the problem is named. Which specialist, which version, which knowledge base it drew from. If the draft is wrong, you know exactly where it came from and why. Attribution is not a courtesy — it is what makes the output challengeable.',
    },
    {
      eyebrow: '03 — EVERY CLAIM CITED',
      body: 'Every factual claim in the draft is cited to a New Zealand statute — Act, section, and year. Customs entries cite the Customs and Excise Act 2018. Building consent checklists cite the Building Act 2004. Payment claim timelines cite the Construction Contracts Act 2002. The law is in the pack, not assumed.',
    },
    {
      eyebrow: '04 — THE RECEIPTS',
      body: 'The final layer: the sign-off block. A named human reviewed this document, at this time, and approved it. The watermark and hash chain confirm the document has not been altered since. Seven-year retention, per the legislation that requires it. These are the receipts.',
    },
  ],
} as const;

// ─── Brand film section (Reo Phase 1, locked) ────────────────────────────────
export const BRAND_FILM = {
  headline: 'Quiet intelligence, on tape.',
  body: 'A short film about how assembl works. Cream paper. The vessel breathes. Kate explains it in 90 seconds.',
  ctaLabel: '▶ Play',
  ctaMeta: 'Sound on. Narrated in NZ English.',
} as const;

// ─── Footer disclaimer (Plugin Architecture Canon §4 verbatim) ───────────────
export const FOOTER_DISCLAIMER =
  'assembl produces draft outputs for human review. No output constitutes legal, financial, immigration, medical, or professional advice. All consequential actions require sign-off from a qualified professional. assembl agents operate under a draft-only posture — nothing ships without explicit human approval.';

// ─── Backwards-compatibility shims ───────────────────────────────────────────
// site-footer.tsx and app/legal/disclaimer/page.tsx import these camelCase names.
// They are aliases — no new data, no new content.

/** @deprecated Use FOOTER_DISCLAIMER */
export const footerDisclaimer = FOOTER_DISCLAIMER;

/** @deprecated Use VESSEL_ASSETS.brandMark */
export const heroVessel = {
  mark: VESSEL_ASSETS.brandMark,
} as const;
