/**
 * POST /api/do/action/permit — issue short-lived permit bound to prep args_hash.
 * Stage: permit
 */
import { permitRequestSchema, buildUniversalResponse, doError } from '@/lib/do/action-contract';
import { permitAction } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const parsed = permitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'permit',
        status: 'failed',
        errors: [
          doError('validation_error', 'Invalid permit payload', {
            details: { issues: parsed.error.issues },
          }),
        ],
      }),
    );
  }
  return jsonUniversal(await permitAction(parsed.data));
}
