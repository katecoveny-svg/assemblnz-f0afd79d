import {
  httpStatusForErrors,
  type UniversalResponse,
  validateUniversalResponse,
} from '@/lib/do/action-contract';

export function jsonUniversal(response: UniversalResponse, init?: { status?: number }): Response {
  const checked = validateUniversalResponse(response);
  if (!checked.ok) {
    return Response.json(
      {
        ok: false,
        action_id: null,
        action_name: null,
        stage: 'execute',
        status: 'failed',
        prep_id: null,
        permit_id: null,
        receipt_id: null,
        wait_id: null,
        verify: null,
        result: null,
        errors: [
          {
            code: 'response_schema_error',
            message: 'Internal universal response failed validation',
            retryable: false,
            details: { issues: checked.issues },
          },
        ],
        risk: { class: 'low', flags: ['response_schema_error'] },
        meta: {
          contract_version: '0.1.0',
          idempotency_key: null,
          request_id: `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
          server_time: new Date().toISOString(),
        },
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const status =
    init?.status ??
    (checked.data.ok ? 200 : httpStatusForErrors(checked.data.errors));

  return Response.json(checked.data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
