/**
 * GET /api/do/action/wait/[waitId] — poll a waiter.
 * POST /api/do/action/wait/[waitId] — resolve a waiter.
 * Stage: wait
 */
import { buildUniversalResponse, doError } from '@/lib/do/action-contract';
import { getWait, resolveWait } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ waitId: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { waitId } = await ctx.params;
  return jsonUniversal(await getWait(waitId));
}

export async function POST(request: Request, ctx: Ctx) {
  const { waitId } = await ctx.params;
  const body = await readJsonBody(request);
  const result =
    body && typeof body === 'object' && 'result' in body
      ? (body as { result?: unknown }).result
      : body;
  if (!waitId) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'wait',
        status: 'failed',
        errors: [doError('validation_error', 'waitId required')],
      }),
    );
  }
  return jsonUniversal(await resolveWait({ wait_id: waitId, result }));
}
