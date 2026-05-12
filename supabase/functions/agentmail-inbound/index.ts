/**
 * Tōro · AgentMail inbound webhook (Term Planner)
 * ================================================
 * Receives AgentMail webhook deliveries when a whānau forwards a school
 * comm to `term-<whanau-id>@toro.nz`, verifies the HMAC signature, parses
 * the payload (text body + PDF attachments + image attachments), runs the
 * schema-driven notice parser to extract typed actions (calendar / payment
 * / gear / permission / transition), and inserts a draft into
 * `public.toro_drafts` with status `pending_approval` for the parent to
 * review.
 *
 * Pipeline (matches the staged-but-missing spec from the earlier session,
 * rebuilt 2026-05-13 against the canon at
 * `outputs/CODE-BRIEF-TORO-LAUNCH-2026-05-12.md`):
 *
 *   1. HMAC verify (raw body, X-AgentMail-Signature, AGENTMAIL_WEBHOOK_SECRET)
 *   2. Parse recipient (`term-<whanau-id>@toro.nz`) → resolve tenant
 *   3. Idempotency check (whanau_id, agentmail_message_id)
 *   4. Collect text inputs: email body + PDF text (unpdf) + image vision
 *   5. NZ-PII redact the cleartext body before persisting
 *   6. Call notice-parser (Claude Opus 4.7 by default) → ExtractedAction[]
 *   7. Insert toro_drafts row (status='pending_approval', source='agentmail',
 *      source_metadata={...}, extracted_actions=[...], retention_class)
 *   8. Insert toro_draft_transitions audit row (null → 'pending_approval')
 *   9. Best-effort Mana Receipt write (mana edge function or evidence_packs)
 *  10. On any parse failure: still insert the draft (parse_failed marker) so
 *      the parent sees the inbound and can act manually — the brief is
 *      explicit that we never silently drop a forwarded comm.
 *
 * Hard rules (Plugin Canon §1, TORO_HARD_RULES):
 *   - status='pending_approval' is the only landing state. No auto-send.
 *   - Never message a child directly (TORO_HARD_RULES §4).
 *   - All extracted_actions land under retention_class='kids_data' if any
 *     action carries a kid_name (drives IPP 3A + Privacy Act retention).
 *
 * Env (Supabase project settings → Edge Functions → secrets):
 *   SUPABASE_URL                  (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY     (auto-injected)
 *   AGENTMAIL_WEBHOOK_SECRET      HMAC secret AgentMail signs deliveries with
 *   AGENTMAIL_DOMAIN              expected recipient domain (default 'toro.nz')
 *   ANTHROPIC_API_KEY             used by callLlm + callClaudeVision
 *
 * Deploy:
 *   supabase functions deploy agentmail-inbound --no-verify-jwt
 *
 * Webhook URL pattern (after deploy):
 *   https://<project-ref>.functions.supabase.co/agentmail-inbound
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { redactNzPii } from "../_shared/nz-pii-redact.ts";
import { extractPdfText, callClaudeVision } from "../_shared/pdf-extract.ts";
import { parseNotice, type ExtractedAction, type ParseStatus } from "../_shared/notice-parser.ts";
import {
  parseRecipient,
  clampConfidence,
  guessSchool,
  renderDraftBody,
} from "./lib.ts";

const DEFAULT_DOMAIN = "toro.nz";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agentmail-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── HMAC verification ───────────────────────────────────────────────────

/**
 * Constant-time HMAC-SHA256 verify. AgentMail signs the raw request body
 * with the per-webhook secret and ships the hex digest in
 * `X-AgentMail-Signature` (with an optional `sha256=` prefix that some
 * relays include).
 */
async function verifyAgentmailHmac(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false;

  // Some webhook relays prefix the digest. Strip it before compare.
  const cleaned = signature.startsWith("sha256=") ? signature.slice(7) : signature;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== cleaned.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ cleaned.charCodeAt(i);
  }
  return mismatch === 0;
}

// ─── AgentMail webhook payload ───────────────────────────────────────────

/**
 * AgentMail webhook shape (best-effort; tolerant of minor variation). The
 * relay docs aren't pinned in our memory yet (reference_agentmail_config.md
 * is missing on disk), so this type is the conservative subset we know
 * we'll see in practice. Fields we don't recognise pass through to
 * source_metadata.raw_payload for forensics.
 */
interface AgentMailAttachment {
  filename?: string;
  content_type?: string;
  // Either base64 bytes inline or a URL to download. AgentMail v1 uses
  // inline base64; we ignore url-based delivery in v1 (would require an
  // extra fetch + auth dance).
  content_base64?: string;
}

interface AgentMailPayload {
  id?: string;                 // message id
  received_at?: string;        // iso8601
  from?: string;
  to?: string;
  cc?: string;
  subject?: string;
  text?: string;               // plaintext body
  html?: string;               // html body (we strip on use)
  attachments?: AgentMailAttachment[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve whanau_id (either a tenants.id UUID or a tenants.slug) to the
 * real tenant row. Returns the row or null if not found / inactive.
 */
async function resolveTenant(
  sb: ReturnType<typeof createClient>,
  whanauId: string,
): Promise<
  { id: string; slug: string; name: string; plan: string } | null
> {
  const isUuid = UUID_RE.test(whanauId);
  const query = sb
    .from("tenants")
    .select("id, slug, name, plan")
    .limit(1)
    .maybeSingle();
  const { data, error } = isUuid
    ? await query.eq("id", whanauId)
    : await query.eq("slug", whanauId);

  if (error || !data) return null;
  return data as { id: string; slug: string; name: string; plan: string };
}

// ─── Base64 utility for attachment bytes ─────────────────────────────────

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ─── Attachment processing ───────────────────────────────────────────────

interface ProcessedAttachment {
  filename: string;
  content_type: string;
  text: string;
  extraction: "pdf_text" | "pdf_likely_scanned" | "vision" | "skip" | "error";
  error?: string;
}

async function processAttachment(
  att: AgentMailAttachment,
  visionPrompt: string,
): Promise<ProcessedAttachment> {
  const filename = att.filename ?? "unnamed";
  const contentType = (att.content_type ?? "").toLowerCase();
  const b64 = att.content_base64 ?? "";

  if (!b64) {
    return {
      filename,
      content_type: contentType,
      text: "",
      extraction: "skip",
      error: "no inline bytes",
    };
  }

  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(b64);
  } catch (err) {
    return {
      filename,
      content_type: contentType,
      text: "",
      extraction: "error",
      error: `base64 decode: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (contentType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    const result = await extractPdfText(bytes);
    if (result.status === "ok") {
      return { filename, content_type: contentType, text: result.text, extraction: "pdf_text" };
    }
    if (result.status === "likely_scanned") {
      // Scanned PDF → vision fallback on the PDF document itself.
      const vision = await callClaudeVision(bytes, "application/pdf", visionPrompt);
      if (vision.ok) {
        return { filename, content_type: contentType, text: vision.text, extraction: "vision" };
      }
      return {
        filename,
        content_type: contentType,
        text: result.text,
        extraction: "pdf_likely_scanned",
        error: vision.error,
      };
    }
    return {
      filename,
      content_type: contentType,
      text: "",
      extraction: "error",
      error: result.error ?? result.status,
    };
  }

  if (contentType.startsWith("image/")) {
    // Hero notifications, Seesaw posts, etc. — vision-only path.
    const media = (
      contentType === "image/png" ? "image/png" :
      contentType === "image/jpeg" || contentType === "image/jpg" ? "image/jpeg" :
      contentType === "image/webp" ? "image/webp" :
      contentType === "image/gif" ? "image/gif" :
      null
    );
    if (!media) {
      return {
        filename,
        content_type: contentType,
        text: "",
        extraction: "skip",
        error: `unsupported image media type: ${contentType}`,
      };
    }
    const vision = await callClaudeVision(bytes, media, visionPrompt);
    return {
      filename,
      content_type: contentType,
      text: vision.text,
      extraction: vision.ok ? "vision" : "error",
      error: vision.error,
    };
  }

  // Anything else (DOCX, calendars, etc.) — skip for v1. The brief is PDF +
  // screenshots first.
  return {
    filename,
    content_type: contentType,
    text: "",
    extraction: "skip",
    error: `unsupported attachment type: ${contentType}`,
  };
}

// ─── Mana Receipt — best-effort audit trail ──────────────────────────────

/**
 * Write a Mana Receipt via the mana edge function. Best-effort: failures
 * are logged but don't fail the request — the toro_drafts row is the
 * authoritative artefact.
 *
 * The mana function requires userId; for webhook-sourced inserts we use
 * the tenant id as a stand-in so the receipt is filterable by whānau.
 */
async function writeManaReceipt(opts: {
  supabaseUrl: string;
  serviceKey: string;
  requestId: string;
  tenantId: string;
  draftId: string;
  parseStatus: ParseStatus;
  actionCount: number;
  source: { from: string; subject: string; agentmail_message_id: string };
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `${opts.supabaseUrl.replace(/\/$/, "")}/functions/v1/mana`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${opts.serviceKey}`,
      },
      body: JSON.stringify({
        action: "generate_evidence",
        requestId: opts.requestId,
        userId: opts.tenantId,
        kete: "toro",
        actionType: "term-planner.inbound",
        outcome: {
          draft_id: opts.draftId,
          parse_status: opts.parseStatus,
          action_count: opts.actionCount,
        },
        explanations: [
          {
            action: "agentmail-inbound",
            reasoning:
              `Forwarded school comm received via term-<whanau-id>@toro.nz. ` +
              `Parsed with status=${opts.parseStatus} into ${opts.actionCount} actions. ` +
              `Draft staged for whānau review (no auto-send).`,
            sources: [
              `agentmail_message:${opts.source.agentmail_message_id}`,
              `from:${opts.source.from}`,
              `subject:${opts.source.subject.slice(0, 80)}`,
            ],
            confidence: 0.95,
            regulations: ["Privacy Act 2020 IPP 3A"],
          },
        ],
      }),
    });
    if (!resp.ok) {
      return { ok: false, error: `mana http ${resp.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Main handler ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const hmacSecret = Deno.env.get("AGENTMAIL_WEBHOOK_SECRET") ?? "";
  const expectedDomain = Deno.env.get("AGENTMAIL_DOMAIN") ?? DEFAULT_DOMAIN;

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "supabase env not configured" }, 500);
  }
  if (!hmacSecret) {
    // Fail closed — we never accept unsigned email-sourced inbound.
    return jsonResponse({ error: "AGENTMAIL_WEBHOOK_SECRET not set" }, 500);
  }

  // Read raw body BEFORE parsing so HMAC matches AgentMail's signing input.
  const rawBody = await req.text();

  const signature =
    req.headers.get("x-agentmail-signature") ??
    req.headers.get("X-AgentMail-Signature") ??
    "";

  const requestId = crypto.randomUUID();
  console.log("[agentmail-inbound] hmac_diag", JSON.stringify({
    request_id: requestId,
    signature_present: !!signature,
    signature_len: signature.length,
    raw_body_len: rawBody.length,
    content_type: req.headers.get("content-type") ?? "(none)",
  }));

  const ok = await verifyAgentmailHmac(rawBody, signature, hmacSecret);
  if (!ok) {
    console.warn("[agentmail-inbound] hmac_diag REJECTED — signature mismatch");
    return jsonResponse({ error: "invalid signature" }, 401);
  }

  let payload: AgentMailPayload;
  try {
    payload = JSON.parse(rawBody) as AgentMailPayload;
  } catch {
    return jsonResponse({ error: "invalid json" }, 400);
  }

  // Resolve recipient → whanau_id
  const toHeader = payload.to ?? "";
  const parsed = parseRecipient(toHeader, expectedDomain);
  if ("error" in parsed) {
    return jsonResponse({ skipped: parsed.error, request_id: requestId }, 200);
  }

  const messageId = payload.id ?? "";
  if (!messageId) {
    return jsonResponse({ skipped: "missing agentmail message id", request_id: requestId }, 200);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const tenant = await resolveTenant(supabase, parsed.whanau_id);
  if (!tenant) {
    // Unknown whānau: respond 200 so AgentMail doesn't retry forever, but
    // log so it shows up in dashboards. A misconfigured forwarder is the
    // most common cause.
    console.warn(
      "[agentmail-inbound] unknown whanau_id",
      JSON.stringify({ whanau_id: parsed.whanau_id, request_id: requestId }),
    );
    return jsonResponse(
      { skipped: "unknown whanau_id", request_id: requestId },
      200,
    );
  }

  // Idempotency fast-path: have we already inserted a draft for this exact
  // AgentMail message? The unique index on (whanau_id, agentmail_message_id)
  // catches concurrent races; this just saves us the LLM call.
  const { data: existing } = await supabase
    .from("toro_drafts")
    .select("id")
    .eq("source", "agentmail")
    .filter("source_metadata->>whanau_id", "eq", tenant.id)
    .filter("source_metadata->>agentmail_message_id", "eq", messageId)
    .maybeSingle();

  if (existing?.id) {
    return jsonResponse({
      ok: true,
      draft_id: existing.id,
      dedup: true,
      request_id: requestId,
    }, 200);
  }

  // ─── Collect text inputs ──────────────────────────────────────────────

  const visionPrompt =
    "This is a forwarded school communication (newsletter / notice / hero " +
    "screenshot) sent by a parent to the TŌRO Term Planner. Transcribe " +
    "every parent-actionable item verbatim: dates, times, locations, " +
    "amounts, bank account numbers, gear lists, permission deadlines. " +
    "Do not summarise or rephrase — return the raw text of the document. " +
    "If multiple kids are named, keep their names with the items.";

  const attachments = payload.attachments ?? [];
  const processed: ProcessedAttachment[] = [];
  for (const att of attachments) {
    processed.push(await processAttachment(att, visionPrompt));
  }

  const attachmentText = processed
    .filter((p) => p.text.length > 0)
    .map((p) => `--- attachment: ${p.filename} (${p.extraction}) ---\n${p.text}`)
    .join("\n\n");

  const bodyText = (payload.text ?? "").trim();
  const combinedText = [bodyText, attachmentText]
    .filter((s) => s.length > 0)
    .join("\n\n");

  // ─── PII-redact the cleartext body before persisting ──────────────────

  const redactedBody = combinedText.length > 0
    ? redactNzPii(combinedText)
    : { redacted: "", stats: { mobiles: 0, landlines: 0, emails: 0, ird_numbers: 0, bank_accounts: 0 } };

  // ─── Run the schema-driven notice parser ──────────────────────────────

  // Kids attribution is best-effort for v1 — until we wire toro_kid_profiles
  // (Kid Money Phase 1), we don't yet have a per-whānau kids list. Pass
  // an empty list and let the parser attribute by what's in the text.
  const parseResult = combinedText.length > 0
    ? await parseNotice({
        text: combinedText,
        kid_names: [],
        tenant_id: tenant.id,
        request_id: requestId,
      })
    : {
        status: "parse_failed" as ParseStatus,
        actions: [] as ExtractedAction[],
        confidence: 0,
        error: "no text to parse",
      };

  // ─── Build the source_metadata blob ───────────────────────────────────

  const sourceMetadata: Record<string, unknown> = {
    whanau_id: tenant.id,
    whanau_slug: tenant.slug,
    agentmail_message_id: messageId,
    from: payload.from ?? null,
    to: toHeader,
    subject: payload.subject ?? null,
    received_at: payload.received_at ?? new Date().toISOString(),
    attachment_count: attachments.length,
    attachments: processed.map((p) => ({
      filename: p.filename,
      content_type: p.content_type,
      extraction: p.extraction,
      error: p.error ?? null,
      text_length: p.text.length,
    })),
    pii_redactions: redactedBody.stats,
    parse_status: parseResult.status,
    parse_confidence: parseResult.confidence,
    parse_notes: parseResult.parse_notes ?? null,
    parse_error: parseResult.error ?? null,
    raw_llm_output: parseResult.raw_llm_output ?? null,
  };

  // ─── Derive retention class ──────────────────────────────────────────
  // Any action that names a kid pushes the row to retention_class='kids_data'.
  // No actions ⇒ standard. (Medical letters / counsellor notes flagged
  // 'sensitive' will land in a future PR once the source has a richer
  // shape — for now they fall under the standard 90-day retention.)

  const hasKidAction = parseResult.actions.some(
    (a) => typeof a.kid_name === "string" && a.kid_name.trim().length > 0,
  );
  const retentionClass = hasKidAction ? "kids_data" : "standard";

  // ─── Build draft body — parent-facing summary ─────────────────────────

  const draftBody = renderDraftBody({
    schoolGuess: guessSchool(payload.subject ?? "", payload.from ?? ""),
    parseStatus: parseResult.status,
    actions: parseResult.actions,
    confidence: parseResult.confidence,
  });

  // ─── Insert toro_drafts ───────────────────────────────────────────────

  const { data: insertedRow, error: insertErr } = await supabase
    .from("toro_drafts")
    .insert({
      source: "agentmail",
      source_metadata: sourceMetadata,
      retention_class: retentionClass,
      extracted_actions: parseResult.actions,
      incoming_body: redactedBody.redacted,
      draft_body: draftBody,
      confidence: clampConfidence(parseResult.confidence),
      status: "pending_approval",
      created_by_agent: "term-planner",
    })
    .select("id")
    .single();

  if (insertErr) {
    // 23505 = unique-index race. A concurrent retry from AgentMail won.
    if ((insertErr as { code?: string }).code === "23505") {
      const { data: raced } = await supabase
        .from("toro_drafts")
        .select("id")
        .eq("source", "agentmail")
        .filter("source_metadata->>whanau_id", "eq", tenant.id)
        .filter("source_metadata->>agentmail_message_id", "eq", messageId)
        .maybeSingle();
      if (raced?.id) {
        return jsonResponse({
          ok: true,
          draft_id: raced.id,
          dedup: true,
          dedup_path: "race_23505",
          request_id: requestId,
        }, 200);
      }
    }
    return jsonResponse(
      { error: "db insert failed", detail: insertErr.message, request_id: requestId },
      500,
    );
  }

  const draftId = insertedRow?.id as string;

  // ─── Insert toro_draft_transitions row (null → 'pending_approval') ────
  // This is best-effort: a transition row failure shouldn't 500 the
  // webhook (AgentMail would retry and we'd insert a duplicate draft).
  // The transitions table guards on tenant_id; we use the resolved tenant.

  const { error: transErr } = await supabase
    .from("toro_draft_transitions")
    .insert({
      draft_id: draftId,
      tenant_id: tenant.id,
      from_state: null,
      to_state: "pending_approval",
      transitioned_by: null,
      reason: `agentmail-inbound:${requestId}`,
      metadata: {
        source: "agentmail",
        agentmail_message_id: messageId,
        parse_status: parseResult.status,
        action_count: parseResult.actions.length,
      },
    });
  if (transErr) {
    console.error("[agentmail-inbound] transitions insert failed", transErr.message);
  }

  // ─── Mana Receipt (best-effort) ───────────────────────────────────────

  const mana = await writeManaReceipt({
    supabaseUrl,
    serviceKey,
    requestId,
    tenantId: tenant.id,
    draftId,
    parseStatus: parseResult.status,
    actionCount: parseResult.actions.length,
    source: {
      from: payload.from ?? "",
      subject: payload.subject ?? "",
      agentmail_message_id: messageId,
    },
  });
  if (!mana.ok) {
    console.error("[agentmail-inbound] mana receipt failed", mana.error);
  }

  return jsonResponse({
    ok: true,
    draft_id: draftId,
    whanau_id: tenant.id,
    whanau_slug: tenant.slug,
    parse_status: parseResult.status,
    action_count: parseResult.actions.length,
    retention_class: retentionClass,
    mana_receipt: mana.ok,
    request_id: requestId,
  }, 200);
});

