/**
 * Happy Tails Daycare OS — command-centre demo data.
 * Daycare / boarding / bus ops (NOT training). SAMPLE figures only.
 */

export type DaycarePath =
  | 'trial'
  | 'daycare-bus'
  | 'overnight'
  | 'boarding'
  | 'unsure';

export type DaycareLead = {
  id: string;
  owner: string;
  dog: string;
  breed: string;
  sizeTier: 'small' | 'medium' | 'large';
  suburb: string;
  needs: string[];
  triage: string;
  recommended: DaycarePath;
  urgency: 'routine' | 'soon' | 'urgent';
  riskLevel: 'low' | 'medium' | 'high';
  source: string;
  receivedAt: string;
  draftReply?: string;
  packMatch?: string;
};

export type DaycareChallenge = {
  id: string;
  title: string;
  blurb: string;
  mapsTo: DaycarePath;
};

export type DaycareAgent = {
  id: string;
  name: string;
  job: string;
  status: 'live' | 'drafting' | 'watching';
};

export type WeekOp = {
  id: string;
  when: string;
  kind: 'bus' | 'admin' | 'comms' | 'compliance' | 'finance' | 'hiring';
  title: string;
  mins: number;
};

export const DAYCARE_PATHS: Record<
  DaycarePath,
  { label: string; short: string; priceSample: string }
> = {
  trial: { label: 'Trial Day', short: 'Trial', priceSample: 'from NZ$57 · SAMPLE' },
  'daycare-bus': {
    label: 'Daycare with Bus',
    short: 'Daycare',
    priceSample: 'NZ$57 / day · GST incl.',
  },
  overnight: {
    label: 'Overnight Care (regulars)',
    short: 'Overnight',
    priceSample: 'NZ$95 / night · small-pup −10%',
  },
  boarding: {
    label: 'Holiday Boarding',
    short: 'Boarding',
    priceSample: 'stay · SAMPLE',
  },
  unsure: {
    label: 'Not sure yet',
    short: 'Chat',
    priceSample: 'free consult · SAMPLE',
  },
};

export const DAYCARE_CHALLENGES: DaycareChallenge[] = [
  {
    id: 'work',
    title: 'I need daycare while I’m at work',
    blurb: 'Weekly recurring days + door-to-door bus.',
    mapsTo: 'daycare-bus',
  },
  {
    id: 'overnight',
    title: 'My regular needs overnight care',
    blurb: 'For settled daycare pups only — not casual drop-in.',
    mapsTo: 'overnight',
  },
  {
    id: 'holiday',
    title: 'We’re going away',
    blurb: 'Holiday boarding with structure and daily updates.',
    mapsTo: 'boarding',
  },
  {
    id: 'new',
    title: 'We’re new — start with a trial',
    blurb: 'Meet the pack, check vaccinations, settle into a schedule.',
    mapsTo: 'trial',
  },
  {
    id: 'unsure',
    title: 'I’m not sure yet',
    blurb: 'Keeper drafts the right path from your enrolment answers.',
    mapsTo: 'unsure',
  },
];

export const DAYCARE_AGENTS: DaycareAgent[] = [
  { id: 'intake', name: 'Enrolment Agent', job: 'Reads forms → dog/owner profiles', status: 'live' },
  { id: 'pathway', name: 'Pathway Agent', job: 'Trial / daycare / overnight / boarding', status: 'live' },
  { id: 'risk', name: 'Welfare Risk Agent', job: 'Vaccinations, behaviour, pack fit flags', status: 'watching' },
  { id: 'welcome', name: 'Welcome Pack Agent', job: '5-page pack in Liana’s voice', status: 'live' },
  { id: 'bus', name: 'Bus Route Agent', job: 'Pickup windows + Mathis SMS drafts', status: 'live' },
  { id: 'invoice', name: 'Invoice Agent', job: 'INV-3031 shape · Xero drafts', status: 'live' },
  { id: 'support', name: 'Owner Support Agent', job: 'Repeat FAQs with escalation', status: 'drafting' },
  { id: 'time', name: 'Ops Time Agent', job: 'Bus load, admin debt, capacity', status: 'live' },
  { id: 'hiring', name: 'Carer Hiring Agent', job: 'Screen carers + onboarding checklist', status: 'watching' },
];

export const DAYCARE_LEADS: DaycareLead[] = [
  {
    id: 'ht-killer',
    owner: 'Sam Harper',
    dog: 'Biscuit',
    breed: 'Cavoodle',
    sizeTier: 'small',
    suburb: 'Ponsonby',
    needs: ['Mon/Wed/Fri daycare', 'bus pickup', 'first trial'],
    triage:
      'New enrolment. Vaccinations look current. Small-pup pack fit. Recommend trial day then recurring daycare-with-bus.',
    recommended: 'trial',
    urgency: 'soon',
    riskLevel: 'low',
    source: 'Landing quiz',
    receivedAt: 'Just now',
    draftReply:
      'Kia ora Sam — we’d love to meet Biscuit. From your answers, a trial day then Mon/Wed/Fri daycare with bus is the cleanest start. I’ve drafted the Welcome Pack and a Mathis pickup SMS for the trial window. Draft only — Liana / Mathis approve before send.',
    packMatch: 'Welcome Pack · 5 pages',
  },
  {
    id: 'ht-2',
    owner: 'Jordan',
    dog: 'Maple',
    breed: 'Lab cross',
    sizeTier: 'medium',
    suburb: 'Grey Lynn',
    needs: ['holiday boarding', 'daily updates'],
    triage: 'Regular daycare pup requesting holiday boarding — capacity check on overnight beds.',
    recommended: 'boarding',
    urgency: 'routine',
    riskLevel: 'low',
    source: 'Repeat client',
    receivedAt: 'Yesterday',
  },
  {
    id: 'ht-3',
    owner: 'New enquiry',
    dog: 'Rex',
    breed: 'Staffy',
    sizeTier: 'large',
    suburb: 'West',
    needs: ['reactive with dogs', 'wants daycare'],
    triage:
      'Behaviour flag — not a fit for small settled groups without assessment. Escalate to Liana; do not auto-book trial.',
    recommended: 'unsure',
    urgency: 'urgent',
    riskLevel: 'high',
    source: 'Website form',
    receivedAt: 'Sun',
  },
];

export const DAYCARE_WEEK: WeekOp[] = [
  { id: 'd1', when: '07:40', kind: 'bus', title: 'Morning bus · CBD → Riverhead', mins: 55 },
  { id: 'd2', when: '08:45', kind: 'comms', title: 'Mathis pickup SMS drafts (3)', mins: 12 },
  { id: 'd3', when: '10:00', kind: 'compliance', title: 'Kennel cough due-soon check', mins: 20 },
  { id: 'd4', when: '11:30', kind: 'admin', title: 'Welcome Pack · Biscuit', mins: 25 },
  { id: 'd5', when: '14:00', kind: 'finance', title: 'INV-3031 shape · June drafts', mins: 30 },
  { id: 'd6', when: '16:30', kind: 'bus', title: 'Afternoon drop-offs', mins: 50 },
];

export const DAYCARE_TIME = {
  capacityPct: 88,
  dogsOnRoster: 8,
  busRunsToday: 2,
  adminDebtMins: 70,
  unpaidCommsMins: 25,
  followUpsDue: 4,
  nextBestActions: [
    'Approve Biscuit enrolment → Welcome Pack + trial SMS',
    'Flag Rex behaviour enquiry for Liana (do not auto-book)',
    'Franklin kennel cough due-soon — remind Kate',
  ],
  timeLeakage: [
    { label: 'Repeating “how does the bus work?”', mins: 45, action: 'FAQ clip + Welcome Pack page' },
    { label: 'Manual invoice maths', mins: 35, action: 'Invoice Agent · INV-3031' },
    { label: 'Unpaid owner WhatsApps', mins: 25, action: 'Support Agent with two-voice rules' },
  ],
};

export const DAYCARE_JOURNEY = [
  { week: 1, title: 'Enrolment & trial', ownerTask: 'Return form + vaccination proof' },
  { week: 2, title: 'Settle into schedule', ownerTask: 'Confirm recurring days' },
  { week: 3, title: 'Bus rhythm locked', ownerTask: 'Keep default pickup address current' },
  { week: 4, title: 'Pack fit review', ownerTask: 'Note any behaviour changes' },
];

export const DAYCARE_FAQ = [
  { id: 'f1', q: 'How does the daycare bus work?', dur: '0:52' },
  { id: 'f2', q: 'What vaccinations do you need?', dur: '0:44' },
  { id: 'f3', q: 'Can we do overnight care?', dur: '0:38' },
  { id: 'f4', q: 'What if my dog is reactive?', dur: '0:55' },
];

export const DAYCARE_CARERS = [
  {
    id: 'c1',
    name: 'Sienna P.',
    score: 88,
    experience: '2 yrs daycare + bus',
    fit: 'Calm with small packs; needs Mathis SMS voice training',
    stage: 'interview' as const,
  },
  {
    id: 'c2',
    name: 'Nate L.',
    score: 71,
    experience: '1 yr boarding',
    fit: 'Strong animal handling; light on Food Act / fridge logs',
    stage: 'screen' as const,
  },
];
