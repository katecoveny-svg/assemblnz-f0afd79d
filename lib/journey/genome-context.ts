/**
 * assembl — journey genome-context selector
 * ------------------------------------------
 * Context selection is a product feature. An agent working a stage receives
 * ONLY the genome slice that stage needs — never the whole Business Genome.
 * This keeps agent calls cheap, focused and auditable (the returned facts
 * become the evidence trail for that stage).
 *
 * The core `selectGenomeContext` is a pure function over facts + rules so it is
 * trivially testable and reusable across tenants. `getJourneyGenomeContext`
 * is the async convenience wrapper the runtime calls; for the seed grocery
 * tenant it resolves the static fallback facts (no DB round-trip required).
 */

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import type { JourneyStageType } from './types';
import {
  GROCERY_GENOME_FACTS,
  GROCERY_RULES,
  GROCERY_TENANT,
  type GroceryBusinessRules,
  type ApprovalRule,
  type EscalationRule,
  type RecommendationRule,
} from './genome/grocery-genome';

export type JourneyGenomeContext = {
  tenantId: string;
  journeyId: string;
  stageId: string;
  stageType: JourneyStageType;
  /** The stage-relevant facts only. */
  facts: GenomeFact[];
  brandVoice?: string;
  terminology?: string;
  recommendationRules: RecommendationRule[];
  approvalRules: ApprovalRule[];
  escalationRules: EscalationRule[];
};

/**
 * Which genome fact ids and rule sets each stage type is allowed to see.
 * Deliberately conservative — if a stage does not need a fact, it does not
 * receive it.
 */
const STAGE_FACT_IDS: Record<JourneyStageType, string[]> = {
  entry: ['grc-identity-name', 'grc-identity-promise', 'grc-identity-voice'],
  intent: ['grc-identity-voice', 'grc-knowledge-dietary'],
  context: ['grc-ops-terminology', 'grc-services-segments', 'grc-knowledge-dietary'],
  recommendation: ['grc-services-catalogue', 'grc-knowledge-dietary', 'grc-knowledge-value'],
  commitment: ['grc-ops-terminology'],
  action: ['grc-ops-fulfilment'],
  wait: ['grc-identity-voice'],
  fulfilment: ['grc-ops-fulfilment', 'grc-identity-promise'],
  resolution: ['grc-knowledge-dietary', 'grc-knowledge-value'],
  continuation: ['grc-proof-metric'],
};

const STAGE_WANTS_RECOMMENDATION: JourneyStageType[] = ['recommendation', 'resolution'];
const STAGE_WANTS_APPROVAL: JourneyStageType[] = ['commitment', 'action', 'resolution', 'continuation'];
const STAGE_WANTS_ESCALATION: JourneyStageType[] = ['resolution', 'action'];

export type SelectGenomeInput = {
  tenantId: string;
  journeyId: string;
  stageId: string;
  stageType: JourneyStageType;
  facts: GenomeFact[];
  rules: GroceryBusinessRules;
};

/** Pure selector — returns the stage-scoped slice. */
export function selectGenomeContext(input: SelectGenomeInput): JourneyGenomeContext {
  const wantedIds = new Set(STAGE_FACT_IDS[input.stageType] ?? []);
  const facts = input.facts.filter((f) => wantedIds.has(f.id));

  const brandVoice = facts.find((f) => f.id === 'grc-identity-voice')?.value;
  const terminology = facts.find((f) => f.id === 'grc-ops-terminology')?.value;

  return {
    tenantId: input.tenantId,
    journeyId: input.journeyId,
    stageId: input.stageId,
    stageType: input.stageType,
    facts,
    brandVoice,
    terminology,
    recommendationRules: STAGE_WANTS_RECOMMENDATION.includes(input.stageType)
      ? input.rules.recommendation
      : [],
    approvalRules: STAGE_WANTS_APPROVAL.includes(input.stageType) ? input.rules.approval : [],
    escalationRules: STAGE_WANTS_ESCALATION.includes(input.stageType) ? input.rules.escalation : [],
  };
}

export type GetJourneyGenomeContextArgs = {
  tenantId: string;
  journeyId: string;
  stageId: string;
  stageType: JourneyStageType;
  /** Reserved: a stage may personalise which facts it needs from context. */
  customerContext?: Record<string, unknown>;
  /** Override facts (tests / other tenants). Defaults to the grocery seed. */
  facts?: GenomeFact[];
  rules?: GroceryBusinessRules;
};

/**
 * Async wrapper the runtime calls. For the grocery tenant it uses the static
 * seed facts. A real tenant would resolve `getGenomeFactsFor(tenantId, …)`
 * here (server-only) and pass the result into `selectGenomeContext`.
 */
export async function getJourneyGenomeContext(
  args: GetJourneyGenomeContextArgs,
): Promise<JourneyGenomeContext> {
  const facts =
    args.facts ?? (args.tenantId === GROCERY_TENANT ? GROCERY_GENOME_FACTS : []);
  const rules = args.rules ?? GROCERY_RULES;
  return selectGenomeContext({
    tenantId: args.tenantId,
    journeyId: args.journeyId,
    stageId: args.stageId,
    stageType: args.stageType,
    facts,
    rules,
  });
}
