/**
 * POST /api/do/action/receipt — issue append-only receipt (after execute only).
 * GET  /api/do/action/receipt?action_id=…|&receipt_id=… — fetch receipt.
 * Stage: receipt
 */
import {
  receiptRequestSchema,
  buildUniversalResponse,
  doError,
} from '@/lib/do/action-contract';
import { fetchReceipt, issueReceipt } from '@/lib/do/action-cloud/service';
import { jsonUniversal, readJsonBody } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = receiptRequestSchema.safeParse({
    action_id: url.searchParams.get('action_id') ?? undefined,
    receipt_id: url.searchParams.get('receipt_id') ?? undefined,
  });
  if (!parsed.success) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'receipt',
        status: 'failed',
        errors: [
          doError('validation_error', 'action_id or receipt_id query param required', {
            details: { issues: parsed.error.issues },
          }),
        ],
      }),
    );
  }
  return jsonUniversal(await fetchReceipt(parsed.data));
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const actionId =
    body && typeof body === 'object' && 'action_id' in body
      ? String((body as { action_id: unknown }).action_id ?? '')
      : '';
  if (!actionId) {
    return jsonUniversal(
      buildUniversalResponse({
        ok: false,
        stage: 'receipt',
        status: 'failed',
        errors: [doError('validation_error', 'action_id is required to issue a receipt')],
      }),
    );
  }
  return jsonUniversal(await issueReceipt({ action_id: actionId }));
}
