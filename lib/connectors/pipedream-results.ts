import type { DoMappedAction } from '@/apps/do/shared/do-connector-pack';

export type RunActionResult = { ok: boolean; detail: Record<string, unknown> };

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function identifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 512 && /^[a-zA-Z0-9_:.+/@=-]+$/.test(value);
}

/** No raw provider errors, logs, exports or account credentials enter a receipt. */
export function verifyPipedreamResult(
  mapped: DoMappedAction,
  data: Record<string, unknown>,
  body: unknown,
): RunActionResult {
  const envelope = record(body);
  const ret = record(envelope?.ret);
  let provider: Record<string, unknown> | null = null;
  if (!envelope?.error) switch (mapped.componentId) {
    case 'google_sheets-add-single-row':
      if (ret?.updatedRows === 1 && typeof ret.updatedRange === 'string' && ret.updatedRange.length <= 256 && /^[^\r\n]+![A-Z]+[1-9]\d*(?::[A-Z]+[1-9]\d*)?$/.test(ret.updatedRange)) provider = { updatedRange: ret.updatedRange, updatedRows: 1 };
      break;
    case 'stripe-retrieve-invoice':
      if (identifier(ret?.id) && ret.id === data.id) provider = { id: ret.id };
      break;
    case 'google_drive-get-file-by-id':
      if (identifier(ret?.id) && ret.id === data.fileId) provider = { id: ret.id };
      break;
    case 'microsoft_outlook-create-draft-email':
      if (identifier(ret?.id) && ret.isDraft === true) provider = { id: ret.id, isDraft: true };
      break;
    case 'hubspot-create-or-update-contact':
    case 'gmail-create-draft':
    case 'google_calendar-create-event':
      if (identifier(ret?.id)) provider = { id: ret.id };
      break;
    case 'slack_v2-send-message':
      if (ret?.ok === true && identifier(ret.channel) && ret.channel === data.conversation && identifier(ret.ts) && /^\d+\.\d+$/.test(ret.ts)) provider = { channel: ret.channel, ts: ret.ts };
      break;
    case 'linear_app-create-issue': {
      const id = record(ret?._issue)?.id;
      if (ret?.success === true && identifier(id)) provider = { id };
      break;
    }
    case 'salesforce_rest_api-create-lead':
      if (ret?.success === true && identifier(ret.id) && (ret.errors === undefined || (Array.isArray(ret.errors) && ret.errors.length === 0))) provider = { id: ret.id };
      break;
  }
  if (provider) return {
    ok: true,
    detail: { component: mapped.componentId, version: mapped.version, outcome: 'verified', provider },
  };
  const rejected = !envelope?.error && ['linear_app-create-issue', 'salesforce_rest_api-create-lead'].includes(mapped.componentId) && ret?.success === false;
  return {
    ok: false,
    detail: {
      component: mapped.componentId,
      version: mapped.version,
      outcome: !rejected && mapped.effect === 'write' ? 'indeterminate' : 'failed',
      error: envelope?.error ? 'provider_error' : rejected ? 'provider_rejected' : 'invalid_result',
      retryable: false,
    },
  };
}
