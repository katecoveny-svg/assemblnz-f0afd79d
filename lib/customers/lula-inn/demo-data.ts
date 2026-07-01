/**
 * Lula Inn × assembl — DEMO DATA for the concept ops platform.
 * ------------------------------------------------------------
 * EVERY value in this file is demonstration data invented for the pitch. There
 * are no real staff, no real rosters, no real revenue, no real menu costings and
 * no real compliance records here. Names are fictional (first name + initial).
 * Nothing is pulled from a live Star Group / Lula Inn system.
 *
 * The ONLY real references in this file are statutory citations (Food Act 2014,
 * Sale and Supply of Alcohol Act 2012, Holidays Act 2003, Employment Relations
 * Act 2000) — these are accurate, not invented, and are cited so a demo viewer
 * can see the compliance framing is grounded.
 *
 * Once a pilot is signed, these arrays are replaced by reads against the
 * tenant_hospo_* tables (see supabase/migrations/*_lula_inn_hospo_pilot.sql).
 */

// ── Statutory references (REAL citations — used across compliance surfaces) ──

export const NZ_CITATIONS = {
  foodAct: {
    label: 'Food Act 2014',
    note: 'Food Control Plan record-keeping — temperature logs, cleaning, allergen management.',
  },
  foodChillTemp: {
    label: 'Food Act 2014 · Food Standards Code 3.2.2',
    note: 'Potentially hazardous food kept at 4°C or below (chilled) or 60°C or above (hot).',
  },
  foodFreezeTemp: {
    label: 'Food Act 2014',
    note: 'Frozen food kept hard-frozen, target −18°C or below.',
  },
  dishwashRinse: {
    label: 'Food Act 2014 · sanitising',
    note: 'Mechanical dishwasher final sanitising rinse to reach 82°C.',
  },
  allergens: {
    label: 'Food Act 2014 · Food Standards Code 1.2.3',
    note: 'Declaration of the mandatory allergen groups on food offered for sale.',
  },
  mpiNotifiable: {
    label: 'Food Act 2014 · MPI notification',
    note: 'Suspected foodborne illness / notifiable event reported to MPI and the verifier.',
  },
  alcoholAct: {
    label: 'Sale and Supply of Alcohol Act 2012',
    note: 'A certificated duty manager must be on duty whenever alcohol is sold or supplied (s.214).',
  },
  alcoholHost: {
    label: 'Sale and Supply of Alcohol Act 2012 · host responsibility',
    note: 'Intoxication, ID/age verification and incident records support the licence.',
  },
  holidaysAct: {
    label: 'Holidays Act 2003',
    note: '4 weeks annual leave, 10 days sick leave, bereavement leave, public-holiday entitlements.',
  },
  publicHoliday: {
    label: 'Holidays Act 2003 · public holidays',
    note: 'Work on a public holiday paid at time-and-a-half plus an alternative holiday if it is an otherwise working day.',
  },
  employmentRelations: {
    label: 'Employment Relations Act 2000',
    note: 'Written employment agreements, records, and good-faith obligations.',
  },
} as const;

export type Citation = { label: string; note: string };

// ── 1. Staffing, rosters, timesheets, pay, leave ───────────────────────────

export type StaffRole =
  | 'Management'
  | 'Chef'
  | 'Kitchen'
  | 'FOH'
  | 'Bar'
  | 'Cleaning';

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  title: string;
  venue: string; // venue slug
  employment: 'Full-time' | 'Part-time' | 'Casual';
  baseRate: number; // $/hr — demo
  managerCert?: { held: boolean; expires: string }; // LCQ / Manager's Certificate
  tenureMonths: number;
};

export const STAFF: StaffMember[] = [
  { id: 's1', name: 'Marama T.', role: 'Management', title: 'Venue GM', venue: 'lula-inn', employment: 'Full-time', baseRate: 42.0, managerCert: { held: true, expires: '2027-03-14' }, tenureMonths: 38 },
  { id: 's2', name: 'Hemi R.', role: 'Management', title: 'Duty Manager', venue: 'lula-inn', employment: 'Full-time', baseRate: 34.5, managerCert: { held: true, expires: '2026-08-02' }, tenureMonths: 21 },
  { id: 's3', name: 'Sina F.', role: 'Chef', title: 'Head Chef', venue: 'lula-inn', employment: 'Full-time', baseRate: 40.0, tenureMonths: 29 },
  { id: 's4', name: 'Tomasi L.', role: 'Chef', title: 'Sous Chef', venue: 'lula-inn', employment: 'Full-time', baseRate: 32.0, tenureMonths: 14 },
  { id: 's5', name: 'Aroha W.', role: 'Kitchen', title: 'Line Cook', venue: 'lula-inn', employment: 'Part-time', baseRate: 27.5, tenureMonths: 9 },
  { id: 's6', name: 'Dan K.', role: 'Kitchen', title: 'Kitchen Hand', venue: 'lula-inn', employment: 'Casual', baseRate: 23.15, tenureMonths: 4 },
  { id: 's7', name: 'Ana P.', role: 'FOH', title: 'Floor Supervisor', venue: 'lula-inn', employment: 'Full-time', baseRate: 29.0, managerCert: { held: true, expires: '2026-07-19' }, tenureMonths: 26 },
  { id: 's8', name: 'Josh M.', role: 'FOH', title: 'Waiter', venue: 'lula-inn', employment: 'Part-time', baseRate: 24.0, tenureMonths: 7 },
  { id: 's9', name: 'Ruby C.', role: 'FOH', title: 'Waiter', venue: 'lula-inn', employment: 'Casual', baseRate: 23.15, tenureMonths: 3 },
  { id: 's10', name: 'Vai S.', role: 'Bar', title: 'Bar Lead', venue: 'lula-inn', employment: 'Full-time', baseRate: 30.0, managerCert: { held: true, expires: '2026-07-06' }, tenureMonths: 33 },
  { id: 's11', name: 'Kiri H.', role: 'Bar', title: 'Bartender', venue: 'lula-inn', employment: 'Part-time', baseRate: 25.5, tenureMonths: 12 },
  { id: 's12', name: 'Pauline G.', role: 'Cleaning', title: 'Cleaner', venue: 'lula-inn', employment: 'Casual', baseRate: 23.5, tenureMonths: 18 },
];

export type Shift = {
  id: string;
  staffId: string;
  day: string; // e.g. 'Fri'
  start: string;
  end: string;
  status: 'confirmed' | 'open' | 'cover-requested';
};

// This weekend's roster (demo). Open + cover-requested drive the workflow demo.
export const SHIFTS: Shift[] = [
  { id: 'sh1', staffId: 's2', day: 'Fri', start: '16:00', end: '00:30', status: 'confirmed' },
  { id: 'sh2', staffId: 's3', day: 'Fri', start: '10:00', end: '22:00', status: 'confirmed' },
  { id: 'sh3', staffId: 's4', day: 'Fri', start: '15:00', end: '23:30', status: 'confirmed' },
  { id: 'sh4', staffId: 's7', day: 'Fri', start: '16:00', end: '00:30', status: 'confirmed' },
  { id: 'sh5', staffId: 's8', day: 'Fri', start: '17:00', end: '23:00', status: 'confirmed' },
  { id: 'sh6', staffId: 's9', day: 'Fri', start: '17:00', end: '23:00', status: 'cover-requested' },
  { id: 'sh7', staffId: 's10', day: 'Fri', start: '15:00', end: '02:00', status: 'confirmed' },
  { id: 'sh8', staffId: 's11', day: 'Fri', start: '18:00', end: '02:00', status: 'confirmed' },
  { id: 'sh9', staffId: '', day: 'Sat', start: '10:00', end: '15:00', status: 'open' }, // bottomless brunch — FOH gap
  { id: 'sh10', staffId: 's5', day: 'Sat', start: '09:00', end: '17:00', status: 'confirmed' },
  { id: 'sh11', staffId: 's6', day: 'Sat', start: '11:00', end: '19:00', status: 'confirmed' },
  { id: 'sh12', staffId: 's12', day: 'Sat', start: '02:00', end: '06:00', status: 'confirmed' },
];

export type Timesheet = {
  staffId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  status: 'approved' | 'pending';
};

export const TIMESHEETS: Timesheet[] = [
  { staffId: 's3', date: 'Thu 26 Jun', clockIn: '09:58', clockOut: '22:11', hours: 12.2, status: 'approved' },
  { staffId: 's4', date: 'Thu 26 Jun', clockIn: '15:02', clockOut: '23:34', hours: 8.5, status: 'approved' },
  { staffId: 's7', date: 'Thu 26 Jun', clockIn: '16:04', clockOut: '00:22', hours: 8.3, status: 'pending' },
  { staffId: 's8', date: 'Thu 26 Jun', clockIn: '17:00', clockOut: '23:05', hours: 6.1, status: 'pending' },
  { staffId: 's10', date: 'Thu 26 Jun', clockIn: '14:57', clockOut: '01:48', hours: 10.8, status: 'approved' },
];

export type LeaveRow = {
  staffId: string;
  type: 'Annual' | 'Sick' | 'Bereavement' | 'Parental';
  balanceDays: number;
  pending?: string; // pending request note
};

export const LEAVE: LeaveRow[] = [
  { staffId: 's3', type: 'Annual', balanceDays: 18.5, pending: '4 days — school holidays' },
  { staffId: 's7', type: 'Annual', balanceDays: 11.0 },
  { staffId: 's5', type: 'Sick', balanceDays: 7 },
  { staffId: 's2', type: 'Annual', balanceDays: 6.5 },
  { staffId: 's4', type: 'Bereavement', balanceDays: 3, pending: '1 day — tangi Fri' },
];

export type PayLine = {
  staffId: string;
  hours: number;
  gross: number;
  paye: number;
  kiwiSaver: number; // employee 3% (demo)
  net: number;
};

export const PAY_RUN = {
  period: 'Mon 23 – Sun 29 Jun 2026',
  status: 'Draft — awaiting GM sign-off',
  lines: [
    { staffId: 's3', hours: 47.0, gross: 1880.0, paye: 470.0, kiwiSaver: 56.4, net: 1353.6 },
    { staffId: 's4', hours: 41.5, gross: 1328.0, paye: 292.2, kiwiSaver: 39.8, net: 996.0 },
    { staffId: 's7', hours: 38.0, gross: 1102.0, paye: 231.4, kiwiSaver: 33.1, net: 837.5 },
    { staffId: 's10', hours: 44.0, gross: 1320.0, paye: 290.4, kiwiSaver: 39.6, net: 990.0 },
    { staffId: 's8', hours: 22.5, gross: 540.0, paye: 91.8, kiwiSaver: 16.2, net: 432.0 },
  ] as PayLine[],
};

// ── 2. Menu, stock, orders, wastage ────────────────────────────────────────

export type Allergen = 'Gluten' | 'Crustacean' | 'Egg' | 'Fish' | 'Milk' | 'Soy' | 'Sesame' | 'Tree nut' | 'Sulphite';

export type MenuItem = {
  id: string;
  name: string;
  category: 'Sharing' | 'Pizza' | 'Larger' | 'Dessert' | 'Cocktail';
  price: number;
  costPerServe: number; // demo
  allergens: Allergen[];
};

export const MENU: MenuItem[] = [
  { id: 'm1', name: 'Kingfish crudo, coconut & lime', category: 'Sharing', price: 26, costPerServe: 8.4, allergens: ['Fish'] },
  { id: 'm2', name: 'Prawn & chorizo skewers', category: 'Sharing', price: 24, costPerServe: 7.9, allergens: ['Crustacean'] },
  { id: 'm3', name: 'Wood-fired margherita', category: 'Pizza', price: 22, costPerServe: 5.1, allergens: ['Gluten', 'Milk'] },
  { id: 'm4', name: 'Hot honey pepperoni', category: 'Pizza', price: 25, costPerServe: 6.2, allergens: ['Gluten', 'Milk'] },
  { id: 'm5', name: 'Market fish & chips', category: 'Larger', price: 34, costPerServe: 11.6, allergens: ['Fish', 'Gluten'] },
  { id: 'm6', name: 'Lula burger, aioli & fries', category: 'Larger', price: 27, costPerServe: 8.1, allergens: ['Gluten', 'Egg', 'Milk'] },
  { id: 'm7', name: 'Coconut & passionfruit tart', category: 'Dessert', price: 16, costPerServe: 3.7, allergens: ['Gluten', 'Egg', 'Milk', 'Tree nut'] },
  { id: 'm8', name: 'Viaduct spritz', category: 'Cocktail', price: 19, costPerServe: 4.4, allergens: ['Sulphite'] },
];

export type StockRow = {
  id: string;
  item: string;
  location: 'Fridge' | 'Freezer' | 'Dry store' | 'Bar';
  onHand: number;
  par: number;
  unit: string;
};

export const STOCK: StockRow[] = [
  { id: 'st1', item: 'Kingfish (whole)', location: 'Fridge', onHand: 4, par: 6, unit: 'kg' },
  { id: 'st2', item: 'Green prawns', location: 'Freezer', onHand: 3, par: 8, unit: 'kg' },
  { id: 'st3', item: 'Pizza flour (00)', location: 'Dry store', onHand: 18, par: 20, unit: 'kg' },
  { id: 'st4', item: 'Mozzarella fior di latte', location: 'Fridge', onHand: 5, par: 12, unit: 'kg' },
  { id: 'st5', item: 'Market fish fillet', location: 'Fridge', onHand: 9, par: 10, unit: 'kg' },
  { id: 'st6', item: 'Beef patties', location: 'Freezer', onHand: 60, par: 80, unit: 'ea' },
  { id: 'st7', item: 'Tanqueray gin', location: 'Bar', onHand: 4, par: 6, unit: 'btl' },
  { id: 'st8', item: 'Prosecco', location: 'Bar', onHand: 11, par: 24, unit: 'btl' },
];

export type SupplierOrder = {
  id: string;
  supplier: string;
  category: string;
  lines: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Delivered';
};

export const SUPPLIER_ORDERS: SupplierOrder[] = [
  { id: 'o1', supplier: 'Sanford Seafood', category: 'Fish & seafood', lines: 4, total: 612.4, status: 'Draft' },
  { id: 'o2', supplier: 'Bidfood', category: 'Dry & frozen', lines: 11, total: 1284.9, status: 'Sent' },
  { id: 'o3', supplier: 'Fresh Provisions', category: 'Produce', lines: 9, total: 348.2, status: 'Delivered' },
  { id: 'o4', supplier: 'Hancocks', category: 'Bar & spirits', lines: 7, total: 902.0, status: 'Draft' },
];

export type WastageRow = {
  id: string;
  item: string;
  qty: string;
  reason: string;
  cost: number;
  date: string;
};

export const WASTAGE: WastageRow[] = [
  { id: 'w1', item: 'Mozzarella', qty: '1.2 kg', reason: 'Out of date', cost: 14.4, date: 'Thu 26 Jun' },
  { id: 'w2', item: 'Market fish', qty: '0.8 kg', reason: 'Prep trim / spoilage', cost: 10.3, date: 'Thu 26 Jun' },
  { id: 'w3', item: 'Passionfruit tarts', qty: '3 ea', reason: 'Dropped service', cost: 11.1, date: 'Wed 25 Jun' },
];

// ── 3. Food safety (Food Act 2014) ─────────────────────────────────────────

export type Traffic = 'green' | 'amber' | 'red';

export type FridgeLog = {
  id: string;
  unit: string;
  temp: number; // °C
  targetMax: number; // °C
  time: string;
  by: string;
  status: Traffic;
};

// Daily fridge/cool-store logs — replaces the paper logbook (Food Act 2014).
export const FRIDGE_LOGS: FridgeLog[] = [
  { id: 'f1', unit: 'Kitchen fridge 1', temp: 3.2, targetMax: 4, time: '07:40', by: 'Sina F.', status: 'green' },
  { id: 'f2', unit: 'Kitchen fridge 2', temp: 4.6, targetMax: 4, time: '07:41', by: 'Sina F.', status: 'amber' },
  { id: 'f3', unit: 'Cool store', temp: 3.8, targetMax: 4, time: '07:45', by: 'Sina F.', status: 'green' },
  { id: 'f4', unit: 'Freezer 1', temp: -19.4, targetMax: -18, time: '07:47', by: 'Sina F.', status: 'green' },
  { id: 'f5', unit: 'Bar fridge', temp: 3.1, targetMax: 4, time: '07:52', by: 'Vai S.', status: 'green' },
  { id: 'f6', unit: 'Dishwasher final rinse', temp: 83.1, targetMax: 82, time: '11:05', by: 'Dan K.', status: 'green' }, // ≥82°C required
];

export type SafetyCheck = {
  id: string;
  task: string;
  cadence: string;
  lastDone: string;
  by: string;
  status: Traffic;
};

export const SAFETY_CHECKS: SafetyCheck[] = [
  { id: 'c1', task: 'Hand-wash stations stocked (soap + towel)', cadence: 'Pre-service', lastDone: 'Today 15:30', by: 'Tomasi L.', status: 'green' },
  { id: 'c2', task: 'Chef pre-service safety checklist', cadence: 'Per service', lastDone: 'Today 15:35', by: 'Sina F.', status: 'green' },
  { id: 'c3', task: 'Kitchen deep clean (schedule)', cadence: 'Weekly', lastDone: 'Mon 23 Jun', by: 'Pauline G.', status: 'amber' },
  { id: 'c4', task: 'Cool-store gasket & seal check', cadence: 'Monthly', lastDone: '2 Jun', by: 'Hemi R.', status: 'green' },
  { id: 'c5', task: 'Allergen matrix review', cadence: 'Menu change', lastDone: '14 Jun', by: 'Sina F.', status: 'green' },
];

export type FoodIncident = {
  id: string;
  type: string;
  detail: string;
  date: string;
  severity: Traffic;
  status: 'Open' | 'Closed' | 'MPI draft';
};

export const FOOD_INCIDENTS: FoodIncident[] = [
  { id: 'fi1', type: 'Near-miss', detail: 'Fridge 2 drifted to 4.6°C overnight — stock moved to cool store, tech booked.', date: 'Today 07:41', severity: 'amber', status: 'Open' },
  { id: 'fi2', type: 'Allergen query', detail: 'Guest asked re sesame in burger bun — confirmed nil, logged.', date: 'Wed 25 Jun', severity: 'green', status: 'Closed' },
];

// ── 4. Bookings + events ───────────────────────────────────────────────────

export type Booking = {
  id: string;
  time: string;
  name: string;
  covers: number;
  area: string;
  vip?: boolean;
  note?: string;
  status: 'Confirmed' | 'Seated' | 'No-show risk';
};

export const BOOKINGS_TODAY: Booking[] = [
  { id: 'b1', time: '12:30', name: 'Whitcombe (birthday)', covers: 8, area: 'Deck', note: 'Cake at 2pm', status: 'Confirmed' },
  { id: 'b2', time: '18:00', name: 'ANZ corporate', covers: 14, area: 'Private room', vip: true, note: 'Set menu B, one GF', status: 'Confirmed' },
  { id: 'b3', time: '19:00', name: 'Ferguson', covers: 4, area: 'Window', status: 'Confirmed' },
  { id: 'b4', time: '19:30', name: 'Patel', covers: 6, area: 'Bar lounge', note: '2 no-shows last time', status: 'No-show risk' },
  { id: 'b5', time: '20:00', name: 'Lauaki (hen’s)', covers: 12, area: 'Deck', vip: true, note: 'Bottomless pkg', status: 'Confirmed' },
];

export const COVERS = {
  today: 214,
  tomorrow: 268,
  weekend: 940,
  target: 240,
};

export type EventBooking = {
  id: string;
  name: string;
  type: 'Wedding' | 'Corporate' | 'Private function' | 'Ticketed';
  date: string;
  covers: number;
  space: string;
  depositPaid: boolean;
  depositAmount: number;
  status: 'Enquiry' | 'Confirmed' | 'Deposit due' | 'Run sheet ready';
};

export const EVENTS: EventBooking[] = [
  { id: 'e1', name: 'Ropati × Tuala wedding', type: 'Wedding', date: 'Sat 12 Jul', covers: 120, space: 'Full venue', depositPaid: true, depositAmount: 4000, status: 'Run sheet ready' },
  { id: 'e2', name: 'Xero AKL end-of-quarter', type: 'Corporate', date: 'Thu 17 Jul', covers: 80, space: 'Deck + lounge', depositPaid: true, depositAmount: 2500, status: 'Confirmed' },
  { id: 'e3', name: 'Pasifika long lunch (ticketed)', type: 'Ticketed', date: 'Sun 20 Jul', covers: 60, space: 'Deck', depositPaid: false, depositAmount: 0, status: 'Confirmed' },
  { id: 'e4', name: '40th — Ngata', type: 'Private function', date: 'Fri 25 Jul', covers: 45, space: 'Private room', depositPaid: false, depositAmount: 1000, status: 'Deposit due' },
];

// Run sheet for the nearest event (demo) — shown on /bookings.
export const EVENT_RUN_SHEET = {
  eventId: 'e1',
  timeline: [
    { time: '13:00', item: 'Ceremony chairs set on deck (FOH ×3)' },
    { time: '14:30', item: 'Guests arrive · welcome spritz on trays' },
    { time: '15:00', item: 'Ceremony · bar paused' },
    { time: '16:00', item: 'Canapés service · kitchen brief with Sina' },
    { time: '18:30', item: 'Seated banquet — set menu C (2 vegan, 1 GF, 1 nut allergy)' },
    { time: '21:00', item: 'Cake + speeches · duty manager Hemi on floor' },
    { time: '00:30', item: 'Last drinks · Cleaning crew in at 01:00' },
  ],
  staffing: '3 kitchen · 6 FOH · 2 bar · 1 duty manager · 1 cleaner',
  contract: 'Signed 2 Jun · deposit $4,000 received',
};

// ── 5. Staff loyalty + incentives + training ───────────────────────────────

export type Milestone = {
  staffId: string;
  kind: 'Birthday' | 'Work anniversary' | 'New baby' | 'Tenure';
  when: string;
  detail: string;
};

export const MILESTONES: Milestone[] = [
  { staffId: 's10', kind: 'Work anniversary', when: 'This week', detail: '3 years with Lula — brass pin + shout' },
  { staffId: 's6', kind: 'Birthday', when: 'Sat', detail: 'Turning 22 — roster off if he wants it' },
  { staffId: 's4', kind: 'New baby', when: 'Last month', detail: 'Pēpi arrived — parental leave register updated' },
];

export type Incentive = {
  id: string;
  title: string;
  detail: string;
  leader: string;
  metric: string;
};

export const INCENTIVES: Incentive[] = [
  { id: 'i1', title: 'Shift of the week', detail: 'Smoothest Friday close', leader: 'Ana P.', metric: 'Zero comps, 8.3h' },
  { id: 'i2', title: 'Upsell champ', detail: 'Most gin flights sold', leader: 'Kiri H.', metric: '38 flights' },
  { id: 'i3', title: 'Cover hero', detail: 'Picked up 3 cover shifts', leader: 'Josh M.', metric: '+3 covers' },
];

export type TrainingRow = {
  staffId: string;
  cert: string;
  status: 'Current' | 'Expiring' | 'Expired';
  expires: string;
};

// Manager's Certificate expiry drives the alerts (Sale & Supply of Alcohol Act).
export const TRAINING: TrainingRow[] = [
  { staffId: 's10', cert: "Manager's Certificate (LCQ)", status: 'Expiring', expires: '6 Jul 2026' },
  { staffId: 's7', cert: "Manager's Certificate (LCQ)", status: 'Expiring', expires: '19 Jul 2026' },
  { staffId: 's2', cert: "Manager's Certificate (LCQ)", status: 'Current', expires: '2 Aug 2026' },
  { staffId: 's3', cert: 'Food safety (FCP) refresher', status: 'Current', expires: '11 Nov 2026' },
  { staffId: 's6', cert: 'Site induction', status: 'Current', expires: '—' },
];

// ── 6. Finance + reporting ─────────────────────────────────────────────────

export type VenueRevenue = {
  venue: string;
  revenue: number; // yesterday, demo
  wagePct: number;
  foodPct: number;
};

export const VENUE_REVENUE: VenueRevenue[] = [
  { venue: 'The Lula Inn', revenue: 18420, wagePct: 28.4, foodPct: 30.1 },
  { venue: 'Sweat Shop Brew Kitchen', revenue: 24310, wagePct: 26.9, foodPct: 31.8 },
  { venue: 'Moretons', revenue: 12980, wagePct: 30.2, foodPct: 29.4 },
  { venue: 'The Elbow Room', revenue: 9640, wagePct: 31.1, foodPct: 28.7 },
];

export const WEEKLY_PL = {
  week: 'Mon 23 – Sun 29 Jun 2026 · The Lula Inn',
  revenue: 121400,
  food: 36540,
  beverage: 41220,
  events: 18600,
  wages: 34470,
  cogs: 37130,
  overheads: 21800,
  get netBeforeTax() {
    return this.revenue - this.wages - this.cogs - this.overheads;
  },
};

export type CashRecon = {
  source: string;
  expected: number;
  counted: number;
};

export const CASH_RECON: CashRecon[] = [
  { source: 'Till drawer 1', expected: 640.0, counted: 638.5 },
  { source: 'Till drawer 2', expected: 500.0, counted: 500.0 },
  { source: 'Eftpos settlement', expected: 14210.4, counted: 14210.4 },
  { source: 'Online bookings', expected: 1860.0, counted: 1860.0 },
  { source: 'Event deposits', expected: 1000.0, counted: 1000.0 },
];

// ── 7. Alcohol licence + compliance (Sale & Supply of Alcohol Act 2012) ─────

export type DutyManagerSlot = {
  day: string;
  manager: string;
  certExpires: string;
  present: boolean;
};

export const DUTY_MANAGERS: DutyManagerSlot[] = [
  { day: 'Fri (now)', manager: 'Hemi R.', certExpires: '2 Aug 2026', present: true },
  { day: 'Sat day', manager: 'Ana P.', certExpires: '19 Jul 2026', present: true },
  { day: 'Sat night', manager: 'Vai S.', certExpires: '6 Jul 2026', present: true },
];

export type AlcoholIncident = {
  id: string;
  time: string;
  type: 'Intoxication refusal' | 'ID check' | 'Disorder' | 'Minor refused';
  detail: string;
  manager: string;
};

export const ALCOHOL_INCIDENTS: AlcoholIncident[] = [
  { id: 'ai1', time: 'Fri 23:10', type: 'Intoxication refusal', detail: 'Patron cut off, water + taxi offered.', manager: 'Hemi R.' },
  { id: 'ai2', time: 'Fri 21:35', type: 'ID check', detail: 'Two IDs checked at door, one declined (expired).', manager: 'Ana P.' },
];

export type LicenceItem = {
  id: string;
  item: string;
  renews: string;
  status: Traffic;
};

export const LICENCE_CALENDAR: LicenceItem[] = [
  { id: 'l1', item: 'On-licence (annual return)', renews: '30 Sep 2026', status: 'green' },
  { id: 'l2', item: 'Outdoor deck endorsement', renews: '30 Sep 2026', status: 'green' },
  { id: 'l3', item: 'Duty manager cert — Vai S.', renews: '6 Jul 2026', status: 'amber' },
  { id: 'l4', item: 'DLC quarterly report draft', renews: '15 Jul 2026', status: 'amber' },
];

// ── 8. Guest comms drafts ──────────────────────────────────────────────────

export type CommsDraft = {
  id: string;
  kind: 'Booking confirmation' | 'Event enquiry' | 'Review reply' | 'Newsletter' | 'Loyal guest';
  context: string;
  draft: string;
};

export const COMMS_DRAFTS: CommsDraft[] = [
  {
    id: 'cm1',
    kind: 'Booking confirmation',
    context: 'Ferguson · 4 · Fri 7pm · window',
    draft:
      'Kia ora Ferguson party — you’re booked at The Lula Inn this Friday, 7pm, 4 guests, window table over the water. Come early for a Viaduct spritz on the deck. Any dietaries, just reply here. See you Friday — the Lula team.',
  },
  {
    id: 'cm2',
    kind: 'Event enquiry',
    context: '30th birthday · ~45 pax · late July',
    draft:
      'Thanks for thinking of Lula for the 30th! For ~45 guests our private room is perfect — I’d suggest set menu B ($68pp) plus a welcome-drink-on-arrival package. To hold Fri 25 Jul we take a $1,000 deposit; I’ve pencilled you in. Want me to send the full run sheet and contract?',
  },
  {
    id: 'cm3',
    kind: 'Review reply',
    context: 'Google · 3★ · slow mains on a busy Saturday',
    draft:
      'Thank you for the honest feedback — a 40-minute wait on mains isn’t the Lula standard and we’re sorry Saturday fell short. We’ve reviewed the kitchen pass timing for peak service. We’d genuinely love another go — reply here and the mains are on us. Ngā mihi, the Lula team.',
  },
  {
    id: 'cm4',
    kind: 'Loyal guest',
    context: 'Guest in for their 10th visit this quarter',
    draft:
      'We noticed tonight’s your tenth visit with us this season — that means a lot. First round of spritzes is on the house. Thanks for making Lula your local on the water. 🥂',
  },
  {
    id: 'cm5',
    kind: 'Newsletter',
    context: "What's on — July",
    draft:
      'July on the water: Live music Thu–Sun, our Pasifika Long Lunch returns Sun 20 Jul (tickets live now), and Bottomless Brunch every Saturday from 10am. Book the deck before it goes — lulas.co.nz.',
  },
];

// ── Mana Receipts (audit trail for compliance-critical actions) ────────────

export type ManaReceipt = {
  id: string;
  action: string;
  actor: string;
  ts: string;
  basis: Citation;
  sha: string; // demo hash
};

export const MANA_RECEIPTS: ManaReceipt[] = [
  { id: 'mr1', action: 'Fridge 2 temp exception logged + stock relocated', actor: 'Sina F.', ts: '2026-06-27 07:41', basis: NZ_CITATIONS.foodChillTemp, sha: 'a9f3…7c21' },
  { id: 'mr2', action: 'Intoxicated patron refused service', actor: 'Hemi R. (duty mgr)', ts: '2026-06-27 23:10', basis: NZ_CITATIONS.alcoholAct, sha: 'b1c8…04de' },
  { id: 'mr3', action: 'Pay run drafted for GM sign-off', actor: 'Marama T.', ts: '2026-06-29 09:02', basis: NZ_CITATIONS.holidaysAct, sha: 'c4a0…9f77' },
  { id: 'mr4', action: 'Bereavement leave approved (1 day, tangi)', actor: 'Marama T.', ts: '2026-06-26 14:20', basis: NZ_CITATIONS.holidaysAct, sha: 'd7e2…5b13' },
  { id: 'mr5', action: 'Allergen query resolved + logged (sesame / burger bun)', actor: 'Sina F.', ts: '2026-06-25 19:44', basis: NZ_CITATIONS.allergens, sha: 'e0b9…a3c6' },
];

// ── Derived helpers (for the /today dashboard) ─────────────────────────────

export function staffById(id: string): StaffMember | undefined {
  return STAFF.find((s) => s.id === id);
}

export function gpPercent(item: MenuItem): number {
  return Math.round(((item.price - item.costPerServe) / item.price) * 100);
}

export function reconVariance(): number {
  return CASH_RECON.reduce((sum, r) => sum + (r.counted - r.expected), 0);
}

export const TODAY_ALERTS: { level: Traffic; text: string }[] = [
  { level: 'amber', text: 'Fridge 2 running warm (4.6°C) — tech booked, stock moved.' },
  { level: 'amber', text: "Vai S. Manager's Certificate expires 6 Jul — renewal needed." },
  { level: 'red', text: 'Sat 10am FOH shift still OPEN (bottomless brunch).' },
  { level: 'amber', text: 'Kingfish + mozzarella below par — Sanford order still in draft.' },
  { level: 'green', text: 'All duty-manager slots covered this weekend.' },
];
