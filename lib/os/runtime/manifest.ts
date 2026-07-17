import { z } from 'zod';

/**
 * Canonical, provider-neutral contract for every assembl agent.
 *
 * Pilot-built agents and first-party agents should compile to this schema.
 * It is intentionally client-safe: publishing, hashing and execution live in
 * server-only modules and consume the validated manifest.
 */

export const DATA_CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted'] as const;
export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const AGENT_MODES = ['assistant', 'bounded-workflow', 'event-driven'] as const;
export const ACTION_LEVELS = ['read', 'draft', 'propose', 'execute-with-policy'] as const;

const semverSchema = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Use semantic versioning, e.g. 1.0.0');
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9-_]*$/, 'Use lowercase letters, numbers, hyphens or underscores');

export const runtimeBudgetSchema = z.object({
  maxTurns: z.number().int().min(1).max(50).default(8),
  maxCapabilityCalls: z.number().int().min(0).max(100).default(12),
  maxChildAgents: z.number().int().min(0).max(10).default(0),
  maxRuntimeSeconds: z.number().int().min(5).max(86_400).default(300),
  maxTokens: z.number().int().min(1_000).max(2_000_000).default(100_000),
  maxModelCostNzd: z.number().min(0).max(10_000).default(5),
  maxExternalSpendNzd: z.number().min(0).max(1_000_000).default(0),
});

export const approvalRuleSchema = z.object({
  capability: identifierSchema,
  when: z.enum(['always', 'policy', 'never']),
  conditions: z.array(z.string().min(1)).default([]),
  approverRoles: z.array(z.string().min(1)).default([]),
  expiresAfterMinutes: z.number().int().min(1).max(10_080).optional(),
});

export const capabilityRequestSchema = z.object({
  key: identifierSchema,
  actionLevel: z.enum(ACTION_LEVELS),
  purpose: z.string().min(5),
  required: z.boolean().default(true),
  inputSchemaRef: z.string().min(1).optional(),
  outputSchemaRef: z.string().min(1).optional(),
  approval: approvalRuleSchema,
});

export const knowledgePolicySchema = z.object({
  sources: z.array(identifierSchema).default([]),
  genomeDomains: z.array(identifierSchema).default([]),
  allowedVerificationStates: z
    .array(z.enum(['confirmed', 'inferred', 'suggested', 'stale', 'conflicting']))
    .min(1)
    .default(['confirmed']),
  allowPublicWeb: z.boolean().default(false),
  citationsRequired: z.boolean().default(true),
  retainRawContext: z.boolean().default(false),
});

export const memoryPolicySchema = z.object({
  readScopes: z.array(identifierSchema).default([]),
  writeMode: z.enum(['none', 'task-only', 'suggest-genome-facts']).default('task-only'),
  retentionDays: z.number().int().min(0).max(2_555).default(30),
  mayConfirmGenomeFacts: z.literal(false).default(false),
});

export const modelPolicySchema = z.object({
  requirements: z.object({
    capabilities: z.array(
      z.enum([
        'reasoning',
        'coding',
        'vision',
        'realtime_voice',
        'long_context',
        'tool_use',
        'browser_use',
        'structured_output',
        'media_generation',
      ]),
    ),
    latencyPreference: z.enum(['realtime', 'fast', 'standard', 'background']).default('standard'),
    qualityPreference: z.enum(['economy', 'balanced', 'maximum']).default('balanced'),
    requiresIndependentVerification: z.boolean().default(false),
  }),
  allowedProviders: z.array(z.enum(['anthropic', 'openai', 'google', 'xai', 'groq', 'ollama'])).optional(),
  workflowEvalKey: identifierSchema.optional(),
  allowExperimentalModels: z.boolean().default(false),
});

export const evidenceRequirementSchema = z.object({
  kind: identifierSchema,
  required: z.boolean().default(true),
  minimumCount: z.number().int().min(1).max(100).default(1),
  sourcePointerRequired: z.boolean().default(false),
  description: z.string().min(3),
});

export const handoffPermissionSchema = z.object({
  toAgent: identifierSchema,
  objectiveTypes: z.array(identifierSchema).min(1),
  allowedCapabilities: z.array(identifierSchema).default([]),
  allowedContextRefs: z.array(identifierSchema).default([]),
  riskCeiling: z.enum(RISK_LEVELS).default('low'),
  outputSchemaRef: z.string().min(1),
  evidenceKinds: z.array(identifierSchema).default([]),
});

export const triggerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('manual') }),
  z.object({ type: z.literal('event'), event: identifierSchema }),
  z.object({ type: z.literal('schedule'), schedulePolicyRef: identifierSchema }),
  z.object({ type: z.literal('api'), routeRef: z.string().min(1) }),
  z.object({ type: z.literal('voice'), intent: identifierSchema }),
]);

export const agentManifestSchema = z
  .object({
    schemaVersion: semverSchema.default('1.0.0'),
    id: identifierSchema,
    version: semverSchema,
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(600),
    owner: z.string().min(1),
    mode: z.enum(AGENT_MODES),
    status: z.enum(['draft', 'production', 'retired']).default('draft'),

    release: z.object({
      promptVersion: z.string().min(1),
      skillVersions: z.record(z.string(), z.string()).default({}),
      genomeSchemaVersion: z.string().min(1),
      modelPolicyVersion: z.string().min(1),
      policyVersion: z.string().min(1),
    }),

    role: z.object({
      summary: z.string().min(10),
      responsibilities: z.array(z.string().min(3)).min(1),
      successCriteria: z.array(z.string().min(3)).min(1),
      neverDo: z.array(z.string().min(3)).default([]),
    }),

    triggers: z.array(triggerSchema).min(1),
    inputSchemaRef: z.string().min(1),
    outputSchemaRef: z.string().min(1),
    riskCeiling: z.enum(RISK_LEVELS),
    dataClassificationCeiling: z.enum(DATA_CLASSIFICATIONS),

    knowledge: knowledgePolicySchema,
    memory: memoryPolicySchema,
    capabilities: z.array(capabilityRequestSchema).default([]),
    model: modelPolicySchema,
    handoffs: z.array(handoffPermissionSchema).default([]),
    evidence: z.array(evidenceRequirementSchema).min(1),
    budgets: runtimeBudgetSchema,

    evaluation: z.object({
      suiteId: identifierSchema,
      minimumScore: z.number().min(0).max(1).default(0.8),
      criticalCases: z.array(identifierSchema).default([]),
      blockProductionOnFailure: z.boolean().default(true),
    }),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((manifest, ctx) => {
    for (const capability of manifest.capabilities) {
      const consequential = capability.actionLevel === 'propose' || capability.actionLevel === 'execute-with-policy';
      if (consequential && capability.approval.when === 'never' && manifest.riskCeiling !== 'low') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['capabilities', manifest.capabilities.indexOf(capability), 'approval'],
          message: 'Medium/high-risk consequential capabilities cannot disable approval.',
        });
      }
    }

    if (manifest.mode !== 'assistant' && manifest.budgets.maxTurns < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgets', 'maxTurns'],
        message: 'Workflow and event-driven agents need at least two bounded turns.',
      });
    }

    if (manifest.handoffs.length > 0 && manifest.budgets.maxChildAgents === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgets', 'maxChildAgents'],
        message: 'Handoff permissions require a non-zero child-agent budget.',
      });
    }

    if (manifest.knowledge.allowPublicWeb && !manifest.knowledge.citationsRequired) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['knowledge', 'citationsRequired'],
        message: 'Public web access requires citations.',
      });
    }

    if (manifest.memory.mayConfirmGenomeFacts !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['memory', 'mayConfirmGenomeFacts'],
        message: 'Agents may suggest genome facts but may not confirm them.',
      });
    }
  });

export type AgentManifest = z.infer<typeof agentManifestSchema>;
export type CapabilityRequest = z.infer<typeof capabilityRequestSchema>;
export type RuntimeBudget = z.infer<typeof runtimeBudgetSchema>;

export type ManifestLintIssue = {
  path: string;
  message: string;
};

/** Safe for Pilot previews and release gates. */
export function validateAgentManifest(input: unknown):
  | { ok: true; manifest: AgentManifest }
  | { ok: false; issues: ManifestLintIssue[] } {
  const result = agentManifestSchema.safeParse(input);
  if (result.success) return { ok: true, manifest: result.data };
  return {
    ok: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
