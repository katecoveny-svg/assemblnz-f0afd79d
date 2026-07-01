/**
 * Happy Tails × Keeper — canonical demo data (source of truth for the pilot workspace).
 *
 * Franklin's record and the Mathis SMS thread are real artefacts Kate shared
 * (invoice INV-3031, Welcome Pack PDF, trial-day email, fuel-surcharge email,
 * Mathis SMS thread — KAITIAKI-VERTICAL-SPEC-2026-06-29-v2 §5).
 *
 * This module is the source the /customers/happy-tails/keeper routes render from,
 * so the demo works standalone even before the Supabase tenant migration is applied.
 * The migration (supabase/migrations/*_happy_tails_tenant.sql) seeds a mirror of this
 * data into RLS-locked tenant_* tables for the real multi-tenant path.
 *
 * Status: demo · pending Liana sign-off. No message here is ever auto-sent.
 * All owner/parent PII is tenant-scoped and must stay RLS-locked in Supabase.
 */

export type SizeTier = 'small' | 'medium' | 'large';
export type Channel = 'sms' | 'email' | 'xero';
export type CarerVoice = 'mathis' | 'liana';

export interface BrandConfig {
  name: string;
  legalName: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  gst: string;
  website: string;
  instagram: string;
  colors: {
    bg: string;
    ink: string;
    ink2: string;
    mute: string;
    line: string;
    card: string;
    canary: string;
    canarySoft: string;
    brown: string;
  };
  fonts: { serif: string; sans: string };
}

export interface Address {
  label: string;
  address: string;
  isDefault?: boolean;
  days?: string[]; // day-of-week overrides, e.g. ['Tue']
}

export interface Vaccination {
  name: string;
  status: 'current' | 'due-soon' | 'expired';
  expiry: string; // ISO
}

export interface SmsMessage {
  from: 'carer' | 'owner';
  carer?: string;
  text: string;
  at: string; // human label
}

export interface Dog {
  slug: string;
  name: string;
  breed: string;
  sizeTier: SizeTier;
  discountPct: number;
  ownerName: string;
  ownerEmailMasked: string;
  ownerPhoneMasked: string;
  weeklySchedule: string;
  scheduleDays: { day: string; state: 'in' | 'out' | 'off' }[];
  feeding: string;
  allergies: string | null;
  medicalNotes: string | null;
  behaviour: string;
  addresses: Address[];
  vaccinations: Vaccination[];
  councilRegExpiry: string;
  welcomedAt: string; // human label
  xeroContactId: string | null;
  latestInvoice: { number: string; total: string; period: string };
  record?: number;
}

export const HAPPY_TAILS_BRAND: BrandConfig = {
  name: 'Happy Tails',
  legalName: 'Happy Tails Daycare & Boarding',
  tagline: 'We care for every dog as if they were our own.',
  location: 'Riverhead, West Auckland',
  email: 'admin@happytailsdaycare.co.nz',
  phone: '021 183 7956',
  gst: '142-043-939',
  website: 'www.happytailsdaycare.co.nz',
  instagram: '@happytailsnz',
  colors: {
    bg: '#FAF7F2',
    ink: '#1a1712',
    ink2: '#3d3428',
    mute: '#7a746a',
    line: '#e6ded0',
    card: '#fffdf9',
    canary: '#FFD42A',
    canarySoft: '#fff4c9',
    brown: '#7a4e2c',
  },
  fonts: {
    serif: "'Cormorant Garamond', Georgia, serif",
    sans: "'Inter', system-ui, sans-serif",
  },
};

/** Pricing schema — GST inclusive (§5.1). */
export const PRICING = {
  daycareWithBus: 57.0,
  overnight: 95.0,
  smallPupDiscountPct: 10,
  overnightSmallPup: 85.5, // 95 * 0.9
  currency: 'NZ$',
  terms: '7 days',
};

/** Two-voice channel model (§5.4 — locked hard rule). */
export const VOICE_RULES: Record<CarerVoice, { channel: Channel; opener: string; signoff: string; notes: string }> = {
  mathis: {
    channel: 'sms',
    opener: 'Hi there',
    signoff: 'Thanks Mathis 😀',
    notes: 'Casual, brief, personal. Dog name, 30-min window, address as a soft question. Light emoji (single 😀). No brand chrome.',
  },
  liana: {
    channel: 'email',
    opener: 'Kia ora',
    signoff: 'Warmly, Liana × Happy Tails',
    notes: 'Warm, formal, considered. "Happy Tails family", "your pup", "we care for every dog as if they were our own". No emoji in body. Full sentences.',
  },
};

/** Franklin — Kate Hudson's dog. Locked as record #1 for the pilot (§5.1, §5.3). */
export const FRANKLIN: Dog = {
  slug: 'franklin',
  name: 'Franklin',
  breed: 'Long-haired dachshund (black)',
  sizeTier: 'small',
  discountPct: 10,
  ownerName: 'Kate Hudson',
  ownerEmailMasked: 'kate@••• · RLS-locked',
  ownerPhoneMasked: '021 ••• •••• · RLS-locked',
  weeklySchedule: 'Wednesday check-in / Thursday check-out',
  scheduleDays: [
    { day: 'Mon', state: 'off' },
    { day: 'Tue', state: 'off' },
    { day: 'Wed', state: 'in' },
    { day: 'Thu', state: 'out' },
    { day: 'Fri', state: 'off' },
  ],
  feeding: 'Owner provides food (fed at home)',
  allergies: null,
  medicalNotes: null,
  behaviour: 'Settles fast · happy in the small pack · kept in the top field (small dogs)',
  addresses: [
    { label: 'Default pickup', address: '802 / 70 Daldy St, Auckland CBD', isDefault: true },
    { label: 'Secondary — some days', address: 'Kohimarama', days: ['Tue'] },
  ],
  vaccinations: [
    { name: 'DHPP (distemper / hepatitis / parvo)', status: 'current', expiry: '2026-08-14' },
    { name: 'Kennel cough (bordetella)', status: 'due-soon', expiry: '2026-08-05' },
    { name: 'Leptospirosis', status: 'current', expiry: '2026-08-14' },
  ],
  councilRegExpiry: '2027-06-30',
  welcomedAt: 'Sun 25 Jan 2026',
  xeroContactId: 'ht-contact-kate-hudson',
  latestInvoice: { number: 'INV-3031', total: 'NZ$665.00', period: 'June 2026' },
  record: 1,
};

/** The rest of today's small roster — supporting cast for the dashboard / route / invoicing. */
export const ROSTER: Dog[] = [
  FRANKLIN,
  {
    slug: 'waffles', name: 'Waffles', breed: 'Cavoodle', sizeTier: 'small', discountPct: 10,
    ownerName: 'Sam', ownerEmailMasked: 'sam@••• · RLS-locked', ownerPhoneMasked: '021 ••• •••• · RLS-locked',
    weeklySchedule: 'Mon–Fri daycare', scheduleDays: [], feeding: 'Owner provides food', allergies: null,
    medicalNotes: null, behaviour: 'Bouncy · medium pack',
    addresses: [{ label: 'Default pickup', address: 'Ponsonby Rd', isDefault: true }],
    vaccinations: [], councilRegExpiry: '2027-06-30', welcomedAt: 'Mar 2026', xeroContactId: null,
    latestInvoice: { number: 'INV-3032', total: 'NZ$456.00', period: 'June 2026' },
  },
  {
    slug: 'otis', name: 'Otis', breed: 'Labrador', sizeTier: 'large', discountPct: 0,
    ownerName: 'Sarah', ownerEmailMasked: 'sarah@••• · RLS-locked', ownerPhoneMasked: '021 ••• •••• · RLS-locked',
    weeklySchedule: 'Tue + Thu', scheduleDays: [], feeding: 'Owner provides food', allergies: null,
    medicalNotes: 'Kennel cough booster due in 21 days', behaviour: 'Calm · small pack · overlaps well with Bailey',
    addresses: [{ label: 'Default pickup', address: 'Grey Lynn', isDefault: true }],
    vaccinations: [], councilRegExpiry: '2027-06-30', welcomedAt: 'Feb 2026', xeroContactId: null,
    latestInvoice: { number: 'INV-3033', total: 'NZ$399.00', period: 'June 2026' },
  },
  {
    slug: 'miso', name: 'Miso', breed: 'Shiba Inu', sizeTier: 'medium', discountPct: 0,
    ownerName: 'Priya', ownerEmailMasked: 'priya@••• · RLS-locked', ownerPhoneMasked: '021 ••• •••• · RLS-locked',
    weeklySchedule: 'Wed daycare', scheduleDays: [], feeding: 'Owner provides food', allergies: null,
    medicalNotes: null, behaviour: 'Independent · medium pack',
    addresses: [
      { label: 'Default pickup', address: 'Kohimarama (override today)', isDefault: true },
    ],
    vaccinations: [], councilRegExpiry: '2027-06-30', welcomedAt: 'Apr 2026', xeroContactId: null,
    latestInvoice: { number: 'INV-3034', total: 'NZ$171.00', period: 'June 2026' },
  },
];

/** Mathis SMS thread with Kate (real artefact — IMG_1527, §5.5). Reference voice for Keeper's SMS drafts. */
export const FRANKLIN_SMS_THREAD: SmsMessage[] = [
  { from: 'carer', carer: 'Mathis', text: 'Hi there, Pick for Franklin tomorrow will be between 7.30-8.00am. City address right? Thanks Mathis 😀', at: 'Tue 7:42pm' },
  { from: 'owner', text: 'Perfect, yes CBD tomorrow 🙏', at: 'Tue 7:48pm' },
  { from: 'carer', carer: 'Mathis', text: "Hi there, Franklin's in and settled — on the couch already 😀 All good on this end, catch you at pickup. Mathis", at: 'Wed 9:10am' },
  { from: 'carer', carer: 'Mathis', text: "Hi there, Franklin's home and washed, had a solid day with the small pack, ate his lunch, no issues. Same time next week — Wed in, Thu out? Thanks Mathis 😀", at: 'Thu 4:02pm' },
  { from: 'owner', text: "He's zonked, thank you both ❤️", at: 'Thu 4:15pm' },
];

/** Channel-aware draft samples — what Keeper drafts into each surface (§5.5). Never sent. */
export const DRAFTS = {
  sms: {
    voice: 'mathis' as CarerVoice,
    nextDayPickup:
      'Hi there, Pick for Franklin tomorrow will be between 7.50-8.15am. City address right? Thanks Mathis 😀',
    addressConfirm:
      'Hi there, all good — CBD pick for Franklin tomorrow at 7.30-8.00am. Same drop off in the arvo? Thanks Mathis 😀',
    arrival:
      "Hi there, Franklin's in and settled — on the couch already 😀 All good on this end, catch you at pickup. Mathis",
    pickupSummary:
      "Hi there, Franklin's home and washed, had a solid day with the small pack, ate his lunch, no issues. Same time next week — Wed in, Thu out? Thanks Mathis 😀",
  },
  email: {
    voice: 'liana' as CarerVoice,
    welcomePackSubject: 'Welcome to the Happy Tails family, Franklin',
    welcomePackBody: [
      'Kia ora Kate,',
      'We are so pleased to welcome Franklin into the Happy Tails family. We have loved reading through his enrolment form and are already looking forward to meeting him for his trial day.',
      'Attached is our full Welcome Pack, which covers everything you need to know before Franklin’s first day — how the bus pickup works, our pre-pickup checklist (fed / toileted / collar + tag), our small carefully-matched groups, and how our monthly Xero invoicing runs.',
      'A few things to know from the outset. We are not a casual drop-in daycare — every pup joins on a weekly recurring schedule so he becomes part of a settled small group. We provide daycare with door-to-door bus pickup, and overnight care exclusively for our regular pups.',
      'Our trial day is confirmed for Thursday. Mathis will SMS you the pickup window the day before, and we’ll take it from there. If you have any questions at all before Franklin’s first day, please just reply here — we care for every dog as if they were our own.',
    ],
    vaccinationReminderSubject: 'Franklin’s kennel cough booster — heads up',
    vaccinationReminderBody: [
      'Kia ora Kate,',
      'A quick note to let you know Franklin’s kennel cough booster is due in about 3 weeks. If you can pop him in with your vet before then that would be perfect — under our policy we can’t take him for overnights after the expiry date until it’s renewed, and we’d hate for that to catch you out on a booking day.',
      'Any questions or if you’d like a recommendation for a great vet near Kohi, just reply.',
    ],
    businessChangeSubject: 'A small update on our overnight rate',
    businessChangeBody: [
      'Kia ora Happy Tails family,',
      'We wanted to reach out about a small change coming into effect. We are increasing our Overnight Care rate by $5 per night (from $95 to $100), with the small-pup discount continuing to apply.',
      'We’ve held off on this change for as long as we possibly could — through the increases in feed, insurance and staffing costs over the last twelve months — but we’ve reached the point where a small adjustment is needed to keep the quality of care where we want it to be for your pups.',
      'This is a one-off adjustment. We are keeping it as minimal as possible, and it will not affect our Daycare with bus rate at all.',
      'We are so grateful to have your pup as part of the Happy Tails family, and we truly appreciate your understanding. If you have any concerns at all, please reply here and we’ll work through it with you personally.',
    ],
  },
};

/** This morning's optimised bus route (Riverhead origin). Wireframe 4. */
export const MORNING_ROUTE = {
  date: 'Wed 15 July 2026',
  origin: 'Riverhead depot',
  departs: '07:20',
  stops: [
    { seq: 1, dog: 'Franklin', suburb: 'Auckland CBD', address: '802/70 Daldy St', window: '07:50–08:15', override: false },
    { seq: 2, dog: 'Waffles', suburb: 'Ponsonby', address: 'Ponsonby Rd', window: '07:35–08:00', override: false },
    { seq: 3, dog: 'Otis', suburb: 'Grey Lynn', address: 'Grey Lynn', window: '07:40–08:05', override: false },
    { seq: 4, dog: 'Miso', suburb: 'Kohimarama', address: 'Kohi (override — today only)', window: '07:30–08:00', override: true },
  ],
  distanceKm: 28.4,
  loopMinutes: 52,
  checklist: ['fed', 'toileted', 'collar + tag'],
};

/**
 * Franklin's June invoice — modelled on the real INV-3031 (§5.1).
 * 4 daycare + 5 overnight (small pup) itemises to $655.50; the issued total
 * was NZ$665.00 (the spec notes sub-services were rounded), reconciled here.
 */
export const INVOICE_INV3031 = {
  number: 'INV-3031',
  to: 'Kate Hudson — Franklin (dachshund, small pup)',
  date: '2026-06-15',
  due: '2026-06-22',
  gst: '142-043-939',
  lines: [
    { service: 'Daycare with bus', note: 'GST incl.', qty: 4, rate: 57.0, amount: 228.0 },
    { service: 'Overnight Care', note: 'small-pup 10% discount', qty: 5, rate: 85.5, amount: 427.5 },
    { service: 'Rounding / part-month adjustment', note: 'per INV-3031 sub-service rounding', qty: null, rate: null, amount: 9.5 },
  ],
  total: 665.0,
  itemisedSubtotal: 655.5,
};

/** Mana Receipt stamp shape (§2.13 + Appendix B). Every draft carries one. */
export interface ManaReceipt {
  id: string;
  title: string;
  voice: CarerVoice | 'system';
  channel: Channel;
  signedBy: string;
  recipient: string;
  draftedBy: string;
  draftedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  sources: string[];
  hardRules: string[];
  hash: string;
}

export const MANA_RECEIPTS: ManaReceipt[] = [
  {
    id: 'mr-biz-change', title: 'Business-change comms — overnight rate update', voice: 'liana', channel: 'email',
    signedBy: 'Liana', recipient: 'Happy Tails family (18 owners)', draftedBy: 'Keeper', draftedAt: '15 Jul 08:41',
    approvedBy: 'Liana', approvedAt: '15 Jul 09:02', sentAt: '15 Jul 09:03',
    sources: ['pricing schema', 'owner list', "Liana's fuel-surcharge email (voice model)"],
    hardRules: ['Animal Welfare Act 1999', 'Privacy Act 2020 IPP 3A', 'tikanga gate ✓', 'no send without human approval ✓'],
    hash: '#a91f…7c02',
  },
  {
    id: 'mr-sms-franklin', title: 'Next-day pickup SMS — Franklin', voice: 'mathis', channel: 'sms',
    signedBy: 'Mathis', recipient: 'Kate Hudson (Franklin’s mum)', draftedBy: 'Keeper', draftedAt: '14 Jul 19:38',
    approvedBy: 'Mathis', approvedAt: '14 Jul 19:42', sentAt: '14 Jul 19:42',
    sources: ['route · Franklin CBD override', 'window 07:50–08:15'],
    hardRules: ['Privacy Act 2020 IPP 3A', 'voice model: Mathis / SMS', 'sent from Mathis’s own phone ✓'],
    hash: '#3d70…b1a4',
  },
  {
    id: 'mr-welcome-franklin', title: 'Welcome Pack — Franklin (5 pages)', voice: 'liana', channel: 'email',
    signedBy: 'Liana', recipient: 'Kate Hudson', draftedBy: 'Keeper', draftedAt: '24 Jan 16:20',
    approvedBy: 'Liana', approvedAt: '25 Jan 08:11', sentAt: '25 Jan 08:12',
    sources: ['enrolment form (Franklin)', 'Happy Tails Welcome Pack template'],
    hardRules: ['Animal Welfare Act 1999', 'Privacy Act 2020 IPP 3A', 'operator-review ✓'],
    hash: '#c204…9f31',
  },
  {
    id: 'mr-xero-franklin', title: 'Xero invoice draft — Franklin · INV-3141', voice: 'system', channel: 'xero',
    signedBy: 'Keeper (draft)', recipient: 'Kate Hudson · NZ$285.00 (part-month July)', draftedBy: 'Keeper', draftedAt: '15 Jul 09:12',
    approvedBy: null, approvedAt: null, sentAt: null,
    sources: ['July roster', 'booking-mod credit (24 Jun unused)', 'pricing schema'],
    hardRules: ['Privacy Act 2020 IPP 3A', 'drafted as Draft in Xero — human issues ✓'],
    hash: '#7e58…a0d9',
  },
];

export const DEMO_BANNER = 'demo · pending Liana sign-off';

export function dogBySlug(slug: string): Dog | undefined {
  return ROSTER.find((d) => d.slug === slug);
}
