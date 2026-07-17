/**
 * assembl's OWN Business Genome — the dogfood tenant.
 *
 * assembl runs on the same architecture it sells: one genome under tenant
 * 'assembl' in `living_site_genome` (seeded by migration 20260722096000,
 * owner-confirmed), read by the same `getGenomeFactsFor` machinery as every
 * sample vertical. This module is the static fallback — the values mirror
 * the migration seeds verbatim so the surfaces never 500 when the DB is
 * unreachable.
 *
 * These facts are DATA (grounding for agents and the ad studio), not page
 * copy. The fixed brand lines quoted here (motto, promise, tagline) are
 * assembl's locked, approved lines — never edit them here.
 */

import type { GenomeFact, GenomeSection, SurfaceId } from '@/lib/customers/auckland-dog-trainer/genome';

export const ASSEMBL_TENANT = 'assembl';

const confirmed = (
  id: string,
  section: GenomeSection,
  label: string,
  value: string,
  readBy: SurfaceId[],
): GenomeFact => ({ id, section, label, value, readBy, source: 'owner', verification: 'confirmed' });

/** Mirrors the 11 tenant='assembl' rows seeded by 20260722096000. */
export const ASSEMBL_GENOME_FACTS: GenomeFact[] = [
  confirmed(
    'g-name',
    'identity',
    'Business',
    'assembl — the living business operating system · Built in Aotearoa',
    ['website', 'proposals', 'email', 'voice', 'social'],
  ),
  confirmed(
    'g-voice',
    'identity',
    'Brand voice',
    'Calm, plain-spoken, human words — no AI jargon. "Less admin. More mahi."',
    ['website', 'email', 'voice', 'support', 'social'],
  ),
  confirmed(
    'g-area',
    'identity',
    'Service area',
    'Aotearoa New Zealand · based in Tāmaki Makaurau',
    ['website', 'voice', 'crm'],
  ),
  confirmed(
    'g-pilot',
    'services',
    'Founding Pilot Sprint',
    'NZ$1,500 + GST · install a Business Genome and a Living Site for your business',
    ['website', 'booking', 'proposals', 'email', 'voice', 'crm'],
  ),
  confirmed(
    'g-install',
    'services',
    'Living Site install',
    'Ten questions → a real genome → a living website, CRM, bookings and drafts',
    ['website', 'booking', 'proposals', 'email', 'voice'],
  ),
  confirmed(
    'g-team',
    'team',
    'The team',
    'Kate — founder · assembl agents draft, Kate approves',
    ['website', 'booking', 'crm'],
  ),
  confirmed(
    'g-approvals',
    'knowledge',
    'The one promise',
    'Nothing sends without a human yes — drafts queue for approval, every action leaves evidence',
    ['website', 'faq', 'voice', 'support', 'email'],
  ),
  confirmed(
    'g-data',
    'knowledge',
    'Data care',
    'Tenant data locked down (deny-all access rules) · NZ Privacy Act 2020 posture · evidence retained',
    ['website', 'faq', 'support'],
  ),
  confirmed(
    'g-proof',
    'proof',
    'Proven loop',
    'Every enquiry becomes a task with a drafted reply, an approval and an evidence trail — verified in production',
    ['website', 'proposals', 'email', 'social'],
  ),
  confirmed(
    'g-booking-rules',
    'operations',
    'How work starts',
    'Enquiries land in the operating system · replies drafted from confirmed facts only · Kate says yes before anything sends',
    ['booking', 'email', 'crm', 'voice'],
  ),
  confirmed(
    'g-automations',
    'operations',
    'Automations',
    'Draft-only: enquiry replies, follow-ups and suggestions — dispatch stays off until deliberately enabled',
    ['email', 'crm', 'support'],
  ),
];

const noSurfaces: SurfaceId[] = [];
const brand = (id: string, section: GenomeSection, label: string, value: string): GenomeFact => ({
  id,
  section,
  label,
  value,
  readBy: noSurfaces,
});

/**
 * assembl's fixed brand lines — grounding context for MUSE and agent drafts,
 * never published copy. The motto/promise/tagline are assembl's own locked,
 * approved lines. Kept separate from the DB-mirroring facts above so the
 * live read can't drift them.
 */
export const ASSEMBL_BRAND_FACTS: GenomeFact[] = [
  brand(
    'a-concept',
    'identity',
    'What it is',
    'A living business operating system — one Business Genome per customer that every surface (website, CRM, bookings, agents, emails) reads.',
  ),
  brand('a-motto', 'identity', 'Motto', 'Less admin. More mahi.'),
  brand('a-promise', 'identity', 'Promise', 'assembl grows your business while you run it.'),
  brand('a-audience', 'identity', "Who it's for", 'New Zealand small businesses.'),
  brand(
    'a-how',
    'services',
    'How it works',
    'Answer a few questions; assembl writes your Genome, then builds and runs your website, CRM, bookings and agents from it.',
  ),
  brand(
    'a-difference',
    'identity',
    'Difference',
    'Not an AI agent marketplace — the calmest business OS: one primary action per screen, human words, no jargon.',
  ),
  brand('a-tagline', 'proof', 'Tagline (fixed)', 'Mahi that earns its proof.'),
];

/**
 * The full grounding fallback: live-mirrored facts first, fixed brand lines
 * after. Passed as the fallback to `getGenomeFactsFor(ASSEMBL_TENANT, …)`
 * so DB edits win row-by-row while the locked brand lines always ride along.
 */
export const ASSEMBL_FALLBACK_FACTS: GenomeFact[] = [
  ...ASSEMBL_GENOME_FACTS,
  ...ASSEMBL_BRAND_FACTS,
];
