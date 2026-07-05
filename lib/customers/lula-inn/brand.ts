/**
 * Lula Inn × assembl — pilot workspace brand + tenant config
 * ----------------------------------------------------------
 * Config-driven tokens for the hosted concept workspace at
 * `/customers/lula-inn/hospo`. This is a CONCEPT pitch surface prepared for
 * Star Group (the hospitality group that operates The Lula Inn). Nothing here
 * is a live integration:
 *
 *  - No real Star Group / Lula Inn logo artwork — a stylised wordmark only.
 *  - No real staff, real revenue, or real menu items — every figure is demo
 *    data, seeded until a signed pilot (see lib/customers/lula-inn/demo-data.ts).
 *  - Chrome is marked "concept · pending" on every surface.
 *  - Booking (SevenRooms/OpenTable/Resy), POS (Lightspeed) and Xero/MYOB
 *    integrations are SCAFFOLDED only — no credentials, no live calls.
 *
 * Venue facts verified from stargroup.nz + heartofthecity.co.nz on 2026-07-01:
 * The Lula Inn, 149 Quay Street, Princes Wharf, Auckland Viaduct. Pacific-fusion
 * dining, day-to-night entertainment, Auckland's only on-water deck, up to ~450
 * guests across event spaces. Operated by Star Group (50+ North Island venues).
 * Palette below is an ORIGINAL warm-Pacific-waterfront interpretation, not
 * lifted proprietary artwork.
 */

export const LULA_BRAND = {
  // Lula Inn side — warm Pacific waterfront.
  ocean: '#0E4D4A', // deep harbour teal (primary ink surfaces)
  oceanMid: '#1C6E68', // mid teal (accents, links)
  oceanLight: '#D7E7E4', // pale teal wash
  coral: '#E2603B', // Pacific coral / terracotta (primary accent)
  coralDark: '#B94526',
  coralLight: '#FBE2D8',
  brass: '#C08A3E', // brass / gold trim
  brassDark: '#9A6B29',
  sand: '#F4EDE1', // warm sand background
  cream: '#FBF6EC', // card / paper
  ink: '#221F1A', // near-black warm charcoal
  inkSoft: '#5A5347', // muted body text
  line: '#E6DCC9', // hairline dividers
  // Status palette (traffic-light for fridge temps, compliance, etc.).
  green: '#2E7D53',
  amber: '#C98A1E',
  red: '#C0392B',
  greenBg: '#E4F0E8',
  amberBg: '#FBEFD6',
  redBg: '#F7E1DE',
  white: '#ffffff',
  // assembl side of the cross-brand lockup (locked canon 2026-06-23).
  canary: '#BFA37A',
  gold: '#C79B1F',
  assemblCream: '#FFF7EC',
  assemblCharcoal: '#3A3832',
} as const;

export const LULA_TENANT = {
  slug: 'lula-inn',
  displayName: 'The Lula Inn',
  venueShort: 'Lula Inn',
  group: 'Star Group',
  groupSlug: 'star-group',
  address: '149 Quay Street, Princes Wharf, Auckland',
  precinct: 'Viaduct Harbour',
  cuisine: 'Pacific-fusion dining · day-to-night',
  // Warm intro angle — Kate's aunty works FOH at the venue.
  introAngle: 'Family-adjacent warm intro via Kate’s aunty (FOH, Lula Inn).',
  contactName: 'The Lula Inn management',
  contactRole: 'Venue GM · Star Group operations',
  conceptLabel: 'concept · pending',
  watermark: 'concept · assembl × the lula inn',
  // Honest positioning of what is real vs scaffolded.
  integrations: {
    bookings: 'SevenRooms / OpenTable / Resy — adapter scaffolded, not connected',
    pos: 'Lightspeed / Vend — adapter scaffolded, not connected',
    finance: 'Xero (payroll + ledger) / MYOB — adapter scaffolded, not connected',
  },
} as const;

/**
 * Star Group venues used to demonstrate the multi-venue rollup. The group runs
 * 50+ North Island venues; this is a small, realistic slice for the demo. Lula
 * Inn is the pilot venue — the others show how the group operator view scales.
 */
export type LulaVenue = {
  slug: string;
  name: string;
  region: string;
  isPilot?: boolean;
};

export const STAR_GROUP_VENUES: LulaVenue[] = [
  { slug: 'lula-inn', name: 'The Lula Inn', region: 'Viaduct, Auckland', isPilot: true },
  { slug: 'sweat-shop', name: 'Sweat Shop Brew Kitchen', region: 'Victoria St, Auckland' },
  { slug: 'moretons', name: 'Moretons', region: 'St Heliers, Auckland' },
  { slug: 'the-elbow-room', name: 'The Elbow Room', region: 'Ponsonby, Auckland' },
];

export const LULA_GROUP = {
  slug: 'star-group',
  name: 'Star Group',
  descriptor: 'Hospitality group · 50+ North Island venues',
  loyalty: 'Star Social Rewards',
  regions: ['Auckland', 'Waikato', 'Bay of Plenty', 'Wellington'],
} as const;
