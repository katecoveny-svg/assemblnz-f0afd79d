// ════════════════════════════════════════════════════════════════════════
// agentmail-inbound · pure helpers
//
// Factored out of index.ts so tests can import them without triggering
// the top-level `Deno.serve(...)` call. No DB access, no LLM calls, no
// fetch — purely string/data transforms.
// ════════════════════════════════════════════════════════════════════════

import type { ExtractedAction } from "../_shared/notice-parser.ts";
import type { ParseStatus } from "../_shared/notice-parser.ts";

export const RECIPIENT_PREFIX = "term-";

/**
 * Parse `term-<whanau-id>@toro.nz` → { whanau_id } or { error }.
 * Tolerant of name-decorated addresses (`Kate <term-hudson@toro.nz>`) and
 * mixed case.
 */
export function parseRecipient(
  to: string,
  expectedDomain: string,
): { whanau_id: string } | { error: string } {
  const trimmed = (to ?? "").trim().toLowerCase();
  const angleMatch = trimmed.match(/<([^>]+)>/);
  const addr = angleMatch ? angleMatch[1] : trimmed;

  const at = addr.indexOf("@");
  if (at < 0) return { error: "no @ in recipient" };

  const local = addr.slice(0, at);
  const domain = addr.slice(at + 1);

  if (domain !== expectedDomain.toLowerCase()) {
    return {
      error: `recipient domain mismatch (got ${domain}, expected ${expectedDomain})`,
    };
  }
  if (!local.startsWith(RECIPIENT_PREFIX)) {
    return { error: `recipient local-part must start with '${RECIPIENT_PREFIX}'` };
  }

  const whanauId = local.slice(RECIPIENT_PREFIX.length);
  if (whanauId.length === 0) {
    return { error: "empty whanau_id" };
  }
  return { whanau_id: whanauId };
}

export function clampConfidence(c: number): number {
  if (!Number.isFinite(c)) return 0;
  return Math.max(0, Math.min(1, Number(c.toFixed(2))));
}

export function guessSchool(subject: string, from: string): string | null {
  const haystack = `${subject} ${from}`.toLowerCase();
  if (haystack.includes("sacredheart") || haystack.includes("sacred heart")) {
    return "Sacred Heart College";
  }
  if (haystack.includes("baradene")) return "Baradene College";
  return null;
}

interface DraftRenderOpts {
  schoolGuess: string | null;
  parseStatus: ParseStatus;
  actions: ExtractedAction[];
  confidence: number;
}

/**
 * Render the parent-facing draft body. Plain text — the inbox UI renders
 * the structured `extracted_actions` separately as a card stack.
 */
export function renderDraftBody(opts: DraftRenderOpts): string {
  const header = opts.schoolGuess
    ? `Kia ora — Tōro picked up a comm from ${opts.schoolGuess}.`
    : "Kia ora — Tōro picked up a forwarded school comm.";

  if (opts.parseStatus === "parse_failed") {
    return [
      header,
      "",
      "I couldn't extract structured actions from this one — the parser " +
        "didn't get enough to be confident. The original is attached to " +
        "this draft for you to read. Reply 'retry' once you've checked it " +
        "if you'd like me to take another pass.",
      "",
      "— Tōro draft, ready for your review.",
    ].join("\n");
  }

  if (opts.actions.length === 0) {
    return [
      header,
      "",
      "Nothing actionable in this one — looks like a general update with " +
        "no dates, payments, gear or permissions to track. Filed for " +
        "context only.",
      "",
      "— Tōro draft, ready for your review.",
    ].join("\n");
  }

  const grouped = groupActionsByType(opts.actions);
  const blocks: string[] = [header, ""];

  if (grouped["event.calendar"]?.length) {
    blocks.push("Calendar events:");
    for (const a of grouped["event.calendar"]) {
      const who = a.kid_name ?? "whānau";
      const when = (a as { starts_at?: string }).starts_at ?? "";
      const where = (a as { location?: string }).location ?? "";
      const dress = (a as { dress_code?: string }).dress_code ?? "";
      blocks.push(
        `  - ${(a as { title?: string }).title ?? ""} — ${who}` +
        (when ? ` @ ${when}` : "") +
        (where ? ` · ${where}` : "") +
        (dress ? ` · ${dress}` : ""),
      );
    }
    blocks.push("");
  }

  if (grouped["event.payment"]?.length) {
    blocks.push("Payments to make:");
    for (const a of grouped["event.payment"]) {
      const p = a as {
        title?: string; amount_nzd?: number; due_date?: string;
        recipient?: string; bank_account?: string; reference?: string;
      };
      const who = a.kid_name ?? "whānau";
      blocks.push(
        `  - ${p.title ?? ""} — $${(p.amount_nzd ?? 0).toFixed(2)} to ${p.recipient ?? ""}` +
        (p.bank_account ? ` (${p.bank_account})` : "") +
        (p.reference ? ` ref ${p.reference}` : "") +
        ` · ${who} · due ${p.due_date ?? ""}`,
      );
    }
    blocks.push("");
  }

  if (grouped["event.gear"]?.length) {
    blocks.push("Gear to pack:");
    for (const a of grouped["event.gear"]) {
      const g = a as { date?: string; items?: string[] };
      const who = a.kid_name ?? "whānau";
      blocks.push(
        `  - ${g.date ?? ""} — ${who}: ${(g.items ?? []).join(", ")}`,
      );
    }
    blocks.push("");
  }

  if (grouped["event.permission"]?.length) {
    blocks.push("Permission / signature needed:");
    for (const a of grouped["event.permission"]) {
      const p = a as { title?: string; deadline?: string };
      const who = a.kid_name ?? "whānau";
      blocks.push(`  - ${p.title ?? ""} — ${who} · sign by ${p.deadline ?? ""}`);
    }
    blocks.push("");
  }

  if (grouped["event.transition"]?.length) {
    blocks.push("Transitions:");
    for (const a of grouped["event.transition"]) {
      const t = a as { description?: string; takes_effect_on?: string };
      const who = a.kid_name ?? "whānau";
      blocks.push(`  - ${who}: ${t.description ?? ""} — from ${t.takes_effect_on ?? ""}`);
    }
    blocks.push("");
  }

  if (opts.confidence < 0.7) {
    blocks.push(
      `(Tōro confidence on this one is ${(opts.confidence * 100).toFixed(0)}% ` +
      `— worth a quick double-check.)`,
    );
    blocks.push("");
  }

  blocks.push("— Tōro draft, ready for your review.");
  return blocks.join("\n");
}

function groupActionsByType(
  actions: ExtractedAction[],
): Partial<Record<ExtractedAction["type"], ExtractedAction[]>> {
  const out: Partial<Record<ExtractedAction["type"], ExtractedAction[]>> = {};
  for (const a of actions) {
    (out[a.type] ??= []).push(a);
  }
  return out;
}
