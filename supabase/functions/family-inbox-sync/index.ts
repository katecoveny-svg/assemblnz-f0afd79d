import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Family Inbox Sync — the always-on reader behind the Family OS demo.
 *
 * Runs every 15 minutes (pg_cron → public.invoke_edge_function). It reads new
 * family email — school newsletters, sports notices, bills, event invites —
 * and turns each one into PROPOSED family_items plus a per-run digest. It is
 * DRAFT-ONLY: it never replies, RSVPs, pays or sends anything. A named adult
 * approves everything in the ops console before it becomes a real handoff.
 *
 * Inbox providers (choose with FAMILY_INBOX_PROVIDER):
 *  - "gmail"   — Gmail API (work address on Google), via an OAuth refresh token
 *  - "outlook" — Microsoft Graph (Kate's personal kateharland@outlook.co.nz,
 *                where the school pānui actually land), via an OAuth refresh token
 *  - neither / no creds → DRY MODE: parses ONE bundled sample newsletter so the
 *    pipeline is exercised end-to-end, but writes NOTHING to prod. This keeps
 *    production clean until Kate connects a real inbox.
 *
 * DEDUPE: before processing a message we check public.family_inbox_seen for its
 * provider message-id and skip if present, then record it. This is the fix for
 * the "same message re-processed every day" bug — we never rely on the unread
 * flag alone (a message can be re-read across runs, or marked unread again).
 *
 * REFRESH TOKEN SOURCE: for each provider we prefer a STORED refresh token from
 * public.family_inbox_tokens (hub, provider) — written by the "Connect Gmail /
 * Outlook" flow (app/api/family/inbox/{connect,callback}). If there's no stored
 * row we fall back to the env token (FAMILY_INBOX_*_REFRESH_TOKEN). This lets the
 * demo go live the moment Kate authorises, with no redeploy. Access tokens are
 * always minted per run from whichever refresh token we resolved.
 *
 * Env:
 *  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (standard)
 *  - GEMINI_API_KEY (the AI gateway; same as echo-respond)
 *  - FAMILY_INBOX_PROVIDER = "gmail" | "outlook" | unset
 *  - Gmail:   GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET (+ optional env
 *             fallback FAMILY_INBOX_GMAIL_REFRESH_TOKEN)
 *  - Outlook: MS_OAUTH_CLIENT_ID, MS_OAUTH_CLIENT_SECRET (+ optional env
 *             fallback FAMILY_INBOX_MS_REFRESH_TOKEN)
 *  - FAMILY_INBOX_HUB (optional, default "demo")
 *  - FAMILY_INBOX_MAX (optional, default 10 — max NEW messages processed per run)
 */

// ── The bundled sample (copied verbatim from lib/family/sample.ts). Copied in
//    rather than imported so the Deno function has no dependency across the
//    TS/Deno boundary. Keep in sync by hand if the demo pānui changes. ────────
const SAMPLE_NEWSLETTER = `Mangawhai Beach School — Week 6 Pānui

Kia ora whānau,

SCHOOL DISCO — this Friday 6:00–8:00pm in the hall. Entry $5 (cash at the door). Glow sticks on sale. Please sign the permission slip that came home Monday and return by Thursday. Pickup at 8:00pm sharp.

SHARED LUNCH — Room 6 (Mila's class) is having a shared lunch this Friday. Please send a plate to share — NUT-FREE please, we have allergies in the class.

NETBALL — Mila has netball training Wednesday 4:30pm at the courts. Wear the red top. Kahawai team photos are also Wednesday, straight after.

CROSS COUNTRY — Years 7–8 (Jack) cross country is next Tuesday, leaving school 9:15am, back by 2:30pm. Bring water, a hat, and sunscreen. Wear house colours.

DENTAL — the mobile dental clinic is here next week. Consent forms went home; please return signed by Monday.

CAMP — Year 8 camp (Jack) is Week 9. The $85 deposit is due by the end of this week via the school app. A packing list will follow.

MUFTI DAY — next Thursday is mufti day, gold coin donation for the school pool fund.

Ngā mihi,
The Mangawhai Beach School office`;

// ── The ParsedWeek system prompt. Copied intent verbatim from lib/family/parse.ts
//    (SYSTEM) so the JSON shape produced here matches saveProposed exactly. ───
const PARSE_SYSTEM = `You are the Family OS — a household assistant for a New Zealand family.
You turn a school newsletter (or daycare bulletin, sports email, class notice, bill, or event invite) into the family's week.

Rules (never break):
- You EXTRACT and PROPOSE only. You never book, pay, RSVP, message anyone, or spend money. Every real-world action becomes an "approval" the adult confirms first.
- Anything involving money, transport, external messaging, or shopping MUST also appear as an approval.
- Be specific and practical: real dates/times as written, the child's name where given, where a pickup is from.
- Turn "bring X / shared plate / mufti / sports kit" into a shopping list with concrete items (nut-free if the family has an allergy).
- Keep it warm and NZ-family (kai, kura, whānau where natural). Only include what's genuinely in the email — don't invent events.
- memory = durable facts worth keeping (allergies, routines, constraints) — only if the email clearly implies one.

You MUST also classify the email into exactly one category:
  "newsletter" | "sports" | "bill" | "event" | "school-admin" | "other".

Return ONLY a JSON object of this exact shape (no markdown, no prose):
{
  "category": "newsletter",
  "summary": "One warm sentence: what this holds for the family.",
  "events":   [{ "title": "", "when_label": "Friday 6pm", "person": "", "location": "" }],
  "tasks":    [{ "title": "", "person": "", "due_label": "" }],
  "pickups":  [{ "child": "", "from": "", "when_label": "", "note": "" }],
  "shopping": [{ "list": "", "items": [""], "reason": "" }],
  "approvals":[{ "title": "", "reason": "", "kind": "money" }],
  "memory":   [{ "fact": "", "person": "" }]
}
Every array may be empty. "kind" is one of "money" | "transport" | "messaging" | "shopping" | "other".
Omit optional string fields (person, location, due_label, note, reason) rather than sending empty strings where you have nothing.`;

type ParsedWeek = {
  category?: string;
  summary?: string;
  events?: Array<{ title: string; when_label: string; person?: string; location?: string }>;
  tasks?: Array<{ title: string; person?: string; due_label?: string }>;
  pickups?: Array<{ child: string; from: string; when_label: string; note?: string }>;
  shopping?: Array<{ list: string; items: string[]; reason?: string }>;
  approvals?: Array<{ title: string; reason: string; kind: string }>;
  memory?: Array<{ fact: string; person?: string }>;
};

type InboxMessage = { id: string; subject: string; body: string };

const VALID_CATEGORIES = ["newsletter", "sports", "bill", "event", "school-admin", "other"];

// ── Refresh-token resolution (stored first, then env) ───────────────────────
// deno-lint-ignore no-explicit-any
async function resolveRefreshToken(sb: any, hub: string, provider: "gmail" | "outlook", envFallback?: string): Promise<string | null> {
  try {
    const { data } = await sb
      .from("family_inbox_tokens")
      .select("refresh_token")
      .eq("hub", hub)
      .eq("provider", provider)
      .maybeSingle();
    if (data?.refresh_token) return data.refresh_token as string;
  } catch (e) {
    console.error("[family-inbox-sync] token lookup failed (falling back to env):", e);
  }
  return envFallback ?? null;
}

// ── Token minting ──────────────────────────────────────────────────────────
async function mintGmailToken(refresh: string | null): Promise<string | null> {
  const clientId = Deno.env.get("GMAIL_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_OAUTH_CLIENT_SECRET");
  if (!refresh || !clientId || !clientSecret) return null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      console.error("[family-inbox-sync] gmail token error:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.access_token ?? null;
  } catch (e) {
    console.error("[family-inbox-sync] gmail token exception:", e);
    return null;
  }
}

async function mintOutlookToken(refresh: string | null): Promise<string | null> {
  const clientId = Deno.env.get("MS_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("MS_OAUTH_CLIENT_SECRET");
  if (!refresh || !clientId || !clientSecret) return null;
  try {
    const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh,
        grant_type: "refresh_token",
        scope: "https://graph.microsoft.com/Mail.Read offline_access",
      }),
    });
    if (!res.ok) {
      console.error("[family-inbox-sync] outlook token error:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.access_token ?? null;
  } catch (e) {
    console.error("[family-inbox-sync] outlook token exception:", e);
    return null;
  }
}

// ── Message fetch (unread in inbox, capped) ────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeBase64Url(data: string): string {
  try {
    const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

// Walk a Gmail payload tree and pull the best text we can find.
function extractGmailBody(payload: unknown): string {
  const p = payload as { mimeType?: string; body?: { data?: string }; parts?: unknown[] };
  if (!p) return "";
  if (p.body?.data && (p.mimeType === "text/plain" || p.mimeType === "text/html")) {
    const text = decodeBase64Url(p.body.data);
    return p.mimeType === "text/html" ? stripHtml(text) : text;
  }
  if (Array.isArray(p.parts)) {
    // prefer text/plain, fall back to anything
    const plain = p.parts.find((x) => (x as { mimeType?: string }).mimeType === "text/plain");
    const html = p.parts.find((x) => (x as { mimeType?: string }).mimeType === "text/html");
    const chosen = plain ?? html ?? p.parts[0];
    return extractGmailBody(chosen);
  }
  return "";
}

async function fetchGmailMessages(token: string, max: number): Promise<InboxMessage[]> {
  const out: InboxMessage[] = [];
  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent("is:unread in:inbox")}&maxResults=${max}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!listRes.ok) {
      console.error("[family-inbox-sync] gmail list error:", listRes.status, await listRes.text());
      return out;
    }
    const list = await listRes.json();
    const ids: string[] = (list.messages ?? []).map((m: { id: string }) => m.id);
    for (const id of ids.slice(0, max)) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!msgRes.ok) continue;
      const msg = await msgRes.json();
      const headers: Array<{ name: string; value: string }> = msg.payload?.headers ?? [];
      const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value ?? "(no subject)";
      const body = extractGmailBody(msg.payload) || msg.snippet || "";
      out.push({ id, subject, body });
    }
  } catch (e) {
    console.error("[family-inbox-sync] gmail fetch exception:", e);
  }
  return out;
}

async function fetchOutlookMessages(token: string, max: number): Promise<InboxMessage[]> {
  const out: InboxMessage[] = [];
  try {
    const url =
      `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages` +
      `?$filter=isRead eq false&$top=${max}&$select=id,subject,body,bodyPreview&$orderby=receivedDateTime desc`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error("[family-inbox-sync] outlook list error:", res.status, await res.text());
      return out;
    }
    const data = await res.json();
    for (const m of (data.value ?? []).slice(0, max)) {
      const contentType = m.body?.contentType ?? "text";
      const raw = m.body?.content ?? m.bodyPreview ?? "";
      const body = contentType === "html" ? stripHtml(raw) : raw;
      out.push({ id: m.id as string, subject: (m.subject as string) ?? "(no subject)", body });
    }
  } catch (e) {
    console.error("[family-inbox-sync] outlook fetch exception:", e);
  }
  return out;
}

// ── Parse one message into a ParsedWeek via the Gemini gateway ──────────────
async function parseMessage(
  msg: InboxMessage,
  model: string,
  apiKey: string,
): Promise<ParsedWeek | null> {
  try {
    const aiResp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: PARSE_SYSTEM },
            {
              role: "user",
              content: `Subject: ${msg.subject}\n\nHere is the email. Classify it and extract the family's week as JSON:\n\n"""${msg.body.slice(0, 8000)}"""`,
            },
          ],
          max_tokens: 1400,
          response_format: { type: "json_object" },
        }),
      },
    );
    if (!aiResp.ok) {
      console.error("[family-inbox-sync] AI gateway error:", aiResp.status, await aiResp.text());
      return null;
    }
    const aiData = await aiResp.json();
    const raw = aiData.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    // Be forgiving if the model wraps JSON in a fence.
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonText) as ParsedWeek;
    let category = (parsed.category ?? "other").toLowerCase();
    if (!VALID_CATEGORIES.includes(category)) category = "other";
    parsed.category = category;
    return parsed;
  } catch (e) {
    console.error("[family-inbox-sync] parse exception:", e);
    return null;
  }
}

// ── Map a ParsedWeek to family_items rows (mirrors saveProposed) ────────────
function toRows(hub: string, source: string, week: ParsedWeek): Array<Record<string, unknown>> {
  const rows: Array<Record<string, unknown>> = [];
  for (const e of week.events ?? []) {
    rows.push({ hub, kind: "event", title: e.title, when_label: e.when_label, person: e.person ?? null, location: e.location ?? null, detail: {}, source });
  }
  for (const t of week.tasks ?? []) {
    rows.push({ hub, kind: "task", title: t.title, person: t.person ?? null, when_label: t.due_label ?? null, detail: {}, source });
  }
  for (const p of week.pickups ?? []) {
    rows.push({ hub, kind: "pickup", title: `${p.child} — ${p.from}`, person: p.child, location: p.from, when_label: p.when_label, detail: { note: p.note ?? null, assigned: null, backup: null }, source });
  }
  for (const s of week.shopping ?? []) {
    rows.push({ hub, kind: "shopping", title: s.list, detail: { items: s.items, reason: s.reason ?? null }, source });
  }
  for (const a of week.approvals ?? []) {
    rows.push({ hub, kind: "approval", title: a.title, detail: { reason: a.reason, kind: a.kind }, source });
  }
  for (const m of week.memory ?? []) {
    rows.push({ hub, kind: "memory", title: m.fact, person: m.person ?? null, detail: {}, source });
  }
  return rows;
}

// deno-lint-ignore no-explicit-any
type SB = any;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sb: SB = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const hub = Deno.env.get("FAMILY_INBOX_HUB") || "demo";
  const provider = (Deno.env.get("FAMILY_INBOX_PROVIDER") || "").toLowerCase();
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  const maxMsgs = Number(Deno.env.get("FAMILY_INBOX_MAX") || "10") || 10;

  const summary = {
    ok: true as boolean,
    provider: provider || "none",
    dry_run: false as boolean,
    scanned: 0,
    created_items: 0,
    categories: {} as Record<string, number>,
    would_create: 0,
    notes: [] as string[],
  };

  try {
    let model = "gemini-2.5-flash";
    try {
      model = await resolveModel("family-inbox", sb);
    } catch {
      // fail soft — keep DEFAULT
    }

    // ── 1. Gather messages ──────────────────────────────────────────────
    let messages: InboxMessage[] = [];
    let dryRun = false;

    if (provider === "gmail") {
      const refresh = await resolveRefreshToken(sb, hub, "gmail", Deno.env.get("FAMILY_INBOX_GMAIL_REFRESH_TOKEN"));
      const token = await mintGmailToken(refresh);
      if (!token) {
        dryRun = true;
        summary.notes.push("gmail creds incomplete — falling back to dry run");
      } else {
        messages = await fetchGmailMessages(token, maxMsgs);
      }
    } else if (provider === "outlook") {
      const refresh = await resolveRefreshToken(sb, hub, "outlook", Deno.env.get("FAMILY_INBOX_MS_REFRESH_TOKEN"));
      const token = await mintOutlookToken(refresh);
      if (!token) {
        dryRun = true;
        summary.notes.push("outlook creds incomplete — falling back to dry run");
      } else {
        messages = await fetchOutlookMessages(token, maxMsgs);
      }
    } else {
      dryRun = true;
    }

    if (dryRun) {
      console.log("[family-inbox-sync] no inbox creds — dry run");
      messages = [{ id: `sample:${new Date().toISOString().slice(0, 10)}`, subject: "Mangawhai Beach School — Week 6 Pānui", body: SAMPLE_NEWSLETTER }];
    }

    summary.dry_run = dryRun;
    summary.scanned = messages.length;

    // ── 2. Dedupe + process ─────────────────────────────────────────────
    for (const msg of messages) {
      // DEDUPE: skip anything we've already seen. In dry mode we still check +
      // record so a scheduled dry run doesn't re-report the sample every tick.
      try {
        const { data: seen } = await sb
          .from("family_inbox_seen")
          .select("message_id")
          .eq("message_id", msg.id)
          .maybeSingle();
        if (seen) continue;
      } catch (e) {
        console.error("[family-inbox-sync] dedupe check failed (processing anyway):", e);
      }

      let category = "other";
      let week: ParsedWeek | null = null;
      if (apiKey) {
        week = await parseMessage(msg, model, apiKey);
        if (week?.category) category = week.category;
      } else {
        summary.notes.push("GEMINI_API_KEY not set — messages recorded but not parsed");
      }

      summary.categories[category] = (summary.categories[category] ?? 0) + 1;

      // Record the message as seen (so it's never re-processed — the fix for the
      // "same message every day" bug). Best-effort; a failure here just means
      // we might re-see it next run, which dedupe would then catch.
      try {
        await sb.from("family_inbox_seen").insert({
          message_id: msg.id,
          provider: dryRun ? "dry" : provider,
          hub,
          category,
          subject: msg.subject?.slice(0, 300) ?? null,
        });
      } catch (e) {
        console.error("[family-inbox-sync] seen insert failed:", e);
      }

      // In DRY MODE we DO NOT write proposed items — report only.
      if (dryRun) {
        const wouldRows = week ? toRows(hub, `inbox:${msg.id}`, week) : [];
        summary.would_create += wouldRows.length;
        continue;
      }

      // ── Insert proposed family_items (hub, source=inbox:<id>) ──────────
      if (week) {
        const rows = toRows(hub, `inbox:${msg.id}`, week);
        if (rows.length > 0) {
          try {
            const { error, count } = await sb.from("family_items").insert(rows, { count: "exact" });
            if (error) {
              console.error("[family-inbox-sync] family_items insert error:", error);
            } else {
              summary.created_items += count ?? rows.length;
            }
          } catch (e) {
            console.error("[family-inbox-sync] family_items insert exception:", e);
          }
        }

        // Optional: file a DRAFT email_draft into agent_action_requests for
        // bills / high-value items, matching createActionRequest's row shape.
        // It rests 'pending' — nothing is ever sent (dispatch is off by design).
        if (category === "bill" && (week.approvals ?? []).some((a) => a.kind === "money")) {
          try {
            const moneyApproval = (week.approvals ?? []).find((a) => a.kind === "money");
            await sb.from("agent_action_requests").insert({
              agent_slug: "family-inbox",
              requested_by: `inbox:${msg.id}`,
              kind: "email_draft",
              payload: {
                subject: `Heads up — ${moneyApproval?.title ?? msg.subject}`,
                body: `A bill or payment landed in the family inbox:\n\n${moneyApproval?.title ?? msg.subject}\n${moneyApproval?.reason ?? ""}\n\nThis is a DRAFT for review — nothing has been paid or sent.`,
                reason: "family bill flagged for review (draft only)",
              },
            });
          } catch (e) {
            console.error("[family-inbox-sync] action-request draft skipped:", e);
          }
        }
      }
    }

    // ── 3. Record the run summary ───────────────────────────────────────
    try {
      await sb.from("family_inbox_runs").insert({
        provider: dryRun ? "dry" : provider,
        dry_run: dryRun,
        scanned: summary.scanned,
        created_items: summary.created_items,
        categories: summary.categories,
      });
    } catch (e) {
      console.error("[family-inbox-sync] run summary insert failed:", e);
    }

    // ── 4. Audit (mirrors echo-respond) ─────────────────────────────────
    try {
      await sb.from("audit_log").insert({
        agent_code: "family-inbox",
        agent_name: "Family Inbox Sync",
        model_used: model,
        user_id: "00000000-0000-0000-0000-000000000000",
        request_summary: `[FAMILY INBOX ${dryRun ? "DRY" : provider}] scanned ${summary.scanned} message(s), hub ${hub}`,
        response_summary: `proposed ${summary.created_items} item(s); categories ${JSON.stringify(summary.categories)}${dryRun ? ` (dry-run, would create ${summary.would_create})` : ""}`,
        compliance_passed: true,
        data_classification: "INTERNAL",
      });
    } catch (e) {
      console.error("[family-inbox-sync] audit error:", e);
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // Fail-soft: never throw uncaught.
    console.error("[family-inbox-sync] error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err), ...summary }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
