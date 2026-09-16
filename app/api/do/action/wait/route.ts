/**
 * POST /api/do/action/wait — register a durable waiter.
 * GET  /api/do/action/wait?wait_id=… — poll status.
 * Stage: wait
 */
import {
  waitRegisterRequestSchema,
  waitResolveRequestSchema,
  buildUniversalResponse,
  doError,
} from '@/lib/do/action-contract';
import { getWait, registerWait, resolveWait } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const waitId = new URL(request.url).searchParams.get('wait_id')?.trim();
  if (!waitId) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'wait',
        status: 'failed',
        errors: [doError('validation_error', 'wait_id query param required')],
      }),
    );
  }
  return jsonUniversal(await getWait(waitId));
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (body && typeof body === 'object' && 'wait_id' in body && !('action_id' in body)) {
    const parsed = waitResolveRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonUniversal(
        buildUniversalResponse({
          ok: false,
          stage: 'wait',
          status: 'failed',
          errors: [
            doError('validation_error', 'Invalid wait resolve payload', {
              details: { issues: parsed.error.issues },
            }),
          ],
        }),
      );
    }
    return jsonUniversal(await resolveWait(parsed.data));
  }

  const parsed = waitRegisterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'wait',
        status: 'failed',
        errors: [
          doError('validation_error', 'Invalid wait register payload', {
            details: { issues: parsed.error.issues },
          }),
        ],
      }),
    );
  }
  return jsonUniversal(await registerWait(parsed.data));
}
