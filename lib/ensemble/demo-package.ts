/**
 * DEMO-only creative package + brand board for the Ensemble front door.
 * Fictional NZ studio day. Not advice. Not a live clearance.
 * Floor plates / PlanPins are intentionally absent — Arc keeps that kit.
 */

export type PackageStage = {
  id: string;
  label: string;
  agent: string;
  body: string;
  demo: true;
};

export type BrandBoardItem = {
  id: string;
  agent: string;
  note: string;
  kind: 'image' | 'video' | 'audio' | 'copy';
  src?: string;
  text?: string;
  demo: true;
};

export const ENSEMBLE_PACKAGE_STAGES: PackageStage[] = [
  {
    id: 'strategy',
    label: '01 · Strategy',
    agent: 'Auaha',
    body: 'Warm winter cuppa for Wellington walk-ins. One message: the single-origin that earns the pause between meetings.',
    demo: true,
  },
  {
    id: 'copy',
    label: '02 · Copy',
    agent: 'Muse',
    body: '“Your perfect winter cuppa is here.” / “Warm up with our new winter single origin.” / “Beat the Wellington chill, one sip at a time.”',
    demo: true,
  },
  {
    id: 'stills',
    label: '03 · Stills',
    agent: 'Prism',
    body: 'Editorial product still — ceramic cup, soft chalk field, plum ink rim light. Four variations staged for review.',
    demo: true,
  },
  {
    id: 'film',
    label: '04 · Film',
    agent: 'Flux',
    body: '15s steam-and-cup beat. Hook in three seconds, hold on the pour, close on the mark.',
    demo: true,
  },
  {
    id: 'voice',
    label: '05 · Voice',
    agent: 'Verse',
    body: '40s warm NZ presenter script — benefit first, one CTA, holds for approval before any publish.',
    demo: true,
  },
];

export const ENSEMBLE_BRAND_BOARD: BrandBoardItem[] = [
  {
    id: 'prism-skincare',
    agent: 'Prism',
    note: 'Editorial still · DEMO',
    kind: 'image',
    src: '/generated/creative-agency/anchors/prism-skincare.png',
    demo: true,
  },
  {
    id: 'prism-vessel',
    agent: 'Prism',
    note: 'Vessel study · DEMO',
    kind: 'image',
    src: '/generated/creative-agency/anchors/prism-vessel.png',
    demo: true,
  },
  {
    id: 'prism-cafe',
    agent: 'Prism',
    note: 'Café campaign · DEMO',
    kind: 'image',
    src: '/generated/creative-agency/anchors/prism-cafe.png',
    demo: true,
  },
  {
    id: 'prism-portrait',
    agent: 'Prism',
    note: 'Founder portrait · DEMO',
    kind: 'image',
    src: '/generated/creative-agency/anchors/prism-portrait.png',
    demo: true,
  },
  {
    id: 'flux-studio',
    agent: 'Flux',
    note: 'Studio film · DEMO',
    kind: 'video',
    src: '/generated/creative-agency/anchors/flux-studio.mp4',
    demo: true,
  },
  {
    id: 'verse-podcast',
    agent: 'Verse',
    note: 'Voice segment · DEMO',
    kind: 'audio',
    src: '/generated/creative-agency/anchors/verse-podcast.mp3',
    demo: true,
  },
  {
    id: 'muse-winter',
    agent: 'Muse',
    note: 'Winter single-origin · DEMO',
    kind: 'copy',
    text: '“Your perfect winter cuppa is here.”\n“Warm up with our new winter single origin.”\n“Beat the Wellington chill, one sip at a time.”',
    demo: true,
  },
];

/**
 * DEMO claim flags on the campaign artefact — readable cards, not an
 * architecture pin sheet. ASA / Fair Trading / rights. Not advice.
 */
export type ClaimPin = {
  id: string;
  code: string;
  title: string;
  summary: string;
  artefact: string;
  demo: true;
};

export const ENSEMBLE_CLAIM_PINS: ClaimPin[] = [
  {
    id: 'asa-superiority',
    code: 'ASA',
    title: 'Unsubstantiated superiority claim',
    summary:
      'Brand board headline claims “NZ’s #1” without substantiation on this DEMO plate. Cite ASA Principle 2 before any publish draft leaves the desk.',
    artefact: 'Harbour winter headline · Muse',
    demo: true,
  },
  {
    id: 'fta-price',
    code: 'FTA 1986',
    title: 'Price claim missing conditions',
    summary:
      'Offer lock-up omits material conditions on this DEMO forme. Fair Trading Act 1986 — draft the note, hold for human sign-off.',
    artefact: 'Offer lock-up · brand board',
    demo: true,
  },
  {
    id: 'asa-disclaimer',
    code: 'ASA',
    title: 'Disclaimer too small on forme',
    summary:
      'DEMO disclaimer sits below readable size on the campaign forme. Stage a corrected layout before any media booking.',
    artefact: 'Campaign forme · Prism',
    demo: true,
  },
  {
    id: 'copyright-asset',
    code: 'Copyright',
    title: 'Asset rights unconfirmed',
    summary:
      'Stock still on the DEMO shelf has no confirmed licence trail. Hold publish until rights are on the receipt.',
    artefact: 'Asset shelf · Flux still',
    demo: true,
  },
];

export const ENSEMBLE_MAKERS = [
  {
    slug: 'auaha',
    name: 'Auaha',
    role: 'Creative lead',
    blurb: 'Whole brief in. Assembled package out — staged for your yes.',
  },
  {
    slug: 'prism',
    name: 'Prism',
    role: 'Art direction',
    blurb: 'A shot brief in. On-brand stills staged for review.',
  },
  {
    slug: 'muse',
    name: 'Muse',
    role: 'Copy',
    blurb: 'Headlines, social, scripts — claim-safe drafts only.',
  },
  {
    slug: 'flux',
    name: 'Flux',
    role: 'Film',
    blurb: 'A fifteen-second brand film beat from one scene.',
  },
  {
    slug: 'verse',
    name: 'Verse',
    role: 'Voice',
    blurb: 'A scripted, voiced segment held for approval.',
  },
] as const;
