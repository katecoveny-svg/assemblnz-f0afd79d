import { z } from 'zod';

import { admitDoRequest, allowedDoOrigin, doHeaders, readDoJson } from '@/apps/do/shared/http';
import { BUILDERDOO_CANONICAL_CONTEXT, type BuilderJob } from '@/apps/do/shared/builder';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { MODEL_CANDIDATES, routeModel, type TaskCapability } from '@/lib/os/routing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  objective: z.string().trim().min(8).max(4000),
  scope: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  definitionOfDone: z.array(z.string().trim().min(1).max(300)).max(12).default([]),
  proof: z.array(z.string().trim().min(1).max(300)).max(12).default([]),
  risk: z.enum(['low', 'medium', 'high']).default('medium'),
  quality: z.enum(['economy', 'balanced', 'maximum']).default('balanced'),
  needsVision: z.boolean().default(true),
  needsBrowser: z.boolean().default(true),
  authority: z.enum(['plan_only', 'branch_and_build', 'prepare_pr']).default('prepare_pr'),
});

export function OPTIONS(request: Request) {
  return new Response(null, { status: allowedDoOrigin(request) ? 204 : 403, headers: doHeaders(request) });
}

function defaultDone(objective: string): string[] {
  return [
    'The requested behaviour exists in the intended surface without creating a parallel implementation.',
    'Relevant tests/checks pass for the changed area.',
    objective.toLowerCase().includes('visual') || objective.toLowerCase().includes('office')
      ? 'The visible result has runtime/visual evidence and remains usable on narrow screens.'
      : 'The result has evidence appropriate to its claim.',
  ];
}

export async function POST(request: Request) {
  const headers = doHeaders(request);
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

  if (!allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed', message: 'Open Builderdoo from the Assembl DO workspace.' }, 403);
  }

  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) {
    headers.set('Retry-After', '60');
    return json({ error: 'rate_limited', message: 'Builderdoo is receiving too many planning requests. Try again in a minute.' }, 429);
  }

  let raw: unknown;
  try {
    raw = await readDoJson(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'too_large';
    return json({ error: tooLarge ? 'too_large' : 'invalid_request' }, tooLarge ? 413 : 400);
  }

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message || 'Check the Builderdoo job.' }, 400);
  }

  const input = parsed.data;
  const capabilities: TaskCapability[] = ['reasoning', 'coding', 'long_context', 'tool_use', 'structured_output'];
  if (input.needsVision) capabilities.push('vision');
  if (input.needsBrowser) capabilities.push('browser_use');

  const route = routeModel({
    requirements: {
      capabilities,
      riskLevel: input.risk,
      latencyPreference: 'standard',
      qualityPreference: input.quality,
      dataClassification: 'internal',
      estimatedValue: input.risk === 'high' ? 'high' : 'medium',
      requiresIndependentVerification: input.risk === 'high',
    },
    workflow: 'builder-do',
  });

  const costPriors = route.ladder.map((id) => {
    const candidate = MODEL_CANDIDATES.find((model) => model.id === id);
    return candidate ? { id, provider: candidate.provider, label: candidate.label, costPerMTokensNzd: candidate.costPerMTokensNzd } : { id };
  });

  const title = input.objective.replace(/\s+/g, ' ').trim().slice(0, 76);
  const job: BuilderJob = {
    id: crypto.randomUUID(),
    title,
    objective: input.objective,
    scope: input.scope.length ? input.scope : ['Inspect the smallest relevant current implementation first.'],
    definitionOfDone: input.definitionOfDone.length ? input.definitionOfDone : defaultDone(input.objective),
    proof: input.proof.length ? input.proof : ['Relevant automated checks', 'Runtime evidence', 'Reviewable change summary'],
    contextFiles: [...BUILDERDOO_CANONICAL_CONTEXT],
    capabilities: capabilities as BuilderJob['capabilities'],
    risk: input.risk,
    quality: input.quality,
    authority: input.authority,
    status: 'planned',
    route,
    createdAt: new Date().toISOString(),
  };

  return json({
    job,
    models: costPriors,
    executionBoundary: input.authority === 'plan_only'
      ? 'Plan only. No repository changes are authorised.'
      : input.authority === 'branch_and_build'
        ? 'An execution harness may work in an isolated branch, but must not merge or deploy.'
        : 'An execution harness may branch, build, test and prepare a PR, but must not merge or deploy.',
  });
}
