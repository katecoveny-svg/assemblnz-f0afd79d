// ════════════════════════════════════════════════════════════════════════
// live-feed-gets-poll
//
// Polls the NZ Government Electronic Tenders Service RSS feed daily at
// 09:00 Pacific/Auckland. Cron fires hourly; this function gates internally
// to the 09:00 hour (DST-safe via Intl). Pass {"force": true} to bypass.
//
// Pipeline per RSS item:
//   1. extract typed tender fields                  (extractor.ts)
//   2. content_hash for idempotency
//   3. lookup existing entry by (source_slug, external_id)
//   4. if new or content_hash changed: score it     (capability-matcher.ts)
//   5. build a Mana Receipt-shaped attestation, upsert into live_feed_entries
//   6. if new + score >= 70: insert proactive_alerts row(s) for the allowlist
//
// Every run writes one row to live_feed_log with timings + counts. On
// failure, live_feed_sources.consecutive_failures is bumped so dashboards
// can detect a dead feed.
// ════════════════════════════════════════════════════════════════════════
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { fetchGetsRss, type GetsRawItem } from "./gets-client.ts";
import { extractTender, type ExtractedTender } from "./extractor.ts";
import { scoreTender, type MatcherResult } from "./capability-matcher.ts";
import { draftGoNoGo, draftResponse } from "./response-template.ts";

const SOURCE_SLUG = "gets";
const TARGET_HOUR_LOCAL = 9; // 09:00 in Pacific/Auckland
const HIGH_MATCH_THRESHOLD = 70;
const NOTIFY_BATCH_MAX = 5; // > this in a single poll → batch into one alert
const KATE_EMAIL_ALLOWLIST = [
  "assembl@assembl.co.nz",
  "kate@assembl.co.nz",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PollRequestBody {
  force?: boolean;
}

interface PollSummary {
  ok: true;
  status: "ok" | "skipped_time_gate";
  source_slug: string;
  fetched: number;
  inserted: number;
  updated: number;
  notified: number;
  high_match: number;
  duration_ms: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ ok: false, error: "SUPABASE_URL / SERVICE_ROLE_KEY missing" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  let body: PollRequestBody = {};
  try {
    if (req.method === "POST") body = (await req.json()) as PollRequestBody;
  } catch {
    body = {};
  }

  // ── time gate ───────────────────────────────────────────────────────
  const force = body.force === true;
  if (!force && !isWithinDailyWindow(new Date())) {
    const runId = await insertLogRow(admin, "skipped_time_gate");
    await finaliseLog(admin, runId, "skipped_time_gate", {
      duration_ms: Date.now() - t0,
      notes: "outside 09:00 Pacific/Auckland window",
    });
    console.log("[live-feed-gets-poll] skipped_time_gate");
    return jsonResponse(
      {
        ok: true,
        status: "skipped_time_gate" as const,
        source_slug: SOURCE_SLUG,
        fetched: 0,
        inserted: 0,
        updated: 0,
        notified: 0,
        high_match: 0,
        duration_ms: Date.now() - t0,
      } satisfies PollSummary,
      200,
    );
  }

  const runId = await insertLogRow(admin, "running");

  try {
    const { items } = await fetchGetsRss();
    let inserted = 0;
    let updated = 0;
    const newlyHighMatch: Array<{
      entry_id: string;
      title: string;
      score: number;
      tender_meta: Record<string, unknown>;
      top_signals: Array<{ label: string; points: number }>;
      url: string | null;
    }> = [];

    for (const item of items) {
      try {
        const result = await processItem(admin, item);
        if (result.kind === "inserted") inserted++;
        else if (result.kind === "updated") updated++;
        if (result.highMatch) newlyHighMatch.push(result.highMatch);
      } catch (itemErr) {
        const msg = itemErr instanceof Error ? itemErr.message : "unknown";
        console.error(`[live-feed-gets-poll] item failed: ${msg}`, item.link ?? item.guid);
      }
    }

    let notified = 0;
    if (newlyHighMatch.length > 0) {
      notified = await notifyAllowlist(admin, newlyHighMatch);
    }

    await admin
      .from("live_feed_sources")
      .update({
        last_polled_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        consecutive_failures: 0,
      })
      .eq("slug", SOURCE_SLUG);

    await finaliseLog(admin, runId, "ok", {
      entries_fetched: items.length,
      entries_inserted: inserted,
      entries_updated: updated,
      entries_notified: notified,
      duration_ms: Date.now() - t0,
    });

    const summary: PollSummary = {
      ok: true,
      status: "ok",
      source_slug: SOURCE_SLUG,
      fetched: items.length,
      inserted,
      updated,
      notified,
      high_match: newlyHighMatch.length,
      duration_ms: Date.now() - t0,
    };
    console.log(`[live-feed-gets-poll] ok ${JSON.stringify(summary)}`);
    return jsonResponse(summary, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[live-feed-gets-poll] error:", msg);

    await admin
      .from("live_feed_sources")
      .update({
        last_polled_at: new Date().toISOString(),
      })
      .eq("slug", SOURCE_SLUG);

    // Bump consecutive_failures separately so we do not depend on an RPC.
    const { data: src } = await admin
      .from("live_feed_sources")
      .select("consecutive_failures")
      .eq("slug", SOURCE_SLUG)
      .maybeSingle();
    const next = (src?.consecutive_failures ?? 0) + 1;
    await admin
      .from("live_feed_sources")
      .update({ consecutive_failures: next })
      .eq("slug", SOURCE_SLUG);

    await finaliseLog(admin, runId, "error", {
      duration_ms: Date.now() - t0,
      error: { message: msg },
    });

    return jsonResponse({ ok: false, error: msg }, 500);
  }
});

// ── time gate ───────────────────────────────────────────────────────────
/**
 * True when `now` falls inside the 09:00 hour in Pacific/Auckland local time.
 * DST-safe — uses Intl.DateTimeFormat with the IANA zone rather than a fixed
 * UTC offset.
 */
export function isWithinDailyWindow(now: Date): boolean {
  const localHour = Number(
    new Intl.DateTimeFormat("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
  return localHour === TARGET_HOUR_LOCAL;
}

// ── per-item processing ────────────────────────────────────────────────

interface HighMatchPayload {
  entry_id: string;
  title: string;
  score: number;
  tender_meta: Record<string, unknown>;
  top_signals: Array<{ label: string; points: number }>;
  url: string | null;
}

type ProcessResult = {
  kind: "inserted" | "updated" | "noop";
  highMatch?: HighMatchPayload;
};

async function processItem(
  // deno-lint-ignore no-explicit-any
  admin: any,
  rawItem: GetsRawItem,
): Promise<ProcessResult> {
  const tender = extractTender(rawItem);
  if (!tender) return { kind: "noop" };

  const corpus = `${tender.title} ${tender.summary ?? ""} ${tender.agency ?? ""} ${tender.response_format ?? ""}`;
  const matcher = scoreTender({ tender, corpus });

  const content_hash = await sha256(
    `${tender.title}|${tender.summary ?? ""}|${tender.close_at ?? ""}|${tender.agency ?? ""}`,
  );

  const { data: existing } = await admin
    .from("live_feed_entries")
    .select("id, content_hash, capability_score, notified_at")
    .eq("source_slug", SOURCE_SLUG)
    .eq("external_id", tender.rfx_id)
    .maybeSingle();

  const assessment = buildAssessment(tender, matcher);
  const tender_meta = buildTenderMeta(tender, matcher);

  if (!existing) {
    const { data: inserted, error } = await admin
      .from("live_feed_entries")
      .insert({
        source_slug: SOURCE_SLUG,
        external_id: tender.rfx_id,
        title: tender.title,
        summary: tender.summary,
        url: tender.detail_url,
        published_at: tender.published_at,
        content_hash,
        kete_relevance: matcher.kete_relevance,
        capability_assessment: assessment,
        tender_meta,
        status: "new",
      })
      .select("id")
      .single();

    if (error) throw new Error(`insert failed: ${error.message}`);

    const highMatch: HighMatchPayload | undefined =
      matcher.score >= HIGH_MATCH_THRESHOLD
        ? {
            entry_id: inserted.id,
            title: tender.title,
            score: matcher.score,
            tender_meta: tender_meta as unknown as Record<string, unknown>,
            top_signals: matcher.signals
              .slice()
              .sort((a, b) => b.points - a.points)
              .slice(0, 5)
              .map((s) => ({ label: s.label, points: s.points })),
            url: tender.detail_url,
          }
        : undefined;
    return { kind: "inserted", highMatch };
  }

  if (existing.content_hash === content_hash) return { kind: "noop" };

  const { error } = await admin
    .from("live_feed_entries")
    .update({
      title: tender.title,
      summary: tender.summary,
      url: tender.detail_url,
      published_at: tender.published_at,
      content_hash,
      kete_relevance: matcher.kete_relevance,
      capability_assessment: assessment,
      tender_meta,
    })
    .eq("id", existing.id);
  if (error) throw new Error(`update failed: ${error.message}`);
  return { kind: "updated" };
}

// ── assessment / receipt builders ──────────────────────────────────────

function buildAssessment(tender: ExtractedTender, matcher: MatcherResult) {
  const assessed_at = new Date().toISOString();
  // Hash the inputs and outputs so the receipt has integrity even though it
  // is an internal-flavoured attestation (no public signing pipeline yet).
  const input_hash_seed = JSON.stringify({
    rfx_id: tender.rfx_id,
    title: tender.title,
    summary: tender.summary,
    agency: tender.agency,
  });
  const output_hash_seed = JSON.stringify({
    score: matcher.score,
    signals: matcher.signals,
    kete_relevance: matcher.kete_relevance,
  });

  // We can't await sha256 from a sync builder, so we compute it inline as a
  // simple stable hash. Real receipts get sha256 below; we mirror that here.
  return {
    score: matcher.score,
    signals: matcher.signals,
    assessed_at,
    mana_receipt: {
      id: crypto.randomUUID(),
      schema_version: "v1",
      issuer: "Assembl Limited",
      issuer_domain: "assembl.co.nz",
      agent: "live-feed-gets",
      agent_version: "1.0.0",
      assembl_version: "0.5.0",
      domain: "capability-assessment",
      input_hash: `internal:${stableHash(input_hash_seed)}`,
      output_hash: `internal:${stableHash(output_hash_seed)}`,
      citations: [],
      pou: {},
      gates: { truth: matcher.signals.length > 0 },
      hitl: { status: "pending_review" as const },
      prev_hash: null,
      receipt_hash: `internal:${stableHash(input_hash_seed + output_hash_seed + assessed_at)}`,
      signature_b64: "internal-only:not-signed-yet",
      key_id: "assembl-internal-capability-v1",
      created_at: assessed_at,
      issued_at: assessed_at,
      audit_log_id: null,
    },
  };
}

function buildTenderMeta(tender: ExtractedTender, matcher: MatcherResult) {
  return {
    feed_kind: "gets" as const,
    rfx_id: tender.rfx_id,
    ref_number: tender.ref_number,
    agency: tender.agency,
    tender_type: tender.tender_type,
    close_at: tender.close_at,
    detail_url: tender.detail_url,
    response_format: tender.response_format,
    budget_nzd_estimate: tender.budget_nzd_estimate,
    go_no_go: draftGoNoGo({ tender, matcher }),
    response_draft: draftResponse({ tender, matcher }),
  };
}

// ── notifications ──────────────────────────────────────────────────────

async function notifyAllowlist(
  // deno-lint-ignore no-explicit-any
  admin: any,
  matches: Array<{
    entry_id: string;
    title: string;
    score: number;
    tender_meta: Record<string, unknown>;
    top_signals: Array<{ label: string; points: number }>;
    url: string | null;
  }>,
): Promise<number> {
  // Look up Kate's user_id(s) by email through auth.users (service role).
  // If none found, skip — we will not block the poll on a notification gap.
  const { data: users } = await admin
    .schema("auth")
    .from("users")
    .select("id, email")
    .in("email", KATE_EMAIL_ALLOWLIST);

  const targets = (users ?? []) as Array<{ id: string; email: string }>;
  if (targets.length === 0) {
    console.warn(
      `[live-feed-gets-poll] no matching auth.users for allowlist: ${KATE_EMAIL_ALLOWLIST.join(", ")} — skipping notify`,
    );
    return 0;
  }

  const batched = matches.length > NOTIFY_BATCH_MAX;
  const nowIso = new Date().toISOString();
  let inserted = 0;

  for (const target of targets) {
    if (batched) {
      const top = matches.slice(0, NOTIFY_BATCH_MAX);
      const tail = matches.length - top.length;
      const { error } = await admin.from("proactive_alerts").insert({
        user_id: target.id,
        source_agent: "live-feed-gets",
        target_agent: "kate",
        alert_type: "tender_high_match_batch",
        title: `${matches.length} high-match GETS tenders detected`,
        message: top
          .map((m) => `· ${m.title} (score ${m.score})`)
          .concat(tail > 0 ? [`· … and ${tail} more`] : [])
          .join("\n"),
        severity: "high",
        metadata: {
          entry_ids: matches.map((m) => m.entry_id),
          count: matches.length,
        },
      });
      if (!error) inserted++;
      else console.error(`[live-feed-gets-poll] alert insert failed: ${error.message}`);
      continue;
    }

    for (const m of matches) {
      const { error } = await admin.from("proactive_alerts").insert({
        user_id: target.id,
        source_agent: "live-feed-gets",
        target_agent: "kate",
        alert_type: "tender_high_match",
        title: `High-match GETS tender (score ${m.score})`,
        message: `${m.title}\n\nTop signals: ${m.top_signals.map((s) => `${s.label} (+${s.points})`).join(", ")}`,
        severity: "high",
        metadata: {
          entry_id: m.entry_id,
          score: m.score,
          tender_meta: m.tender_meta,
          top_signals: m.top_signals,
          url: m.url,
        },
      });
      if (!error) inserted++;
      else console.error(`[live-feed-gets-poll] alert insert failed: ${error.message}`);
    }
  }

  // Mark every notified entry's notified_at so we never re-notify.
  await admin
    .from("live_feed_entries")
    .update({ notified_at: nowIso })
    .in(
      "id",
      matches.map((m) => m.entry_id),
    );

  return inserted;
}

// ── log helpers ────────────────────────────────────────────────────────

async function insertLogRow(
  // deno-lint-ignore no-explicit-any
  admin: any,
  status: "running" | "skipped_time_gate",
): Promise<number | null> {
  const { data } = await admin
    .from("live_feed_log")
    .insert({ source_slug: SOURCE_SLUG, status })
    .select("id")
    .single();
  return data?.id ?? null;
}

async function finaliseLog(
  // deno-lint-ignore no-explicit-any
  admin: any,
  runId: number | null,
  status: "ok" | "error" | "skipped_time_gate",
  patch: Partial<{
    entries_fetched: number;
    entries_inserted: number;
    entries_updated: number;
    entries_notified: number;
    duration_ms: number;
    error: { message?: string; [key: string]: unknown };
    notes: string;
  }>,
): Promise<void> {
  if (!runId) return;
  await admin
    .from("live_feed_log")
    .update({
      finished_at: new Date().toISOString(),
      status,
      ...patch,
    })
    .eq("id", runId);
}

// ── small utilities ────────────────────────────────────────────────────

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Cheap deterministic 32-bit-ish hash used inside the synchronous Mana
 * Receipt builder. Not a cryptographic primitive — the receipt is internal
 * only. Real signing comes when the public verifier is wired up.
 */
function stableHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
