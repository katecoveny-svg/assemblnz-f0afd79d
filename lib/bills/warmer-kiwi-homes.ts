/**
 * Warmer Kiwi Homes — real eligibility criteria, fetched from EECA.
 *
 * Source (verified 2026-07-07 via server-side fetch):
 *   https://www.eeca.govt.nz/co-funding-and-support/products/warmer-kiwi-homes-programme/information/
 * Check-eligibility tool:
 *   https://www.eeca.govt.nz/.../warmer-kiwi-homes-programme/check-eligibility/
 *
 * The Alerts surface shows this with its source + last-verified date. A daily
 * scheduled function (refresh-warmer-kiwi-homes — see supabase/functions) can
 * re-fetch and flag any change; until then this is the verified snapshot.
 */

export const WKH_SOURCE_URL =
  'https://www.eeca.govt.nz/co-funding-and-support/products/warmer-kiwi-homes-programme/information/';
export const WKH_CHECK_URL =
  'https://www.eeca.govt.nz/co-funding-and-support/products/warmer-kiwi-homes-programme/check-eligibility/?bypassIntro=1';
export const WKH_PHONE = '0800 749 782';
export const WKH_VERIFIED_AT = '2026-07-07T00:00:00Z';

export const warmerKiwiHomes = {
  whoQualifies: [
    'Own and occupy a home built before 2008',
    'Hold a Community Services Card or SuperGold Combo card, OR live in a designated lower-income area',
    'Home lacks existing ceiling and underfloor insulation (for the insulation grant)',
  ],
  insulation: [
    '90% funded — Community Services Card / SuperGold holders or highest-need areas',
    '80% funded — certain designated areas',
    '50% funded — middle-income areas (average cost ~$4,300 → you pay ~$2,150)',
  ],
  heatPump: [
    '90% funded, up to $3,450 — Community Services Card / SuperGold holders or highest-need areas',
    'Requires existing ceiling + underfloor insulation to EECA standard',
    'Home must not already have a fixed heater (heat pump, wood/pellet burner, flued gas or central heating)',
    'Expected out-of-pocket: $400–$700',
  ],
} as const;

/** Headline used on the Alerts callout. */
export const WKH_HEADLINE = 'up to 90% funded';
