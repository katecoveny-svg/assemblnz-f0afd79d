// Plain (non-client) module so Server Components can import HOSPO_LINKS as a
// real array. Importing a value export from a 'use client' module hands back a
// client-reference proxy, not the array — so this lives on its own.

export const HOSPO_BASE = '/customers/lula-inn/hospo';

export const HOSPO_LINKS = [
  { href: `${HOSPO_BASE}/today`, label: 'Today' },
  { href: `${HOSPO_BASE}/staff`, label: 'Staff & pay' },
  { href: `${HOSPO_BASE}/kitchen`, label: 'Kitchen' },
  { href: `${HOSPO_BASE}/food-safety`, label: 'Food safety' },
  { href: `${HOSPO_BASE}/bookings`, label: 'Bookings & events' },
  { href: `${HOSPO_BASE}/rewards`, label: 'Team rewards' },
  { href: `${HOSPO_BASE}/finance`, label: 'Finance' },
  { href: `${HOSPO_BASE}/compliance`, label: 'Alcohol licence' },
  { href: `${HOSPO_BASE}/comms`, label: 'Guest comms' },
];
