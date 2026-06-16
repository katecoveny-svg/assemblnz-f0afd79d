/**
 * Phase-1 demo configuration — one agent, one customer (Whetū).
 *
 * Single source of truth for the constraints the booking tools and their
 * tests both depend on: business hours, slot length, party-size bounds. Kept
 * here (not in env) because they're product rules, not secrets, and the unit
 * tests assert against them directly. The richer per-restaurant policy copy
 * lives in the knowledge docs (whetu-policies.md).
 */

export const AGENT_ID = 'aria.manaaki@demo';
export const AGENT_VERSION = 'manaaki-phase1-0.1.0';
export const CUSTOMER_ID = 'whetu';
export const TIMEZONE = 'Pacific/Auckland';

/** Booking slot length in minutes. */
export const SLOT_MINUTES = 30;

/** Largest party the agent will book without a human; bigger → warm transfer. */
export const MAX_PARTY_SIZE = 10;
export const MIN_PARTY_SIZE = 1;

/**
 * Opening hours per ISO weekday (1=Mon … 7=Sun), local time. `null` = closed.
 * Whetū is a dinner-service restaurant: closed Mondays, dinner Tue–Sun.
 */
export const BUSINESS_HOURS: Record<number, { open: string; close: string } | null> = {
  1: null, // Monday — closed
  2: { open: '17:00', close: '21:30' },
  3: { open: '17:00', close: '21:30' },
  4: { open: '17:00', close: '21:30' },
  5: { open: '17:00', close: '22:30' },
  6: { open: '12:00', close: '22:30' },
  7: { open: '12:00', close: '21:00' },
};

/** Last seating offset before close, in minutes (kitchen winds down). */
export const LAST_SEATING_BEFORE_CLOSE = 60;
