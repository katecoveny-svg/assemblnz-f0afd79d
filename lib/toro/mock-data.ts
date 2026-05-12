/**
 * Tōro mock data — Hudson whānau scenario.
 *
 * Lives here so every Tōro UI surface (dashboard, family, consent, inbox
 * empty-state preview) reads the same Hudson household. Production reads
 * still come from Supabase; these mocks render only when the relevant
 * Supabase query returns empty OR when explicitly requested by a `?demo=1`
 * search param. Every consumer of these mocks is marked with a
 * `// MOCK: replace with real query when toro_xxx wires up` comment.
 *
 * NZ English throughout. Lowercase 'tōro' on display. School + age detail
 * mirrors Kate's locked household state.
 */

export interface MockRoutine {
  id: string;
  title: string;
  cadence: string;
}

export interface MockChild {
  id: string;
  name: string;
  age: number;
  year: number;
  school: string;
  schoolAccent: string;
  accentColor: string;
  todaysBus: string;
  todaysGear: string[];
  weekActivities: string[];
  consentStatus: 'all_granted' | 'needs_review';
  consents: Array<{ skill: string; entity: string; status: 'granted' | 'revoked' }>;
}

export interface MockManaReceipt {
  id: string;
  title: string;
  relativeTime: string;
  evidenceCount: number;
}

export interface MockDashboardData {
  pendingDrafts: number;
  driftWarn: string | null;
  routines: MockRoutine[];
  children: MockChild[];
  manaReceipts: MockManaReceipt[];
  health: {
    memoryBlocks: number;
    episodicLast7d: number;
    draftsSentLast7d: number;
    threeGatePassRate: string;
  };
}

export interface MockDraftEvidence {
  citation: string;
  tikangaAttested: boolean;
  threeGatesPass: 'pass' | 'warn' | 'fail';
}

export interface MockDraftCard {
  id: string;
  fromWho: string;
  fromContext: string;
  action: string;
  draftBody: string;
  receivedRelative: string;
  evidence: MockDraftEvidence;
  paymentAuthorisation?: {
    amountNzd: number;
    description: string;
    requiresApproval: true;
  };
  consentNeeded?: { skill: string; entity: string };
}

const HUDSON_CHILDREN: MockChild[] = [
  {
    id: 'mock-child-niko',
    name: 'Niko',
    age: 11,
    year: 6,
    school: 'St Cuthbert\'s',
    schoolAccent: '#2B6B57',
    accentColor: '#2B6B57',
    todaysBus: 'Route 32 · Remuera Rd · 8:14 am pickup, 3:21 pm drop',
    todaysGear: ['Maths book', 'PE kit', 'Reusable drink bottle', 'Permission slip (climbing)'],
    weekActivities: ['Mon · climbing club (after school)', 'Wed · choir rehearsal', 'Fri · cross-country trial'],
    consentStatus: 'all_granted',
    consents: [
      { skill: 'nz-bus-tracking', entity: 'route 32', status: 'granted' },
      { skill: 'school-portal', entity: 'St Cuthbert\'s parent portal', status: 'granted' },
      { skill: 'openweather', entity: 'Auckland CBD', status: 'granted' },
    ],
  },
  {
    id: 'mock-child-lily',
    name: 'Lily',
    age: 14,
    year: 10,
    school: 'ACG Parnell',
    schoolAccent: '#5B4FA0',
    accentColor: '#5B4FA0',
    todaysBus: 'Walk · 7 min · Wellesley to Parnell Rd',
    todaysGear: ['Laptop (charged)', 'Art folio', 'Tournament hoodie', 'Sports water bottle'],
    weekActivities: ['Tue · debating practice', 'Thu · netball training', 'Sat · regional tournament'],
    consentStatus: 'needs_review',
    consents: [
      { skill: 'school-portal', entity: 'ACG parent portal', status: 'granted' },
      { skill: 'openweather', entity: 'Auckland CBD', status: 'granted' },
      { skill: 'sports-fixtures', entity: 'NZ Secondary Schools Netball', status: 'revoked' },
    ],
  },
  {
    id: 'mock-child-theo',
    name: 'Theo',
    age: 7,
    year: 3,
    school: 'Auckland Primary',
    schoolAccent: '#AC5838',
    accentColor: '#AC5838',
    todaysBus: 'Walk + scooter · with Dad · 8:25 am',
    todaysGear: ['Lunchbox', 'Reading book', 'Library card', 'Spare jumper'],
    weekActivities: ['Mon · swimming lesson', 'Wed · library group', 'Fri · whānau hui (kapa haka)'],
    consentStatus: 'all_granted',
    consents: [
      { skill: 'school-portal', entity: 'Auckland Primary newsletter', status: 'granted' },
      { skill: 'openweather', entity: 'Auckland CBD', status: 'granted' },
      { skill: 'library-renewals', entity: 'Auckland Libraries · Theo card', status: 'granted' },
    ],
  },
];

const HUDSON_ROUTINES: MockRoutine[] = [
  { id: 'r1', title: 'School run · all three', cadence: 'Mon–Fri · 7:50–8:30' },
  { id: 'r2', title: 'Niko · climbing pickup', cadence: 'Mon · 4:45 pm' },
  { id: 'r3', title: 'Lily · netball training', cadence: 'Thu · 4:00 pm' },
  { id: 'r4', title: 'Theo · swimming', cadence: 'Mon · 3:30 pm' },
  { id: 'r5', title: 'Whānau hui · kapa haka', cadence: 'Fri evening' },
];

const HUDSON_MANA_RECEIPTS: MockManaReceipt[] = [
  { id: 'm1', title: 'Drafted reply to Niko\'s climbing permission slip', relativeTime: '12 min ago', evidenceCount: 3 },
  { id: 'm2', title: 'Forwarded ACG bulletin · tournament logistics', relativeTime: '1 hr ago', evidenceCount: 2 },
  { id: 'm3', title: 'Approved grocery top-up · Countdown $48.40', relativeTime: '3 hr ago', evidenceCount: 4 },
  { id: 'm4', title: 'Bus eta nudge · Niko route 32 delay', relativeTime: 'this morning', evidenceCount: 2 },
  { id: 'm5', title: 'Weather alert · Auckland heavy rain', relativeTime: 'yesterday', evidenceCount: 5 },
];

const HUDSON_DRAFTS: MockDraftCard[] = [
  {
    id: 'mock-draft-school-notice',
    fromWho: 'St Cuthbert\'s parent portal',
    fromContext: 'Niko · year 6 notice · climbing club',
    action: 'Summary draft for Kate',
    draftBody:
      'Kia ora Kate — St Cuthbert\'s has shared a notice about next Monday\'s climbing club. Bring shoes, signed permission slip, and a snack. Permission slip is due by Friday 3 pm. Confirm reply?',
    receivedRelative: '8 min ago',
    evidence: {
      citation: 'school-portal · digest 2026-05-11 #4',
      tikangaAttested: true,
      threeGatesPass: 'pass',
    },
  },
  {
    id: 'mock-draft-weather-alert',
    fromWho: 'MetService NZ',
    fromContext: 'Auckland CBD · heavy rain warning',
    action: 'Whānau routine adjustment draft',
    draftBody:
      'Heavy rain forecast 6–9 am tomorrow. Tōro suggests: drive Niko + Theo (skip walk + scooter), Lily takes a rain jacket. Confirm to send a 6:30 am nudge?',
    receivedRelative: '34 min ago',
    evidence: {
      citation: 'openweather · MetService 2026-05-11 06:14',
      tikangaAttested: true,
      threeGatesPass: 'pass',
    },
  },
  {
    id: 'mock-draft-bus-eta',
    fromWho: 'AT bus tracking',
    fromContext: 'Niko · route 32 · 8 min late',
    action: 'Time-sensitive nudge draft',
    draftBody:
      'Route 32 running 8 min late. Tōro can hold Niko at the gate and message you when the bus turns into Remuera Rd. Approve to arm?',
    receivedRelative: 'just now',
    evidence: {
      citation: 'nz-bus-tracking · AT GTFS 2026-05-11 08:02',
      tikangaAttested: true,
      threeGatesPass: 'pass',
    },
  },
  {
    id: 'mock-draft-traffic-alert',
    fromWho: 'NZTA traffic feed',
    fromContext: 'SH1 Newmarket · 14 min delay',
    action: 'Routing nudge draft',
    draftBody:
      'SH1 northbound delayed 14 min through Newmarket. If you\'re heading to Lily\'s netball pickup, the Parnell back route saves 9 min today.',
    receivedRelative: '1 hr ago',
    evidence: {
      citation: 'nzta-traffic · feed snapshot 16:42',
      tikangaAttested: true,
      threeGatesPass: 'warn',
    },
  },
  {
    id: 'mock-draft-grocery-payment',
    fromWho: 'Countdown online · pātaka top-up',
    fromContext: 'Weekly basket · 12 items · whānau staples',
    action: 'Payment authorisation required',
    draftBody:
      'Tōro has rebuilt your weekly basket from the locked staples list (12 items, no substitutions). Total: NZ$94.40 (includes $4 delivery). Authorise the charge to place the order?',
    receivedRelative: '2 hr ago',
    evidence: {
      citation: 'countdown · basket-rebuild #9117 · staples-canon v3',
      tikangaAttested: true,
      threeGatesPass: 'pass',
    },
    paymentAuthorisation: {
      amountNzd: 94.40,
      description: 'Countdown weekly basket · 12 items',
      requiresApproval: true,
    },
  },
  {
    id: 'mock-draft-school-portal-forward',
    fromWho: 'ACG Parnell parent portal',
    fromContext: 'Lily · year 10 notice · regional tournament logistics',
    action: 'Forwarding draft (consent needed)',
    draftBody:
      'ACG has posted detailed tournament-day logistics for Saturday (transport, kit, meal plan). Tōro can summarise + forward to Lily directly if you grant the sports-fixtures consent below.',
    receivedRelative: '3 hr ago',
    evidence: {
      citation: 'school-portal · digest 2026-05-11 #11',
      tikangaAttested: true,
      threeGatesPass: 'warn',
    },
    consentNeeded: { skill: 'sports-fixtures', entity: 'NZ Secondary Schools Netball' },
  },
];

export function getDashboardMockData(_slug: string): MockDashboardData {
  void _slug;
  return {
    pendingDrafts: HUDSON_DRAFTS.length,
    driftWarn: '2 drafts older than 24h',
    routines: HUDSON_ROUTINES,
    children: HUDSON_CHILDREN,
    manaReceipts: HUDSON_MANA_RECEIPTS,
    health: {
      memoryBlocks: 18,
      episodicLast7d: 142,
      draftsSentLast7d: 24,
      threeGatePassRate: '96%',
    },
  };
}

export function getFamilyMockData(_slug: string): MockChild[] {
  void _slug;
  return HUDSON_CHILDREN;
}

export function getMockDrafts(_slug: string): MockDraftCard[] {
  void _slug;
  return HUDSON_DRAFTS;
}

export function getConsentRowsMock(_slug: string): Array<{
  id: string;
  skill: string;
  entityType: string;
  entityId: string;
  status: 'granted' | 'revoked';
  grantedBy: string;
  grantedAt: string;
  expiresAt: string | null;
}> {
  void _slug;
  // MOCK: replace with real query against toro_consent_grants when the
  // consent UI moves from preview to live.
  return [
    {
      id: 'c1',
      skill: 'nz-bus-tracking',
      entityType: 'child',
      entityId: 'Niko (route 32)',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-04-22',
      expiresAt: null,
    },
    {
      id: 'c2',
      skill: 'openweather',
      entityType: 'location',
      entityId: 'Hudson home · Remuera',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-04-22',
      expiresAt: null,
    },
    {
      id: 'c3',
      skill: 'school-portal',
      entityType: 'child',
      entityId: 'Niko · St Cuthbert\'s',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-04-22',
      expiresAt: '2026-12-31',
    },
    {
      id: 'c4',
      skill: 'school-portal',
      entityType: 'child',
      entityId: 'Lily · ACG Parnell',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-04-22',
      expiresAt: '2026-12-31',
    },
    {
      id: 'c5',
      skill: 'school-portal',
      entityType: 'child',
      entityId: 'Theo · Auckland Primary',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-04-22',
      expiresAt: '2026-12-31',
    },
    {
      id: 'c6',
      skill: 'sports-fixtures',
      entityType: 'child',
      entityId: 'Lily · netball',
      status: 'revoked',
      grantedBy: 'Kate',
      grantedAt: '2026-03-14',
      expiresAt: null,
    },
    {
      id: 'c7',
      skill: 'library-renewals',
      entityType: 'child',
      entityId: 'Theo · Auckland Libraries card',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-04-22',
      expiresAt: null,
    },
    {
      id: 'c8',
      skill: 'countdown-grocery',
      entityType: 'household',
      entityId: 'Hudson whānau · pātaka top-up',
      status: 'granted',
      grantedBy: 'Kate',
      grantedAt: '2026-05-01',
      expiresAt: null,
    },
  ];
}
