// ════════════════════════════════════════════════════════════════════════
// notice-parser — schema-driven extraction of typed actions from forwarded
// school comms (newsletter text, screenshot OCR output, plain emails).
//
// Used by supabase/functions/agentmail-inbound. Produces an array of
// validated actions that land in toro_drafts.extracted_actions.
//
// Action shapes (canonical — keep stable, downstream UI reads these):
//
//   { type: "event.calendar", kid_name, title, starts_at, ends_at?,
//     location?, dress_code?, notes? }
//   { type: "event.payment", kid_name, title, amount_nzd, due_date,
//     recipient, bank_account?, reference?, notes? }
//   { type: "event.gear", kid_name, date, items: string[], notes? }
//   { type: "event.permission", kid_name, title, deadline,
//     needs_signature: true, notes? }
//   { type: "event.transition", kid_name, description, takes_effect_on,
//     notes? }
//
// LLM contract: respond with a single JSON object
//   { actions: Action[], confidence: number, parse_notes?: string }
// where Action is one of the variants above. Any other shape causes a
// `parse_failed` outcome, and the caller stores the raw LLM output for
// diagnosis.
// ════════════════════════════════════════════════════════════════════════

import { callLlm, type ChatMessage } from "./llm-call.ts";

export type ActionType =
  | "event.calendar"
  | "event.payment"
  | "event.gear"
  | "event.permission"
  | "event.transition";

export interface CalendarAction {
  type: "event.calendar";
  kid_name: string | null;
  title: string;
  starts_at: string; // ISO 8601, no timezone normalisation; assume Pacific/Auckland
  ends_at?: string;
  location?: string;
  dress_code?: string;
  notes?: string;
}

export interface PaymentAction {
  type: "event.payment";
  kid_name: string | null;
  title: string;
  amount_nzd: number;
  due_date: string; // ISO 8601 date (YYYY-MM-DD)
  recipient: string;
  bank_account?: string;
  reference?: string;
  notes?: string;
}

export interface GearAction {
  type: "event.gear";
  kid_name: string | null;
  date: string; // ISO 8601 date
  items: string[];
  notes?: string;
}

export interface PermissionAction {
  type: "event.permission";
  kid_name: string | null;
  title: string;
  deadline: string; // ISO 8601 date
  needs_signature: true;
  notes?: string;
}

export interface TransitionAction {
  type: "event.transition";
  kid_name: string | null;
  description: string;
  takes_effect_on: string; // ISO 8601 date
  notes?: string;
}

export type ExtractedAction =
  | CalendarAction
  | PaymentAction
  | GearAction
  | PermissionAction
  | TransitionAction;

export type ParseStatus = "parsed" | "parse_partial" | "parse_failed";

export interface ParseResult {
  status: ParseStatus;
  actions: ExtractedAction[];
  confidence: number; // 0..1, parser self-assessed
  parse_notes?: string;
  raw_llm_output?: string; // populated only on parse_failed / partial
  error?: string;
}

export interface ParseOptions {
  /** Raw extracted text of the inbound (PDF text, email body, OCR output). */
  text: string;
  /** Whānau-supplied kid names so the parser can attribute correctly. */
  kid_names: string[];
  /** Whānau-supplied schools so the parser can identify the source. */
  schools?: string[];
  /** Tenant id for cost logging. */
  tenant_id: string;
  /** Correlation id for cross-edge-function trace. */
  request_id: string;
  /** Override model — defaults to anthropic/claude-opus-4-7. */
  model?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `You are the schema-driven notice parser for TŌRO Term Planner.

Your job: read forwarded school communications (newsletters, emails, OCR
output from screenshots) and produce a structured JSON object listing every
parent-actionable item.

Output contract (the ONLY thing you may return):

{
  "actions": [ /* zero or more Action objects per the schema below */ ],
  "confidence": 0.0-1.0,
  "parse_notes": "optional short string describing your confidence calibration"
}

Action variants (use ONLY these five "type" values):

1. {"type":"event.calendar","kid_name":string|null,"title":string,
    "starts_at":ISO8601,"ends_at"?:ISO8601,"location"?:string,
    "dress_code"?:string,"notes"?:string}
2. {"type":"event.payment","kid_name":string|null,"title":string,
    "amount_nzd":number,"due_date":YYYY-MM-DD,"recipient":string,
    "bank_account"?:string,"reference"?:string,"notes"?:string}
3. {"type":"event.gear","kid_name":string|null,"date":YYYY-MM-DD,
    "items":string[],"notes"?:string}
4. {"type":"event.permission","kid_name":string|null,"title":string,
    "deadline":YYYY-MM-DD,"needs_signature":true,"notes"?:string}
5. {"type":"event.transition","kid_name":string|null,
    "description":string,"takes_effect_on":YYYY-MM-DD,"notes"?:string}

Rules:
- Times: assume Pacific/Auckland local time when no timezone given. ISO 8601
  format. Dates: YYYY-MM-DD.
- If a kid is named in the original text, set kid_name to that exact name.
  If the item applies to all kids in the whānau, set kid_name to null.
- Amounts: in NZD as a JSON number (e.g. 12.50, not "$12.50").
- Be conservative on confidence. 0.9+ only if every action is unambiguous;
  0.5-0.8 if some items are partially specified; <0.5 if you had to guess
  on dates/amounts/recipients.
- Output ONLY the JSON object. No prose around it. No code fences.
- If you genuinely cannot extract a single action, return
  {"actions":[],"confidence":0.0,"parse_notes":"<why>"}.

Hard rules:
- Never invent a payment recipient or bank account number. If the source
  is silent on these, omit the field rather than guessing.
- Never claim "needs_signature": true unless the source explicitly says
  the parent must sign / consent.
- Never address a child directly. Output is for the parent only.`;

function buildUserPrompt(opts: ParseOptions): string {
  const kids = opts.kid_names.length
    ? `Whānau kids (use these exact names): ${opts.kid_names.join(", ")}`
    : "Whānau kids: not supplied — set kid_name to null if not obvious";

  const schools = opts.schools?.length
    ? `Whānau schools: ${opts.schools.join(", ")}`
    : "Whānau schools: not supplied";

  return `${kids}
${schools}

Source text:
"""
${opts.text.trim()}
"""

Return the JSON object as specified.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
function isNullableString(v: unknown): v is string | null {
  return v === null || isNonEmptyString(v);
}
function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && ISO_DATE_RE.test(v);
}
function isIsoDateTime(v: unknown): v is string {
  return typeof v === "string" && (ISO_DATE_RE.test(v) || ISO_DATETIME_RE.test(v));
}

/**
 * Validate one action. Returns the action with type narrowed, or a string
 * describing why it failed. The caller decides whether one bad action
 * downgrades the whole parse to `parse_partial` or `parse_failed`.
 */
export function validateAction(
  a: unknown,
): { ok: true; value: ExtractedAction } | { ok: false; reason: string } {
  if (!a || typeof a !== "object") return { ok: false, reason: "not an object" };
  const obj = a as Record<string, unknown>;
  const t = obj.type;
  if (typeof t !== "string") return { ok: false, reason: "missing type" };

  switch (t) {
    case "event.calendar":
      if (!isNullableString(obj.kid_name)) return { ok: false, reason: "kid_name" };
      if (!isNonEmptyString(obj.title)) return { ok: false, reason: "title" };
      if (!isIsoDateTime(obj.starts_at)) return { ok: false, reason: "starts_at" };
      if (obj.ends_at !== undefined && !isIsoDateTime(obj.ends_at))
        return { ok: false, reason: "ends_at" };
      return { ok: true, value: obj as unknown as CalendarAction };

    case "event.payment":
      if (!isNullableString(obj.kid_name)) return { ok: false, reason: "kid_name" };
      if (!isNonEmptyString(obj.title)) return { ok: false, reason: "title" };
      if (!isFiniteNumber(obj.amount_nzd) || (obj.amount_nzd as number) <= 0)
        return { ok: false, reason: "amount_nzd" };
      if (!isIsoDate(obj.due_date)) return { ok: false, reason: "due_date" };
      if (!isNonEmptyString(obj.recipient)) return { ok: false, reason: "recipient" };
      return { ok: true, value: obj as unknown as PaymentAction };

    case "event.gear":
      if (!isNullableString(obj.kid_name)) return { ok: false, reason: "kid_name" };
      if (!isIsoDate(obj.date)) return { ok: false, reason: "date" };
      if (!Array.isArray(obj.items) || obj.items.length === 0)
        return { ok: false, reason: "items" };
      if (!obj.items.every(isNonEmptyString))
        return { ok: false, reason: "items[i]" };
      return { ok: true, value: obj as unknown as GearAction };

    case "event.permission":
      if (!isNullableString(obj.kid_name)) return { ok: false, reason: "kid_name" };
      if (!isNonEmptyString(obj.title)) return { ok: false, reason: "title" };
      if (!isIsoDate(obj.deadline)) return { ok: false, reason: "deadline" };
      if (obj.needs_signature !== true) return { ok: false, reason: "needs_signature" };
      return { ok: true, value: obj as unknown as PermissionAction };

    case "event.transition":
      if (!isNullableString(obj.kid_name)) return { ok: false, reason: "kid_name" };
      if (!isNonEmptyString(obj.description)) return { ok: false, reason: "description" };
      if (!isIsoDate(obj.takes_effect_on)) return { ok: false, reason: "takes_effect_on" };
      return { ok: true, value: obj as unknown as TransitionAction };

    default:
      return { ok: false, reason: `unknown type: ${t}` };
  }
}

/** Strip code fences and obvious LLM chatter to recover JSON-only output. */
export function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  // ```json … ``` or ``` … ```
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse forwarded school comms into typed actions. Returns a ParseResult
 * with a status that drives caller behaviour:
 *
 *   - parsed         all actions validated; ship them
 *   - parse_partial  some actions valid, some skipped; ship the good ones,
 *                    note the partial in source_metadata
 *   - parse_failed   nothing usable; insert a parse_failed draft so the
 *                    parent still sees the inbound and can act manually
 */
export async function parseNotice(opts: ParseOptions): Promise<ParseResult> {
  const model = opts.model ?? "gemini-2.5-pro";

  const messages: ChatMessage[] = [
    { role: "user", content: buildUserPrompt(opts) },
  ];

  let response: Response;
  try {
    response = await callLlm({
      model,
      systemPrompt: SYSTEM_PROMPT_BASE,
      messages,
      maxTokens: 4096,
      meta: {
        tenantId: opts.tenant_id,
        agentCode: "term-planner",
        requestId: opts.request_id,
      },
    });
  } catch (err) {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      error: `callLlm threw: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!response.ok) {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      error: `callLlm http ${response.status}`,
    };
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = await response.json();
  } catch {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      error: "callLlm body not JSON",
    };
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      error: "callLlm returned empty content",
    };
  }

  const stripped = stripJsonFences(content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      raw_llm_output: content,
      error: `JSON.parse: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      raw_llm_output: content,
      error: "top-level not an object",
    };
  }

  const root = parsed as Record<string, unknown>;
  const rawActions = root.actions;
  const rawConfidence = root.confidence;
  const rawNotes = root.parse_notes;

  if (!Array.isArray(rawActions)) {
    return {
      status: "parse_failed",
      actions: [],
      confidence: 0,
      raw_llm_output: content,
      error: "actions not an array",
    };
  }

  const accepted: ExtractedAction[] = [];
  const rejected: string[] = [];
  for (const a of rawActions) {
    const r = validateAction(a);
    if (r.ok) accepted.push(r.value);
    else rejected.push(r.reason);
  }

  const confidence = isFiniteNumber(rawConfidence)
    ? Math.max(0, Math.min(1, rawConfidence as number))
    : 0;
  const parse_notes = typeof rawNotes === "string" ? rawNotes : undefined;

  if (accepted.length === 0 && rejected.length === 0) {
    // Genuinely empty inbox (LLM said zero actions). Still a successful
    // parse — caller will probably still create a draft with a "no
    // actions extracted" placeholder so the parent sees the inbound.
    return {
      status: "parsed",
      actions: [],
      confidence,
      parse_notes,
    };
  }

  if (accepted.length === 0) {
    return {
      status: "parse_failed",
      actions: [],
      confidence,
      raw_llm_output: content,
      error: `all ${rejected.length} actions invalid: ${rejected.slice(0, 5).join(", ")}`,
    };
  }

  if (rejected.length > 0) {
    return {
      status: "parse_partial",
      actions: accepted,
      confidence,
      parse_notes: [
        parse_notes,
        `rejected ${rejected.length} actions: ${rejected.slice(0, 5).join(", ")}`,
      ].filter(Boolean).join(" · "),
    };
  }

  return { status: "parsed", actions: accepted, confidence, parse_notes };
}
