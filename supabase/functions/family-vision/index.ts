import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Family Vision — the read-a-photo half of the Family OS demo.
 *
 * A parent uploads a photo (receipt / fridge / product / newsletter) or a short
 * video to the PRIVATE `family-uploads` bucket. The Next server helper
 * (lib/family/uploads.ts) then calls this function with the storage path. We:
 *
 *  1. Download the file from the bucket via the service-role storage API.
 *  2. Run a per-kind vision extraction through the SAME Gemini gateway as
 *     fridge-to-list (image_url data URI → JSON).
 *  3. Map the result to PROPOSED public.family_items (mirrors family-inbox-sync),
 *     and — for a newsletter with an amount due (e.g. a Kindo payment) — ALSO
 *     file a DRAFT into agent_action_requests. It NEVER submits or pays.
 *  4. Assign an A/B/C trust score and update the family_uploads row.
 *
 * DRAFT-ONLY. Fail-soft: on any error we set family_uploads.status='failed' and
 * return 200 with ok:false — the pipeline never throws uncaught.
 *
 * Privacy Act 2020 / IPP 3A: uploads may contain child data. The bucket is
 * private, all access is service-role only, and rows + objects are purged after
 * 30 days (see 20260715090000_family_uploads.sql).
 *
 * VIDEO LIMITATION: Deno can't decode video frames here. For kind='video' we do
 * NOT attempt frame extraction — we return trust 'C' with a "please add a still
 * frame" summary and create nothing. The UI enforces 30s / 720p framing
 * client-side and sends a captured still (as kind='product'/'newsletter') for a
 * confident read.
 *
 * Body: { path, kind, hub?, uploadedBy?, uploadId? }
 *   path       — object path inside the family-uploads bucket
 *   kind       — 'receipt' | 'fridge' | 'product' | 'newsletter' | 'video'
 *   hub        — family hub (default 'demo')
 *   uploadedBy — who uploaded (label only)
 *   uploadId   — the family_uploads row id to update (also used in source)
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY (same gateway as
 * echo-respond / fridge-to-list). Register [functions.family-vision]
 * verify_jwt = false in config.toml.
 */

const BUCKET = "family-uploads";
const GATEWAY = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// ── Per-kind system prompts ────────────────────────────────────────────────
const RECEIPT_SYSTEM = `You read a New Zealand shopping receipt photo and return JSON ONLY (no prose, no markdown fences):
{
  "store": "",
  "date": "",
  "total": "",
  "line_items": [{ "name": "", "price": "" }],
  "unusual": ["a line that looks out of the ordinary for a family shop, if any"],
  "summary": "One warm plain sentence: what this receipt holds.",
  "confidence": "high" | "medium" | "low"
}
Rules:
- NZ English (kūmara, mince, capsicum). Prices as written on the receipt.
- Only list line_items you can actually read. If the photo is unclear, return line_items: [] and confidence: "low".
- "unusual" = anything a parent might want to eyeball (a big-ticket item, a duplicate charge, an unexpected category). Empty array if nothing stands out.`;

const FRIDGE_SYSTEM = `You look at a photo of a fridge/pantry or a single product and return JSON ONLY (no prose, no markdown fences):
{
  "spotted": ["items you can clearly see"],
  "runningLow": ["items that look almost out"],
  "suggested_items": ["things worth adding to the shopping list"],
  "summary": "One warm plain sentence.",
  "confidence": "high" | "medium" | "low"
}
Rules:
- NZ English. Only list things you can genuinely see as "spotted".
- If the photo is unclear, return spotted: [], runningLow: [], suggested_items: [] and confidence: "low".`;

const NEWSLETTER_SYSTEM = `You are the Family OS — a household assistant for a New Zealand family. You read a school newsletter (or daycare bulletin, sports email, class notice, bill, event invite) captured as a photo and turn it into the family's week.

Rules (never break):
- You EXTRACT and PROPOSE only. You never book, pay, RSVP, message anyone, or spend money. Anything involving money, transport, external messaging, or shopping MUST also appear as an approval.
- Be specific and practical: real dates/times as written, the child's name where given, where a pickup is from.
- Turn "bring X / shared plate / mufti / sports kit" into a shopping list with concrete items (nut-free if the family has an allergy).
- Keep it warm and NZ-family. Only include what's genuinely in the notice — don't invent events.
- memory = durable facts worth keeping (allergies, routines) — only if the notice clearly implies one.
- If the notice names an amount DUE (e.g. a Kindo payment, a camp deposit, a trip cost), capture it in "payment" so it can be drafted for review.

Return ONLY a JSON object of this exact shape (no markdown, no prose):
{
  "summary": "One warm sentence: what this holds for the family.",
  "events":   [{ "title": "", "when_label": "Friday 6pm", "person": "", "location": "" }],
  "tasks":    [{ "title": "", "person": "", "due_label": "" }],
  "pickups":  [{ "child": "", "from": "", "when_label": "", "note": "" }],
  "shopping": [{ "list": "", "items": [""], "reason": "" }],
  "approvals":[{ "title": "", "reason": "", "kind": "money" }],
  "memory":   [{ "fact": "", "person": "" }],
  "payment":  { "title": "", "amount": "", "method": "Kindo", "due_label": "" },
  "confidence": "high" | "medium" | "low"
}
Every array may be empty. "payment" may be omitted if there's no amount due. "kind" is one of "money" | "transport" | "messaging" | "shopping" | "other".
Omit optional string fields rather than sending empty strings where you have nothing.`;

type ReqBody = {
  path?: string;
  kind?: string;
  hub?: string;
  uploadedBy?: string;
  uploadId?: string;
};

type ParsedWeek = {
  summary?: string;
  events?: Array<{ title: string; when_label: string; person?: string; location?: string }>;
  tasks?: Array<{ title: string; person?: string; due_label?: string }>;
  pickups?: Array<{ child: string; from: string; when_label: string; note?: string }>;
  shopping?: Array<{ list: string; items: string[]; reason?: string }>;
  approvals?: Array<{ title: string; reason: string; kind: string }>;
  memory?: Array<{ fact: string; person?: string }>;
  payment?: { title?: string; amount?: string; method?: string; due_label?: string };
  confidence?: string;
};

const VALID_KINDS = ["receipt", "fridge", "product", "newsletter", "video"];

// deno-lint-ignore no-explicit-any
type SB = any;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

// Map a vision "confidence" hint to the A/B/C trust score.
function trustFromConfidence(conf: string | undefined): "A" | "B" | "C" {
  const c = (conf ?? "").toLowerCase();
  if (c === "high") return "A";
  if (c === "low") return "C";
  return "B"; // medium / unknown
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

function guessMime(path: string, fallback: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? fallback;
}

// Base64-encode bytes without blowing the call stack on large files.
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// ── Map an extracted result to PROPOSED family_items rows ──────────────────
function receiptRows(hub: string, source: string, r: Record<string, unknown>): Array<Record<string, unknown>> {
  const rows: Array<Record<string, unknown>> = [];
  const store = String(r.store ?? "a shop");
  const total = String(r.total ?? "");
  const unusual = Array.isArray(r.unusual) ? (r.unusual as string[]) : [];
  const lineItems = Array.isArray(r.line_items) ? r.line_items : [];

  // The receipt itself becomes a memory note so the family has a record.
  rows.push({
    hub,
    kind: "memory",
    title: `Receipt — ${store}${total ? ` ($${String(total).replace(/^\$/, "")})` : ""}`,
    detail: { store, date: r.date ?? null, total, line_items: lineItems, unusual },
    source,
  });

  // Any unusual spend gets flagged as an approval to eyeball (draft only).
  if (unusual.length > 0) {
    rows.push({
      hub,
      kind: "approval",
      title: `Unusual spend at ${store}`,
      detail: { reason: unusual.join("; "), kind: "money", store, total },
      source,
    });
  }
  return rows;
}

function fridgeRows(hub: string, source: string, r: Record<string, unknown>): Array<Record<string, unknown>> {
  const spotted = Array.isArray(r.spotted) ? (r.spotted as string[]) : [];
  const runningLow = Array.isArray(r.runningLow) ? (r.runningLow as string[]) : [];
  const suggested = Array.isArray(r.suggested_items) ? (r.suggested_items as string[]) : [];
  const items = [...new Set([...runningLow, ...suggested])];
  if (items.length === 0) return [];
  return [{
    hub,
    kind: "shopping",
    title: "From the fridge photo",
    detail: { items, reason: "spotted running low / suggested", spotted },
    source,
  }];
}

// Mirrors family-inbox-sync's toRows (which mirrors saveProposed).
function weekRows(hub: string, source: string, week: ParsedWeek): Array<Record<string, unknown>> {
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

async function callVision(
  system: string,
  userText: string,
  dataUri: string | null,
  model: string,
  apiKey: string,
): Promise<Record<string, unknown> | null> {
  try {
    const content: Array<Record<string, unknown>> = [{ type: "text", text: userText }];
    if (dataUri) content.push({ type: "image_url", image_url: { url: dataUri } });

    const resp = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
        max_tokens: 1600,
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      console.error("[family-vision] gateway error", resp.status, await resp.text().catch(() => ""));
      return null;
    }
    const payload = await resp.json();
    const raw = payload?.choices?.[0]?.message?.content ?? "{}";
    return extractJson(raw);
  } catch (e) {
    console.error("[family-vision] vision call failed", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const sb: SB = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const body = (await req.json().catch(() => ({}))) as ReqBody;
  const path = String(body.path ?? "");
  let kind = String(body.kind ?? "").toLowerCase();
  const hub = String(body.hub ?? "demo");
  const uploadedBy = body.uploadedBy ? String(body.uploadedBy) : null;
  const uploadId = body.uploadId ? String(body.uploadId) : null;
  const source = `upload:${uploadId ?? path}`;

  // Update helper — writes back to the family_uploads row if we have an id/path.
  async function markUpload(patch: Record<string, unknown>) {
    try {
      if (uploadId) {
        await sb.from("family_uploads").update(patch).eq("id", uploadId);
      } else if (path) {
        await sb.from("family_uploads").update(patch).eq("storage_path", path);
      }
    } catch (e) {
      console.error("[family-vision] markUpload failed", e);
    }
  }

  try {
    if (!path || !VALID_KINDS.includes(kind)) {
      await markUpload({ status: "failed", summary: "Missing path or unknown kind." });
      return json({ ok: false, error: "path and a valid kind are required" }, 400);
    }

    // ── Video: no frame extraction in Deno. Return trust C, create nothing. ──
    if (kind === "video") {
      const summary = "Video received — please add a still frame for a confident read.";
      await markUpload({ status: "reviewed", trust: "C", summary, review: true, vision: { note: "video not decoded server-side; UI captures a still for a confident read", reasoning: "no frame extraction available in the Deno runtime" } });
      await auditRow(sb, "family-vision", "gemini-2.5-flash", `[FAMILY VISION video] hub ${hub}`, summary);
      return json({ ok: true, uploadId, kind, trust: "C", created: 0, summary });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      await markUpload({ status: "failed", summary: "Vision key not configured." });
      return json({ ok: false, error: "GEMINI_API_KEY not configured" }, 200);
    }

    let model = "gemini-2.5-flash";
    try {
      model = await resolveModel("family-vision", sb);
    } catch {
      // fail soft — keep default
    }

    // ── Download the object from the private bucket ────────────────────────
    const { data: file, error: dlErr } = await sb.storage.from(BUCKET).download(path);
    if (dlErr || !file) {
      console.error("[family-vision] download failed", dlErr);
      await markUpload({ status: "failed", summary: "Could not read the uploaded file." });
      return json({ ok: false, error: "download failed" }, 200);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = guessMime(path, (file as Blob).type || "image/jpeg");
    const dataUri = `data:${mime};base64,${toBase64(bytes)}`;

    // ── Run the per-kind extraction ────────────────────────────────────────
    let rows: Array<Record<string, unknown>> = [];
    let summary = "";
    let trust: "A" | "B" | "C" = "B";
    let vision: Record<string, unknown> = {};
    let paymentDraftId: string | null = null;

    if (kind === "receipt") {
      const r = await callVision(RECEIPT_SYSTEM, "Read this receipt and return the JSON.", dataUri, model, apiKey);
      if (!r) throw new Error("receipt extraction returned nothing");
      summary = String(r.summary ?? "Receipt read.");
      trust = trustFromConfidence(String(r.confidence ?? ""));
      vision = { ...r, reasoning: `trust ${trust} from confidence "${r.confidence ?? "unknown"}"` };
      rows = receiptRows(hub, source, r);
    } else if (kind === "fridge" || kind === "product") {
      const r = await callVision(FRIDGE_SYSTEM, "Look at this photo and return the JSON.", dataUri, model, apiKey);
      if (!r) throw new Error("fridge/product extraction returned nothing");
      summary = String(r.summary ?? "Photo read.");
      trust = trustFromConfidence(String(r.confidence ?? ""));
      vision = { ...r, reasoning: `trust ${trust} from confidence "${r.confidence ?? "unknown"}"` };
      rows = fridgeRows(hub, source, r);
    } else {
      // newsletter → ParsedWeek shape
      const week = (await callVision(NEWSLETTER_SYSTEM, "Read this school notice and return the family's week as JSON.", dataUri, model, apiKey)) as ParsedWeek | null;
      if (!week) throw new Error("newsletter extraction returned nothing");
      summary = String(week.summary ?? "School notice read.");
      trust = trustFromConfidence(week.confidence);
      vision = { ...week, reasoning: `trust ${trust} from confidence "${week.confidence ?? "unknown"}"` };
      rows = weekRows(hub, source, week);

      // If a payment (e.g. a Kindo amount) was found, file a DRAFT — never pay.
      const pay = week.payment;
      const hasAmount = pay && (pay.amount || pay.title);
      if (hasAmount) {
        try {
          const { data: draft } = await sb
            .from("agent_action_requests")
            .insert({
              agent_slug: "family-vision",
              requested_by: source,
              kind: "email_draft",
              payload: {
                subject: `Heads up — ${pay?.title ?? "school payment"}${pay?.amount ? ` (${pay.amount})` : ""}`,
                body: `A payment landed in a school notice:\n\n${pay?.title ?? "Payment"}${pay?.amount ? `\nAmount: ${pay.amount}` : ""}${pay?.method ? `\nVia: ${pay.method}` : ""}${pay?.due_label ? `\nDue: ${pay.due_label}` : ""}\n\nThis is a DRAFT for review — nothing has been paid or sent.`,
                reason: "school payment flagged for review (draft only)",
              },
            })
            .select("id")
            .single();
          paymentDraftId = draft?.id ?? null;
        } catch (e) {
          console.error("[family-vision] payment draft skipped", e);
        }
      }
    }

    // ── Insert proposed family_items ───────────────────────────────────────
    let created = 0;
    if (rows.length > 0) {
      try {
        const { error, count } = await sb.from("family_items").insert(rows, { count: "exact" });
        if (error) console.error("[family-vision] family_items insert error", error);
        else created = count ?? rows.length;
      } catch (e) {
        console.error("[family-vision] family_items insert exception", e);
      }
    }

    await markUpload({ status: "reviewed", trust, summary, vision, review: true });
    await auditRow(
      sb,
      "family-vision",
      model,
      `[FAMILY VISION ${kind}] hub ${hub}, trust ${trust}`,
      `proposed ${created} item(s)${paymentDraftId ? ` + 1 payment draft` : ""}; ${summary}`.slice(0, 300),
    );

    return json({ ok: true, uploadId, kind, trust, created, summary, paymentDraftId });
  } catch (err) {
    // Fail-soft: never throw uncaught.
    console.error("[family-vision] error", err);
    await markUpload({ status: "failed", summary: "Couldn't read this upload clearly." });
    return json({ ok: false, error: String(err), uploadId, kind }, 200);
  }
});

// Audit — mirrors echo-respond / family-inbox-sync.
async function auditRow(sb: SB, code: string, model: string, reqSummary: string, respSummary: string) {
  try {
    await sb.from("audit_log").insert({
      agent_code: code,
      agent_name: "Family Vision",
      model_used: model,
      user_id: "00000000-0000-0000-0000-000000000000",
      request_summary: reqSummary,
      response_summary: respSummary,
      compliance_passed: true,
      data_classification: "INTERNAL",
    });
  } catch (e) {
    console.error("[family-vision] audit error", e);
  }
}
