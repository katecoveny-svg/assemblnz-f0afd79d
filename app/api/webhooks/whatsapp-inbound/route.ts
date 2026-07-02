import { verifyIdentityWebhookSecret } from '@/lib/identity/webhook-auth';
import { handleInboundMessage } from '@/lib/identity/inbound';

export const maxDuration = 60;

/**
 * Twilio inbound-WhatsApp webhook → bundle identity router.
 *
 * Paste into the Twilio Console (WhatsApp sender → Endpoint configuration →
 * "When a message comes in", method POST):
 *
 *   https://assembl.co.nz/api/webhooks/whatsapp-inbound?secret=<IDENTITY_WEBHOOK_SECRET>
 *
 * One shared WhatsApp sender fronts every bundle identity; routing is by the
 * first-word keyword (HELM / KEEPER / FOREMAN / SERVICE / DOCTOR / DIRECTOR /
 * SOLICITOR / VISA), with conversation continuity for follow-up messages —
 * see lib/identity/inbound.ts.
 *
 * DRAFT-ONLY: the generated reply is queued in content_approvals and logged
 * as outbound-draft. Nothing is sent unless bundle_identity.live is true AND
 * SEND_MODE=live (hard gate in lib/identity/send.ts). We therefore always
 * answer Twilio with an EMPTY TwiML <Response/> — the webhook never replies
 * inline.
 */

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twiml(status = 200): Response {
  return new Response(EMPTY_TWIML, {
    status,
    headers: { 'Content-Type': 'text/xml' },
  });
}

/** Twilio prefixes WhatsApp addresses: 'whatsapp:+64211234567'. */
function stripWhatsAppPrefix(value: string): string {
  return value.replace(/^whatsapp:/i, '').trim();
}

export async function POST(req: Request) {
  if (!verifyIdentityWebhookSecret(req)) {
    return Response.json({ error: 'unauthorised' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData(); // Twilio posts application/x-www-form-urlencoded
  } catch {
    return Response.json({ error: 'unparseable payload' }, { status: 400 });
  }

  const from = stripWhatsAppPrefix(String(form.get('From') ?? ''));
  const to = stripWhatsAppPrefix(String(form.get('To') ?? ''));
  const body = String(form.get('Body') ?? '').trim();

  if (!from || !to || !body) {
    // Acknowledge malformed/media-only payloads so Twilio does not retry.
    return twiml();
  }

  const result = await handleInboundMessage({ channel: 'whatsapp', from, to, body });
  if (!result.ok) {
    // Unknown keyword / no identity resolved: acknowledge without processing
    // (the inbound handler has already decided nothing should happen).
    console.warn(`whatsapp-inbound: ${result.reason}`);
    return twiml();
  }
  return twiml();
}

/** Provider URL-validation ping (no data, no secret required). */
export async function GET() {
  return Response.json({ status: 'ready', channel: 'whatsapp', mode: 'draft-only webhook' });
}
