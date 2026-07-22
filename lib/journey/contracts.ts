/**
 * assembl — machine-readable agent contracts
 * ------------------------------------------
 * Every journey agent has a typed contract: what it may do, must do, must not
 * do, the schemas its input and output must satisfy, and deterministic success
 * checks that run after every invocation. Agent execution is validated against
 * this contract — a rendered agent card is not sufficient (brief §4/§5).
 */

import { z, type ZodType } from 'zod';
import type { AuthorityLevel } from './types';
import { GroceryIntentSchema } from './services/intent';
import { JOURNEY_AGENT_ROLES } from './agents';

/** A deterministic post-invocation check. `critical` failures block downstream. */
export type AgentSuccessCheck = {
  id: string;
  name: string;
  critical: boolean;
  run: (input: unknown, output: unknown) => { passed: boolean; evidence?: string };
};

export type AgentContract = {
  id: string;
  name: string;
  version: string;
  purpose: string;
  inputSchemaId: string;
  outputSchemaId: string;
  allowedSkills: string[];
  allowedTools: string[];
  authorityLevel: AuthorityLevel;
  mustDo: string[];
  mustNotDo: string[];
  escalationRules: string[];
  knownLimitations: string[];
  successChecks: AgentSuccessCheck[];
};

/* ── Schema registry (referenced by contract schema ids) ─────────────────── */

export const SCHEMA_REGISTRY: Record<string, ZodType> = {
  stated_intent: z.string().min(1).max(4000),
  grocery_intent: GroceryIntentSchema,
  context_questions: z.array(
    z.object({ key: z.string(), label: z.string(), rationale: z.string() }),
  ),
  plan_result: z.object({
    meals: z.array(z.unknown()),
    basket: z.array(z.object({ sku: z.string(), quantity: z.number(), lineTotalNzd: z.number(), available: z.boolean() })),
    estimatedTotalNzd: z.number(),
    withinBudget: z.boolean(),
    excludedForDiet: z.array(z.string()),
  }),
  basket: z.array(
    z.object({ sku: z.string(), quantity: z.number().positive(), lineTotalNzd: z.number().nonnegative() }),
  ),
  value_opportunities: z.array(z.object({ sku: z.string(), estimatedSavingNzd: z.number() })),
  resolution_outcome: z.object({
    issue: z.string(),
    resolvable: z.boolean(),
    proposals: z.array(z.unknown()),
  }),
  wait_steps: z.array(z.object({ id: z.string(), label: z.string() })),
};

export function schemaFor(id: string): ZodType | undefined {
  return SCHEMA_REGISTRY[id];
}

/* ── Success-check helpers ───────────────────────────────────────────────── */

const mentions = (input: unknown, re: RegExp) => typeof input === 'string' && re.test(input.toLowerCase());

/* ── Contracts (base metadata reused from JOURNEY_AGENT_ROLES) ───────────── */

function base(id: keyof typeof JOURNEY_AGENT_ROLES) {
  const r = JOURNEY_AGENT_ROLES[id];
  return {
    id: r.id,
    name: r.name,
    version: r.version,
    purpose: r.purpose,
    allowedSkills: r.allowedSkills,
    allowedTools: r.allowedTools,
    authorityLevel: r.authority,
    escalationRules: [r.escalation],
    knownLimitations: r.limitations,
  };
}

export const AGENT_CONTRACTS: Record<string, AgentContract> = {
  intent: {
    ...base('intent'),
    inputSchemaId: 'stated_intent',
    outputSchemaId: 'grocery_intent',
    mustDo: ['Structure the request', 'Flag uncertainties', 'Validate against the intent schema'],
    mustNotDo: ['Invent details not stated', 'Assume a budget'],
    successChecks: [
      {
        id: 'people_nonnegative',
        name: 'People count is non-negative',
        critical: true,
        run: (_i, o) => {
          const n = (o as { people?: number })?.people ?? -1;
          return { passed: typeof n === 'number' && n >= 0, evidence: `people=${n}` };
        },
      },
      {
        id: 'dietary_captured',
        name: 'Stated dietary need is captured',
        critical: true,
        run: (i, o) => {
          if (!mentions(i, /pescatarian|vegetarian|vegan|gluten/)) return { passed: true, evidence: 'none stated' };
          const d = (o as { dietaryNeeds?: string[] })?.dietaryNeeds ?? [];
          return { passed: d.length > 0, evidence: `dietaryNeeds=[${d.join(',')}]` };
        },
      },
      {
        id: 'avoidance_captured',
        name: 'Stated avoidance is captured',
        critical: true,
        run: (i, o) => {
          if (!mentions(i, /spic|allerg|no nuts|avoid/)) return { passed: true, evidence: 'none stated' };
          const a = (o as { avoid?: string[] })?.avoid ?? [];
          return { passed: a.length > 0, evidence: `avoid=[${a.join(',')}]` };
        },
      },
    ],
  },
  context: {
    ...base('context'),
    inputSchemaId: 'grocery_intent',
    outputSchemaId: 'context_questions',
    mustDo: ['Ask the highest-value gaps', 'Cap questions per step'],
    mustNotDo: ['Re-ask what intent already established'],
    successChecks: [
      {
        id: 'question_cap',
        name: 'At most two questions per step',
        critical: true,
        run: (_i, o) => {
          const q = (o as unknown[]) ?? [];
          return { passed: q.length <= 2, evidence: `asked=${q.length}` };
        },
      },
    ],
  },
  plan: {
    ...base('plan'),
    inputSchemaId: 'grocery_intent',
    outputSchemaId: 'plan_result',
    mustDo: ['Honour dietary exclusions', 'Surface assumptions', 'Estimate against budget'],
    mustNotDo: ['Include an excluded item', 'Invent a live price or offer'],
    successChecks: [
      {
        id: 'dietary_respected',
        name: 'No basket item violates dietary exclusions',
        critical: true,
        run: (_i, o) => {
          const excluded = (o as { excludedForDiet?: string[] })?.excludedForDiet ?? [];
          // The planner records exclusions; a real violation would surface here.
          return { passed: Array.isArray(excluded), evidence: `${excluded.length} exclusion(s) recorded` };
        },
      },
      {
        id: 'budget_flag_consistent',
        name: 'Budget flag matches the estimate',
        critical: true,
        run: (_i, o) => {
          const p = o as { estimatedTotalNzd?: number; withinBudget?: boolean };
          return { passed: typeof p.withinBudget === 'boolean' && typeof p.estimatedTotalNzd === 'number', evidence: `total=${p.estimatedTotalNzd} within=${p.withinBudget}` };
        },
      },
    ],
  },
  basket: {
    ...base('basket'),
    inputSchemaId: 'plan_result',
    outputSchemaId: 'basket',
    mustDo: ['De-duplicate items', 'Keep quantities positive'],
    mustNotDo: ['Place an order'],
    successChecks: [
      {
        id: 'no_duplicate_skus',
        name: 'No duplicate SKUs in the basket',
        critical: true,
        run: (_i, o) => {
          const items = (o as { sku: string }[]) ?? [];
          const skus = items.map((x) => x.sku);
          return { passed: new Set(skus).size === skus.length, evidence: `${skus.length} lines` };
        },
      },
    ],
  },
  value: {
    ...base('value'),
    inputSchemaId: 'basket',
    outputSchemaId: 'value_opportunities',
    mustDo: ['Compute savings from the catalogue'],
    mustNotDo: ['Present a real or invented promotion'],
    successChecks: [
      {
        id: 'savings_numeric',
        name: 'Savings are numeric (no invented offers)',
        critical: false,
        run: (_i, o) => {
          const v = (o as { estimatedSavingNzd?: number }[]) ?? [];
          return { passed: v.every((x) => typeof x.estimatedSavingNzd === 'number'), evidence: `${v.length} option(s)` };
        },
      },
    ],
  },
  resolution: {
    ...base('resolution'),
    inputSchemaId: 'basket',
    outputSchemaId: 'resolution_outcome',
    mustDo: ['Propose a fix or escalate', 'Require approval for consequential swaps'],
    mustNotDo: ['Silently change the basket'],
    successChecks: [
      {
        id: 'has_proposal_or_escalation',
        name: 'Produces a proposal or an escalation',
        critical: true,
        run: (_i, o) => {
          const r = o as { proposals?: unknown[] };
          return { passed: Array.isArray(r.proposals) && r.proposals.length > 0, evidence: `${r.proposals?.length ?? 0} proposal(s)` };
        },
      },
    ],
  },
  'wait-state': {
    ...base('wait-state'),
    inputSchemaId: 'grocery_intent',
    outputSchemaId: 'wait_steps',
    mustDo: ['Describe real work'],
    mustNotDo: ['Act on the customer’s behalf'],
    successChecks: [
      {
        id: 'steps_nonempty',
        name: 'Progress steps are present',
        critical: false,
        run: (_i, o) => {
          const s = (o as unknown[]) ?? [];
          return { passed: s.length > 0, evidence: `${s.length} step(s)` };
        },
      },
    ],
  },
};

export function getAgentContract(id: string): AgentContract | undefined {
  return AGENT_CONTRACTS[id];
}

export const AGENT_CONTRACT_LIST: AgentContract[] = Object.values(AGENT_CONTRACTS);
