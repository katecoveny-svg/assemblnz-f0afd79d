/**
 * POST /api/do/action/verify — post-condition checks after execute.
 * Stage: verify
 */
import { verifyRequestSchema, buildUniversalResponse, doError } from '@/lib/do/action-contract';
import { verifyAction } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const parsed = verifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'verify',
        status: 'failed',
        errors: [
          doError('validation_error', 'Invalid verify payload', {
            details: { issues: parsed.error.issues },
          }),
        ],
      }),
    );
  }
  return jsonUniversal(await verifyAction(parsed.data));
}
