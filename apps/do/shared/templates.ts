/**
 * Five NZ-flavoured DEMO templates for DO Agent OS v0.
 * Honest DEMO: fixtures OK — no real scraping of locked sites.
 */

import type { DemoTemplate } from './types';

export const DEMO_TEMPLATES: DemoTemplate[] = [
  {
    id: 'price-watcher',
    name: 'Price / page watcher',
    summary: 'Watch a public page and tell you when something material changes.',
    brief: 'tell me if this changes',
    primitive: 'watch',
    watches: ['current page URL'],
    looks_for: ['price changes', 'availability flips', 'headline or stock status changes'],
    can_do_without_asking: [
      'snapshot the page text',
      'compare against the last snapshot',
      'flag a material change in Needs you',
    ],
    must_ask_before: ['send me a notification off this device'],
    never: ['buy or add to cart', 'submit forms on the page'],
  },
  {
    id: 'school-notice',
    name: 'School notice → calendar',
    summary: 'Extract dates from a school notice and draft calendar suggestions.',
    brief: 'pull the dates out of this school notice and suggest calendar entries',
    primitive: 'extract',
    fixture: 'school-notice',
    watches: ['pasted school notice', 'fixture:school-notice'],
    looks_for: ['event dates', 'pickup changes', 'mufti / sports days', 'deadlines'],
    can_do_without_asking: [
      'extract candidate dates and titles',
      'draft calendar suggestions',
    ],
    must_ask_before: ['add anything to a real calendar', 'send the notice on to others'],
    never: ['post to the school portal', 'reply to the school without a human yes'],
  },
  {
    id: 'gets-opportunity',
    name: 'GETS-like opportunity brief',
    summary: 'Find a matching opportunity from DEMO fixtures and prepare a draft brief.',
    brief: 'find a relevant tender opportunity and prepare a brief I can review',
    primitive: 'find',
    fixture: 'gets-opportunities',
    watches: ['fixture:gets-opportunities'],
    looks_for: ['keyword matches', 'closing dates', 'agency', 'category fit'],
    can_do_without_asking: [
      'search DEMO opportunity fixtures',
      'prepare a draft opportunity brief',
    ],
    must_ask_before: ['submit a response', 'register interest with an agency'],
    never: ['scrape locked GETS pages', 'lodge a tender response'],
  },
  {
    id: 'quote-compare',
    name: 'Quote compare',
    summary: 'Compare two or three quotes side by side and surface the gaps.',
    brief: 'compare these quotes and show me what differs',
    primitive: 'compare',
    fixture: 'quote-compare',
    watches: ['fixture:quote-compare', 'pasted quote text'],
    looks_for: ['price', 'inclusions', 'exclusions', 'validity', 'lead time'],
    can_do_without_asking: [
      'normalise line items',
      'draft a comparison table',
      'flag missing inclusions',
    ],
    must_ask_before: ['accept a quote', 'pay a deposit', 'sign an acceptance'],
    never: ['send acceptance to a supplier without a human yes'],
  },
  {
    id: 'kids-tomorrow',
    name: 'Kids tomorrow brief',
    summary: 'Assemble a DEMO morning brief for school-age kids from fixtures.',
    brief: 'what do the kids need tomorrow',
    primitive: 'prepare',
    fixture: 'kids-tomorrow',
    watches: ['fixture:kids-tomorrow'],
    looks_for: ['sports gear', 'permission slips', 'lunch notes', 'pickup changes'],
    can_do_without_asking: [
      'read DEMO calendar + notice fixtures',
      'draft a tomorrow brief',
    ],
    must_ask_before: ['send the brief to anyone', 'book after-school care'],
    never: ['message other parents without a human yes'],
  },
];

export function getTemplate(id: string): DemoTemplate | undefined {
  return DEMO_TEMPLATES.find((t) => t.id === id);
}
