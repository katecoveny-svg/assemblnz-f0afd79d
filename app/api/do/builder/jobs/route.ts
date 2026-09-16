import { z } from 'zod';

import { doOwner, privateDoHeaders } from '@/apps/do/services/owner';
import {
  getOwnerBuilderJob,
  listOwnerBuilderJobs,
  saveOwnerBuilderJob,
} from '@/apps/do/services/office-jobs';
import { createBuilderJob } from '@/apps/do/shared/builder';
import { allowedDoOrigin } from '@/apps/do/shared/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const saveSchema = z.object({
  job: z.object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(120),
    objective: z.string().trim().min(8).max(4000),
    scope: z.array(z.string()).max(12),
    definitionOfDone: z.array(z.string()).max(12),
    proof: z.array(z.string()).max(12),
    contextFiles: z.array(z.string()).max(24),
    capabilities: z.array(z.enum([
      'reasoning', 'coding', 'vision', 'long_context', 'tool_use', 'browser_use', 'structured_output',
    ])).max(12),
    risk: z.enum(['low', 'medium', 'high']),
    quality: z.enum(['economy', 'balanced', 'maximum']),
    authority: z.enum(['plan_only', 'branch_and_build', 'prepare_pr']),
    status: z.enum(['planned', 'ready', 'working', 'needs_you', 'proved', 'ship_ready']),
    route: z.object({
      ladder: z.array(z.string()).max(12),
      rationale: z.array(z.string()).max(12),
    }),
    createdAt: z.string().datetime(),
  }),
  models: z.array(z.object({
    id: z.string(),
    provider: z.string().optional(),
    label: z.string().optional(),
    costPerMTokensNzd: z.number().optional(),
  })).max(12).default([]),
  executionBoundary: z.string().trim().min(8).max(500),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

function headers() {
  return new Headers(privateDoHeaders);
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: headers() });
}

export async function OPTIONS(request: Request) {
  if (!allowedDoOrigin(request)) return new Response(null, { status: 403, headers: headers() });
  const responseHeaders = headers();
  responseHeaders.set('Allow', 'GET, POST, OPTIONS');
  return new Response(null, { status: 204, headers: responseHeaders });
}

export async function GET(request: Request) {
  if (request.headers.get('origin') && !allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed' }, 403);
  }
  const owner = await doOwner();
  if (!owner) return json({ error: 'auth_required', message: 'Sign in to open durable Builder jobs across devices.' }, 401);

  const jobs = await listOwnerBuilderJobs(owner.id);
  return json({
    jobs: jobs.map((record) => ({
      job: record.job,
      models: record.models,
      executionBoundary: record.executionBoundary,
      officeStatus: record.officeStatus,
      savedAt: record.updatedAt,
      durable: true,
    })),
  });
}

export async function POST(request: Request) {
  if (!allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed', message: 'Open Builder DO from the Assembl DO workspace.' }, 403);
  }

  const owner = await doOwner();
  if (!owner) {
    return json({
      error: 'auth_required',
      message: 'Sign in to save this job to your Office workspace. Browser storage remains available while signed out.',
    }, 401);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message || 'Check the Builder job payload.' }, 400);
  }

  const input = parsed.data;
  if (input.job.status !== 'planned' && input.job.status !== 'ready') {
    return json({
      error: 'invalid_status',
      message: 'Only planned or ready jobs can be accepted here. Execution outcomes need a separate receipt path.',
    }, 400);
  }

  // Re-hydrate through the contract so we never persist a client-fabricated success state.
  const job = createBuilderJob({
    objective: input.job.objective,
    scope: input.job.scope,
    definitionOfDone: input.job.definitionOfDone,
    proof: input.job.proof,
    risk: input.job.risk,
    quality: input.job.quality,
    authority: input.job.authority,
    capabilities: input.job.capabilities,
  }, input.job.route, { id: input.job.id, now: input.job.createdAt });

  try {
    const detail = await saveOwnerBuilderJob({
      ownerId: owner.id,
      job,
      models: input.models,
      executionBoundary: input.executionBoundary,
      idempotencyKey: input.idempotencyKey,
    });

    const acceptance = detail.receipts.find((receipt) => receipt.kind === 'job_accepted');
    return json({
      job: detail.record.job,
      models: detail.record.models,
      executionBoundary: detail.record.executionBoundary,
      officeStatus: detail.record.officeStatus,
      savedAt: detail.record.updatedAt,
      durable: true,
      receipt: acceptance
        ? {
            id: acceptance.id,
            kind: acceptance.kind,
            title: acceptance.title,
            summary: acceptance.summary,
            evidence: acceptance.evidence,
            createdAt: acceptance.createdAt,
          }
        : null,
      events: detail.events.slice(0, 5).map((event) => ({
        eventId: event.eventId,
        kind: event.kind,
        replayed: Boolean(event.replayed),
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save Builder job.';
    if (/another owner/i.test(message)) return json({ error: 'forbidden', message }, 403);
    return json({ error: 'save_failed', message }, 500);
  }
}
