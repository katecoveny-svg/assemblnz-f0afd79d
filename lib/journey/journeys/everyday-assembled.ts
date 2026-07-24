/**
 * assembl — "everyday, assembled" reference journey
 * -------------------------------------------------
 * The first production reference journey. An agentic grocery journey that turns
 * a natural-language intention into a personalised, approval-ready shop.
 *
 * This is a CONFIGURATION of the reusable journey model — no journey-specific
 * logic lives in the UI or runtime. To add a second journey (energy, airline,
 * trades…) a developer authors another object of this shape; the runtime,
 * approvals, wait state and proof are unchanged.
 *
 * The friction moment it improves: households abandon or under-plan a shop when
 * the mental load of "what do seven people eat for three days, minus the things
 * two of them won't touch" is too high. That is the one measurable moment.
 */

import { GROCERY_TENANT } from '../genome/grocery-genome';
import type {
  CustomerContextField,
  CustomerJourney,
  JourneyStage,
  WaitStateModule,
} from '../types';

export const EVERYDAY_ASSEMBLED_ID = 'everyday-assembled';
const SEED_TS = '2026-07-21T00:00:00.000Z';

const contextFields: CustomerContextField[] = [
  {
    key: 'budget',
    label: 'Roughly what would you like to spend?',
    rationale: 'A ceiling lets us keep the basket honest and flag anything over.',
    importance: 'high',
    kind: 'number',
    required: false,
  },
  {
    key: 'fulfilment',
    label: 'Delivery or click-and-collect?',
    rationale: 'It changes what we can assemble and when it can arrive.',
    importance: 'high',
    kind: 'choice',
    choices: ['Delivery', 'Click-and-collect'],
    required: false,
  },
  {
    key: 'staples',
    label: 'Anything already in the cupboard we should skip?',
    rationale: 'We avoid buying what you already have — less waste, lower total.',
    importance: 'medium',
    kind: 'text',
    required: false,
  },
  {
    key: 'equipment',
    label: 'What can you cook with there — oven, BBQ, just a stovetop?',
    rationale: 'We only suggest meals you can actually make at the bach.',
    importance: 'medium',
    kind: 'choice',
    choices: ['Full kitchen', 'Stovetop only', 'BBQ', 'Microwave only'],
    required: false,
  },
  {
    key: 'brands',
    label: 'Any brands you prefer or avoid?',
    rationale: 'We match your usual choices where we can.',
    importance: 'low',
    kind: 'text',
    required: false,
  },
  {
    key: 'depth',
    label: 'Want meal ideas too, or just the basket?',
    rationale: 'Some people want the plan, some just want the shop assembled.',
    importance: 'low',
    kind: 'choice',
    choices: ['Meal ideas + basket', 'Just the basket'],
    required: false,
  },
];

function stage(
  s: Omit<JourneyStage, 'journeyId'>,
): JourneyStage {
  return { ...s, journeyId: EVERYDAY_ASSEMBLED_ID };
}

const stages: JourneyStage[] = [
  stage({
    id: 'entry',
    type: 'entry',
    name: 'Tell us what life looks like',
    order: 1,
    customerGoal: 'Say what I need in my own words.',
    businessGoal: 'Capture intent with the lowest possible effort.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: [],
    availableActions: ['capture_intent'],
    authorityLevel: 'observe',
    experienceSurface: 'web',
    successCriteria: ['A natural-language intent is captured.'],
    failurePaths: [],
    nextStageIds: ['intent'],
  }),
  stage({
    id: 'intent',
    type: 'intent',
    name: 'Understand the intent',
    order: 2,
    customerGoal: 'Feel understood without filling in a form.',
    businessGoal: 'Convert language into structured, validated intent.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: ['intent'],
    availableActions: ['structure_intent'],
    authorityLevel: 'recommend',
    experienceSurface: 'web',
    successCriteria: ['Structured intent validates against schema.', 'Uncertainties are surfaced.'],
    failurePaths: [{ id: 'fp-unclear', label: 'Intent unclear', when: 'Confidence is very low', toStageId: 'entry' }],
    nextStageIds: ['context'],
  }),
  stage({
    id: 'context',
    type: 'context',
    name: 'Ask only what matters',
    order: 3,
    customerGoal: 'Answer one or two useful questions, not twenty.',
    businessGoal: 'Fill the highest-value gaps for a good plan.',
    requiredContext: [],
    optionalContext: ['budget', 'fulfilment', 'staples', 'equipment', 'brands', 'depth'],
    agentRoles: ['context'],
    availableActions: ['ask_context'],
    authorityLevel: 'recommend',
    experienceSurface: 'web',
    successCriteria: ['No redundant questions are asked.', 'At most two questions per step.'],
    failurePaths: [],
    nextStageIds: ['recommendation'],
  }),
  stage({
    id: 'recommendation',
    type: 'recommendation',
    name: 'Assemble the plan',
    order: 4,
    customerGoal: 'See meals and a basket that fit my situation.',
    businessGoal: 'Produce a personalised, rule-compliant recommendation.',
    requiredContext: [],
    optionalContext: ['budget'],
    agentRoles: ['plan', 'value'],
    availableActions: ['summarise_plan'],
    authorityLevel: 'recommend',
    experienceSurface: 'web',
    successCriteria: ['Plan honours all dietary exclusions.', 'Assumptions are surfaced.'],
    failurePaths: [{ id: 'fp-no-plan', label: 'No viable plan', when: 'Rules leave no options', toStageId: 'resolution' }],
    nextStageIds: ['commitment'],
  }),
  stage({
    id: 'commitment',
    type: 'commitment',
    name: 'Your call',
    order: 5,
    customerGoal: 'Approve, edit, swap or set a budget.',
    businessGoal: 'Get explicit confirmation before preparing anything.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: ['basket'],
    availableActions: ['edit_plan', 'set_budget'],
    authorityLevel: 'recommend',
    experienceSurface: 'web',
    successCriteria: ['Customer confirms or edits the plan.'],
    failurePaths: [],
    nextStageIds: ['action'],
  }),
  stage({
    id: 'action',
    type: 'action',
    name: 'Prepare the basket',
    order: 6,
    customerGoal: 'Get an approval-ready basket.',
    businessGoal: 'Assemble the basket — prepared, never ordered.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: ['basket'],
    availableActions: ['assemble_basket'],
    authorityLevel: 'act_with_approval',
    experienceSurface: 'web',
    successCriteria: ['Basket is prepared and clearly labelled simulated.'],
    failurePaths: [{ id: 'fp-budget', label: 'Over budget', when: 'Estimate exceeds budget', toStageId: 'resolution' }],
    nextStageIds: ['wait'],
  }),
  stage({
    id: 'wait',
    type: 'wait',
    name: 'Assembling',
    order: 7,
    customerGoal: 'Know useful work is happening, and stay in control.',
    businessGoal: 'Turn latency into visible value.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: ['wait-state'],
    availableActions: ['show_progress'],
    authorityLevel: 'draft',
    experienceSurface: 'web',
    successCriteria: ['Progress steps describe real work.', 'Customer can review during the wait.'],
    failurePaths: [],
    nextStageIds: ['fulfilment'],
  }),
  stage({
    id: 'fulfilment',
    type: 'fulfilment',
    name: 'Ready for you',
    order: 8,
    customerGoal: 'See the basket ready to review, export or connect.',
    businessGoal: 'Present clear next actions without overstating capability.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: ['basket'],
    availableActions: ['review_basket', 'copy_list', 'export_list', 'connect_retailer', 'save_template'],
    authorityLevel: 'recommend',
    experienceSurface: 'web',
    successCriteria: ['Basket shown as approval-ready with honest status.'],
    failurePaths: [],
    nextStageIds: ['resolution'],
  }),
  stage({
    id: 'resolution',
    type: 'resolution',
    name: 'When something changes',
    order: 9,
    customerGoal: 'See a sensible fix when an item is out or the total is high.',
    businessGoal: 'Resolve conflicts safely or escalate to a person.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: ['resolution'],
    availableActions: ['apply_substitution', 'remove_item', 'escalate'],
    authorityLevel: 'act_with_approval',
    experienceSurface: 'web',
    successCriteria: ['Conflicts resolved with approval, or escalated honestly.'],
    failurePaths: [{ id: 'fp-escalate', label: 'Escalate', when: 'Cannot resolve within rules', toStageId: 'continuation' }],
    nextStageIds: ['continuation'],
  }),
  stage({
    id: 'continuation',
    type: 'continuation',
    name: 'Make next time easier',
    order: 10,
    customerGoal: 'Save preferences or a template — and see what was learned.',
    businessGoal: 'Earn the next journey while staying transparent.',
    requiredContext: [],
    optionalContext: [],
    agentRoles: [],
    availableActions: ['save_household_preferences', 'save_template', 'create_recurring', 'give_feedback', 'view_learned'],
    authorityLevel: 'act_with_approval',
    experienceSurface: 'web',
    successCriteria: ['Customer can save, edit or remove what was learned.'],
    failurePaths: [],
    nextStageIds: [],
  }),
];

const waitStateModules: WaitStateModule[] = [
  {
    id: 'wait-assembling',
    stageId: 'wait',
    interactive: true,
    steps: [
      { id: 'w1', label: 'Understanding the household', detail: 'Reading who is eating and for how long.', agentRoleId: 'intent' },
      { id: 'w2', label: 'Matching meals to preferences', detail: 'Applying dietary needs and what to avoid.', agentRoleId: 'plan' },
      { id: 'w3', label: 'Reducing duplicate ingredients', detail: 'Merging shared ingredients to cut waste.', agentRoleId: 'basket' },
      { id: 'w4', label: 'Checking preparation effort', detail: 'Keeping dinners easy where you asked.', agentRoleId: 'plan' },
      { id: 'w5', label: 'Preparing substitutions', detail: 'Lining up swaps in case something is out.', agentRoleId: 'resolution' },
      { id: 'w6', label: 'Organising the shop by category', detail: 'Grouping the basket so it is quick to check.', agentRoleId: 'basket' },
    ],
  },
];

export const everydayAssembledJourney: CustomerJourney = {
  id: EVERYDAY_ASSEMBLED_ID,
  tenantId: GROCERY_TENANT,
  name: 'everyday, assembled',
  description:
    'An agentic grocery journey that turns what life looks like into a personalised, approval-ready shop.',
  objective:
    'Reduce the mental load of planning a shop for a household with mixed needs, and prove the time it saves.',
  status: 'shadow',
  frictionMoment:
    'The moment a household gives up planning a real shop because working out meals around mixed dietary needs is too much effort.',
  entryPoints: [
    {
      id: 'ep-web',
      surface: 'web',
      label: 'Natural-language intent',
      examplePrompts: [
        'School lunches for the week',
        'Friends staying for the weekend',
        'Easy dinners during a busy week',
        'A birthday gathering',
        'Restocking the holiday house',
        'Meals for dietary requirements',
      ],
    },
  ],
  stages,
  customerContextFields: contextFields,
  agentAssignments: [
    { roleId: 'intent', stageIds: ['intent'], authorityLevel: 'recommend' },
    { roleId: 'context', stageIds: ['context'], authorityLevel: 'recommend' },
    { roleId: 'plan', stageIds: ['recommendation'], authorityLevel: 'recommend' },
    { roleId: 'value', stageIds: ['recommendation'], authorityLevel: 'recommend' },
    { roleId: 'basket', stageIds: ['commitment', 'action', 'fulfilment'], authorityLevel: 'draft' },
    { roleId: 'wait-state', stageIds: ['wait'], authorityLevel: 'draft' },
    { roleId: 'resolution', stageIds: ['resolution'], authorityLevel: 'act_with_approval' },
  ],
  toolPermissions: [
    { capabilityKey: 'read_genome', label: 'Read Business Genome', authorityRequired: 'observe', status: 'sandbox' },
    { capabilityKey: 'search_knowledge', label: 'Search catalogue', authorityRequired: 'observe', status: 'simulated' },
    { capabilityKey: 'assemble_basket', label: 'Assemble basket', authorityRequired: 'act_with_approval', status: 'simulated' },
    { capabilityKey: 'connector_action', label: 'Place order with retailer', authorityRequired: 'act_within_limits', status: 'unavailable' },
  ],
  waitStateModules,
  handoffRules: [
    { id: 'ho-unresolved', when: 'A conflict cannot be resolved within budget and dietary rules', toRole: 'human', authorityLevel: 'act_with_approval' },
    { id: 'ho-repeat-reject', when: 'The customer rejects the same proposal twice', toRole: 'human', authorityLevel: 'act_with_approval' },
  ],
  metrics: [
    { key: 'customer_minutes_saved', label: 'Customer minutes saved', unit: 'minutes', estimated: true },
    { key: 'staff_minutes_saved', label: 'Staff minutes saved', unit: 'minutes', estimated: true },
    { key: 'preference_adherence', label: 'Preference adherence', unit: 'percent', estimated: true },
    { key: 'budget_variance', label: 'Budget variance', unit: 'nzd', estimated: true },
  ],
  evaluationSuiteId: 'everyday-assembled-suite',
  createdAt: SEED_TS,
  updatedAt: SEED_TS,
};

/** The illustrative seed household used to demonstrate the journey. */
export const SEED_HOUSEHOLD = {
  label: 'Beach-house weekend (fictional demonstration household)',
  statedIntent:
    "I need food for five teenagers at our beach house this weekend. Two are pescatarian, one hates spicy food, and I want easy dinners and plenty of snacks.",
  people: 7,
  adults: 2,
  teenagers: 5,
  nights: 3,
} as const;
