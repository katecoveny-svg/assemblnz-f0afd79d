import { verifyIdentityWebhookSecret } from '@/lib/identity/webhook-auth';
import { handleInboundMessage } from '@/lib/identity/inbound';

export const maxDuration = 60;

/**
 * TNZ inbound-SMS webhook → bundle identity router.
 *
 * Paste into the TNZ dashboard (Account 606498) as the Received-SMS webhook
 * for each bundle's dedicated number:
 *
 *   https://assembl.co.nz/api/identity/sms?secret=<IDENTITY_WEBHOOK_SECRET>
 *
 * TNZ posts JSON for received messages. Field names have varied across their
 * v3 webhook payloads (From/MessageText vs lowercase variants), so parsing is
 * deliberately liberal — verify against a live payload during go-live and
 * tighten if needed (docs/bundle-identity-provisioning.md).
 *
 * DRAFT-ONLY: the generated reply is queued in content_approvals and logged
 * as outbound-draft. Nothing is sent unless bundle_identity.live is true AND
 * SEND_MODE=live (hard gate in lib/identity/send.ts).
 */

type UnknownRecord = Record<string, unknown>;

function pick(obj: UnknownRecord, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number') return String(v);
  }
  return null;
}

async function parseBody(req: Request): Promise<UnknownRecord | null> {
  const contentType = req.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      return (await req.json()) as UnknownRecord;
    }
    if (contentType.includes('form')) {
      const form = await req.formData();
      const out: UnknownRecord = {};
      form.forEach((value, key) => {
        out[key] = typeof value === 'string' ? value : '';
      });
      return out;
    }
    // last resort: try JSON anyway
    return (await req.json()) as UnknownRecord;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!verifyIdentityWebhookSecret(req)) {
    return Response.json({ error: 'unauthorised' }, { status: 401 });
  }

  const payload = await parseBody(req);
  if (!payload) {
    return Response.json({ error: 'unparseable payload' }, { status: 400 });
  }

  // TNZ sometimes nests the message under MessageReceived / Data.
  const nested =
    (payload.MessageReceived as UnknownRecord | undefined) ??
    (payload.Data as UnknownRecord | undefined) ??
    payload;

  const from = pick(nested, ['From', 'from', 'Sender', 'sender', 'MSISDN', 'Mobile', 'mobile']);
  const to = pick(nested, ['To', 'to', 'Recipient', 'recipient', 'SentTo', 'Destination', 'destination', 'Number', 'number']);
  const body = pick(nested, ['MessageText', 'Message', 'message', 'Body', 'body', 'Text', 'text']);

  if (!from || !to || !body) {
    return Response.json(
      { error: 'missing from/to/body in TNZ payload', gotKeys: Object.keys(nested) },
      { status: 400 },
    );
  }

  const result = await handleInboundMessage({ channel: 'sms', from, to, body });
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: result.status });
  }
  return Response.json({
    ok: true,
    bundle: result.bundleSlug,
    agent: result.agentSlug,
    mode: result.mode, // 'draft' until live=true AND SEND_MODE=live
    approvalId: result.approvalId,
  });
}

/** Provider URL-validation ping (no data, no secret required). */
export async function GET() {
  return Response.json({ status: 'ready', channel: 'sms', mode: 'draft-only webhook' });
}
