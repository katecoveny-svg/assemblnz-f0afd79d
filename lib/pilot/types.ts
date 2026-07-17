/**
 * Pilot (Kaiurungi) — shared types for the 13-step guided agent-maker flow.
 *
 * A PilotDraft carries two things: `spec` (the structured answers from steps
 * 1–7) and `pack` (the 19-item agent pack Pilot generates from the spec at
 * step 8). The pack is the real output — every Pilot run produces all 19 items,
 * grouped under the six modular brains. Held in the browser through the flow,
 * persisted to public.pilot_agents on save/ship.
 */

export type ModelPreference = 'claude' | 'gpt' | 'gemini' | 'llama';
export type PriceTier = 'free' | 'toro' | 'whanau' | 'pro' | 'business';
export type DraftStatus = 'draft' | 'submitted' | 'published' | 'archived';

// ── Step 1: goal ────────────────────────────────────────────────────────
export type Domain =
  | 'research' | 'writing' | 'sales' | 'customer-support' | 'onboarding'
  | 'admin' | 'operations' | 'finance' | 'hr' | 'learning'
  | 'project-management' | 'reporting' | 'internal-knowledge'
  | 'personal-productivity' | 'custom';

export type ResultType =
  | 'drafted-email' | 'completed-report' | 'meeting-summary' | 'proposal'
  | 'customer-response' | 'task-list' | 'spreadsheet-update' | 'crm-note'
  | 'decision-recommendation' | 'workflow-checklist' | 'training-material';

// ── Step 2: workflow map (structured capture) ─────────────────────────────
export interface WorkflowMap {
  trigger: string;
  inputs: string;
  steps: string;
  decisions: string;
  toolsUsed: string;
  peopleInvolved: string;
  output: string;
  approvalNeeded: string;
  risks: string;
  whatCanGoWrong: string;
}

// ── Step 3: agent type (HARD DEFAULT: assistant + workflow) ────────────────
export type AgentType = 'assistant' | 'workflow' | 'agent';

// ── Step 4: the user ──────────────────────────────────────────────────────
export interface UserDef {
  who: string;
  role: string;
  technicalLevel: 'beginner' | 'intermediate' | 'advanced' | '';
  frequency: 'one-off' | 'daily' | 'weekly' | 'when-needed' | '';
  approvalAuthority: 'none' | 'own-work' | 'team' | 'full' | '';
}

// ── Step 5: knowledge sources ─────────────────────────────────────────────
export type KnowledgeKind = 'static' | 'live' | 'user-provided' | 'system';

// ── Step 7: guardrails ────────────────────────────────────────────────────
export interface Guardrails {
  neverDo: string[];
  approvalPoints: string[];
}

export type AgentTone = 'warm' | 'neutral' | 'formal' | 'specialist';

/**
 * Pattern-signature identity — the agent's visual mark, rendered live by the
 * Pattern Studio engine (vortex or particles). Carried inside `spec` so it
 * round-trips through the jsonb column with no schema change. Optional:
 * classic Pilot drafts don't have one.
 */
export interface PatternIdentity {
  mode: 'vortex' | 'particles';
  foregroundColor: string;
  accentColor: string;
  count: number;
  turbulence: number;
  speed: number;
  glow: boolean;
}

/** The structured spec captured across steps 1–7. */
export interface PilotSpec {
  domain: Domain | '';
  resultType: ResultType | '';
  workflow: WorkflowMap;
  agentType: AgentType;
  user: UserDef;
  knowledge: string[];     // knowledge-source ids
  tools: string[];         // tool ids (grouped registry)
  guardrails: Guardrails;
  tone: AgentTone;
  /** Optional pattern-signature identity (public builder /a). */
  identity?: PatternIdentity;
}

// ── The 19-item agent pack ────────────────────────────────────────────────
export type TestType =
  | 'happy-path' | 'messy-input' | 'out-of-scope'
  | 'risky-action' | 'tool-failure' | 'quality';

export interface TestCase {
  type: TestType;
  title: string;
  prompt: string;
  expected: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

/** All 19 pack items. Strings are TBD-able; arrays default to []. */
export interface AgentPack {
  name: string;            // 1
  identity: string;        // 2
  personality: AgentTone;  // 3
  role: string;            // 4
  targetUser: string;      // 5
  useCase: string;         // 6
  workflow: string;        // 7  (rendered from the map)
  requiredInputs: string[];// 8
  expectedOutputs: string[];// 9
  systemPrompt: string;    // 10 (canonical template + compliance + voice)
  toolRecommendations: string[]; // 11
  knowledgeSources: string[];    // 12
  guardrails: string[];    // 13
  approvalPoints: string[];// 14
  testCases: TestCase[];   // 15
  evaluationChecklist: ChecklistItem[]; // 16
  launchPlan: string[];    // 17
  userGuide: string;       // 18
  improvementBacklog: string[]; // 19
}

/** Which pack items belong to which of the six modular brains. */
export const BRAINS: { id: string; label: string; blurb: string; items: (keyof AgentPack)[] }[] = [
  { id: 'domain', label: 'Domain brain', blurb: 'What it knows about your work.', items: ['name', 'identity', 'personality', 'role', 'targetUser', 'useCase'] },
  { id: 'workflow', label: 'Workflow brain', blurb: 'How it breaks the work into steps.', items: ['workflow', 'requiredInputs', 'expectedOutputs'] },
  { id: 'tool', label: 'Tool brain', blurb: 'Which tools it uses, and when.', items: ['toolRecommendations', 'knowledgeSources'] },
  { id: 'risk', label: 'Risk brain', blurb: 'What it must avoid or escalate.', items: ['guardrails', 'approvalPoints'] },
  { id: 'teaching', label: 'Teaching brain', blurb: 'How it explains and rolls out.', items: ['launchPlan', 'userGuide'] },
  { id: 'testing', label: 'Testing brain', blurb: 'How it checks its own work.', items: ['testCases', 'evaluationChecklist'] },
];

// Human labels for the 19 items.
export const PACK_ITEM_LABELS: Record<keyof AgentPack, string> = {
  name: 'Agent name',
  identity: 'Identity',
  personality: 'Personality',
  role: 'Role',
  targetUser: 'Target user',
  useCase: 'Use case',
  workflow: 'Workflow',
  requiredInputs: 'Required inputs',
  expectedOutputs: 'Expected outputs',
  systemPrompt: 'System prompt',
  toolRecommendations: 'Tool recommendations',
  knowledgeSources: 'Knowledge sources',
  guardrails: 'Guardrails',
  approvalPoints: 'Approval points',
  testCases: 'Test cases',
  evaluationChecklist: 'Evaluation checklist',
  launchPlan: 'Launch plan',
  userGuide: 'User guide',
  improvementBacklog: 'Improvement backlog',
};

/** The full running draft: identity + spec + generated pack. */
export interface PilotDraft {
  id?: string;
  slug: string;
  name: string;
  teReo: string;
  description: string;
  category: string;
  icon: string;
  accent: string;
  spec: PilotSpec;
  pack: AgentPack | null;
  modelPreference: ModelPreference;
  priceTier: PriceTier;
  status: DraftStatus;
}

export function emptyWorkflow(): WorkflowMap {
  return {
    trigger: '', inputs: '', steps: '', decisions: '', toolsUsed: '',
    peopleInvolved: '', output: '', approvalNeeded: '', risks: '', whatCanGoWrong: '',
  };
}

export function emptyDraft(): PilotDraft {
  return {
    slug: '',
    name: '',
    teReo: '',
    description: '',
    category: 'build',
    icon: 'spark',
    accent: '#BFA37A',
    spec: {
      domain: '',
      resultType: '',
      workflow: emptyWorkflow(),
      agentType: 'assistant', // hard default to the safer shape
      user: { who: '', role: '', technicalLevel: '', frequency: '', approvalAuthority: '' },
      knowledge: [],
      tools: [],
      guardrails: { neverDo: [], approvalPoints: [] },
      tone: 'warm',
    },
    pack: null,
    modelPreference: 'claude',
    priceTier: 'free',
    status: 'draft',
  };
}
