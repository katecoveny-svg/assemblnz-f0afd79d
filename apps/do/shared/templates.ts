/**
 * Launch template catalog for DO Agent OS v0.
 * Data-driven — used by /do, Chrome ✦ widget, and GET /api/do/templates.
 * DEMO honesty: fixtures only; no live scrapes of locked sites.
 *
 * Public catalog excludes Mitre 10 / SAP pursuit pack — that pack is private
 * (`/do/pursuit/mitre10` + `?pack=mitre10` on the templates API).
 */

import type { DemoTemplate, TemplateLane, TemplatePack } from './types';

export const LANE_LABELS: Record<TemplateLane, string> = {
  'creative-ensemble': 'Creative / Ensemble',
  'personal-household': 'Personal / Household',
  'bills-money': 'Bills / Money',
  'work-pursuit': 'Work / Pursuit',
  'study-family': 'Study / Family',
  'retail-ops': 'Retail / Ops',
  sme: 'SME',
  'pursuit-mitre10-sap': 'Mitre 10 · SAP pursuit (private)',
};

/** Public lane order — no Mitre/SAP. */
export const LANE_ORDER: TemplateLane[] = [
  'creative-ensemble',
  'personal-household',
  'bills-money',
  'work-pursuit',
  'study-family',
  'retail-ops',
  'sme',
];

export const PRIVATE_LANE_ORDER: TemplateLane[] = ['pursuit-mitre10-sap'];

const MITRE_TEMPLATE_IDS = new Set([
  'mitre10-sap-rfp-brief',
  'mitre10-sap-competitor-watch',
  'mitre10-sap-stakeholder-map',
  'mitre10-sap-proposal-compare',
  'mitre10-sap-next-meeting',
]);

export function isMitreTemplateId(id: string): boolean {
  return MITRE_TEMPLATE_IDS.has(id);
}

export function isPublicTemplate(t: DemoTemplate): boolean {
  return t.lane !== 'pursuit-mitre10-sap' && !isMitreTemplateId(t.id);
}

export const DEMO_TEMPLATES: DemoTemplate[] = [
  // ── Creative / Ensemble (Assembl Studio creative-director language) ──
  {
    id: 'creative-web-director',
    name: 'Creative web director',
    summary: 'Three art directions, visual targets, craft critique — asks before publish.',
    brief:
      'create a creative agent that could direct web design — three art directions, visual targets, craft critique',
    primitive: 'prepare',
    lane: 'creative-ensemble',
    watches: ['current page URL', 'brand refs', 'brief'],
    looks_for: [
      'brand cues on the page',
      'brief constraints',
      'reference tones',
      'composition opportunities',
    ],
    can_do_without_asking: [
      'draft three materially different art directions',
      'propose visual targets (desktop hero, mobile, key interaction, motion board)',
      'run craft critique against Assembl Studio creative-director checks',
    ],
    must_ask_before: ['publish', 'export', 'send'],
    never: [
      'publish or ship without a human yes',
      'claim a live brand system write-back',
    ],
  },

  // ── Mitre 10 / SAP Pursuit pack (PRIVATE — not on public /do) ──
  {
    id: 'mitre10-sap-rfp-brief',
    name: 'RFP → pursuit brief',
    summary: 'From this RFP or page, extract requirements, deadlines, and SAP touchpoints.',
    brief: 'prepare a pursuit brief from this RFP — requirements, deadlines, SAP touchpoints',
    primitive: 'prepare',
    lane: 'pursuit-mitre10-sap',
    connectorHint: 'sap',
    fixture: 'mitre10-sap-rfp',
    watches: ['fixture:mitre10-sap-rfp', 'current page URL'],
    looks_for: ['requirements', 'closing date', 'SAP modules / landscape', 'evaluation criteria'],
    can_do_without_asking: [
      'extract requirements and deadlines from DEMO RFP text',
      'map named SAP touchpoints',
      'draft a pursuit brief with Evidence',
    ],
    must_ask_before: ['send the brief to anyone', 'file a response'],
    never: ['submit a bid', 'email the buyer without a human yes'],
  },
  {
    id: 'mitre10-sap-competitor-watch',
    name: 'Competitor / tender page watch',
    summary: 'Watch this competitor or tender page and flag material changes.',
    brief: 'watch this competitor / tender page for changes',
    primitive: 'watch',
    lane: 'pursuit-mitre10-sap',
    connectorHint: 'sap',
    fixture: 'mitre10-sap-competitor',
    watches: ['fixture:mitre10-sap-competitor', 'current page URL'],
    looks_for: ['pricing claims', 'capability statements', 'case study swaps', 'deadline shifts'],
    can_do_without_asking: [
      'snapshot the DEMO competitor page',
      'diff against the last snapshot',
      'attach DO Evidence when a change is found',
    ],
    must_ask_before: ['send a notification off this device'],
    never: ['scrape locked competitor portals', 'contact the competitor'],
  },
  {
    id: 'mitre10-sap-stakeholder-map',
    name: 'Stakeholder map',
    summary: 'Extract stakeholders and the decision path from this doc or page.',
    brief: 'extract stakeholders and decision path from this document',
    primitive: 'extract',
    lane: 'pursuit-mitre10-sap',
    fixture: 'mitre10-sap-stakeholders',
    watches: ['fixture:mitre10-sap-stakeholders', 'current page URL'],
    looks_for: ['named roles', 'decision makers', 'influencers', 'approval path'],
    can_do_without_asking: [
      'pull named people and roles from DEMO text',
      'draft a decision-path sketch',
    ],
    must_ask_before: ['send the map to the account team'],
    never: ['contact named people without a human yes'],
  },
  {
    id: 'mitre10-sap-proposal-compare',
    name: 'Proposal vs requirements',
    summary: 'Compare our draft against their requirements checklist.',
    brief: 'compare our draft proposal against their requirements checklist',
    primitive: 'compare',
    lane: 'pursuit-mitre10-sap',
    connectorHint: 'sap',
    fixture: 'mitre10-sap-proposal-compare',
    watches: ['fixture:mitre10-sap-proposal-compare'],
    looks_for: ['covered requirements', 'gaps', 'SAP module fit', 'risk language'],
    can_do_without_asking: [
      'normalise the checklist',
      'draft a gap table',
      'flag uncovered must-haves',
    ],
    must_ask_before: ['send the comparison to the buyer', 'submit a revised proposal'],
    never: ['lodge a response without a human yes'],
  },
  {
    id: 'mitre10-sap-next-meeting',
    name: 'Next meeting pack',
    summary: 'Prepare the next meeting pack from this thread or page — asks before send.',
    brief: 'prepare next meeting pack from this thread — agenda, open questions, asks first before send',
    primitive: 'prepare',
    lane: 'pursuit-mitre10-sap',
    connectorHint: 'email',
    fixture: 'mitre10-sap-meeting',
    watches: ['fixture:mitre10-sap-meeting', 'current page URL'],
    looks_for: ['open actions', 'agenda items', 'decisions needed', 'SAP landscape notes'],
    can_do_without_asking: [
      'draft agenda + open questions from DEMO thread',
      'attach Evidence of sources used',
    ],
    must_ask_before: ['send the pack to attendees', 'book a meeting'],
    never: ['email or invite without a human yes'],
  },

  // ── Personal / Household ──
  {
    id: 'power-price-watch',
    name: 'Power price watch',
    summary: 'Detect a fixture power-price page change (v1 → v2).',
    brief: 'did this power price change?',
    primitive: 'watch',
    lane: 'personal-household',
    fixture: 'power-price-watch',
    watches: ['fixture:power-price-watch'],
    looks_for: ['c/kWh rate changes', 'effective-from date'],
    can_do_without_asking: [
      'snapshot the DEMO price card',
      'diff against the last snapshot',
      'attach DO Evidence when a change is found',
    ],
    must_ask_before: ['send me a notification off this device'],
    never: ['switch plans', 'pay a bill', 'submit a form'],
  },
  {
    id: 'plan-compare',
    name: 'Plan compare',
    summary: 'Compare two power or broadband plans side by side.',
    brief: 'compare these plans and show what differs on price and terms',
    primitive: 'compare',
    lane: 'personal-household',
    fixture: 'plan-compare',
    watches: ['fixture:plan-compare', 'pasted plan text'],
    looks_for: ['monthly cost', 'contract length', 'exit fees', 'inclusions'],
    can_do_without_asking: ['draft a comparison table', 'flag exit-fee traps'],
    must_ask_before: ['switch plans', 'sign a contract'],
    never: ['submit a switch without a human yes'],
  },
  {
    id: 'school-notice-tomorrow',
    name: 'School notice → tomorrow',
    summary: 'Pull tomorrow’s actions from a school notice.',
    brief: 'what from this school notice matters for tomorrow',
    primitive: 'extract',
    lane: 'personal-household',
    connectorHint: 'calendar',
    fixture: 'school-notice',
    watches: ['pasted school notice', 'fixture:school-notice'],
    looks_for: ['event dates', 'pickup changes', 'mufti / sports days', 'deadlines'],
    can_do_without_asking: ['extract candidate dates and titles', 'draft tomorrow actions'],
    must_ask_before: ['add anything to a real calendar', 'send the notice on to others'],
    never: ['post to the school portal', 'reply to the school without a human yes'],
  },
  {
    id: 'physio-cancellation-watch',
    name: 'Physio cancellation watch',
    summary: 'Watch a booking page for an earlier physio slot.',
    brief: 'watch for a physio cancellation or earlier slot',
    primitive: 'watch',
    lane: 'personal-household',
    fixture: 'physio-slots',
    watches: ['fixture:physio-slots', 'current page URL'],
    looks_for: ['new openings', 'cancellations', 'earlier times'],
    can_do_without_asking: ['snapshot the DEMO slot list', 'flag a new opening under Needs you'],
    must_ask_before: ['book the slot'],
    never: ['book or pay without a human yes'],
  },
  {
    id: 'tradie-find-availability',
    name: 'Tradie find + availability',
    summary: 'Find DEMO tradies who can do the job and when they are free.',
    brief: 'find a tradie who can do this job and show availability',
    primitive: 'find',
    lane: 'personal-household',
    fixture: 'tradie-availability',
    watches: ['fixture:tradie-availability'],
    looks_for: ['trade match', 'earliest available', 'call-out area'],
    can_do_without_asking: ['search DEMO tradie fixtures', 'draft a shortlist'],
    must_ask_before: ['book a visit', 'send a message to a tradie'],
    never: ['book or pay without a human yes'],
  },

  // ── Bills / Money ──
  {
    id: 'recurring-expense-find',
    name: 'Recurring expense find',
    summary: 'Find repeating charges from DEMO statements.',
    brief: 'find recurring expenses on this statement',
    primitive: 'find',
    lane: 'bills-money',
    fixture: 'recurring-expenses',
    watches: ['fixture:recurring-expenses'],
    looks_for: ['monthly charges', 'subscriptions', 'amount drift'],
    can_do_without_asking: ['scan DEMO statement lines', 'draft a recurring list'],
    must_ask_before: ['cancel a subscription', 'pay anything'],
    never: ['move money without a human yes'],
  },
  {
    id: 'invoice-extract',
    name: 'Invoice extract',
    summary: 'Pull totals, due dates, and supplier from an invoice.',
    brief: 'extract totals, due date, and supplier from this invoice',
    primitive: 'extract',
    lane: 'bills-money',
    fixture: 'invoice-extract',
    watches: ['fixture:invoice-extract', 'pasted invoice text'],
    looks_for: ['supplier', 'total due', 'due date', 'GST'],
    can_do_without_asking: ['extract fields', 'draft a payment reminder note'],
    must_ask_before: ['pay the invoice', 'forward it'],
    never: ['pay or submit without a human yes'],
  },
  {
    id: 'quote-compare',
    name: 'Quote compare',
    summary: 'Compare two or three quotes side by side and surface the gaps.',
    brief: 'compare these quotes and show me what differs',
    primitive: 'compare',
    lane: 'bills-money',
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

  // ── Work / Pursuit ──
  {
    id: 'gets-opportunity',
    name: 'GETS-like find more',
    summary: 'Find a matching opportunity from DEMO fixtures and prepare a draft brief.',
    brief: 'find a relevant tender opportunity and prepare a brief I can review',
    primitive: 'find',
    lane: 'work-pursuit',
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
    id: 'prepare-bid-brief',
    name: 'Prepare bid brief',
    summary: 'Turn this page or tender text into a short bid brief.',
    brief: 'prepare a bid brief from this tender page',
    primitive: 'prepare',
    lane: 'work-pursuit',
    fixture: 'bid-brief',
    watches: ['fixture:bid-brief', 'current page URL'],
    looks_for: ['scope', 'deadline', 'evaluation criteria', 'must-haves'],
    can_do_without_asking: ['draft a one-page bid brief', 'list open questions'],
    must_ask_before: ['send the brief to the bid team', 'submit interest'],
    never: ['lodge a response without a human yes'],
  },
  {
    id: 'competitor-page-watch',
    name: 'Competitor page watch',
    summary: 'Watch a competitor page for material changes.',
    brief: 'watch this competitor page for changes',
    primitive: 'watch',
    lane: 'work-pursuit',
    fixture: 'competitor-page',
    watches: ['fixture:competitor-page', 'current page URL'],
    looks_for: ['pricing', 'product claims', 'case studies', 'hiring signals'],
    can_do_without_asking: ['snapshot the page', 'flag material changes'],
    must_ask_before: ['send a notification off this device'],
    never: ['contact the competitor', 'scrape locked portals'],
  },
  {
    id: 'meeting-prep',
    name: 'Meeting prep',
    summary: 'Assemble a meeting pack from this thread or page.',
    brief: 'prepare a meeting pack from this page — agenda and open questions',
    primitive: 'prepare',
    lane: 'work-pursuit',
    connectorHint: 'calendar',
    fixture: 'meeting-prep',
    watches: ['fixture:meeting-prep', 'current page URL'],
    looks_for: ['agenda items', 'open actions', 'decisions needed'],
    can_do_without_asking: ['draft agenda + open questions'],
    must_ask_before: ['send the pack', 'book the meeting'],
    never: ['email or invite without a human yes'],
  },

  // ── Study / Family ──
  {
    id: 'explain-until-solve',
    name: 'Explain until I can solve',
    summary: 'Tutor mode — explain the problem so I can solve it myself. Not a cheat sheet.',
    brief: 'explain this until I can solve it myself — hints, not answers',
    primitive: 'prepare',
    lane: 'study-family',
    fixture: 'study-tutor',
    watches: ['fixture:study-tutor', 'selected text'],
    looks_for: ['concepts to unlock', 'worked hint steps', 'check questions'],
    can_do_without_asking: ['draft scaffolded hints', 'pose a check question'],
    must_ask_before: ['share the full worked answer'],
    never: ['submit schoolwork', 'impersonate a student'],
  },
  {
    id: 'newsletter-to-calendar',
    name: 'Newsletter → calendar actions',
    summary: 'Turn newsletter dates into draft calendar actions.',
    brief: 'pull dates from this newsletter and suggest calendar actions',
    primitive: 'extract',
    lane: 'study-family',
    connectorHint: 'calendar',
    fixture: 'newsletter-calendar',
    watches: ['fixture:newsletter-calendar', 'pasted newsletter'],
    looks_for: ['event dates', 'deadlines', 'RSVP links'],
    can_do_without_asking: ['extract candidate events', 'draft calendar suggestions'],
    must_ask_before: ['add to a real calendar', 'RSVP'],
    never: ['RSVP or post without a human yes'],
  },
  {
    id: 'kids-tomorrow',
    name: 'Kids tomorrow brief',
    summary: 'Assemble a DEMO morning brief for school-age kids from fixtures.',
    brief: 'what do the kids need tomorrow',
    primitive: 'prepare',
    lane: 'study-family',
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

  // ── Retail / Ops ──
  {
    id: 'stock-page-watch',
    name: 'Stock / page watch',
    summary: 'Watch a product or stock page for availability flips.',
    brief: 'tell me if this stock or product page changes',
    primitive: 'watch',
    lane: 'retail-ops',
    fixture: 'stock-page',
    watches: ['fixture:stock-page', 'current page URL'],
    looks_for: ['in-stock flips', 'price changes', 'SKU notes'],
    can_do_without_asking: ['snapshot the page', 'flag material changes'],
    must_ask_before: ['send a notification off this device'],
    never: ['buy or add to cart', 'submit forms'],
  },
  {
    id: 'supplier-quote-compare',
    name: 'Supplier quote compare',
    summary: 'Compare supplier quotes for a retail / ops order.',
    brief: 'compare these supplier quotes for the order',
    primitive: 'compare',
    lane: 'retail-ops',
    fixture: 'supplier-quotes',
    watches: ['fixture:supplier-quotes'],
    looks_for: ['unit price', 'MOQ', 'lead time', 'freight'],
    can_do_without_asking: ['draft a comparison table', 'flag MOQ traps'],
    must_ask_before: ['accept a quote', 'place an order'],
    never: ['place an order without a human yes'],
  },
  {
    id: 'store-notice-extract',
    name: 'Store notice extract',
    summary: 'Extract actions and dates from a store ops notice.',
    brief: 'extract actions and dates from this store notice',
    primitive: 'extract',
    lane: 'retail-ops',
    fixture: 'store-notice',
    watches: ['fixture:store-notice', 'pasted notice'],
    looks_for: ['deadlines', 'roster changes', 'promo windows'],
    can_do_without_asking: ['extract actions', 'draft a short ops list'],
    must_ask_before: ['send the list to the store team'],
    never: ['post to staff channels without a human yes'],
  },

  // ── SME ──
  {
    id: 'xero-recurring-cost-watch',
    name: 'Xero recurring cost watch',
    summary: 'Watch DEMO recurring costs (Xero connector stub — hook later).',
    brief: 'watch recurring costs in Xero and tell me if they jump',
    primitive: 'watch',
    lane: 'sme',
    connectorHint: 'xero',
    fixture: 'xero-recurring',
    watches: ['fixture:xero-recurring'],
    looks_for: ['amount jumps', 'new recurring lines', 'supplier renames'],
    can_do_without_asking: [
      'read DEMO recurring cost fixtures',
      'flag a jump under Needs you',
    ],
    must_ask_before: ['send a notification off this device', 'cancel a bill'],
    never: ['pay or edit Xero without a human yes', 'claim a live Xero connection'],
  },
  {
    id: 'customer-follow-up-draft',
    name: 'Customer follow-up draft',
    summary: 'Draft a follow-up from this thread — asks first before send.',
    brief: 'draft a customer follow-up from this thread — ask me before send',
    primitive: 'prepare',
    lane: 'sme',
    connectorHint: 'email',
    fixture: 'customer-follow-up',
    watches: ['fixture:customer-follow-up', 'current page URL'],
    looks_for: ['open promises', 'tone', 'next step'],
    can_do_without_asking: ['draft a follow-up note from DEMO thread'],
    must_ask_before: ['send the email'],
    never: ['send without a human yes'],
  },

  // ── General (kept for “tell me if this changes”) ──
  {
    id: 'price-watcher',
    name: 'Price / page watcher',
    summary: 'Watch a public page and tell you when something material changes.',
    brief: 'tell me if this changes',
    primitive: 'watch',
    lane: 'personal-household',
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
];

export function getTemplate(id: string): DemoTemplate | undefined {
  return DEMO_TEMPLATES.find((t) => t.id === id);
}

export function templatesForPack(pack: TemplatePack = 'public'): DemoTemplate[] {
  if (pack === 'mitre10') {
    return DEMO_TEMPLATES.filter((t) => t.lane === 'pursuit-mitre10-sap');
  }
  return DEMO_TEMPLATES.filter(isPublicTemplate);
}

export function templatesByLane(
  pack: TemplatePack = 'public',
): { lane: TemplateLane; label: string; templates: DemoTemplate[] }[] {
  const order = pack === 'mitre10' ? PRIVATE_LANE_ORDER : LANE_ORDER;
  const pool = templatesForPack(pack);
  return order
    .map((lane) => ({
      lane,
      label: LANE_LABELS[lane],
      templates: pool.filter((t) => t.lane === lane),
    }))
    .filter((g) => g.templates.length > 0);
}
