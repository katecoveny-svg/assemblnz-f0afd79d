/**
 * POST /api/do/action/execute — run under permit; reject expired / hash mismatch.
 * Stage: execute
 */
import { executeRequestSchema, buildUniversalResponse, doError } from '@/lib/do/action-contract';
import { executeAction } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const parsed = executeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'execute',
        status: 'failed',
        errors: [
          doError('validation_error', 'Invalid execute payload', {
            details: { issues: parsed.error.issues },
          }),
        ],
      }),
    );
  }
  return jsonUniversal(await executeAction(parsed.data));
}
