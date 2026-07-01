// Auckland Zoo × Keeper — operational modules (demo data).
//
// CONCEPT · PENDING. Everything here is illustrative mock data for a hosted-pilot
// design mockup — not real Auckland Zoo operational, staffing, payroll or
// financial records. Staff are demo roster entries (first name + role), never
// real named employees, except the two public figures named in the cover letter
// (Director Kevin Buley, Vet Services Manager James Chatterton) who appear only
// in the leadership brief. No fabricated clinical or welfare data. Every output
// is an unsigned draft for a named human to review.

export type Tone = 'ok' | 'watch' | 'urgent';

// ── STAFF & ROSTERS ─────────────────────────────────────────────────────────
export type ShiftRate = 'ordinary' | 'sunday' | 'public-holiday';

export type Shift = {
  id: string;
  staff: string;
  role: string;
  area: string;
  start: string;
  end: string;
  rate: ShiftRate;
  onCall?: boolean;
  note?: string;
};

export const ROSTER_DATE = 'Monday 6 July 2026'; // demo — a Matariki-week public holiday scenario

export const SHIFTS: Shift[] = [
  { id: 's1', staff: 'Mere', role: 'Senior keeper', area: 'Te Wao Nui — kiwi kōhanga', start: '06:45', end: '15:15', rate: 'public-holiday', note: 'Kōhanga chick 06:45 feed — public holiday rate + alternative day accrues' },
  { id: 's2', staff: 'Tom', role: 'Keeper', area: 'Megafauna — rhino & giraffe', start: '07:00', end: '15:30', rate: 'public-holiday', note: 'Zambezi lameness watch — hold for NZCCM assessment' },
  { id: 's3', staff: 'Aroha', role: 'Keeper', area: 'Primates — orangutan', start: '07:00', end: '15:30', rate: 'public-holiday' },
  { id: 's4', staff: 'James Chatterton', role: 'Manager of Veterinary Services', area: 'NZCCM', start: '08:00', end: '16:30', rate: 'public-holiday', onCall: true, note: 'On call for Zambezi standing assessment' },
  { id: 's5', staff: 'Priya', role: 'Veterinary nurse', area: 'NZCCM', start: '08:00', end: '16:30', rate: 'public-holiday' },
  { id: 's6', staff: 'Daniel', role: 'Education lead', area: 'Visitor education', start: '08:30', end: '17:00', rate: 'public-holiday', note: 'School holiday programme running' },
  { id: 's7', staff: 'Sina', role: 'Keeper', area: 'Te Wao Nui — tuatara & reptiles', start: '07:15', end: '15:45', rate: 'public-holiday' },
  { id: 's8', staff: 'Cover needed', role: 'Cleaner', area: 'Front of house', start: '06:00', end: '14:00', rate: 'public-holiday', note: 'Cover request open — Ben called in sick 05:20' },
];

export const COVER_REQUESTS = [
  { id: 'c1', shift: 'Front-of-house cleaner · 06:00–14:00', reason: 'Sick call (Ben, 05:20)', status: 'open' as const, rate: 'Public holiday — 1.5× + alternative day' },
  { id: 'c2', shift: 'Weekend reptile keeper · Sat 11 Jul', reason: 'Annual leave (Sina)', status: 'filled' as const, rate: 'Ordinary + weekend loading (collective agreement)' },
];

export const HOLIDAYS_ACT_NOTE =
  'Public-holiday shifts on an otherwise-working day attract time-and-a-half for hours worked plus an alternative holiday (day in lieu) under the Holidays Act 2003. Sunday/weekend loadings follow the Auckland Council collective agreement. Keeper drafts the timesheet coding; council payroll approves and pays.';

// ── PAYROLL ─────────────────────────────────────────────────────────────────
export const PAYROLL = {
  provider: 'Auckland Council payroll (Auckland Unlimited CCO)',
  integration: 'Read-only ITSM stub — Keeper drafts timesheet coding and penalty-rate flags; it never writes to the council payroll system. All pay runs are approved and processed by council payroll.',
  period: 'Pay period 14 · 29 Jun – 12 Jul 2026',
  status: 'draft-for-approval' as const,
  lines: [
    { staff: 'Mere', ordinary: 68, sunday: 0, publicHoliday: 8.5, altDays: 1, flag: 'Public holiday worked — alt day accrued' },
    { staff: 'Tom', ordinary: 68, sunday: 8, publicHoliday: 8.5, altDays: 1, flag: 'Public holiday + Sunday loading' },
    { staff: 'Aroha', ordinary: 76, sunday: 0, publicHoliday: 8.5, altDays: 1, flag: 'Public holiday worked' },
    { staff: 'Priya', ordinary: 72, sunday: 0, publicHoliday: 8.5, altDays: 1, flag: 'Public holiday worked' },
    { staff: 'Sina', ordinary: 60, sunday: 8, publicHoliday: 8.5, altDays: 1, flag: 'Public holiday + Sunday loading' },
  ],
};

// ── BREEDING PROGRAMME CALENDAR ─────────────────────────────────────────────
export type BreedingEvent = {
  id: string;
  species: string;
  taonga: boolean;
  programme: string;
  milestone: string;
  window: string;
  status: Tone;
  note: string;
};

export const BREEDING_CALENDAR: BreedingEvent[] = [
  { id: 'b1', species: 'North Island brown kiwi', taonga: true, programme: 'Operation Nest Egg (BNZ Kiwi Recovery / DOC)', milestone: 'Kōhanga chick → grow to ~1200 g for island release', window: 'Jul–Sep 2026', status: 'ok', note: 'Chick husbandry on track. Naming + release-rohe held for iwi consultation.' },
  { id: 'b2', species: 'Tuatara', taonga: true, programme: 'ZAA regional programme', milestone: 'Egg incubation temperature-sex check', window: 'Ongoing', status: 'ok', note: 'Incubation parameters within standard. Taonga species — cultural content kaumātua-gated.' },
  { id: 'b3', species: 'Sumatran orangutan', taonga: false, programme: 'ZAA / regional studbook (SSP-aligned)', milestone: 'Quarterly enrichment + reproductive-behaviour review', window: 'Due this month', status: 'watch', note: 'Enrichment review falls due — Keeper drafted the checklist for the primate team.' },
  { id: 'b4', species: 'Southern white rhinoceros', taonga: false, programme: 'ZAA regional collection plan', milestone: 'Breeding recommendation pending herd health', window: 'On hold', status: 'watch', note: 'Deferred pending Zambezi lameness resolution.' },
];

// ── ANIMAL TRANSFER RECORDS ─────────────────────────────────────────────────
export type Transfer = {
  id: string;
  direction: 'incoming' | 'outgoing';
  animal: string;
  from: string;
  to: string;
  compliance: string;
  status: Tone;
  note: string;
};

export const TRANSFERS: Transfer[] = [
  { id: 't1', direction: 'outgoing', animal: 'Kōhanga kiwi (once ~1200 g)', from: 'NZCCM kōhanga', to: 'Predator-free island crèche → forest of origin', compliance: 'DOC Wildlife Act permit · rohe-appropriate iwi consultation', status: 'ok', note: 'Release rohe held for iwi. Chain-of-custody + DOC permit draft prepared by Keeper.' },
  { id: 't2', direction: 'incoming', animal: 'Red panda (regional recommendation)', from: 'Australian ZAA institution', to: 'Auckland Zoo', compliance: 'CITES import permit · MPI IHS (Import Health Standard) biosecurity · quarantine', status: 'watch', note: 'CITES + MPI pre-flight checklist drafted; quarantine slot to confirm.' },
  { id: 't3', direction: 'outgoing', animal: 'Wild-native casualty (kererū, recovered)', from: 'NZCCM', to: 'Release site / Wildbase referral', compliance: 'DOC HOTline notification · chain-of-custody', status: 'ok', note: 'Rescue-coordination bridge output — unsigned draft for DOC-permitted handler.' },
];

// ── EVENTS & EDUCATION PROGRAMME CALENDAR ───────────────────────────────────
export type ZooEvent = {
  id: string;
  title: string;
  type: 'school' | 'night-tour' | 'keeper-for-a-day' | 'corporate';
  when: string;
  headcount: string;
  status: Tone;
  note: string;
};

export const EVENTS: ZooEvent[] = [
  { id: 'e1', title: 'School holiday programme — “Meet the kōhanga”', type: 'school', when: 'Daily · 10:30 & 13:30', headcount: '2 groups × 25 tamariki', status: 'ok', note: 'Content card drafted by Keeper, held whakapapa content excluded — education lead approves.' },
  { id: 'e2', title: 'Night tour — Te Wao Nui after dark', type: 'night-tour', when: 'Fri 10 Jul · 19:00', headcount: '18 booked / 20 cap', status: 'watch', note: 'Two spots left — Keeper drafted a waitlist + confirmation comms.' },
  { id: 'e3', title: 'Keeper-for-a-day — megafauna', type: 'keeper-for-a-day', when: 'Sat 11 Jul · 08:00', headcount: '4 participants', status: 'ok', note: 'Rhino paddock excluded while Zambezi under watch — itinerary redrafted.' },
  { id: 'e4', title: 'Corporate hire — evening function', type: 'corporate', when: 'Thu 16 Jul · 18:00', headcount: '120 pax', status: 'ok', note: 'Quote + H&S briefing draft prepared for events team.' },
];

// ── VOLUNTEER MANAGEMENT ────────────────────────────────────────────────────
export type Volunteer = {
  id: string;
  name: string;
  role: string;
  trained: boolean;
  vetting: 'current' | 'expiring' | 'required';
  availability: string;
};

export const VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Ngaire (docent, demo)', role: 'Docent — Te Wao Nui', trained: true, vetting: 'current', availability: 'Tue, Thu, Sun' },
  { id: 'v2', name: 'Rangi (education vol, demo)', role: 'Education volunteer', trained: true, vetting: 'expiring', availability: 'School holidays' },
  { id: 'v3', name: 'Holly (backup keeper, demo)', role: 'Backup keeper — reptiles', trained: false, vetting: 'required', availability: 'Weekends' },
];

export const VOLUNTEER_NOTE =
  'Docents, education volunteers and backup keepers. Police vetting (safety check) tracked per volunteer; Keeper flags expiring checks and drafts renewal reminders. Training records illustrative only.';

// ── ENCLOSURE H&S TRACKER ───────────────────────────────────────────────────
export type EnclosureCheck = {
  id: string;
  enclosure: string;
  barrier: Tone;
  waterQuality: Tone;
  feedTemp: Tone;
  checkedBy: string;
  time: string;
  note?: string;
};

export const ENCLOSURE_CHECKS: EnclosureCheck[] = [
  { id: 'h1', enclosure: 'Rhino paddock', barrier: 'watch', waterQuality: 'ok', feedTemp: 'ok', checkedBy: 'Tom', time: '07:05', note: 'Transfer-gate hinge flagged for maintenance — logged, not a barrier breach.' },
  { id: 'h2', enclosure: 'Orangutan habitat', barrier: 'ok', waterQuality: 'ok', feedTemp: 'ok', checkedBy: 'Aroha', time: '07:10' },
  { id: 'h3', enclosure: 'Kiwi kōhanga', barrier: 'ok', waterQuality: 'ok', feedTemp: 'ok', checkedBy: 'Mere', time: '06:50', note: 'Brooder temp within range.' },
  { id: 'h4', enclosure: 'Reptile precinct feed store', barrier: 'ok', waterQuality: 'ok', feedTemp: 'watch', checkedBy: 'Sina', time: '07:20', note: 'Feed-store fridge 6°C (target ≤4°C) — Keeper drafted maintenance ticket.' },
];

export const NOTIFIABLE_EVENT_NOTE =
  'Daily safety checks per enclosure — barrier integrity, water quality, feed-store temperatures. Where a check surfaces a notifiable event (serious harm risk, or an animal-welfare or biosecurity trigger), Keeper drafts the notification to WorkSafe (Health and Safety at Work Act 2015) or MPI for a named manager to review and lodge. assembl never lodges a notification itself.';

// ── VISITOR COMMS ───────────────────────────────────────────────────────────
export type VisitorComm = {
  id: string;
  kind: 'booking' | 'quote' | 'review';
  subject: string;
  channel: string;
  status: 'draft-for-review';
  preview: string;
};

export const VISITOR_COMMS: VisitorComm[] = [
  { id: 'vc1', kind: 'booking', subject: 'Night tour confirmation — Fri 10 Jul', channel: 'Email', status: 'draft-for-review', preview: 'Kia ora — your Te Wao Nui after-dark tour is confirmed for Friday 10 July, 7pm. Meet at the main gate 15 minutes early…' },
  { id: 'vc2', kind: 'quote', subject: 'Group tour quote — 45 pax community group', channel: 'Email', status: 'draft-for-review', preview: 'Thanks for your enquiry. For a guided group of 45 we can offer a 90-minute keeper-led tour with Te Wao Nui access…' },
  { id: 'vc3', kind: 'review', subject: 'Response to a 3-star Google review', channel: 'Google', status: 'draft-for-review', preview: 'Thank you for the feedback — we’re sorry the café queue was long on a busy holiday weekend. We’re trialling…' },
];

export const VISITOR_COMMS_NOTE =
  'Booking confirmations, group-tour quotes, and review responses (TripAdvisor + Google) drafted in Auckland Zoo’s public voice. Every message is an unsigned draft for the visitor-services or comms team to review and send.';

// ── STAFF RECOGNITION / LOYALTY ─────────────────────────────────────────────
export const RECOGNITION = {
  keeperOfMonth: { name: 'Mere', reason: 'Kōhanga chick early-life care through a difficult hatch week', month: 'June 2026' },
  milestones: [
    { name: 'Tom', milestone: '5 years', when: 'This month' },
    { name: 'Daniel', milestone: '10 years', when: 'Next month' },
  ],
  cpd: [
    { name: 'Aroha', item: 'Great-ape husbandry workshop (ZAA)', status: 'ok' as Tone },
    { name: 'Sina', item: 'Reptile welfare CPD — due', status: 'watch' as Tone },
    { name: 'Priya', item: 'Zoo-anaesthesia refresher (NZCCM)', status: 'ok' as Tone },
  ],
  note: 'Keeper-of-the-month, education-programme excellence, tenure milestones and a CPD tracker. Recognition is drafted for the people-and-culture lead to confirm — illustrative demo data.',
};

// ── FINANCE DASHBOARD ───────────────────────────────────────────────────────
export const FINANCE = {
  councilReporting: 'Monthly rollup to Auckland Unlimited (Auckland Council CCO) — illustrative figures only.',
  donations: [
    { source: 'Zoo Society membership', ytd: '—', trend: 'ok' as Tone, note: 'Membership renewals tracked; Keeper drafts renewal comms.' },
    { source: 'Adopt an Animal', ytd: '—', trend: 'ok' as Tone, note: 'Adoption certificates + thank-you drafts generated on demand.' },
  ],
  grants: [
    { funder: 'DOC Community Fund', purpose: 'Native-species recovery support', status: 'watch' as Tone, note: 'Application draft in progress — Keeper assembling evidence pack.' },
    { funder: 'Private philanthropic trust', purpose: 'NZCCM equipment', status: 'ok' as Tone, note: 'Acquittal report drafted for finance to review.' },
  ],
  note: 'Council reporting rollup, donation tracking (Zoo Society + Adopt an Animal) and grant applications (DOC + private philanthropists). Figures are illustrative placeholders — Keeper drafts reports and applications for finance to review; it never moves money.',
};

// ── LEADERSHIP DAILY BRIEF (Kevin Buley + James Chatterton) ──────────────────
export const DAILY_BRIEF = {
  date: 'Monday 6 July 2026 · 07:00',
  for: 'Kevin Buley (Director) + James Chatterton (Manager, Veterinary Services)',
  onToday: '7 keepers, 1 vet (Chatterton, on call), 1 vet nurse, 1 education lead, 2 volunteers. One open cover request (front-of-house cleaner).',
  welfareFlags: [
    { label: 'Zambezi (rhino) — acute front-left lameness, NZCCM assessment pending', tone: 'urgent' as Tone },
    { label: 'Reptile feed-store fridge at 6°C (target ≤4°C) — maintenance ticket drafted', tone: 'watch' as Tone },
    { label: 'Rhino transfer-gate hinge flagged for maintenance', tone: 'watch' as Tone },
  ],
  incidents: [
    { label: 'No notifiable events overnight', tone: 'ok' as Tone },
    { label: 'Sick call (front-of-house) — cover request open', tone: 'watch' as Tone },
  ],
  happening: [
    'School holiday programme running (2 groups × 25)',
    'Kōhanga chick 06:45 feed complete — husbandry on track',
    'Public holiday pay coding drafted for council payroll',
  ],
  vips: [
    'DOC species-recovery liaison visiting NZCCM 11:00',
    'Zoo Society board member on site pm (Adopt an Animal review)',
  ],
  note: 'Auto-drafted by Keeper at 07:00 for the leadership team to read and action. Every underlying item links to an unsigned draft. Concept · pending demo.',
};
