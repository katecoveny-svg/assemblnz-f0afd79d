/**
 * assembl — journey specialist agent roles
 * ----------------------------------------
 * Every journey is supported by specialist roles, not one giant assistant. The
 * customer may never know these exist; internally they collaborate through the
 * runtime. Each role declares its contract, tools, authority, escalation and
 * limitations so the "inside the journey" view can show exactly who did what.
 *
 * Authority maps onto the shared ladder in `lib/journey/types.ts` (which mirrors
 * the OS risk ladder in `lib/os/policy.ts`): nothing above `act_with_approval`
 * is exercised by any seed journey.
 */

import type { AuthorityLevel } from './types';

export type JourneyAgentRole = {
  id: string;
  name: string;
  role: string;
  purpose: string;
  /** What the role expects to receive. */
  inputContract: string;
  /** What the role is contracted to produce. */
  outputContract: string;
  allowedSkills: string[];
  /** Capability keys (align with lib/os/capabilities.ts where connected). */
  allowedTools: string[];
  authority: AuthorityLevel;
  escalation: string;
  limitations: string[];
  /** Stable version so proof can record which agent produced an output. */
  version: string;
};

export const JOURNEY_AGENT_ROLES: Record<string, JourneyAgentRole> = {
  intent: {
    id: 'intent',
    name: 'Intent',
    role: 'intent agent',
    purpose: 'Interpret natural language, identify the customer goal, structure constraints, flag uncertainty.',
    inputContract: 'A free-text statement of what the customer needs.',
    outputContract: 'A validated structured intent + a confidence score + explicit uncertainties.',
    allowedSkills: ['language-understanding', 'constraint-extraction'],
    allowedTools: ['read_genome'],
    authority: 'recommend',
    escalation: 'If the request is unintelligible, ask for a rephrase rather than guessing.',
    limitations: ['Does not invent facts about the customer.', 'Flags low confidence instead of assuming.'],
    version: '1.0.0',
  },
  context: {
    id: 'context',
    name: 'Context',
    role: 'context agent',
    purpose: 'Identify important missing information and ask the smallest useful next question. Avoid repetitive questioning.',
    inputContract: 'The structured intent + which context is already known/answered.',
    outputContract: 'At most one or two ranked questions, each with a reason it improves the outcome.',
    allowedSkills: ['gap-analysis', 'question-ranking'],
    allowedTools: ['read_genome'],
    authority: 'recommend',
    escalation: 'Never blocks the journey; if nothing high-value is missing, it asks nothing.',
    limitations: ['Never re-asks what intent already established.', 'Caps questions per step.'],
    version: '1.0.0',
  },
  plan: {
    id: 'plan',
    name: 'Plan',
    role: 'plan agent',
    purpose: 'Create meal / product recommendations, apply business rules, expose assumptions.',
    inputContract: 'Structured intent + stage-scoped genome context + catalogue.',
    outputContract: 'Meal ideas + grouped recommendations + surfaced assumptions.',
    allowedSkills: ['meal-planning', 'rule-application'],
    allowedTools: ['read_genome', 'search_knowledge'],
    authority: 'recommend',
    escalation: 'If dietary rules leave no viable plan, hand to resolution/human.',
    limitations: ['Dietary exclusions are hard rules.', 'Never invents live offers or prices.'],
    version: '1.0.0',
  },
  basket: {
    id: 'basket',
    name: 'Basket',
    role: 'basket agent',
    purpose: 'Convert the plan into an actionable structured basket; group items; avoid duplication; estimate against budget.',
    inputContract: 'The approved/edited plan.',
    outputContract: 'A de-duplicated basket with quantities, line totals and a budget estimate.',
    allowedSkills: ['basket-assembly', 'budget-estimation'],
    allowedTools: ['read_genome'],
    authority: 'draft',
    escalation: 'Flags budget excess to the resolution agent.',
    limitations: ['Prepares only — never places an order.', 'Prices are indicative, not live.'],
    version: '1.0.0',
  },
  value: {
    id: 'value',
    name: 'Value',
    role: 'value agent',
    purpose: 'Identify genuine savings, loyalty or simplification opportunities.',
    inputContract: 'The basket + catalogue tiers.',
    outputContract: 'Value swaps with indicative savings — never a misrepresented offer.',
    allowedSkills: ['value-analysis'],
    allowedTools: ['read_genome'],
    authority: 'recommend',
    escalation: 'None — advisory only.',
    limitations: ['Never presents an offer that is not real.'],
    version: '1.0.0',
  },
  resolution: {
    id: 'resolution',
    name: 'Resolution',
    role: 'resolution agent',
    purpose: 'Handle availability, budget or preference conflicts; propose alternatives; escalate when rules cannot safely resolve.',
    inputContract: 'The basket + the conflict (unavailable item / over budget).',
    outputContract: 'Resolution proposals (swap/remove) requiring approval, or an escalation.',
    allowedSkills: ['conflict-resolution', 'substitution'],
    allowedTools: ['read_genome'],
    authority: 'act_with_approval',
    escalation: 'Escalates to a human when it cannot resolve within budget and dietary rules.',
    limitations: ['Consequential swaps always require approval.'],
    version: '1.0.0',
  },
  'wait-state': {
    id: 'wait-state',
    name: 'Wait',
    role: 'wait-state agent',
    purpose: 'Communicate progress, gather useful context, keep the customer in control, turn latency into visible value.',
    inputContract: 'The current run + the stage being assembled.',
    outputContract: 'Ordered, truthful progress steps the customer can review and influence.',
    allowedSkills: ['progress-narration'],
    allowedTools: ['read_genome'],
    authority: 'draft',
    escalation: 'None — never acts on the customer’s behalf.',
    limitations: ['Describes only work that is actually happening.'],
    version: '1.0.0',
  },
};

export function getJourneyAgentRole(id: string): JourneyAgentRole | undefined {
  return JOURNEY_AGENT_ROLES[id];
}

export const JOURNEY_AGENT_ROLE_LIST: JourneyAgentRole[] = Object.values(JOURNEY_AGENT_ROLES);
