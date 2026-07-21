/**
 * assembl — grocery Business Genome (seed)
 * ----------------------------------------
 * The intelligence foundation for the "everyday, assembled" journey. Reuses the
 * repo's `GenomeFact` shape so this tenant reads through the same model as
 * every other assembl surface.
 *
 * ILLUSTRATIVE seed data. Fictional grocery brand ("everyday, assembled");
 * NOT Woolworths, NOT live pricing, NOT real customer data. The journey never
 * loads this whole genome — `getJourneyGenomeContext` returns only the slice a
 * stage needs (see `lib/journey/genome-context.ts`).
 */

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

/** Genome tenant key for the grocery reference journey. */
export const GROCERY_TENANT = 'everyday-assembled';

export const GROCERY_GENOME_FACTS: GenomeFact[] = [
  {
    id: 'grc-identity-name',
    section: 'identity',
    label: 'Business name',
    value: 'everyday, assembled (illustrative grocery journey — fictional)',
    readBy: ['website', 'support', 'email'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-identity-promise',
    section: 'identity',
    label: 'Customer promise',
    value: 'Tell us what life looks like. We will help assemble the shop around it.',
    readBy: ['website', 'support'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-identity-voice',
    section: 'identity',
    label: 'Brand voice',
    value: 'Warm, plain, practical. Short sentences. Never salesy. NZ English.',
    readBy: ['website', 'support', 'email'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-services-catalogue',
    section: 'services',
    label: 'What we offer',
    value: 'Groceries assembled into a plan: meals, snacks, staples, drinks, categorised for one shop.',
    readBy: ['website', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-services-segments',
    section: 'services',
    label: 'Customer segments',
    value: 'Households, holiday-house hosts, busy weeknight cooks, dietary-specific shoppers.',
    readBy: ['crm'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-ops-fulfilment',
    section: 'operations',
    label: 'Fulfilment options',
    value: 'Delivery or click-and-collect. No live order is placed in this demo — baskets are approval-ready only.',
    readBy: ['support', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-ops-terminology',
    section: 'operations',
    label: 'Terminology',
    value: 'We say "shop" not "cart", "basket" for the assembled list, "swap" for substitutions.',
    readBy: ['support', 'website'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-knowledge-dietary',
    section: 'knowledge',
    label: 'Dietary handling',
    value: 'Pescatarian excludes meat but allows fish. Spice preferences are honoured strictly — never include a spicy item for someone who avoids it.',
    readBy: ['support', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-knowledge-value',
    section: 'knowledge',
    label: 'Value guidance',
    value: 'Offer a value alternative alongside premium items. Never invent a live promotion or discount.',
    readBy: ['website'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'grc-proof-metric',
    section: 'proof',
    label: 'Success metric',
    value: 'Customer minutes saved vs planning a shop manually; preference adherence; basket within budget.',
    readBy: ['website'],
    source: 'seed',
    verification: 'confirmed',
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * Typed business rules the journey enforces. These sit beside the genome facts
 * (which are prose for humans/surfaces) and give the runtime machine-checkable
 * policy. A real tenant would author these in the composer.
 * ──────────────────────────────────────────────────────────────────────── */

export type RecommendationRule = {
  id: string;
  label: string;
  detail: string;
};

export type ApprovalRule = {
  id: string;
  /** Action type this rule governs. */
  actionType: string;
  requiresApproval: boolean;
  reason: string;
};

export type EscalationRule = {
  id: string;
  when: string;
  toRole: string;
};

export type GroceryBusinessRules = {
  recommendation: RecommendationRule[];
  approval: ApprovalRule[];
  escalation: EscalationRule[];
  /** How many context questions to ask at once (progressive disclosure). */
  maxQuestionsPerStep: number;
  /** Budget headroom tolerated before flagging an excess (fraction). */
  budgetTolerance: number;
};

export const GROCERY_RULES: GroceryBusinessRules = {
  recommendation: [
    { id: 'rec-dietary-strict', label: 'Dietary exclusions are hard rules', detail: 'Never recommend an item that violates a stated dietary exclusion.' },
    { id: 'rec-value-pair', label: 'Pair premium with value', detail: 'When suggesting a premium item, surface a value swap.' },
    { id: 'rec-no-fake-offers', label: 'No invented offers', detail: 'Never present a loyalty or discount offer that is not real.' },
    { id: 'rec-low-waste', label: 'Reduce duplication', detail: 'Avoid recommending duplicate ingredients across meals.' },
  ],
  approval: [
    { id: 'apr-basket', actionType: 'assemble_basket', requiresApproval: true, reason: 'The customer confirms the plan before anything is prepared.' },
    { id: 'apr-substitution', actionType: 'apply_substitution', requiresApproval: true, reason: 'Swaps change what the customer receives.' },
    { id: 'apr-save-prefs', actionType: 'save_household_preferences', requiresApproval: true, reason: 'Storing preferences is the customer’s choice.' },
    { id: 'apr-summarise', actionType: 'summarise_plan', requiresApproval: false, reason: 'Summaries are low-risk internal drafting.' },
  ],
  escalation: [
    { id: 'esc-cannot-resolve', when: 'A conflict cannot be resolved within budget and dietary rules', toRole: 'human' },
    { id: 'esc-repeat-reject', when: 'The customer rejects the same proposal twice', toRole: 'human' },
  ],
  maxQuestionsPerStep: 2,
  budgetTolerance: 0.05,
};
