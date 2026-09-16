import { allowedDoOrigin, doHeaders, readDoJson } from '@/apps/do/shared/http';
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
  BROWSER_RUNTIME_BOUNDARY,
} from '@/apps/do/shared/browser-runtime';
import { getPermit, getPrepared, getReceipt } from '@/lib/do/action-stub';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DO Browser Runtime — persistent jobs API.
 * Extends browser-seat patterns; jobs live in DO store across tabs.
 * TODO(action-core): swap permit/execute stubs to /api/do/action/*.
 */

function headers(request: Request) {
  const base = doHeaders(request);
  base.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return base;
}

function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: headers(request) });
}

function packJob(job_id: string) {
  const job = getBrowserRuntimeJob(job_id);
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
  if (!allowedDoOrigin(request)) {
    return new Response(null, { status: 403, headers: headers(request) });
  }
  return new Response(null, { status: 204, headers: headers(request) });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('job_id');
  if (jobId) {
    const packed = packJob(jobId);
    if (!packed) {
      return json(request, { error: 'job_not_found', message: 'Unknown browser runtime job' }, 404);
    }
    return json(request, packed);
  }
  return json(request, {
    jobs: listBrowserRuntimeJobs(),
    boundary: BROWSER_RUNTIME_BOUNDARY,
    honesty:
      'Persistent DO jobs · not a sidebar summariser · not Firefox Smart Window · demo stubs only',
  });
}

export async function POST(request: Request) {
  if (!allowedDoOrigin(request) && request.headers.get('origin')) {
    return json(
      request,
      { error: 'origin_not_allowed', message: 'Open Browser Runtime from Assembl or the DO extension.' },
      403,
    );
  }

  const ip = doDemoClientIp(request);
  if (!admitDoDemoRequest(ip)) {
    return json(request, { message: 'Please wait a minute before another browser runtime step.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await readDoJson(request)) as Record<string, unknown>;
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
        const job = createBrowserRuntimeJob(parsed.data);
        return json(request, packJob(job.job_id));
      }
      case 'seed_insurer_compare': {
        const job = seedInsurerCompareJob();
        return json(request, packJob(job.job_id));
      }
      case 'lock_context': {
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
        const job = lockBrowserRuntimeContext(parsed.data);
        return json(request, packJob(job.job_id));
      }
      case 'propose':
      case 'request_permit':
      case 'approve_permit':
      case 'produce_artifact':
      case 'receipt': {
        const job_id = typeof body.job_id === 'string' ? body.job_id : '';
        if (!job_id) {
          return json(request, { error: 'job_id_required', message: 'job_id required' }, 400);
        }
        const handlers = {
          propose: proposeBrowserRuntimeNextStep,
          request_permit: requestBrowserRuntimePermit,
          approve_permit: approveBrowserRuntimePermit,
          produce_artifact: produceBrowserRuntimeArtifact,
          receipt: mintBrowserRuntimeReceipt,
        } as const;
        const job = handlers[action](job_id);
        return json(request, packJob(job.job_id));
      }
      default:
        return json(request, { error: 'unknown_action', message: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
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
