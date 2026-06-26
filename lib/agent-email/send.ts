/**
 * Outbound agent email — send a reply FROM <agent>@assembl.co.nz via Brevo and
 * record it on the thread.
 *
 * This is the Next/Node path, used by the token-gated admin reply route and
 * (in a follow-up) by the chat "send as email" action. The Supabase edge
 * function agent-email-outbound is the Deno mirror for the cron / inbound
 * auto-reply path.
 *
 * Brevo note: the FROM address must be an authorised sender on the assembl.co.nz
 * domain (SPF/DKIM/DMARC). If the domain isn't authorised yet, Brevo rejects the
 * send and we surface the error rather than silently dropping it.
 * NEVER re-enable Brevo's "Authorised IPs" allowlist — it silently breaks sends.
 *
 * Server-only.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { agentEmailAddress } from './addresses';
import { renderAgentEmailHtml, renderAgentEmailText } from './template';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export type SendAgentEmailInput = {
  agentSlug: string;
  agentName: string;
  toEmail: string;
  subject: string;
  body: string;
  /** Existing thread to append the outbound message to. */
  threadId?: string;
};

export type SendAgentEmailResult =
  | { ok: true; agentEmail: string; messageId?: string }
  | { ok: false; error: string };

export async function sendAgentEmail(input: SendAgentEmailInput): Promise<SendAgentEmailResult> {
  const agentEmail = agentEmailAddress(input.agentSlug);
  if (!agentEmail) {
    return { ok: false, error: `Agent "${input.agentSlug}" has no email inbox.` };
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return { ok: false, error: 'BREVO_API_KEY is not configured.' };
  }

  const to = input.toEmail.trim();
  if (!to || !to.includes('@')) {
    return { ok: false, error: 'A valid recipient email is required.' };
  }

  const subject = input.subject.trim() || `Reply from ${input.agentName}`;
  const html = renderAgentEmailHtml({ agentName: input.agentName, agentEmail, body: input.body });
  const text = renderAgentEmailText({ agentName: input.agentName, agentEmail, body: input.body });

  let brevoMessageId: string | undefined;
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
      body: JSON.stringify({
        sender: { name: input.agentName, email: agentEmail },
        replyTo: { name: input.agentName, email: agentEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { messageId?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: data?.message || `Brevo send failed (${res.status}).` };
    }
    brevoMessageId = data?.messageId;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Brevo request failed.' };
  }

  // Record the outbound message + bump the thread. Best-effort: the email is
  // already sent, so a logging failure must not look like a send failure.
  if (input.threadId) {
    try {
      const supabase = getServiceClient();
      const now = new Date().toISOString();
      await supabase.from('agent_email_messages').insert({
        thread_id: input.threadId,
        direction: 'outbound',
        from_email: agentEmail,
        to_email: to,
        subject,
        body: input.body,
        raw: { provider: 'brevo', messageId: brevoMessageId ?? null },
      });
      await supabase
        .from('agent_email_threads')
        .update({ last_message_at: now, updated_at: now, status: 'open' })
        .eq('id', input.threadId);
    } catch (err) {
      console.error('[agent-email] outbound logged-send failed:', err);
    }
  }

  return { ok: true, agentEmail, messageId: brevoMessageId };
}
