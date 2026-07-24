/**
 * assembl — agentic customer journey · public surface
 * ---------------------------------------------------
 * One reusable journey object powering the composer, the runtime, the customer
 * interface, the evaluation suite and the Proof dashboard. The "everyday,
 * assembled" grocery journey is the first configuration; the whole system is
 * tenant- and journey-agnostic.
 */

export * from './types';
export * from './status';
export * from './agents';
export * from './catalogue';
export * from './genome-context';
export * from './runtime';
export * from './proof';
export * from './repository';

export {
  GroceryIntentSchema,
  parseGroceryIntent,
  mockIntentService,
  liveIntentService,
  type GroceryIntent,
  type IntentParseResult,
  type IntentService,
} from './services/intent';
export {
  nextContextQuestions,
  contextComplete,
  deriveKnownContextKeys,
  type ContextQuestion,
} from './services/context';
export {
  assemblePlan,
  dietaryExclusions,
  type PlanResult,
  type BasketItem,
  type ValueOpportunity,
} from './services/plan';
export {
  resolveUnavailableItems,
  resolveBudget,
  type ResolutionOutcome,
  type ResolutionProposal,
} from './services/resolution';

export {
  everydayAssembledJourney,
  EVERYDAY_ASSEMBLED_ID,
  SEED_HOUSEHOLD,
} from './journeys/everyday-assembled';
export {
  GROCERY_TENANT,
  GROCERY_GENOME_FACTS,
  GROCERY_RULES,
} from './genome/grocery-genome';
