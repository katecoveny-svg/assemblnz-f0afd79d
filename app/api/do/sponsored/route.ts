import { allowedDoOrigin, admitDoRequest, doHeaders, readDoJson } from '@/apps/do/shared/http';
import { getPermit, getPrepared, getReceipt } from '@/lib/do/action-stub';
import {
  advanceSponsoredRun,
  getSponsoredDemo,
  getSponsoredRun,
  GROCERY_LOYALTY_SPONSORED_DEMO,
  listSponsoredRuns,
  startSponsoredRun,
} from '@/lib/do/sponsored-journeys';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sponsored Journeys demo API.
 * TODO(action-core): route consequential stages through /api/do/action/* when available.
 */

function headers(request: Request) {
  const base = doHeaders(request);
  base.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return base;
}

function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: headers(request) });
}

export async function OPTIONS(request: Request) {
  if (!allowedDoOrigin(request)) {
    return new Response(null, { status: 403, headers: headers(request) });
  }
  return new Response(null, { status: 204, headers: headers(request) });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const runId = url.searchParams.get('run_id');
  if (runId) {
    const run = getSponsoredRun(runId);
    if (!run) {
      return json(request, { error: 'run_not_found', message: 'Unknown sponsored journey run' }, 404);
    }
    return json(request, {
      demo: getSponsoredDemo(run.demo_id),
      run,
      prepared: run.prep_id ? getPrepared(run.prep_id) : null,
      permit: run.permit_id ? getPermit(run.permit_id) : null,
      receipt: run.receipt_id ? getReceipt(run.receipt_id) : null,
    });
  }

  return json(request, {
    demo: GROCERY_LOYALTY_SPONSORED_DEMO,
    runs: listSponsoredRuns(),
    honesty: GROCERY_LOYALTY_SPONSORED_DEMO.disclaimer,
  });
}

export async function POST(request: Request) {
  if (!allowedDoOrigin(request) && request.headers.get('origin')) {
    return json(
      request,
      { error: 'origin_not_allowed', message: 'Open Sponsored Journeys from Assembl or the DO extension.' },
      403,
    );
  }

  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) {
    return json(request, { message: 'Please wait a minute before another sponsored journey step.' }, 429);
  }

  let body: {
    action?: string;
    run_id?: string;
    intent?: string;
    demo_id?: string;
  };
  try {
    body = (await readDoJson(request)) as typeof body;
  } catch {
    return json(request, { error: 'invalid_json', message: 'Expected JSON body' }, 400);
  }

  try {
    if (body.action === 'start' || !body.action) {
      const run = startSponsoredRun({ demo_id: body.demo_id, intent: body.intent });
      return json(request, { run, demo: getSponsoredDemo(run.demo_id) });
    }

    if (!body.run_id) {
      return json(request, { error: 'run_id_required', message: 'run_id required for advance actions' }, 400);
    }

    const allowed = [
      'assemble',
      'show_offer',
      'skip_offer',
      'request_permit',
      'approve_permit',
      'deny_permit',
      'execute',
      'handoff',
      'receipt',
    ] as const;
    type Advance = (typeof allowed)[number];
    if (!allowed.includes(body.action as Advance)) {
      return json(request, { error: 'unknown_action', message: `Unknown action: ${body.action}` }, 400);
    }

    const run = advanceSponsoredRun(body.run_id, body.action as Advance);
    return json(request, {
      run,
      demo: getSponsoredDemo(run.demo_id),
      prepared: run.prep_id ? getPrepared(run.prep_id) : null,
      permit: run.permit_id ? getPermit(run.permit_id) : null,
      receipt: run.receipt_id ? getReceipt(run.receipt_id) : null,
    });
  } catch (error) {
    return json(
      request,
      {
        error: 'sponsored_journey_error',
        message: error instanceof Error ? error.message : 'Sponsored journey failed',
      },
      400,
    );
  }
}
