import { verifyIdentityWebhookSecret } from '@/lib/identity/webhook-auth';
import { handleInboundMessage } from '@/lib/identity/inbound';

export const maxDuration = 60;

/**
 * Brevo inbound-parse webhook → bundle identity router.
 *
 * Paste into Brevo (Inbound parsing) as the webhook URL:
 *
 *   https://assembl.co.nz/api/identity/email?secret=<IDENTITY_WEBHOOK_SECRET>
 *
 * Brevo POSTs `{ items: [ { From: {Address}, To: [{Address}], Subject,
 * RawTextBody, ExtractedMarkdownMessage, … } ] }` for each parsed inbound
 * email. We route on the first recipient address that matches a bundle
 * identity (bundle_identity.email).
 *
 * DRAFT-ONLY: the generated reply is queued in content_approvals and logged
 * as outbound-draft. Nothing is sent unless bundle_identity.live is true AND
 * SEND_MODE=live (hard gate in lib/identity/send.ts).
 *
 * NB (reference_brevo_lead_pipeline): NEVER enable Brevo "Authorised IPs" on
 * any API key this pipeline uses.
 */

type BrevoAddress = { Address?: string; Name?: string };
type BrevoInboundItem = {
  From?: BrevoAddress;
  To?: BrevoAddress[];
  Cc?: BrevoAddress[];
  Subject?: string;
  RawTextBody?: string;
  RawHtmlBody?: string;
  ExtractedMarkdownMessage?: string;
};

export async function POST(req: Request) {
  if (!verifyIdentityWebhookSecret(req)) {
    return Response.json({ error: 'unauthorised' }, { status: 401 });
  }

  let payload: { items?: BrevoInboundItem[] };
  try {
    payload = (await req.json()) as { items?: BrevoInboundItem[] };
  } catch {
    return Response.json({ error: 'unparseable payload' }, { status: 400 });
  }

  const items = payload.items ?? [];
  if (!items.length) {
    return Response.json({ error: 'no items in Brevo payload' }, { status: 400 });
  }

  const results: Array<{ ok: boolean; detail: string }> = [];
  for (const item of items) {
    const from = item.From?.Address?.trim();
    const body = (item.RawTextBody ?? item.ExtractedMarkdownMessage ?? '').trim();
    const recipients = [...(item.To ?? []), ...(item.Cc ?? [])]
      .map((r) => r.Address?.trim())
      .filter((a): a is string => Boolean(a));

    if (!from || !body || !recipients.length) {
      results.push({ ok: false, detail: 'missing from/to/body' });
      continue;
    }

    // Route on the first recipient that matches a bundle identity.
    let handled = false;
    for (const to of recipients) {
      const result = await handleInboundMessage({
        channel: 'email',
        from,
        to,
        body,
        subject: item.Subject?.trim() || undefined,
      });
      if (result.ok) {
        results.push({
          ok: true,
          detail: `${result.bundleSlug} → ${result.agentSlug} (${result.mode})`,
        });
        handled = true;
        break;
      }
      if (result.status !== 404) {
        // real failure (not just "this recipient isn't a bundle identity")
        results.push({ ok: false, detail: result.reason });
        handled = true;
        break;
      }
    }
    if (!handled) {
      results.push({ ok: false, detail: 'no recipient matched a bundle identity' });
    }
  }

  // Always 200 once authenticated + parsed, so Brevo doesn't retry-storm;
  // per-item outcomes ride in the body for the function logs.
  return Response.json({ ok: true, results });
}

/** Provider URL-validation ping (no data, no secret required). */
export async function GET() {
  return Response.json({ status: 'ready', channel: 'email', mode: 'draft-only webhook' });
}
