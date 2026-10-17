/**
 * assembl / living — "space, assembled" journey configuration
 * -----------------------------------------------------------
 * The Space Studio as a CONFIGURATION of the reusable journey model, so the
 * composer, Proof and evaluation tooling see it in the same shape as every
 * other journey.
 *
 * Status is `draft`: this configuration is not seeded into the journey
 * repository and does not run through the shared runtime yet. The runtime's
 * genome-context selector and approval rules are still keyed to the grocery
 * tenant (`lib/journey/genome-context.ts`); generalising them is the step
 * that lets this journey run there. Until then the Space Studio runs its
 * deterministic stages in `lib/living/recommend.ts` and `design.ts`.
 */

import type { CustomerContextField, CustomerJourney, JourneyStage, WaitStateModule } from '@/lib/journey/types';
import { LIVING_TENANT } from './genome';

export const SPACE_ASSEMBLED_ID = 'space-assembled';
const SEED_TS = '2026-10-17T00:00:00.000Z';

const contextFields: CustomerContextField[] = [
  {
    key: 'surface',
    label: 'Where are we making space?',
    rationale: 'Wall, desk, drawer, wardrobe and vanity each start from different foundations.',
    importance: 'high',
    kind: 'choice',
    choices: ['Wall', 'Desk', 'Drawer', 'Wardrobe', 'Vanity', 'Floor'],
    required: true,
  },
  {
    key: 'need',
    label: 'What would make it better?',
    rationale: 'Your words decide which accessories we suggest first.',
    importance: 'high',
    kind: 'text',
    required: false,
  },
  {
    key: 'aesthetic',
    label: 'Choose a starting aesthetic',
    rationale: 'Colourways change; the parts do not.',
    importance: 'medium',
    kind: 'choice',
    choices: ['calm', 'warm', 'contrast', 'expressive'],
    required: false,
  },
  {
    key: 'keep',
    label: 'Anything you want to keep, display or fit?',
    rationale: 'We design around what you own instead of replacing it.',
    importance: 'medium',
    kind: 'text',
    required: false,
  },
  {
    key: 'measurements',
    label: 'Confirm the width and height of the space',
    rationale: 'A photograph alone cannot establish fit. These two numbers decide it.',
    importance: 'high',
    kind: 'text',
    required: true,
  },
];

function stage(s: Omit<JourneyStage, 'journeyId'>): JourneyStage {
  return { ...s, journeyId: SPACE_ASSEMBLED_ID };
}

const stages: JourneyStage[] = [
  stage({
    id: 'entry', type: 'entry', name: 'Show us your space', order: 1,
    customerGoal: 'Point at the space, in a photo or in words.',
    businessGoal: 'Capture the surface and the friction with the least effort.',
    requiredContext: ['surface'], optionalContext: ['need'], agentRoles: [],
    availableActions: ['capture_intent'], authorityLevel: 'observe', experienceSurface: 'web',
    successCriteria: ['A surface and an intent are captured.'], failurePaths: [], nextStageIds: ['intent'],
  }),
  stage({
    id: 'intent', type: 'intent', name: 'assembl understands the space', order: 2,
    customerGoal: 'See that the studio understood what is not working.',
    businessGoal: 'Turn words into needs and candidate parts, deterministically.',
    requiredContext: [], optionalContext: ['need', 'keep'], agentRoles: ['intent'],
    availableActions: ['structure_intent'], authorityLevel: 'recommend', experienceSurface: 'web',
    successCriteria: ['Needs are shown back before anything is proposed.', 'Photo analysis is stated as not available.'],
    failurePaths: [{ id: 'fp-unclear', label: 'Nothing matched', when: 'No cue matched the words', toStageId: 'context' }],
    nextStageIds: ['context'],
  }),
  stage({
    id: 'context', type: 'context', name: 'Ask only what matters', order: 3,
    customerGoal: 'Answer two short questions, not a form.',
    businessGoal: 'Fill the gaps that change the proposal: aesthetic and what to keep.',
    requiredContext: [], optionalContext: ['aesthetic', 'keep'], agentRoles: ['context'],
    availableActions: ['ask_context'], authorityLevel: 'recommend', experienceSurface: 'web',
    successCriteria: ['At most two questions per step.'], failurePaths: [], nextStageIds: ['recommendation'],
  }),
  stage({
    id: 'recommendation', type: 'recommendation', name: 'See three ways to improve it', order: 4,
    customerGoal: 'Compare a minimal refresh, a full system and an expressive layout.',
    businessGoal: 'Propose from the same parts library every time.',
    requiredContext: ['surface'], optionalContext: ['need', 'aesthetic'], agentRoles: ['plan'],
    availableActions: ['summarise_plan'], authorityLevel: 'recommend', experienceSurface: 'web',
    successCriteria: ['Three proposals, each labelled proposed.', 'Every placement validates against the grid.'],
    failurePaths: [], nextStageIds: ['commitment'],
  }),
  stage({
    id: 'commitment', type: 'commitment', name: 'Assemble your design', order: 5,
    customerGoal: 'Move, add and recolour parts in a live preview, then approve.',
    businessGoal: 'Get an explicit approval of a buildable layout.',
    requiredContext: [], optionalContext: [], agentRoles: ['basket'],
    availableActions: ['edit_plan'], authorityLevel: 'recommend', experienceSurface: 'web',
    successCriteria: ['Customer approves a layout with no placement issues.'], failurePaths: [], nextStageIds: ['action'],
  }),
  stage({
    id: 'action', type: 'action', name: 'Made for your space', order: 6,
    customerGoal: 'Confirm the measurements and save the configuration.',
    businessGoal: 'Produce a typed saved configuration with CAD revisions; never claim an order.',
    requiredContext: ['measurements'], optionalContext: [], agentRoles: ['basket'],
    availableActions: ['assemble_basket'], authorityLevel: 'act_with_approval', experienceSurface: 'web',
    successCriteria: ['Fit check passes on confirmed measurements.', 'Configuration is labelled proposed; purchasing labelled not enabled.'],
    failurePaths: [{ id: 'fp-fit', label: 'Does not fit', when: 'Confirmed size is smaller than the layout', toStageId: 'resolution' }],
    nextStageIds: ['wait'],
  }),
  stage({
    id: 'wait', type: 'wait', name: 'Assembling the kit', order: 7,
    customerGoal: 'See the parts list, print plan and fit notes assemble.',
    businessGoal: 'Turn the wait into a review of real manufacturing detail.',
    requiredContext: [], optionalContext: [], agentRoles: ['wait-state'],
    availableActions: ['show_progress'], authorityLevel: 'draft', experienceSurface: 'web',
    successCriteria: ['Every step names real work in the configuration.'], failurePaths: [], nextStageIds: ['fulfilment'],
  }),
  stage({
    id: 'fulfilment', type: 'fulfilment', name: 'Ready to quote', order: 8,
    customerGoal: 'Download the configuration or send it for a manufacturing quote.',
    businessGoal: 'Hand a complete, revisioned spec to the manufacturer; open purchasing only after acceptance.',
    requiredContext: [], optionalContext: [], agentRoles: ['basket'],
    availableActions: ['export_list', 'save_template'], authorityLevel: 'recommend', experienceSurface: 'web',
    successCriteria: ['Saved configuration validates against its schema.'], failurePaths: [], nextStageIds: ['resolution'],
  }),
  stage({
    id: 'resolution', type: 'resolution', name: 'When it does not fit', order: 9,
    customerGoal: 'See a smaller layout or a rail instead of a panel.',
    businessGoal: 'Resolve within the parts library or hand to a person.',
    requiredContext: [], optionalContext: [], agentRoles: ['resolution'],
    availableActions: ['apply_substitution', 'remove_item', 'escalate'], authorityLevel: 'act_with_approval', experienceSurface: 'web',
    successCriteria: ['An alternative that fits, or an honest handoff.'], failurePaths: [], nextStageIds: ['continuation'],
  }),
  stage({
    id: 'continuation', type: 'continuation', name: 'Add to it later', order: 10,
    customerGoal: 'Save the design and come back for more accessories on the same panel.',
    businessGoal: 'Earn the accessory re-order without a new starter system.',
    requiredContext: [], optionalContext: [], agentRoles: [],
    availableActions: ['save_template', 'give_feedback'], authorityLevel: 'act_with_approval', experienceSurface: 'web',
    successCriteria: ['Customer can reopen and extend a saved design.'], failurePaths: [], nextStageIds: [],
  }),
];

const waitStateModules: WaitStateModule[] = [
  {
    id: 'wait-assembling-kit',
    stageId: 'wait',
    interactive: true,
    steps: [
      { id: 'w1', label: 'Checking every placement against the grid', detail: 'Bounds and overlaps on the 24 mm interface.', agentRoleId: 'plan' },
      { id: 'w2', label: 'Counting the parts', detail: 'Panels, accessories, trays and clips, with minimum quantities.', agentRoleId: 'basket' },
      { id: 'w3', label: 'Checking fit against your measurements', detail: 'Width, height and the 12 mm wall standoff.', agentRoleId: 'basket' },
      { id: 'w4', label: 'Attaching CAD revisions', detail: 'STEP and STL checksums for every part in the order.', agentRoleId: 'basket' },
      { id: 'w5', label: 'Preparing the print plan', detail: 'Orientation, material, infill and support notes per part.', agentRoleId: 'wait-state' },
    ],
  },
];

export const spaceAssembledJourney: CustomerJourney = {
  id: SPACE_ASSEMBLED_ID,
  tenantId: LIVING_TENANT,
  name: 'space, assembled',
  description:
    'Assembl Living Space Studio: photograph or describe a space, see three ways to improve it, assemble a design from one modular system, confirm fit and save a quote-ready configuration. Nothing is ordered.',
  objective: 'Cut the time from "this corner does not work" to an approved, buildable, made-to-measure design.',
  status: 'draft',
  frictionMoment: 'A person knows a surface is not working but cannot translate that into which storage parts would fix it, or whether they would fit.',
  entryPoints: [
    {
      id: 'ep-web',
      surface: 'web',
      label: 'Show us your space',
      examplePrompts: [
        'My desk is covered in cables and controllers',
        'Makeup everywhere and no bench space',
        'Keys and leads somewhere sensible by the door',
        'A small parts wall for the workbench',
      ],
    },
  ],
  stages,
  customerContextFields: contextFields,
  agentAssignments: [
    { roleId: 'intent', stageIds: ['intent'], authorityLevel: 'recommend' },
    { roleId: 'context', stageIds: ['context'], authorityLevel: 'recommend' },
    { roleId: 'plan', stageIds: ['recommendation'], authorityLevel: 'recommend' },
    { roleId: 'basket', stageIds: ['commitment', 'action', 'fulfilment'], authorityLevel: 'draft' },
    { roleId: 'wait-state', stageIds: ['wait'], authorityLevel: 'draft' },
    { roleId: 'resolution', stageIds: ['resolution'], authorityLevel: 'act_with_approval' },
  ],
  toolPermissions: [
    { capabilityKey: 'read_genome', label: 'Read Business Genome', authorityRequired: 'observe', status: 'sandbox' },
    { capabilityKey: 'analyse_photo', label: 'Understand a photograph of the space', authorityRequired: 'observe', status: 'unavailable' },
    { capabilityKey: 'assemble_design', label: 'Assemble and validate a design', authorityRequired: 'recommend', status: 'simulated' },
    { capabilityKey: 'request_quote', label: 'Send configuration for a manufacturing quote', authorityRequired: 'act_with_approval', status: 'unavailable' },
    { capabilityKey: 'connector_action', label: 'Purchase through Shopify', authorityRequired: 'act_within_limits', status: 'unavailable' },
  ],
  waitStateModules,
  handoffRules: [
    { id: 'ho-no-fit', when: 'No layout in the library fits the confirmed measurements', toRole: 'human', authorityLevel: 'act_with_approval' },
    { id: 'ho-load', when: 'The customer asks to hang something outside the light-duty policy', toRole: 'human', authorityLevel: 'act_with_approval' },
  ],
  metrics: [
    { key: 'designs_saved', label: 'Designs saved', unit: 'count', estimated: false },
    { key: 'fit_confirmed', label: 'Fit confirmations', unit: 'count', estimated: false },
    { key: 'parts_per_order', label: 'Parts per order', unit: 'count', estimated: true },
    { key: 'customer_minutes_saved', label: 'Customer minutes saved', unit: 'minutes', estimated: true },
  ],
  evaluationSuiteId: 'space-assembled-suite',
  createdAt: SEED_TS,
  updatedAt: SEED_TS,
};
