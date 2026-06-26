// agent-email-outbound — send an agent reply FROM <agent>@assembl.co.nz.
//
// The Deno/Supabase sender, for the scheduled-reply and inbound auto-reply
// paths. The Next/Node path (admin reply UI, chat "send as email") sends via
// lib/agent-email/send.ts — same Brevo call, same canon template.
//
// POST { agentSlug, agentName, to, subject, body, threadId? }
// Gated by a shared token in the X-Agent-Email-Token header (fail-closed).
//
// Brevo: the FROM must be an authorised sender on assembl.co.nz (SPF/DKIM/DMARC).
// NEVER re-enable Brevo's "Authorised IPs" allowlist — it silently breaks sends.
//
// Env:
//   AGENT_EMAIL_OUTBOUND_TOKEN  (required)  shared secret for callers
//   BREVO_API_KEY               (required)
//   AGENT_EMAIL_DOMAIN          (optional)  default 'assembl.co.nz'
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected)
//
// Deploy: supabase functions deploy agent-email-outbound

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DOMAIN = Deno.env.get("AGENT_EMAIL_DOMAIN") ?? "assembl.co.nz";

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

function agentEmailAddress(slug: string): string | null {
  const local = AGENT_EMAIL_LOCAL_PART[slug];
  return local ? `${local}@${DOMAIN}` : null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Lato', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'Space Mono', 'SFMono-Regular', Menlo, Consolas, monospace";
const C = { canary: "#FFD42A", ink: "#3A3832", body: "#56544B", paper: "#FFFFFF", cream: "#FFF7EC", hairline: "#EFEADC", gold: "#C79B1F", muted: "#8A8678" };

function bodyToHtml(text: string): string {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, "<br>"))
    .map((p) => `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.body};">${p}</p>`)
    .join("");
}

function renderHtml(agentName: string, agentEmail: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(agentName)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.paper};border:1px solid ${C.hairline};border-radius:18px;overflow:hidden;">
<tr><td style="height:4px;background:${C.canary};line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:32px 36px 8px;">
<p style="margin:0 0 4px;font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.gold};">From your agent</p>
<h1 style="margin:0;font-family:${SERIF};font-weight:600;font-size:34px;line-height:1.1;letter-spacing:-0.02em;color:${C.ink};">${escapeHtml(agentName)}</h1>
</td></tr>
<tr><td style="padding:20px 36px 8px;">${bodyToHtml(body)}</td></tr>
<tr><td style="padding:8px 36px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.hairline};margin-top:8px;">
<tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
<tr><td>
<p style="margin:0;font-family:${MONO};font-size:12px;letter-spacing:0.04em;color:${C.muted};">${escapeHtml(agentName)} · <a href="mailto:${escapeHtml(agentEmail)}" style="color:${C.gold};text-decoration:none;">${escapeHtml(agentEmail)}</a></p>
<p style="margin:10px 0 0;font-family:${SERIF};font-weight:600;font-size:22px;letter-spacing:-0.01em;color:${C.ink};">assembl</p>
<p style="margin:4px 0 0;font-family:${SANS};font-size:12px;color:${C.muted};">Specialist Aotearoa agents, assembled into one calm surface.</p>
</td></tr></table>
</td></tr></table>
<p style="margin:16px 0 0;font-family:${SANS};font-size:11px;color:${C.muted};">Reply to this email to keep the thread going.</p>
</td></tr></table></body></html>`;
}

function renderText(agentName: string, agentEmail: string, body: string): string {
  return `${body.trim()}\n\n— ${agentName}\n${agentEmail}\n\nassembl · Specialist Aotearoa agents, assembled into one calm surface.\nReply to this email to keep the thread going.`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const token = Deno.env.get("AGENT_EMAIL_OUTBOUND_TOKEN");
  if (!token) return new Response(JSON.stringify({ error: "Sender not configured" }), { status: 500 });
  if (req.headers.get("X-Agent-Email-Token") !== token) {
    return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401 });
  }

  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey) return new Response(JSON.stringify({ error: "BREVO_API_KEY not configured" }), { status: 500 });

  let p: Record<string, unknown>;
  try { p = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  const agentSlug = String(p.agentSlug ?? "");
  const agentName = String(p.agentName ?? agentSlug);
  const to = String(p.to ?? "").trim();
  const body = String(p.body ?? "");
  const subject = (String(p.subject ?? "").trim()) || `Reply from ${agentName}`;
  const threadId = p.threadId ? String(p.threadId) : null;

  const agentEmail = agentEmailAddress(agentSlug);
  if (!agentEmail) return new Response(JSON.stringify({ error: `Agent "${agentSlug}" has no inbox` }), { status: 400 });
  if (!to.includes("@")) return new Response(JSON.stringify({ error: "Valid recipient required" }), { status: 400 });

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": brevoKey },
    body: JSON.stringify({
      sender: { name: agentName, email: agentEmail },
      replyTo: { name: agentName, email: agentEmail },
      to: [{ email: to }],
      subject,
      htmlContent: renderHtml(agentName, agentEmail, body),
      textContent: renderText(agentName, agentEmail, body),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[agent-email-outbound] Brevo error", data);
    return new Response(JSON.stringify({ error: data?.message || `Send failed (${res.status})` }), { status: res.status });
  }

  if (threadId) {
    try {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const nowIso = new Date().toISOString();
      await supabase.from("agent_email_messages").insert({
        thread_id: threadId,
        direction: "outbound",
        from_email: agentEmail,
        to_email: to,
        subject,
        body,
        raw: { provider: "brevo", messageId: data?.messageId ?? null },
      });
      await supabase.from("agent_email_threads")
        .update({ last_message_at: nowIso, updated_at: nowIso, status: "open" })
        .eq("id", threadId);
    } catch (e) {
      console.error("[agent-email-outbound] thread log failed", e);
    }
  }

  return new Response(JSON.stringify({ ok: true, from: agentEmail, messageId: data?.messageId ?? null }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
