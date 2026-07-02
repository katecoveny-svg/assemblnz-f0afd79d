/**
 * Bundle identity outbound send path — ONE function, one HARD draft gate.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SEND_MODE=draft is the enforced default. A real SMS/email leaves this   │
 * │ file ONLY when BOTH are true:                                           │
 * │   1. env SEND_MODE === 'live'                                           │
 * │   2. the bundle_identity row has live = true (Kate flips it in /admin)  │
 * │ Anything else returns { mode: 'draft' } WITHOUT touching a send API.    │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Providers (per the locked references):
 *   SMS   — TNZ (Account 606498), Bearer TNZ_AUTH_TOKEN,
 *           https://api.tnz.co.nz/api/v3.00 (reference_tnz_messaging).
 *   Email — Brevo, api-key BREVO_API_KEY (reference_brevo_lead_pipeline).
 *           NEVER re-enable Brevo "Authorised IPs" — cloud IPs rotate.
 *
 * Flipping to live later = set SEND_MODE=live in Vercel + toggle the bundle's
 * `live` in /admin. No code change.
 */

import 'server-only';

export type BundleIdentityRow = {
  bundle_slug: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  telegram_handle: string | null;
  chat_slug: string;
  live: boolean;
  /** shared-number keyword routing (20260705090000) — see lib/identity/inbound.ts */
  keyword_sms: string | null;
  phone_whatsapp: string | null;
  keyword_whatsapp: string | null;
};

export type OutboundReply = {
  channel: 'sms' | 'email' | 'whatsapp';
  /** the human we are replying to (their mobile / email) */
  to: string;
  body: string;
  /** email only */
  subject?: string;
};

export type DeliverResult =
  | { mode: 'draft'; reason: string }
  | { mode: 'sent'; provider: 'tnz' | 'brevo' | 'twilio' }
  | { mode: 'error'; reason: string };

export function sendModeIsLive(): boolean {
  return process.env.SEND_MODE === 'live';
}

/**
 * The single outbound door. Draft mode is the default and is enforced here —
 * callers do not get to bypass it.
 */
export async function deliverReply(
  identity: BundleIdentityRow,
  reply: OutboundReply,
): Promise<DeliverResult> {
  // ── THE HARD DRAFT GATE — do not weaken, do not add bypasses ────────────
  if (!sendModeIsLive()) {
    return { mode: 'draft', reason: 'SEND_MODE is not "live" (draft is the enforced default)' };
  }
  if (identity.live !== true) {
    return { mode: 'draft', reason: `bundle_identity.live is false for ${identity.bundle_slug}` };
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    if (reply.channel === 'sms') {
      return await sendSmsViaTnz(identity, reply);
    }
    if (reply.channel === 'whatsapp') {
      return await sendWhatsAppViaTwilio(reply);
    }
    return await sendEmailViaBrevo(identity, reply);
  } catch (err) {
    return { mode: 'error', reason: err instanceof Error ? err.message : String(err) };
  }
}

/** TNZ v3 SMS send. Only reachable through deliverReply's gate. */
async function sendSmsViaTnz(
  identity: BundleIdentityRow,
  reply: OutboundReply,
): Promise<DeliverResult> {
  const token = process.env.TNZ_AUTH_TOKEN;
  if (!token) return { mode: 'error', reason: 'TNZ_AUTH_TOKEN not configured' };
  if (!identity.phone) {
    return { mode: 'error', reason: `no provisioned phone for ${identity.bundle_slug}` };
  }
  const res = await fetch('https://api.tnz.co.nz/api/v3.00/send/sms', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Reference: `bundle-identity:${identity.bundle_slug}`,
      FromNumber: identity.phone,
      Message: reply.body,
      Destinations: [{ Recipient: reply.to }],
    }),
  });
  if (!res.ok) {
    return { mode: 'error', reason: `TNZ send failed: HTTP ${res.status}` };
  }
  return { mode: 'sent', provider: 'tnz' };
}

/**
 * Twilio WhatsApp send. Only reachable through deliverReply's gate. The sender
 * number is shared across identities, so it comes from env rather than the row.
 */
async function sendWhatsAppViaTwilio(reply: OutboundReply): Promise<DeliverResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER; // 'whatsapp:+64…' format
  if (!sid || !token || !from) {
    return {
      mode: 'error',
      reason: 'TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER not configured',
    };
  }
  const to = reply.to.startsWith('whatsapp:') ? reply.to : `whatsapp:${reply.to}`;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: reply.body }),
  });
  if (!res.ok) {
    return { mode: 'error', reason: `Twilio WhatsApp send failed: HTTP ${res.status}` };
  }
  return { mode: 'sent', provider: 'twilio' };
}

/** Brevo transactional email send. Only reachable through deliverReply's gate. */
async function sendEmailViaBrevo(
  identity: BundleIdentityRow,
  reply: OutboundReply,
): Promise<DeliverResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { mode: 'error', reason: 'BREVO_API_KEY not configured' };
  if (!identity.email) {
    return { mode: 'error', reason: `no email address for ${identity.bundle_slug}` };
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: `${identity.display_name} — assembl`, email: identity.email },
      to: [{ email: reply.to }],
      subject: reply.subject ?? `Re: your message to ${identity.display_name}`,
      textContent: reply.body,
      tags: [`bundle-identity:${identity.bundle_slug}`],
    }),
  });
  if (!res.ok) {
    return { mode: 'error', reason: `Brevo send failed: HTTP ${res.status}` };
  }
  return { mode: 'sent', provider: 'brevo' };
}
