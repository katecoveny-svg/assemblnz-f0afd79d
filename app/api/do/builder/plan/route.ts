import { z } from 'zod';

import { admitDoRequest, allowedDoOrigin, doHeaders, readDoJson } from '@/apps/do/shared/http';
import { createBuilderJob, type BuilderCapability } from '@/apps/do/shared/builder';
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

export async function POST(request: Request) {
  const headers = doHeaders(request);
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

  if (!allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed', message: 'Open Builder DO from the Assembl DO workspace.' }, 403);
  }

  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) {
    headers.set('Retry-After', '60');
    return json({ error: 'rate_limited', message: 'Builder DO is receiving too many planning requests. Try again in a minute.' }, 429);
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
    return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message || 'Check the Builder DO job.' }, 400);
  }

  const input = parsed.data;
  const modelCapabilities: TaskCapability[] = ['reasoning', 'coding', 'long_context', 'tool_use', 'structured_output'];
  const jobCapabilities: BuilderCapability[] = ['reasoning', 'coding', 'long_context', 'tool_use', 'structured_output'];
  if (input.needsVision) {
    modelCapabilities.push('vision');
    jobCapabilities.push('vision');
  }
  if (input.needsBrowser) jobCapabilities.push('browser_use');

  const route = routeModel({
    requirements: {
      capabilities: modelCapabilities,
      riskLevel: input.risk,
      latencyPreference: 'standard',
      qualityPreference: input.quality,
      dataClassification: 'internal',
      estimatedValue: input.risk === 'high' ? 'high' : 'medium',
      requiresIndependentVerification: input.risk === 'high',
    },
    workflow: 'builder-do',
  });

  const job = createBuilderJob({
    objective: input.objective,
    scope: input.scope,
    definitionOfDone: input.definitionOfDone,
    proof: input.proof,
    risk: input.risk,
    quality: input.quality,
    authority: input.authority,
    capabilities: jobCapabilities,
  }, route);

  const costPriors = route.ladder.map((id) => {
    const candidate = MODEL_CANDIDATES.find((model) => model.id === id);
    return candidate ? { id, provider: candidate.provider, label: candidate.label, costPerMTokensNzd: candidate.costPerMTokensNzd } : { id };
  });

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
