/**
 * TOA ARCHITECTS × ARC — demo dataset.
 *
 * FLAGSHIP: 16A Hubert Henderson Place, Remuera — Nick's REAL project. Facts
 * come from the draft RC of 12 May 2025 and assembl's April 2026 pre-checks
 * (see public/brand/toa-architects/16a/ and the pitch pack's
 * 16A-ASSET-INVENTORY.md): AUP zone H4, existing 16A+16B retained, proposed
 * 16C+16D two-bed 65 m² units, 380 mm FFL difference across the sloped site,
 * 225 mm stormwater line. The Te Aranga audit is only ever shown as HELD FOR
 * REVIEW with mana whenua — never as a determination.
 *
 * Everything else — supporting projects, clients, consultant firms, dollar
 * figures, and all week-by-week activity — is FICTIONAL and demo-labelled.
 * Consultant firms are invented even where they act on real 16A site facts.
 *
 * Draft-mode contract (from the April 2026 discovery doc): ARC drafts, never
 * decides; flags, never claims. Nothing in this surface sends an email or
 * lodges a consent. Every compliance claim cites its clause.
 */

export type ConsentStatus = 'green' | 'amber' | 'red';

export type ConsentApplication = {
  id: string;
  project: string;
  council: string;
  portal: 'Auckland BCM' | 'Wellington Objective' | 'Christchurch portal';
  reference: string;
  stage: string;
  status: ConsentStatus;
  statusNote: string;
  daysInStage: number;
  demo: true;
};

export type ProjectSummary = {
  id: string;
  name: string;
  location: string;
  stage:
    | 'concept'
    | 'developed design'
    | 'detailed design'
    | 'consent'
    | 'construction'
    | 'ccc';
  clientName: string; // fictional
  demo: true;
};

export type ClientUpdateDraft = {
  id: string;
  project: string;
  weekEnding: string; // ISO date
  photosThisWeek: number;
  decisionsMade: string[];
  nextWeek: string;
  rfiAnswered?: string;
  contractorStatus: string;
  demo: true;
};

export type ConsultantStatus = 'current' | 'chasing' | 'overdue';

export type Consultant = {
  id: string;
  firm: string; // fictional
  discipline:
    | 'structural'
    | 'geotech'
    | 'fire'
    | 'acoustic'
    | 'mechanical'
    | 'drainage';
  projects: string[];
  outstanding: string | null;
  status: ConsultantStatus;
  demo: true;
};

export type FeePhase = {
  phase: string;
  hours: number;
  fee: number; // NZD
};

export type FeeProposal = {
  id: string;
  project: string;
  clientName: string;
  basis: string;
  phases: FeePhase[];
  total: number;
  status: 'draft' | 'sent' | 'accepted';
  demo: true;
};

export type ProducerStatement = {
  id: string;
  project: string;
  kind: 'PS1' | 'PS3';
  discipline: string;
  firm: string;
  requiredFor: string;
  status: 'received' | 'chasing' | 'not yet due';
  demo: true;
};

export type SiteVisitReport = {
  id: string;
  project: string;
  date: string;
  recordedBy: string;
  memoSeconds: number;
  weather: string;
  progress: string[];
  defects: Array<{ item: string; action: string; owner: string }>;
  decisions: string[];
  distribution: string[];
  demo: true;
};

export type MondayQueueItem = {
  id: string;
  kind: 'client update' | 'RFI response' | 'fee proposal' | 'consultant chase';
  label: string;
  minutesToReview: number;
  demo: true;
};

/**
 * Two-tier integrations model for the orbit map.
 * Tier 1 — tools ARC reads AND writes into daily.
 * Tier 2 — signal sources ARC only reads (portals, registers, the Code).
 * `mark` is a two-letter monogram for the node chip — we draw our own marks,
 * we don't ship third-party logo assets.
 */
export type OrbitTool = {
  id: string;
  name: string;
  mark: string;
  tier: 1 | 2;
  reads: string;
  writes: string | null; // null = read-only signal source
};

/* ------------------------------------------------------------------ */
/* Projects — all fictional                                            */
/* ------------------------------------------------------------------ */

export const toaProjects: ProjectSummary[] = [
  {
    id: 'p-16a',
    name: '16A Hubert Henderson Place',
    location: 'Remuera, Auckland',
    stage: 'consent',
    clientName: 'Private client · Remuera',
    demo: true,
  },
  {
    id: 'p-karaka',
    name: 'Karaka Bay House',
    location: 'Karaka Bay, Wellington',
    stage: 'construction',
    clientName: 'M. & J. Fletcher-Ngata',
    demo: true,
  },
  {
    id: 'p-waima',
    name: 'Waimā Studio',
    location: 'Titirangi, Auckland',
    stage: 'consent',
    clientName: 'S. Priestley',
    demo: true,
  },
  {
    id: 'p-nikau',
    name: 'Nikau Lane Townhouses',
    location: 'Sydenham, Christchurch',
    stage: 'developed design',
    clientName: 'Nikau Lane Ltd',
    demo: true,
  },
  {
    id: 'p-matai',
    name: 'Matai Street Hall',
    location: 'St Albans, Christchurch',
    stage: 'ccc',
    clientName: 'Matai Street Community Trust',
    demo: true,
  },
  {
    id: 'p-puriri',
    name: 'Puriri Workshop',
    location: 'Grey Lynn, Auckland',
    stage: 'concept',
    clientName: 'Puriri Joinery Co.',
    demo: true,
  },
];

/* ------------------------------------------------------------------ */
/* Consents                                                            */
/* ------------------------------------------------------------------ */

export const toaConsents: ConsentApplication[] = [
  {
    id: 'c-karaka',
    project: 'Karaka Bay House',
    council: 'Wellington City Council',
    portal: 'Wellington Objective',
    reference: 'SR 512240 (demo)',
    stage: 'Granted — construction underway',
    status: 'green',
    statusNote: 'Building consent granted. Next touch: PS3s ahead of CCC.',
    daysInStage: 41,
    demo: true,
  },
  {
    id: 'c-16a',
    project: '16A Hubert Henderson Place',
    council: 'Auckland Council',
    portal: 'Auckland BCM',
    reference: 'Pre-lodgement · draft RC 12 May 2025',
    stage: 'Pre-lodgement — pre-check complete',
    status: 'amber',
    statusNote:
      'ARC ran the pre-consent check against AUP H4 and the Building Code Acceptable Solutions — three gaps flagged before lodgement, each cited to its clause. Geotech PS1 for the sloped site (380 mm level difference) is the blocker; the stormwater line (225 mm dia.) needs an engineer’s note. Gap-closing notes are in your queue.',
    daysInStage: 4,
    demo: true,
  },
  {
    id: 'c-waima',
    project: 'Waimā Studio',
    council: 'Auckland Council',
    portal: 'Auckland BCM',
    reference: 'BCO10501773 (demo)',
    stage: 'RFI overdue — bracing calcs missing',
    status: 'red',
    statusNote:
      'Application stuck 18 days: council wants the bracing calculations (B1/AS1). ARC has drafted the clarification request to Torrent Structural and flagged the processing clock.',
    daysInStage: 18,
    demo: true,
  },
  {
    id: 'c-nikau',
    project: 'Nikau Lane Townhouses',
    council: 'Christchurch City Council',
    portal: 'Christchurch portal',
    reference: 'Pre-app (demo)',
    stage: 'Pre-application booked',
    status: 'green',
    statusNote:
      'Pre-app meeting 16 July. ARC assembled the drawing set list the council asks for at pre-app.',
    daysInStage: 3,
    demo: true,
  },
];

/* ------------------------------------------------------------------ */
/* Weekly client updates                                               */
/* ------------------------------------------------------------------ */

export const toaClientUpdates: ClientUpdateDraft[] = [
  {
    id: 'u-16a',
    project: '16A Hubert Henderson Place',
    weekEnding: '2026-07-03',
    // Massing aerial + four interior-study frames (public/brand/toa-architects/16a/).
    photosThisWeek: 5,
    decisionsMade: [
      '16C + 16D held at 65 m² two-bed — no change to unit mix',
      'Cladding confirmed: bevel-back weatherboard per Work Section 2640 spec',
    ],
    nextWeek:
      'Close the three pre-check gaps; brief geotech on the 380 mm level difference.',
    rfiAnswered: 'Pre-consent check complete — gap notes drafted, each cites its clause',
    contractorStatus: 'No contractor engaged yet — consent stage.',
    demo: true,
  },
  {
    id: 'u-karaka',
    project: 'Karaka Bay House',
    weekEnding: '2026-07-03',
    photosThisWeek: 9,
    decisionsMade: ['Retaining wall drainage detail signed off with Torrent Structural'],
    nextWeek: 'Slab pour Thursday, weather permitting.',
    contractorStatus: 'Two days behind after last week’s southerly. Recovery plan in place.',
    demo: true,
  },
  {
    id: 'u-matai',
    project: 'Matai Street Hall',
    weekEnding: '2026-07-03',
    photosThisWeek: 6,
    decisionsMade: ['Final paint colours confirmed with the trust board'],
    nextWeek: 'Defects walk Tuesday; PS3s being collected for CCC.',
    contractorStatus: 'Practical completion targeted 24 July.',
    demo: true,
  },
];

/* ------------------------------------------------------------------ */
/* Consultants                                                         */
/* ------------------------------------------------------------------ */

export const toaConsultants: Consultant[] = [
  {
    id: 'k-torrent',
    firm: 'Torrent Structural',
    discipline: 'structural',
    projects: ['16A Hubert Henderson Place', 'Karaka Bay House', 'Matai Street Hall'],
    outstanding: 'PS3 for Matai Street Hall retaining works; bracing calcs for Waimā Studio RFI',
    status: 'chasing',
    demo: true,
  },
  {
    id: 'k-kohia',
    firm: 'Kohia Geotech',
    discipline: 'geotech',
    projects: ['16A Hubert Henderson Place', 'Karaka Bay House'],
    outstanding:
      'PS1 + slope stability for 16A (380 mm level difference) — blocking lodgement',
    status: 'overdue',
    demo: true,
  },
  {
    id: 'k-beacon',
    firm: 'Beacon Fire Engineering',
    discipline: 'fire',
    projects: ['Matai Street Hall', 'Nikau Lane Townhouses'],
    outstanding: null,
    status: 'current',
    demo: true,
  },
  {
    id: 'k-southern',
    firm: 'Southern Acoustics',
    discipline: 'acoustic',
    projects: ['Nikau Lane Townhouses'],
    outstanding: 'Inter-tenancy wall report for developed design',
    status: 'chasing',
    demo: true,
  },
  {
    id: 'k-airflow',
    firm: 'Airflow Mechanical',
    discipline: 'mechanical',
    projects: ['Matai Street Hall'],
    outstanding: null,
    status: 'current',
    demo: true,
  },
];

/* ------------------------------------------------------------------ */
/* Fee proposal                                                        */
/* ------------------------------------------------------------------ */

export const toaFeeProposal: FeeProposal = {
  id: 'f-16cd',
  project: '16C + 16D, Hubert Henderson Place',
  clientName: 'Private client · Remuera',
  basis:
    'NZIA/ACE agreement basis · scaled for a two-unit 65 m² infill from the draft RC scope (demo figures)',
  phases: [
    { phase: 'Concept design', hours: 32, fee: 6400 },
    { phase: 'Developed design', hours: 54, fee: 10800 },
    { phase: 'Detailed design + consent', hours: 96, fee: 19200 },
    { phase: 'Construction observation', hours: 60, fee: 12000 },
  ],
  total: 48400,
  status: 'draft',
  demo: true,
};

/* ------------------------------------------------------------------ */
/* Producer statements                                                 */
/* ------------------------------------------------------------------ */

export const toaProducerStatements: ProducerStatement[] = [
  {
    id: 'ps-16a-geo',
    project: '16A Hubert Henderson Place',
    kind: 'PS1',
    discipline: 'Geotech (slope stability, 380 mm level difference)',
    firm: 'Kohia Geotech',
    requiredFor: 'Building consent lodgement',
    status: 'chasing',
    demo: true,
  },
  {
    id: 'ps-matai-str',
    project: 'Matai Street Hall',
    kind: 'PS3',
    discipline: 'Structural (retaining works)',
    firm: 'Torrent Structural',
    requiredFor: 'Code Compliance Certificate',
    status: 'chasing',
    demo: true,
  },
  {
    id: 'ps-matai-fire',
    project: 'Matai Street Hall',
    kind: 'PS3',
    discipline: 'Passive fire installation',
    firm: 'Beacon Fire Engineering',
    requiredFor: 'Code Compliance Certificate',
    status: 'received',
    demo: true,
  },
  {
    id: 'ps-karaka-str',
    project: 'Karaka Bay House',
    kind: 'PS3',
    discipline: 'Structural',
    firm: 'Torrent Structural',
    requiredFor: 'Code Compliance Certificate',
    status: 'not yet due',
    demo: true,
  },
];

/* ------------------------------------------------------------------ */
/* Site visit report — voice memo → structured report                  */
/* ------------------------------------------------------------------ */

export const toaSiteVisit: SiteVisitReport = {
  id: 'sv-16a-0702',
  project: '16A Hubert Henderson Place',
  date: '2026-07-02',
  recordedBy: 'Site architect (voice memo, on the walk back to the car)',
  memoSeconds: 174,
  weather: 'Overcast, dry, light SW',
  progress: [
    'Pre-lodgement walkover — existing 16A + 16B units and shared drive access confirmed',
    '225 mm stormwater line marked on the ground against the GIS trace',
  ],
  defects: [
    {
      item: 'Level difference at proposed 16C platform reads true to the 380 mm on the drawings',
      action: 'Brief Kohia on slope stability scope for the PS1',
      owner: 'Kohia Geotech',
    },
    {
      item: 'Boundary planting encroaches the 16D building line by ~600 mm',
      action: 'Flag in the AEE; confirm with the client before lodgement',
      owner: 'TOA',
    },
  ],
  decisions: ['16C set-out confirmed against the sloped-site levels as drawn'],
  distribution: ['Kohia Geotech', 'Torrent Structural', 'Client file'],
  demo: true,
};

/* ------------------------------------------------------------------ */
/* Monday-morning approval queue                                       */
/* ------------------------------------------------------------------ */

export const toaMondayQueue: MondayQueueItem[] = [
  { id: 'q1', kind: 'client update', label: '16A Hubert Henderson Place — consent-stage update', minutesToReview: 5, demo: true },
  { id: 'q2', kind: 'client update', label: 'Karaka Bay House — week 8 update', minutesToReview: 5, demo: true },
  { id: 'q3', kind: 'client update', label: 'Matai Street Hall — week 22 update', minutesToReview: 4, demo: true },
  { id: 'q4', kind: 'RFI response', label: '16A — pre-check gap notes (cites AUP H4 + E1/AS1)', minutesToReview: 8, demo: true },
  { id: 'q5', kind: 'RFI response', label: 'Waimā Studio — bracing calcs clarification (B1/AS1)', minutesToReview: 6, demo: true },
  { id: 'q6', kind: 'fee proposal', label: '16C + 16D two-unit infill — letter + phase spreadsheet', minutesToReview: 10, demo: true },
  { id: 'q7', kind: 'consultant chase', label: 'Kohia Geotech — 16A PS1 + slope stability, third chase', minutesToReview: 2, demo: true },
  { id: 'q8', kind: 'consultant chase', label: 'Torrent Structural — PS3, Matai Street Hall', minutesToReview: 2, demo: true },
  { id: 'q9', kind: 'consultant chase', label: 'Southern Acoustics — inter-tenancy report', minutesToReview: 2, demo: true },
  { id: 'q10', kind: 'consultant chase', label: 'Airflow Mechanical — as-builts for O&M manual', minutesToReview: 2, demo: true },
];

/* ------------------------------------------------------------------ */
/* Integrations — the tools ARC runs on top of                         */
/* ------------------------------------------------------------------ */

export const toaOrbitTools: OrbitTool[] = [
  /* ---- tier 1 · reads + writes daily ---- */
  {
    id: 'model',
    name: 'Archicad / Revit',
    mark: 'AR',
    tier: 1,
    reads: 'the live model — levels, areas, door + window schedules',
    writes: 'the drawing issue register',
  },
  {
    id: 'bluebeam',
    name: 'Bluebeam Revu',
    mark: 'Bb',
    tier: 1,
    reads: 'markups on the current set',
    writes: 'collated markup summaries',
  },
  {
    id: 'money',
    name: 'Xero / MYOB',
    mark: 'X$',
    tier: 1,
    reads: 'invoices, WIP and time against each phase',
    writes: 'draft invoices when a fee stage completes',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    mark: 'Ou',
    tier: 1,
    reads: 'project inboxes and consultant threads',
    writes: 'drafts into your outbox — you press send',
  },
  {
    id: 'docs',
    name: 'Dropbox / Drive / SharePoint',
    mark: 'Dx',
    tier: 1,
    reads: 'the project archive where it already lives',
    writes: 'filed reports, updates and registers',
  },
  {
    id: 'msg',
    name: 'WhatsApp / SMS',
    mark: 'Wa',
    tier: 1,
    reads: 'site messages and photo threads',
    writes: 'draft replies and photo requests',
  },
  /* ---- tier 2 · signal sources, read-only ---- */
  {
    id: 'akl-bcm',
    name: 'Auckland Council BCM',
    mark: 'AC',
    tier: 2,
    reads: 'application status, RFIs, inspection bookings',
    writes: null,
  },
  {
    id: 'wgtn-objective',
    name: 'Wellington Objective',
    mark: 'WO',
    tier: 2,
    reads: 'application status and RFIs',
    writes: null,
  },
  {
    id: 'chch',
    name: 'Christchurch consenting',
    mark: 'CC',
    tier: 2,
    reads: 'application status and RFIs',
    writes: null,
  },
  {
    id: 'code',
    name: 'NZ Building Code',
    mark: 'BC',
    tier: 2,
    reads: 'clauses and acceptable solutions, cited by reference',
    writes: null,
  },
  {
    id: 'nzia',
    name: 'NZIA templates',
    mark: 'NZ',
    tier: 2,
    reads: 'agreement and fee templates',
    writes: null,
  },
  {
    id: 'lbp',
    name: 'LBP register',
    mark: 'LB',
    tier: 2,
    reads: 'licence class and status for anyone on the job',
    writes: null,
  },
  {
    id: 'linz',
    name: 'Companies Office / LINZ',
    mark: 'CL',
    tier: 2,
    reads: 'company records, titles and property data',
    writes: null,
  },
];

/* ------------------------------------------------------------------ */
/* 16A Hubert Henderson Place — the flagship (real project, real docs) */
/* ------------------------------------------------------------------ */

/**
 * Facts from the draft RC of 12 May 2025; imagery from assembl's April 2026
 * session (massing aerial + interior-study frames). The Te Aranga audit is
 * listed as held for review with mana whenua — that is its own cover language
 * and it never appears as a determination.
 */
export const toa16A = {
  name: '16A Hubert Henderson Place',
  suburb: 'Remuera, Auckland 1050',
  facts: [
    'AUP zone H4 · Mixed Housing Suburban',
    '16A + 16B retained · 16C + 16D proposed (two-bed, 65 m²)',
    'Sloped site — 380 mm level difference',
    '225 mm stormwater line crosses the site',
  ],
  thisWeek: [
    'Pre-consent check complete — three gaps flagged, each cited to its clause',
    'Geotech PS1 chase drafted (slope stability — the lodgement blocker)',
    'Consent-stage client update drafted with the unit renders + massing',
  ],
  images: {
    // Kate's proper exterior renders of the proposed unit — cedar shiplap,
    // deck, piles for the sloped site. THE hero imagery; never regenerate.
    renders: [
      '/brand/toa-architects/16a/render-1.jpg',
      '/brand/toa-architects/16a/render-2.jpg',
      '/brand/toa-architects/16a/render-3.jpg',
    ],
    massing: '/brand/toa-architects/16a/massing-aerial.png',
    interiors: [
      '/brand/toa-architects/16a/interior-render-1.jpg',
      '/brand/toa-architects/16a/interior-render-3.jpg',
      '/brand/toa-architects/16a/interior-render-5.jpg',
      '/brand/toa-architects/16a/interior-render-7.jpg',
    ],
  },
  register: [
    { name: 'Draft Resource Consent package', detail: '12 May 2025 · 10 pp A3 · basis for every fact here', status: 'current' },
    { name: 'Pre-Consent Compliance Check', detail: 'assembl · 30 Apr 2026 · AUP H4 + Building Code AS, clause-cited', status: 'draft for review' },
    { name: 'Te Aranga Design Audit', detail: 'assembl · 30 Apr 2026', status: 'held for review with mana whenua' },
    { name: 'Wall Cladding Spec — Work Section 2640', detail: 'weatherboard · NZS 3604', status: 'draft for review' },
    { name: 'Massing model', detail: 'SketchUp + Blender (16C unit .glb)', status: 'current' },
  ],
} as const;

/** Totals used on tiles — derived, never hardcoded in the UI. */
export const toaQueueTotals = {
  items: toaMondayQueue.length,
  reviewMinutes: toaMondayQueue.reduce((m, q) => m + q.minutesToReview, 0),
  writingHoursSaved: 4,
};
