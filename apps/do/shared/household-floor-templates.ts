/**
 * Household Floor templates.
 *
 * - public_household_floor: scrubbed fictional demo — share tonight
 * - owner_private_household_floor: owner-personal seed — NOT for public share
 */

import {
  DEFAULT_DAILY_BOARD_ORDER,
  HOUSEHOLD_HARD_GATES,
  type HouseholdFloorTemplate,
  type HouseholdSeat,
  type HouseholdScheduleHook,
} from './household-floor';

const SEATS: HouseholdSeat[] = [
  {
    id: 'SCHOOL',
    title: 'School',
    summary: 'Read notices, timetables and forms from school portals. Draft replies only.',
    sources: ['SchoolBridge portals (owner browser)', 'pasted newsletter', 'Gmail school admin when connected'],
    canDoWithoutAsking: [
      'Open consented school portal URL in owner-browser seat',
      'Extract dates, forms and bag items from reviewed page text',
      'Prepare a draft summary for the evening board',
    ],
    mustAskBefore: [
      'Submit absence, permission or payment forms',
      'Message teachers',
      'Send any draft off-device',
    ],
    never: [
      'Invent fixtures, grades or medical notes',
      'Submit portal forms without explicit OK',
      'Track a child',
    ],
    browserSeatPreferred: true,
    learnPlaybookHint: 'Show me once: open college notices → capture → store playbook “open notices”.',
  },
  {
    id: 'PACK',
    title: 'Pack',
    summary: 'Tomorrow bags, sports gear and permissions — checklist only.',
    sources: ['school extracts', 'calendar notes you provide'],
    canDoWithoutAsking: ['Build a pack checklist from reviewed notices'],
    mustAskBefore: ['Message anyone about missing kit'],
    never: ['Order or buy gear without OK'],
    browserSeatPreferred: false,
  },
  {
    id: 'KITCHEN',
    title: 'Kitchen',
    summary: 'Fridge photo in → meal/leftover suggestions out. No shopping carts.',
    sources: ['fridge photo (Show DO / vision)', 'notes you paste'],
    canDoWithoutAsking: ['Suggest meals from a reviewed fridge photo', 'List likely leftovers'],
    mustAskBefore: ['Place a grocery order', 'Pay for delivery'],
    never: ['Autonomous checkout'],
    browserSeatPreferred: false,
  },
  {
    id: 'MONEY',
    title: 'Money',
    summary: 'Surface bills and school costs as drafts. Never pay.',
    sources: ['bill PDFs you provide', 'school cost lines from notices'],
    canDoWithoutAsking: ['Extract amounts and due dates', 'Draft a pay-reminder for review'],
    mustAskBefore: ['Pay', 'Transfer', 'Save card details'],
    never: ['Execute a payment'],
    browserSeatPreferred: false,
  },
  {
    id: 'TRAVEL',
    title: 'Travel',
    summary: 'Pickup windows, co-parent handovers and tomorrow logistics.',
    sources: ['custody calendar notes', 'maps you open with consent'],
    canDoWithoutAsking: ['Draft a who-goes-where plan', 'Flag clash risks'],
    mustAskBefore: ['Book transport', 'Send location to anyone'],
    never: ['Silent location tracking'],
    browserSeatPreferred: false,
  },
  {
    id: 'WEATHER',
    title: 'Weather',
    summary: 'Morning weather note for bags and bus decisions.',
    sources: ['public weather page via browser seat', 'pasted forecast'],
    canDoWithoutAsking: ['Summarise a reviewed forecast for the board'],
    mustAskBefore: [],
    never: ['Claim live weather without a capture receipt'],
    browserSeatPreferred: true,
  },
  {
    id: 'BINS',
    title: 'Bins',
    summary: 'Rubbish / recycling / food scraps reminders for the active home.',
    sources: ['council bin page via browser seat', 'home bin schedule in context'],
    canDoWithoutAsking: ['Post a bin reminder to the board from context or capture'],
    mustAskBefore: [],
    never: ['Invent a collection day not in context or capture'],
    browserSeatPreferred: true,
  },
  {
    id: 'BUS',
    title: 'Bus',
    summary: 'Morning bus / scooter / drop-off note — advisory only.',
    sources: ['AT or school transport page via browser seat', 'notes you provide'],
    canDoWithoutAsking: ['Draft a morning transport line for the board'],
    mustAskBefore: ['Buy tickets', 'Book a ride'],
    never: ['Pay for transport without OK'],
    browserSeatPreferred: true,
  },
  {
    id: 'DESK',
    title: 'Desk',
    summary: 'Evening wrap: Needs you pile, cleaner-key drafts, fortnightly admin.',
    sources: ['other seats', 'owner notes'],
    canDoWithoutAsking: ['Assemble the evening board', 'Draft a cleaner key note for approve'],
    mustAskBefore: ['Send the cleaner message', 'Share the board externally'],
    never: ['Auto-send household messages'],
    browserSeatPreferred: false,
  },
];

const SCHEDULES: HouseholdScheduleHook[] = [
  {
    id: 'evening-board',
    title: 'Evening board',
    when: 'Every day 19:30 Pacific/Auckland',
    timezone: 'Pacific/Auckland',
    days: 'daily',
    localTime: '19:30',
    seatIds: ['DESK', 'SCHOOL', 'PACK', 'KITCHEN', 'TRAVEL', 'BINS', 'MONEY'],
    boardOrder: DEFAULT_DAILY_BOARD_ORDER,
    produces: 'needs_you',
  },
  {
    id: 'morning-bus',
    title: 'Morning weather + bus',
    when: 'Mon–Fri 07:00 Pacific/Auckland',
    timezone: 'Pacific/Auckland',
    days: [1, 2, 3, 4, 5],
    localTime: '07:00',
    seatIds: ['WEATHER', 'BUS', 'PACK'],
    boardOrder: ['Weather', 'Bus / drop-off', 'Pack check'],
    produces: 'needs_you',
  },
  {
    id: 'sunday-week-board',
    title: 'Sunday week board',
    when: 'Sunday 10:00 Pacific/Auckland',
    timezone: 'Pacific/Auckland',
    days: [0],
    localTime: '10:00',
    seatIds: ['DESK', 'SCHOOL', 'TRAVEL', 'MONEY'],
    boardOrder: ['Week overview', 'School week', 'Handovers', 'Money touchpoints'],
    produces: 'needs_you',
  },
  {
    id: 'sunday-cleaner-key',
    title: 'Cleaner key draft',
    when: 'Sunday 19:00 Pacific/Auckland (fortnightly intent)',
    timezone: 'Pacific/Auckland',
    days: [0],
    localTime: '19:00',
    seatIds: ['DESK'],
    boardOrder: ['Draft cleaner key note → approve'],
    produces: 'needs_you',
  },
];

/** Public competition / share template — fictional household, no real PII. */
export const PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE: HouseholdFloorTemplate = {
  id: 'public_household_floor',
  visibility: 'public_template',
  name: 'Household Floor',
  summary:
    'A shareable family DO: nine seats, evening/morning/Sunday boards, drafts-only gates, and an owner-browser seat for school and council pages.',
  shareable: true,
  context: {
    timezone: 'Pacific/Auckland',
    people: [
      { id: 'avery', displayName: 'Avery Ng', role: 'owner', notes: 'Primary organiser' },
      { id: 'jordan', displayName: 'Jordan Blake', role: 'co_parent', notes: 'Week-on / week-off Mondays' },
      {
        id: 'quinn',
        displayName: 'Quinn',
        role: 'child',
        yearLabel: 'Y9 · demo college',
        schoolPortal: 'demo-college.bridge.school.nz',
        notes: 'Drop-off / e-scooter days vary — never invent attendance',
      },
      {
        id: 'harper',
        displayName: 'Harper',
        role: 'child',
        yearLabel: 'Y8 · demo secondary',
        schoolPortal: 'demo-secondary.bridge.school.nz',
        notes: 'PM pickup window often ~15:30–16:00 near demo sports hub',
      },
      { id: 'maple', displayName: 'Maple', role: 'pet', notes: 'Household dog — walks & feeding notes only' },
    ],
    homes: [
      {
        id: 'kids-week',
        label: 'Kids-week home',
        addressLine: '12 Harbour View Lane, Example Bay',
        whenActive: 'Kids weeks (demo custody calendar)',
        bins: {
          rubbish: 'red',
          recycling: 'yellow',
          foodScraps: 'green',
          day: 'Thursday',
        },
      },
      {
        id: 'off-week',
        label: 'Off-week home',
        addressLine: '88 Quay Demo, Waterfront',
        whenActive: 'Off weeks with co-parent (demo)',
      },
    ],
    custodyNote:
      'Demo custody: kids weeks at Harbour View; off weeks at Quay Demo with Jordan. Handovers Mondays. Do not invent real locations.',
    schoolPortals: [
      { label: 'Demo College (Quinn)', host: 'demo-college.bridge.school.nz', childId: 'quinn', mode: 'read_only' },
      { label: 'Demo Secondary (Harper)', host: 'demo-secondary.bridge.school.nz', childId: 'harper', mode: 'read_only' },
    ],
    kitchenMode: 'fridge_photo',
    messaging: 'drafts_only',
    hardGates: [...HOUSEHOLD_HARD_GATES],
  },
  seats: SEATS,
  schedules: SCHEDULES,
  dailyBoardOrder: DEFAULT_DAILY_BOARD_ORDER,
};

/**
 * Owner-private seed mirroring a real household operating pattern.
 * Install only from the private path — never offer as the public share card.
 */
export const OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE: HouseholdFloorTemplate = {
  id: 'owner_private_household_floor',
  visibility: 'owner_private',
  name: 'Household Floor · owner',
  summary:
    'Owner-personal Household Floor seed (Pacific/Auckland). Not for public share. Same seats and schedules as the public template with private household context.',
  shareable: false,
  context: {
    timezone: 'Pacific/Auckland',
    people: [
      { id: 'kate', displayName: 'Kate Hudson', role: 'owner' },
      { id: 'adrian', displayName: 'Adrian', role: 'co_parent', notes: 'Off-week home · Wynyard' },
      {
        id: 'jack',
        displayName: 'Jack Coveny',
        role: 'child',
        yearLabel: '14 · Y9 Sacred Heart',
        schoolPortal: 'sacredheart.bridge.school.nz',
        notes: 'Drop-off / e-scooter',
      },
      {
        id: 'mila',
        displayName: 'Mila Coveny',
        role: 'child',
        yearLabel: '~12 · Baradene',
        schoolPortal: 'baradene.bridge.school.nz',
        notes: 'PM often 413 Kohimarama Rd / Kepa Rd · Kate pickup ~15:30–16:00',
      },
      { id: 'aaron', displayName: 'Aaron', role: 'other', notes: 'Dad · week-on/off Mondays' },
      { id: 'franklin', displayName: 'Franklin', role: 'pet', notes: 'Dachshund' },
    ],
    homes: [
      {
        id: 'geraldine',
        label: 'Kids-week home',
        addressLine: '6 A Geraldine Place, Kohimarama',
        whenActive: 'Kids weeks',
        bins: {
          rubbish: 'rubbish',
          recycling: 'recycling',
          foodScraps: 'food scraps',
          day: 'Thursday',
        },
      },
      {
        id: 'daldy',
        label: 'Off-week home',
        addressLine: '70 Daldy St, Wynyard',
        whenActive: 'Off weeks with Adrian',
      },
    ],
    custodyNote:
      'Kids weeks at Geraldine Place (Kohimarama); off weeks at Daldy St (Wynyard) with Adrian. Aaron week-on/off Mondays.',
    schoolPortals: [
      { label: 'Sacred Heart (Jack)', host: 'sacredheart.bridge.school.nz', childId: 'jack', mode: 'read_only' },
      { label: 'Baradene (Mila)', host: 'baradene.bridge.school.nz', childId: 'mila', mode: 'read_only' },
    ],
    kitchenMode: 'fridge_photo',
    messaging: 'drafts_only',
    hardGates: [...HOUSEHOLD_HARD_GATES],
  },
  seats: SEATS,
  schedules: SCHEDULES,
  dailyBoardOrder: DEFAULT_DAILY_BOARD_ORDER,
};

export const HOUSEHOLD_FLOOR_TEMPLATES: HouseholdFloorTemplate[] = [
  PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
  OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE,
];

export function getHouseholdFloorTemplate(id: string): HouseholdFloorTemplate | null {
  return HOUSEHOLD_FLOOR_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function listShareableHouseholdFloorTemplates(): HouseholdFloorTemplate[] {
  return HOUSEHOLD_FLOOR_TEMPLATES.filter((template) => template.shareable);
}
