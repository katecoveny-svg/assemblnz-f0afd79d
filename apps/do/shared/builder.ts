export type BuilderRisk = 'low' | 'medium' | 'high';
export type BuilderQuality = 'economy' | 'balanced' | 'maximum';
export type BuilderJobStatus = 'planned' | 'ready' | 'working' | 'needs_you' | 'proved' | 'ship_ready';

export type BuilderJob = {
  id: string;
  title: string;
  objective: string;
  scope: string[];
  definitionOfDone: string[];
  proof: string[];
  contextFiles: string[];
  capabilities: Array<'reasoning' | 'coding' | 'vision' | 'long_context' | 'tool_use' | 'browser_use' | 'structured_output'>;
  risk: BuilderRisk;
  quality: BuilderQuality;
  authority: 'plan_only' | 'branch_and_build' | 'prepare_pr';
  status: BuilderJobStatus;
  route: {
    ladder: string[];
    rationale: string[];
  };
  createdAt: string;
};

export const BUILDERDOO_CANONICAL_CONTEXT = [
  'START_HERE.md',
  'AGENTS.md',
  'config/context-manifest.json',
  'docs/context/CURRENT.md',
  'docs/context/README.md',
  'docs/factory/PRIMITIVES.md',
  'docs/factory/DECISIONS.md',
] as const;

export const BUILDERDOO_RULES = [
  'Inspect current code before creating parallel infrastructure.',
  'Reuse existing primitives and record genuinely reusable new ones.',
  'Work in an isolated branch/worktree where the execution harness supports it.',
  'No merge, deploy, publishing, spend, credential changes or irreversible actions without explicit authority.',
  'No-error is not proof: visible changes need visual/runtime evidence and code changes need relevant checks.',
  'Model/provider is replaceable; Builderdoo identity, context, tools, approvals and evidence are persistent.',
] as const;
