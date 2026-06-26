// agent-email-inbound — AgentMail webhook → agent email thread.
//
// Inbound mail to <local-part>@assembl.co.nz is relayed here by AgentMail. We:
//   1. verify the AgentMail HMAC signature (fail-closed if no secret),
//   2. resolve the `to:` local-part to an agent (agents.email_slug, then slug),
//   3. run a Privacy-Act pass: redact NZ PII, and quarantine any email carrying
//      credentials / passwords / payment data (the agent never sees the raw),
//   4. find-or-create the (agent, sender) thread and append the message,
//   5. optionally auto-acknowledge ("Got your email — I'll respond shortly").
//
// The untouched original + attachments are kept in agent_email_messages.raw
// (service-role only) as the audit / Mana Receipt evidence trail.
//
// This is ADDITIVE — it does not touch the toro_drafts AgentMail-inbound flow
// (term-*@toro.nz), which routes to a different recipient domain.
//
// Env:
//   AGENTMAIL_WEBHOOK_SECRET  (required)  HMAC-SHA256 secret; fail-closed if unset
//   AGENT_EMAIL_DOMAIN        (optional)  default 'assembl.co.nz'
//   AGENT_EMAIL_AUTO_ACK      (optional)  'true' to send an auto-acknowledgement
//   BREVO_API_KEY             (optional)  needed only for the auto-ack send
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected)
//
// Deploy: supabase functions deploy agent-email-inbound --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { redactNzPii } from "../_shared/nz-pii-redact.ts";

const DOMAIN = Deno.env.get("AGENT_EMAIL_DOMAIN") ?? "assembl.co.nz";

// Mirror of lib/agent-email/addresses.ts (Deno can't import the app module).
const AGENT_EMAIL_LOCAL_PART: Record<string, string> = {
  atlas: "atlas",
  "tax-tidy": "tax-tidy",
  "customs-entry": "customs",
  "care-scribe": "care-scribe",
  "voice-cs": "voice-cs",
  "food-temp-logs": "food-temp",
  "stock-count": "stock-count",
  "compliance-check": "compliance",
  "maritime-brief": "maritime",
  arataki: "arataki",
};

function agentSlugForLocalPart(localPart: string): string | null {
  const lower = localPart.trim().toLowerCase();
  for (const [slug, local] of Object.entries(AGENT_EMAIL_LOCAL_PART)) {
    if (local === lower) return slug;
  }
  return null;
}

// ── Quarantine scan (mirror of lib/agent-email/safety.ts) ──────────────────
const CARD_RE = /\b(?:\d[ -]?){13,16}\b/;
const CVV_RE = /\b(?:cvv|cvc|cvv2|security code)\b\s*[:#]?\s*\d{3,4}\b/i;
const PASSWORD_RE = /\b(?:password|passwd|pwd|passcode|pass\s?phrase)\b\s*[:=]\s*\S+/i;
const PIN_RE = /\b(?:pin|pin\s?number)\b\s*[:=#]?\s*\d{3,8}\b/i;
const SECRET_RE = /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token|bearer|client[_-]?secret)\b\s*[:=]?\s*\S+/i;
const KEY_PREFIX_RE = /\b(?:sk_live_|sk_test_|pk_live_|xox[baprs]-|ghp_|AKIA)[A-Za-z0-9_-]{8,}/;
const PRIVATE_KEY_RE = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;

function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function scanSensitive(text: string): { quarantine: boolean; reason: string | null } {
  if (!text) return { quarantine: false, reason: null };
  if (PRIVATE_KEY_RE.test(text)) return { quarantine: true, reason: "private key" };
  if (KEY_PREFIX_RE.test(text)) return { quarantine: true, reason: "API key / token" };
  if (SECRET_RE.test(text)) return { quarantine: true, reason: "credential or secret" };
  if (PASSWORD_RE.test(text)) return { quarantine: true, reason: "password" };
  if (PIN_RE.test(text)) return { quarantine: true, reason: "PIN" };
  if (CVV_RE.test(text)) return { quarantine: true, reason: "card security code" };
  const m = text.match(CARD_RE);
  if (m) {
    const digits = m[0].replace(/[^\d]/g, "");
    if (digits.length >= 13 && digits.length <= 16 && luhnValid(digits)) {
      return { quarantine: true, reason: "payment card number" };
    }
  }
  return { quarantine: false, reason: null };
}

const QUARANTINE_PLACEHOLDER =
  "This email contained sensitive content (credentials or payment data) and was held for human review. The agent has not seen the raw message.";

// ── HMAC verification ──────────────────────────────────────────────────────
async function verifySignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const got = signature.trim().replace(/^sha256=/i, "").toLowerCase();
  // Constant-ish time compare.
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// ── Payload normalisation (defensive — AgentMail field names vary) ──────────
function extractEmail(v: unknown): { email: string; name: string | null } {
  if (!v) return { email: "", name: null };
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { email: String(o.email ?? o.address ?? "").toLowerCase(), name: o.name ? String(o.name) : null };
  }
  const s = String(v);
  const m = s.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { email: m[2].toLowerCase().trim(), name: m[1].replace(/^"|"$/g, "").trim() || null };
  return { email: s.toLowerCase().trim(), name: null };
}

function recipientList(v: unknown): { email: string; name: string | null }[] {
  if (Array.isArray(v)) return v.map(extractEmail);
  if (typeof v === "string") return v.split(",").map(extractEmail);
  if (v) return [extractEmail(v)];
  return [];
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("AGENTMAIL_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[agent-email-inbound] AGENTMAIL_WEBHOOK_SECRET not set — refusing (fail-closed).");
    return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-AgentMail-Signature") ?? req.headers.get("x-agentmail-signature");
  if (!(await verifySignature(rawBody, signature, secret))) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Some webhooks nest the message under `message` / `data`.
  const msg = (payload.message ?? payload.data ?? payload) as Record<string, unknown>;

  const messageId = String(
    msg.message_id ?? msg.id ?? payload.message_id ?? payload.id ?? crypto.randomUUID(),
  );
  const from = extractEmail(msg.from ?? payload.from);
  const tos = recipientList(msg.to ?? payload.to);
  const subject = String(msg.subject ?? payload.subject ?? "(no subject)").slice(0, 500);
  const textBody = String(msg.text ?? msg.text_body ?? msg.plain ?? payload.text ?? "");
  const htmlBody = String(msg.html ?? msg.html_body ?? payload.html ?? "");
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];

  // Find the recipient at our domain and resolve it to an agent.
  const ours = tos.find((t) => t.email.endsWith(`@${DOMAIN}`));
  if (!ours) {
    console.warn("[agent-email-inbound] no recipient at", DOMAIN, "— ignoring", messageId);
    return new Response(JSON.stringify({ ok: true, ignored: "no-matching-recipient" }), { status: 200 });
  }
  const localPart = ours.email.split("@")[0];
  const mappedSlug = agentSlugForLocalPart(localPart);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Match on email_slug (pretty) first, then raw slug fallback.
  const { data: agent } = await supabase
    .from("agents")
    .select("id, slug, name, email_slug")
    .or(`email_slug.eq.${localPart}${mappedSlug ? `,slug.eq.${mappedSlug}` : ""},slug.eq.${localPart}`)
    .limit(1)
    .maybeSingle();

  if (!agent) {
    console.warn("[agent-email-inbound] no agent for local-part", localPart, "— ignoring", messageId);
    return new Response(JSON.stringify({ ok: true, ignored: "unknown-agent" }), { status: 200 });
  }

  if (!from.email) {
    return new Response(JSON.stringify({ ok: true, ignored: "no-sender" }), { status: 200 });
  }

  // Idempotency: AgentMail may redeliver.
  const { data: dupe } = await supabase
    .from("agent_email_messages")
    .select("id")
    .eq("agentmail_message_id", messageId)
    .maybeSingle();
  if (dupe) {
    return new Response(JSON.stringify({ ok: true, deduped: true }), { status: 200 });
  }

  // Privacy-Act pass: quarantine first, else redact NZ PII.
  const scanText = `${subject}\n${textBody}`;
  const scan = scanSensitive(scanText);
  let safeBody: string;
  let redactionStats: unknown = null;
  if (scan.quarantine) {
    safeBody = QUARANTINE_PLACEHOLDER;
  } else {
    const r = redactNzPii(textBody);
    safeBody = r.redacted;
    redactionStats = r.stats;
  }

  // Find or create the (agent, sender) thread.
  const nowIso = new Date().toISOString();
  let threadId: string;
  const { data: existing } = await supabase
    .from("agent_email_threads")
    .select("id")
    .eq("agent_slug", agent.slug)
    .eq("customer_email", from.email)
    .maybeSingle();

  if (existing) {
    threadId = existing.id as string;
    await supabase
      .from("agent_email_threads")
      .update({
        last_message_at: nowIso,
        updated_at: nowIso,
        status: scan.quarantine ? "quarantined" : "open",
        customer_name: from.name ?? undefined,
      })
      .eq("id", threadId);
  } else {
    const { data: created, error: insErr } = await supabase
      .from("agent_email_threads")
      .insert({
        agent_id: agent.id,
        agent_slug: agent.slug,
        customer_email: from.email,
        customer_name: from.name,
        subject,
        status: scan.quarantine ? "quarantined" : "open",
        last_message_at: nowIso,
      })
      .select("id")
      .single();
    if (insErr || !created) {
      console.error("[agent-email-inbound] thread insert failed", insErr);
      return new Response(JSON.stringify({ error: "thread insert failed" }), { status: 500 });
    }
    threadId = created.id as string;
  }

  const { error: msgErr } = await supabase.from("agent_email_messages").insert({
    thread_id: threadId,
    direction: "inbound",
    from_email: from.email,
    to_email: ours.email,
    subject,
    body: safeBody,
    raw: { text: textBody, html: htmlBody, from: from.email, to: ours.email, headers: payload.headers ?? null },
    attachments,
    quarantined: scan.quarantine,
    quarantine_reason: scan.reason,
    redaction_stats: redactionStats,
    agentmail_message_id: messageId,
  });
  if (msgErr) {
    console.error("[agent-email-inbound] message insert failed", msgErr);
    return new Response(JSON.stringify({ error: "message insert failed" }), { status: 500 });
  }

  // Optional auto-acknowledgement (skipped for quarantined mail).
  if (Deno.env.get("AGENT_EMAIL_AUTO_ACK") === "true" && !scan.quarantine) {
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (brevoKey) {
      const agentEmail = ours.email;
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": brevoKey },
          body: JSON.stringify({
            sender: { name: agent.name, email: agentEmail },
            replyTo: { name: agent.name, email: agentEmail },
            to: [{ email: from.email, name: from.name ?? undefined }],
            subject: `Re: ${subject}`,
            textContent: `Got your email — I'll respond shortly.\n\n— ${agent.name}\n${agentEmail}`,
          }),
        });
      } catch (e) {
        console.error("[agent-email-inbound] auto-ack failed", e);
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, agent: agent.slug, thread_id: threadId, quarantined: scan.quarantine }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
