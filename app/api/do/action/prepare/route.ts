/**
 * POST /api/do/action/prepare — lock args, persist prep_id + args_hash.
 * Stage: prepare
 */
import { prepareRequestSchema } from '@/lib/do/action-contract';
import { prepareAction } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';
import { buildUniversalResponse, doError } from '@/lib/do/action-contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const parsed = prepareRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'prepare',
        status: 'failed',
        errors: [
          doError('validation_error', 'Invalid prepare payload', {
            details: { issues: parsed.error.issues },
          }),
        ],
      }),
    );
  }
  return jsonUniversal(await prepareAction(parsed.data));
}
