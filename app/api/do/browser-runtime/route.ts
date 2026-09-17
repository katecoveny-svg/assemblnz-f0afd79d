import { readDoJson } from '@/apps/do/shared/http';
import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { admitDoDemoRequest, doDemoClientIp } from '@/lib/do/action-stub/demo-http';
import {
  approveBrowserRuntimePermit,
  createBrowserRuntimeJob,
  getBrowserRuntimeJob,
  listBrowserRuntimeJobs,
  lockBrowserRuntimeContext,
  mintBrowserRuntimeReceipt,
  produceBrowserRuntimeArtifact,
  proposeBrowserRuntimeNextStep,
  requestBrowserRuntimePermit,
  seedInsurerCompareJob,
  browserRuntimeCreateInput,
  browserRuntimeContextInput,
  browserRuntimeJobId,
  browserRuntimeReviewInput,
  BROWSER_RUNTIME_BOUNDARY,
  BrowserRuntimeJobNotFoundError,
  BrowserRuntimeReviewConflictError,
} from '@/apps/do/shared/browser-runtime';
import { getPermit, getPrepared, getReceipt } from '@/lib/do/action-stub';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DO Browser Runtime — authenticated, owner-scoped preview API.
 * Jobs live only in process memory. No durable storage or external actions.
 * TODO(action-core): swap permit/execute stubs to /api/do/action/*.
 */

function headers(request: Request) {
  const base = new Headers(privateDoHeaders);
  base.set('Vary', 'Cookie, Origin');
  if (sameDoOrigin(request)) {
    base.set('Access-Control-Allow-Origin', new URL(request.url).origin);
    base.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    base.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return base;
}

function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: headers(request) });
}

function packJob(job_id: string, ownerId: string) {
  const job = getBrowserRuntimeJob(job_id, ownerId);
  if (!job) return null;
  return {
    job,
    prepared: job.prep_id ? getPrepared(job.prep_id) : null,
    permit: job.permit_id ? getPermit(job.permit_id) : null,
    receipt: job.receipt_id ? getReceipt(job.receipt_id) : null,
    boundary: BROWSER_RUNTIME_BOUNDARY,
  };
}

export async function OPTIONS(request: Request) {
  if (!sameDoOrigin(request)) {
    return new Response(null, { status: 403, headers: headers(request) });
  }
  return new Response(null, { status: 204, headers: headers(request) });
}

export async function GET(request: Request) {
  const owner = await doOwner();
  if (!owner) return json(request, { error: 'sign_in_required', message: 'Sign in to use Browser Runtime preview.' }, 401);
  const url = new URL(request.url);
  const jobId = url.searchParams.get('job_id');
  if (url.searchParams.has('job_id')) {
    const parsedId = browserRuntimeJobId.safeParse(jobId);
    if (!parsedId.success || url.searchParams.getAll('job_id').length !== 1) {
      return json(request, { error: 'invalid_job_id', message: 'A valid job_id is required' }, 400);
    }
    const packed = packJob(parsedId.data, owner.id);
    if (!packed) {
      return json(request, { error: 'job_not_found', message: 'Unknown browser runtime job' }, 404);
    }
    return json(request, packed);
  }
  return json(request, {
    jobs: listBrowserRuntimeJobs(owner.id),
    boundary: BROWSER_RUNTIME_BOUNDARY,
    honesty: BROWSER_RUNTIME_BOUNDARY,
  });
}

export async function POST(request: Request) {
  if (!sameDoOrigin(request)) {
    return json(
      request,
      { error: 'origin_not_allowed', message: 'Open Browser Runtime preview from Assembl.' },
      403,
    );
  }

  const owner = await doOwner();
  if (!owner) return json(request, { error: 'sign_in_required', message: 'Sign in to use Browser Runtime preview.' }, 401);

  const ip = doDemoClientIp(request);
  if (!admitDoDemoRequest(ip)) {
    return json(request, { message: 'Please wait a minute before another browser runtime step.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    const input = await readDoJson(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return json(request, { error: 'invalid_input', message: 'Expected a JSON object' }, 400);
    }
    body = input as Record<string, unknown>;
  } catch {
    return json(request, { error: 'invalid_json', message: 'Expected JSON body' }, 400);
  }

  const action = typeof body.action === 'string' ? body.action : 'create';

  try {
    switch (action) {
      case 'create': {
        const { action: _action, ...createBody } = body;
        const parsed = browserRuntimeCreateInput.safeParse(createBody);
        if (!parsed.success) {
          return json(
            request,
            { error: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Invalid create input' },
            400,
          );
        }
        const job = createBrowserRuntimeJob(parsed.data, owner.id);
        return json(request, packJob(job.job_id, owner.id));
      }
      case 'seed_insurer_compare': {
        const job = seedInsurerCompareJob(owner.id);
        return json(request, packJob(job.job_id, owner.id));
      }
      case 'lock_context': {
        if (!browserRuntimeJobId.safeParse(body.job_id).success) {
          return json(request, { error: 'invalid_job_id', message: 'A valid job_id is required' }, 400);
        }
        const { action: _action, ...contextBody } = body;
        const parsed = browserRuntimeContextInput.safeParse(contextBody);
        if (!parsed.success) {
          return json(
            request,
            {
              error: 'invalid_input',
              message: parsed.error.issues[0]?.message ?? 'Consent, URL, title and page text required',
            },
            400,
          );
        }
        const job = lockBrowserRuntimeContext(parsed.data, owner.id);
        return json(request, packJob(job.job_id, owner.id));
      }
      case 'propose':
      case 'request_permit': {
        const parsedId = browserRuntimeJobId.safeParse(body.job_id);
        if (!parsedId.success) {
          return json(request, { error: 'invalid_job_id', message: 'A valid job_id is required' }, 400);
        }
        const handler = action === 'propose' ? proposeBrowserRuntimeNextStep : requestBrowserRuntimePermit;
        const job = handler(parsedId.data, owner.id);
        return json(request, packJob(job.job_id, owner.id));
      }
      case 'approve_permit':
      case 'produce_artifact':
      case 'receipt': {
        const parsedId = browserRuntimeJobId.safeParse(body.job_id);
        if (!parsedId.success) {
          return json(request, { error: 'invalid_job_id', message: 'A valid job_id is required' }, 400);
        }
        const { action: _action, job_id: _jobId, ...reviewBody } = body;
        const parsedReview = browserRuntimeReviewInput.safeParse(reviewBody);
        if (!parsedReview.success) {
          return json(request, {
            error: 'invalid_input',
            message: 'The displayed expected_permit_id and expected_review_generation are required.',
          }, 400);
        }
        const handlers = {
          approve_permit: approveBrowserRuntimePermit,
          produce_artifact: produceBrowserRuntimeArtifact,
          receipt: mintBrowserRuntimeReceipt,
        } as const;
        const job = handlers[action](parsedId.data, owner.id, parsedReview.data);
        return json(request, packJob(job.job_id, owner.id));
      }
      default:
        return json(request, { error: 'unknown_action', message: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    if (error instanceof BrowserRuntimeJobNotFoundError) {
      return json(request, { error: 'job_not_found', message: 'Unknown browser runtime job' }, 404);
    }
    if (error instanceof BrowserRuntimeReviewConflictError) {
      return json(request, { error: 'stale_review', message: error.message }, 409);
    }
    return json(
      request,
      {
        error: 'browser_runtime_error',
        message: error instanceof Error ? error.message : 'Browser runtime failed',
      },
      400,
    );
  }
}
