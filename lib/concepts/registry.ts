/**
 * assembl — private-concept registry
 * ----------------------------------
 * Per the build sequence, only the Woolworths / Everyday Rewards golden journey
 * is wired first (it validates the shared architecture). Air New Zealand and
 * Contact are the next stages — deliberately NOT built in parallel — and slot in
 * here as additional configs against their own `journeyId`s once ready.
 *
 * There is NO public directory of concepts (brief §4): this registry is server-
 * side config only and is never rendered as a browsable index.
 */

import { EVERYDAY_ASSEMBLED_ID } from '@/lib/journey/journeys/everyday-assembled';
import type { ConceptConfig } from './types';

const EVERYDAY_REWARDS: ConceptConfig = {
  slug: 'everyday-rewards',
  org: 'Woolworths NZ',
  programme: 'Everyday Rewards',
  journeyId: EVERYDAY_ASSEMBLED_ID,
  // Verified in-repo Everyday Rewards brand tokens (not the print one-pager set).
  brand: {
    accent: '#fd6400',
    accentDeep: '#c65100',
    ink: '#22303c',
    paper: '#ffffff',
    accentSoft: '#ffe6d1',
  },
  signature: {
    eyebrow: 'assembling · a rewarded wait-state product',
    hook: 'Your week is ready.',
    hookLong:
      'Everyday Rewards becomes the household intelligence layer that understands the week, prepares the shop and asks for approval.',
    scenario:
      'A member opens the app on a busy week. assembl reads one approved wait, assembles the household shop, and hands the basket back for member approval — nothing purchased, nothing changed.',
  },
  language: {
    start: 'Assemble my week',
    customerLabel: 'Member view',
    insideLabel: 'Inside the journey',
  },
  commercial: {
    chips: ['12,840 eligible waits', '32% opt-in', '68% completion', '+12 pts per moment'],
    model: {
      consumer: 'visible reward + useful result',
      client: 'control + measurable outcome',
      assembl: 'paid on completion',
    },
    pilotAsk:
      'A 90-minute working session to define the first household week, the rewarded signal that improves it, and the smallest safe basket sandbox.',
  },
  disclosure:
    'Independent concept prepared by assembl · simulated data · not an active partnership. No Everyday Rewards or Woolworths systems are connected; nothing is purchased and no order is placed.',
  flagship: true,
};

const CONCEPTS: Record<string, ConceptConfig> = {
  'everyday-rewards': EVERYDAY_REWARDS,
};

export function getConcept(slug: string): ConceptConfig | undefined {
  return CONCEPTS[slug];
}

/** Server-side only — never rendered as a public list. */
export const CONCEPT_SLUGS = Object.keys(CONCEPTS);
