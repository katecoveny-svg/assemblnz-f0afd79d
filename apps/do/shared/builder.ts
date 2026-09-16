export type BuilderRisk = 'low' | 'medium' | 'high';
export type BuilderQuality = 'economy' | 'balanced' | 'maximum';
export type BuilderAuthority = 'plan_only' | 'branch_and_build' | 'prepare_pr';
export type BuilderJobStatus = 'planned' | 'ready' | 'working' | 'needs_you' | 'proved' | 'ship_ready';
export type BuilderCapability = 'reasoning' | 'coding' | 'vision' | 'long_context' | 'tool_use' | 'browser_use' | 'structured_output';

export type BuilderRoute = { ladder: string[]; rationale: string[] };

export type BuilderJobInput = {
  objective: string;
  scope?: string[];
  definitionOfDone?: string[];
  proof?: string[];
  risk: BuilderRisk;
  quality: BuilderQuality;
  authority: BuilderAuthority;
  capabilities: BuilderCapability[];
};

export type BuilderJob = {
  id: string;
  title: string;
  objective: string;
  scope: string[];
  definitionOfDone: string[];
  proof: string[];
  contextFiles: string[];
  capabilities: BuilderCapability[];
  risk: BuilderRisk;
  quality: BuilderQuality;
  authority: BuilderAuthority;
  status: BuilderJobStatus;
  route: BuilderRoute;
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
  'Model/provider is replaceable; Builder DO identity, context, tools, approvals and evidence are persistent.',
] as const;

function defaultDone(objective: string): string[] {
  return [
    'The requested behaviour exists in the intended surface without creating a parallel implementation.',
    'Relevant tests/checks pass for the changed area.',
    objective.toLowerCase().includes('visual') || objective.toLowerCase().includes('office')
      ? 'The visible result has runtime/visual evidence and remains usable on narrow screens.'
      : 'The result has evidence appropriate to its claim.',
  ];
}

export function createBuilderJob(
  input: BuilderJobInput,
  route: BuilderRoute,
  opts: { id?: string; now?: string } = {},
): BuilderJob {
  const objective = input.objective.replace(/\s+/g, ' ').trim();
  if (objective.length < 8) throw new Error('Builder DO objective is too short');

  return {
    id: opts.id ?? crypto.randomUUID(),
    title: objective.slice(0, 76),
    objective,
    scope: input.scope?.length ? input.scope : ['Inspect the smallest relevant current implementation first.'],
    definitionOfDone: input.definitionOfDone?.length ? input.definitionOfDone : defaultDone(objective),
    proof: input.proof?.length ? input.proof : ['Relevant automated checks', 'Runtime evidence', 'Reviewable change summary'],
    contextFiles: [...BUILDERDOO_CANONICAL_CONTEXT],
    capabilities: input.capabilities,
    risk: input.risk,
    quality: input.quality,
    authority: input.authority,
    status: 'planned',
    route,
    createdAt: opts.now ?? new Date().toISOString(),
  };
}
