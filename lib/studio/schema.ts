/**
 * assembl studio — typed source of truth for an agent workbench.
 *
 * Every visible surface (component library, 3D scene, properties panel,
 * x-ray, activity view, deployment summary, test simulator) reads from
 * this schema. Do NOT hard-code component data anywhere else.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Component identity — one taxonomy shared across the interface. Categories
// mirror the required "essentials / knowledge / abilities / connected apps /
// control" grouping in the left library.
// ---------------------------------------------------------------------------

export const ComponentCategory = z.enum([
  'essentials',
  'knowledge',
  'abilities',
  'connected-apps',
  'control',
]);
export type ComponentCategory = z.infer<typeof ComponentCategory>;

/**
 * Type of a component in the agent — used by the 3D scene to pick a
 * geometry, and by the properties panel to pick a field set. Kept
 * open-ended (`.enum`) so adding a new type is a code change in one place.
 */
export const ComponentType = z.enum([
  'identity',
  'instructions',
  'intelligence',
  'memory',
  'knowledge-file',
  'knowledge-website',
  'knowledge-drive',
  'knowledge-policy',
  'ability-draft-email',
  'ability-send-email',
  'ability-calendar-event',
  'ability-research',
  'ability-create-document',
  'connector-gmail',
  'connector-calendar',
  'connector-drive',
  'connector-xero',
  'connector-hubspot',
  'boundary',
  'approval',
  'evaluation-tone',
  'evaluation-accuracy',
]);
export type ComponentType = z.infer<typeof ComponentType>;

export const ComponentStatus = z.enum([
  'configured',   // ready for use
  'draft',        // added but needs setup
  'inactive',     // present but disabled
  'warning',      // needs attention
]);
export type ComponentStatus = z.infer<typeof ComponentStatus>;

// ---------------------------------------------------------------------------
// Individual component config sub-schemas.
// ---------------------------------------------------------------------------

export const AgentIdentity = z.object({
  displayName: z.string().min(1),
  handle: z.string().min(1),
  avatarSlug: z.string().min(1),
  language: z.string().default('en-NZ'),
});
export type AgentIdentity = z.infer<typeof AgentIdentity>;

/**
 * Structured instruction fields — NOT a single "prompt" blob. The composed
 * system prompt lives in the Advanced tab.
 */
export const AgentInstructions = z.object({
  role: z.string(),
  responsibility: z.string(),
  priorities: z.array(z.string()),
  communicationStyle: z.string(),
  whenToEscalate: z.array(z.string()),
  prohibitedActions: z.array(z.string()),
});
export type AgentInstructions = z.infer<typeof AgentInstructions>;

export const IntelligenceConfig = z.object({
  model: z.string(),                              // display name; runtime is decoupled
  reasoningEffort: z.enum(['low', 'medium', 'high']),
  temperature: z.number().min(0).max(2),
  maxOutputTokens: z.number().int().positive(),
});
export type IntelligenceConfig = z.infer<typeof IntelligenceConfig>;

export const KnowledgeSource = z.object({
  id: z.string(),
  type: z.enum(['file', 'website', 'drive-folder', 'policy']),
  title: z.string(),
  description: z.string(),
  items: z.number().int().nonnegative(),
  status: ComponentStatus,
  lastIndexed: z.string().nullable(),
});
export type KnowledgeSource = z.infer<typeof KnowledgeSource>;

export const MemoryConfig = z.object({
  scope: z.enum(['session', 'per-customer', 'business-wide']),
  retentionDays: z.number().int().positive(),
  summaryStrategy: z.enum(['none', 'rolling', 'nightly-summary']),
  containsPII: z.boolean(),
});
export type MemoryConfig = z.infer<typeof MemoryConfig>;

export const Ability = z.object({
  id: z.string(),
  type: ComponentType,
  title: z.string(),
  description: z.string(),
  status: ComponentStatus,
  /** Which connector this ability depends on (nullable for pure reasoning). */
  connectorId: z.string().nullable(),
  /** True when using this ability requires an approval rule to fire first. */
  requiresApproval: z.boolean(),
});
export type Ability = z.infer<typeof Ability>;

export const Connector = z.object({
  id: z.string(),
  type: ComponentType,
  provider: z.string(),
  scopes: z.array(z.string()),
  status: ComponentStatus,
  /** Explicit — prototype only shows simulated integrations. */
  simulated: z.boolean(),
});
export type Connector = z.infer<typeof Connector>;

export const Boundary = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  rule: z.string(),                               // plain-language rule
  status: ComponentStatus,
});
export type Boundary = z.infer<typeof Boundary>;

export const ApprovalRule = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  /** Ability that requires approval before it can proceed. */
  gatesAbilityId: z.string(),
  /** Trigger conditions in plain language. */
  triggers: z.array(z.string()),
  approver: z.enum(['owner', 'any-teammate', 'named-teammate']),
  status: ComponentStatus,
});
export type ApprovalRule = z.infer<typeof ApprovalRule>;

export const Evaluation = z.object({
  id: z.string(),
  type: ComponentType,                            // 'evaluation-tone' | 'evaluation-accuracy'
  title: z.string(),
  description: z.string(),
  /** 0..1 minimum score to pass; below this fails the eval. */
  passThreshold: z.number().min(0).max(1),
  status: ComponentStatus,
});
export type Evaluation = z.infer<typeof Evaluation>;

export const DeploymentConfig = z.object({
  environment: z.enum(['draft', 'preview', 'production']),
  lastDeployedAt: z.string().nullable(),
  version: z.string(),
});
export type DeploymentConfig = z.infer<typeof DeploymentConfig>;

export const AgentAppearance = z.object({
  /** Which chrome palette (see lib/generative-art/families/chrome.ts) the
   *  central core should read from. Keeps the studio visually consistent
   *  with the creative-playground primitive. */
  palette: z.enum(['chrome', 'gold', 'rose', 'emerald', 'pearl', 'obsidian', 'copper', 'ocean']),
  /** Which core geometry the R3F scene renders. */
  coreShape: z.enum(['sphere', 'wobble', 'icosahedron']),
});
export type AgentAppearance = z.infer<typeof AgentAppearance>;

// ---------------------------------------------------------------------------
// Connection model — how components relate in the 3D scene AND in the
// x-ray view. Every module in the scene traces back to one of these
// relationships, so a viewer can explain the wiring in words.
// ---------------------------------------------------------------------------

export const ConnectionRelationship = z.enum([
  'informs',            // knowledge informs the core
  'enables',            // an ability is enabled by a connector
  'requires-approval',  // approval sits between an ability and a connector
  'protects',           // boundary wraps the whole scene
  'evaluates',          // evaluation ring judges outputs
]);
export type ConnectionRelationship = z.infer<typeof ConnectionRelationship>;

export const AgentConnection = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  relationship: ConnectionRelationship,
  /** Copy shown when the user selects this edge in x-ray view. */
  explanation: z.string(),
});
export type AgentConnection = z.infer<typeof AgentConnection>;

// ---------------------------------------------------------------------------
// Root agent definition.
// ---------------------------------------------------------------------------

export const AgentDefinition = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  purpose: z.array(z.string()).min(1),

  identity: AgentIdentity,
  instructions: AgentInstructions,
  intelligence: IntelligenceConfig,
  knowledge: z.array(KnowledgeSource),
  memory: MemoryConfig,
  abilities: z.array(Ability),
  connectors: z.array(Connector),
  boundaries: z.array(Boundary),
  approvals: z.array(ApprovalRule),
  evaluations: z.array(Evaluation),
  deployment: DeploymentConfig,
  appearance: AgentAppearance,

  connections: z.array(AgentConnection),
});
export type AgentDefinition = z.infer<typeof AgentDefinition>;

// ---------------------------------------------------------------------------
// Discriminated component union — one ID space across ALL component kinds.
// This is what the store, the 3D scene, and the properties panel index by.
// ---------------------------------------------------------------------------

export type AgentComponent =
  | ({ id: string; kind: 'identity' } & { data: AgentIdentity })
  | ({ id: string; kind: 'instructions' } & { data: AgentInstructions })
  | ({ id: string; kind: 'intelligence' } & { data: IntelligenceConfig })
  | ({ id: string; kind: 'memory' } & { data: MemoryConfig })
  | ({ id: string; kind: 'knowledge' } & { data: KnowledgeSource })
  | ({ id: string; kind: 'ability' } & { data: Ability })
  | ({ id: string; kind: 'connector' } & { data: Connector })
  | ({ id: string; kind: 'boundary' } & { data: Boundary })
  | ({ id: string; kind: 'approval' } & { data: ApprovalRule })
  | ({ id: string; kind: 'evaluation' } & { data: Evaluation });

/**
 * Flatten the agent definition into a single indexable list of components.
 * Every component's ID is unique across the whole agent (identity/instructions/
 * intelligence/memory get fixed synthetic IDs; the arrays carry their own).
 */
export function listAllComponents(agent: AgentDefinition): AgentComponent[] {
  return [
    { id: 'identity', kind: 'identity', data: agent.identity },
    { id: 'instructions', kind: 'instructions', data: agent.instructions },
    { id: 'intelligence', kind: 'intelligence', data: agent.intelligence },
    { id: 'memory', kind: 'memory', data: agent.memory },
    ...agent.knowledge.map((k) => ({ id: k.id, kind: 'knowledge' as const, data: k })),
    ...agent.abilities.map((a) => ({ id: a.id, kind: 'ability' as const, data: a })),
    ...agent.connectors.map((c) => ({ id: c.id, kind: 'connector' as const, data: c })),
    ...agent.boundaries.map((b) => ({ id: b.id, kind: 'boundary' as const, data: b })),
    ...agent.approvals.map((a) => ({ id: a.id, kind: 'approval' as const, data: a })),
    ...agent.evaluations.map((e) => ({ id: e.id, kind: 'evaluation' as const, data: e })),
  ];
}

export function findComponent(agent: AgentDefinition, id: string): AgentComponent | undefined {
  return listAllComponents(agent).find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Component library taxonomy — what the left panel shows even if the agent
// doesn't currently include one. Adding a new kind here is enough to make it
// appear in the library.
// ---------------------------------------------------------------------------

export interface LibraryEntry {
  type: ComponentType;
  category: ComponentCategory;
  label: string;
  description: string;
  /** Whether this type can appear more than once in an agent. */
  multiInstance: boolean;
}

export const COMPONENT_LIBRARY: LibraryEntry[] = [
  // Essentials
  { type: 'instructions',      category: 'essentials',      label: 'Instructions',   description: 'Role, priorities, communication style',           multiInstance: false },
  { type: 'intelligence',      category: 'essentials',      label: 'Intelligence',   description: 'Model choice + reasoning effort',                 multiInstance: false },
  { type: 'memory',            category: 'essentials',      label: 'Memory',         description: 'What the agent remembers between messages',       multiInstance: false },
  // Knowledge
  { type: 'knowledge-file',    category: 'knowledge',       label: 'Files',          description: 'Uploaded documents',                              multiInstance: true },
  { type: 'knowledge-website', category: 'knowledge',       label: 'Website',        description: 'Public pages crawled and indexed',                multiInstance: true },
  { type: 'knowledge-drive',   category: 'knowledge',       label: 'Google Drive',   description: 'Live folder — kept in sync',                      multiInstance: true },
  { type: 'knowledge-policy',  category: 'knowledge',       label: 'Policy library', description: 'Named policy documents with citations',            multiInstance: true },
  // Abilities
  { type: 'ability-draft-email',    category: 'abilities', label: 'Draft email',    description: 'Compose a reply — never sends alone',              multiInstance: false },
  { type: 'ability-send-email',     category: 'abilities', label: 'Send email',     description: 'Deliver a message via a connector',                multiInstance: false },
  { type: 'ability-calendar-event', category: 'abilities', label: 'Create calendar event', description: 'Book meetings on the connected calendar', multiInstance: false },
  { type: 'ability-research',       category: 'abilities', label: 'Research',       description: 'Search + summarise the web',                       multiInstance: false },
  { type: 'ability-create-document',category: 'abilities', label: 'Create document', description: 'Draft a document from a brief',                   multiInstance: false },
  // Connected apps
  { type: 'connector-gmail',    category: 'connected-apps', label: 'Gmail',           description: 'Read + send from a Google Workspace mailbox', multiInstance: false },
  { type: 'connector-calendar', category: 'connected-apps', label: 'Google Calendar', description: 'View + create calendar events',              multiInstance: false },
  { type: 'connector-drive',    category: 'connected-apps', label: 'Google Drive',    description: 'Read + write documents in a folder',         multiInstance: false },
  { type: 'connector-xero',     category: 'connected-apps', label: 'Xero',            description: 'Invoices + contact records',                 multiInstance: false },
  { type: 'connector-hubspot',  category: 'connected-apps', label: 'HubSpot',         description: 'Deal + contact records',                     multiInstance: false },
  // Control
  { type: 'boundary',           category: 'control',        label: 'Boundary',        description: 'A rule the agent will not cross',            multiInstance: true },
  { type: 'approval',           category: 'control',        label: 'Approval',        description: 'Ask a human before a specific action',       multiInstance: true },
  { type: 'evaluation-tone',    category: 'control',        label: 'Tone evaluation', description: 'Judge every reply against tone standards',   multiInstance: false },
  { type: 'evaluation-accuracy',category: 'control',        label: 'Fact evaluation', description: 'Check claims against cited knowledge',       multiInstance: false },
];

export const CATEGORY_LABEL: Record<ComponentCategory, string> = {
  essentials: 'Essentials',
  knowledge: 'Knowledge',
  abilities: 'Abilities',
  'connected-apps': 'Connected apps',
  control: 'Control',
};

/**
 * Compose the system prompt from structured instruction fields. Shown only
 * in the Advanced tab of the properties panel — it must never be the
 * primary way to edit an agent.
 */
export function composeSystemPrompt(agent: AgentDefinition): string {
  const i = agent.instructions;
  return [
    `You are ${agent.identity.displayName}, ${i.role}.`,
    `Your responsibility: ${i.responsibility}`,
    `Priorities:`,
    ...i.priorities.map((p) => `- ${p}`),
    `Communication style: ${i.communicationStyle}`,
    ``,
    `Escalate to a human when:`,
    ...i.whenToEscalate.map((e) => `- ${e}`),
    ``,
    `You must never:`,
    ...i.prohibitedActions.map((p) => `- ${p}`),
    ``,
    `Boundaries:`,
    ...agent.boundaries.map((b) => `- ${b.rule}`),
    ``,
    `Approvals required:`,
    ...agent.approvals.map((a) => `- ${a.title}: ${a.triggers.join(', ')}`),
  ].join('\n');
}
