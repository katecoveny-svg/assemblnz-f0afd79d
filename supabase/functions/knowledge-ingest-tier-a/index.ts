// ═══════════════════════════════════════════════════════════════
// knowledge-ingest-tier-a — the Tier A accuracy floor (BUNDLES V4 §8).
//
// Runs daily (06:00 NZT via pg_cron) or on manual invoke. For every active
// Tier A source that is due for a refresh:
//   1. Fetch the source (api_endpoint || url), rate-limited to <=1 req/sec.
//   2. Normalise to text and hash it.
//   3. Diff the hash against last_content_hash:
//        - unchanged  -> just bump last_fetched_at (no re-embed).
//        - changed    -> re-chunk, embed at 1536-dim, replace chunks, and
//                        flag every dependent agent for scenario-pack refresh
//                        (public.flag_knowledge_source_change).
//   4. Blocked scrape (403/429/451) -> log a steward alert, mark blocked,
//      surface in the stale view, and DO NOT retry.
//   5. Every chunk stores retrieved_at + a source_pointer (citation form §8.3)
//      + its own content hash.
//
// Public official-primary sources only — never stores proprietary content.
// Embedding is best-effort: if GEMINI_API_KEY is absent the diff-and-alert
// loop still runs (chunks are written without vectors and back-filled later).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";
const EMBED_DIM = 1536;        // spec-mandated Tier A vector width
const CHUNK_CHARS = 3200;      // ~800 tokens
const CHUNK_OVERLAP = 200;
const MAX_CHUNKS = 40;         // bound embedding cost per source per run
const FETCH_TIMEOUT_MS = 20000;
const RATE_LIMIT_MS = 1000;    // max 1 req/sec per source

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + CHUNK_CHARS);
    out.push(text.slice(i, end));
    if (end === text.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return out.slice(0, MAX_CHUNKS);
}

interface Source {
  source_slug: string;
  source_name: string;
  tier: string;
  url: string | null;
  api_endpoint: string | null;
  source_type: string;
  refresh_cadence_days: number;
  last_fetched_at: string | null;
  last_content_hash: string | null;
  dependent_agents: string[] | null;
}

function isDue(s: Source): boolean {
  if (!s.last_fetched_at) return true;
  const ageMs = Date.now() - new Date(s.last_fetched_at).getTime();
  return ageMs > s.refresh_cadence_days * 86400_000;
}

// Only raise a blocked/error alert if there isn't already an unresolved one of
// the same type for this source in the last 24h (avoid alert spam on repeats).
async function alertOncePerDay(
  // deno-lint-ignore no-explicit-any
  admin: any,
  slug: string,
  type: "source_blocked" | "fetch_error",
  severity: "warning" | "critical",
  message: string,
  detail: Record<string, unknown>,
) {
  const since = new Date(Date.now() - 86400_000).toISOString();
  const { data: existing } = await admin
    .from("knowledge_alerts")
    .select("id")
    .eq("source_slug", slug)
    .eq("alert_type", type)
    .eq("resolved", false)
    .gte("created_at", since)
    .limit(1);
  if (existing && existing.length > 0) return;
  await admin.from("knowledge_alerts").insert({
    source_slug: slug,
    alert_type: type,
    severity,
    message,
    detail,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const started = Date.now();
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiKey = Deno.env.get("GEMINI_API_KEY") ??
      Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY") ?? null;
    const admin = createClient(supabaseUrl, serviceKey);

    // Optional single-source override for manual re-pulls: { source_slug }.
    let onlySlug: string | null = null;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      onlySlug = typeof body?.source_slug === "string" ? body.source_slug : null;
    }

    let q = admin
      .from("knowledge_sources")
      .select("source_slug, source_name, tier, url, api_endpoint, source_type, refresh_cadence_days, last_fetched_at, last_content_hash, dependent_agents")
      .eq("active", true)
      .eq("tier", "A");
    if (onlySlug) q = q.eq("source_slug", onlySlug);

    const { data: sources, error } = await q;
    if (error) throw error;

    const summary = {
      checked: 0, changed: 0, unchanged: 0, blocked: 0, errored: 0,
      skipped_not_due: 0, chunksWritten: 0, agentsFlagged: 0,
    };

    for (const s of (sources ?? []) as unknown as Source[]) {
      if (!onlySlug && !isDue(s)) { summary.skipped_not_due++; continue; }

      const target = s.api_endpoint || s.url;
      if (!target) {
        summary.errored++;
        await admin.from("knowledge_sources").update({
          last_status: "error", last_error: "no url or api_endpoint configured", updated_at: new Date().toISOString(),
        }).eq("source_slug", s.source_slug);
        continue;
      }

      summary.checked++;

      // ── Fetch (rate-limited, single attempt) ──────────────────────────
      let res: Response;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
        res = await fetch(target, {
          headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8" },
          signal: ctrl.signal,
          redirect: "follow",
        });
        clearTimeout(t);
      } catch (e) {
        summary.errored++;
        const msg = e instanceof Error ? e.message : "fetch failed";
        await admin.from("knowledge_sources").update({
          last_status: "error", last_error: msg, updated_at: new Date().toISOString(),
        }).eq("source_slug", s.source_slug);
        await alertOncePerDay(admin, s.source_slug, "fetch_error", "warning",
          `Tier A source "${s.source_name}" failed to fetch: ${msg}`, { target, error: msg });
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      // Blocked scraping — log, mark blocked, surface in stale view, DON'T retry.
      if (res.status === 403 || res.status === 429 || res.status === 451) {
        summary.blocked++;
        await admin.from("knowledge_sources").update({
          blocked: true, last_status: "blocked", last_error: `HTTP ${res.status}`, updated_at: new Date().toISOString(),
        }).eq("source_slug", s.source_slug);
        await alertOncePerDay(admin, s.source_slug, "source_blocked", "warning",
          `Tier A source "${s.source_name}" blocked scraping (HTTP ${res.status}). Not retrying; surfaced in stale-source view.`,
          { target, status: res.status });
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      if (!res.ok) {
        summary.errored++;
        await admin.from("knowledge_sources").update({
          last_status: "error", last_error: `HTTP ${res.status}`, updated_at: new Date().toISOString(),
        }).eq("source_slug", s.source_slug);
        await alertOncePerDay(admin, s.source_slug, "fetch_error", "warning",
          `Tier A source "${s.source_name}" returned HTTP ${res.status}.`, { target, status: res.status });
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      const ctype = res.headers.get("content-type") ?? "";
      const raw = await res.text();
      const text = ctype.includes("json") ? raw.replace(/\s+/g, " ").trim() : htmlToText(raw);

      if (!text || text.length < 40) {
        summary.errored++;
        await admin.from("knowledge_sources").update({
          last_status: "error", last_error: "empty or too-short content", updated_at: new Date().toISOString(),
        }).eq("source_slug", s.source_slug);
        await alertOncePerDay(admin, s.source_slug, "fetch_error", "warning",
          `Tier A source "${s.source_name}" returned empty/too-short content.`, { target, length: text.length });
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      const contentHash = await sha256(text);
      const nowIso = new Date().toISOString();

      // ── Unchanged: just refresh the watermark ─────────────────────────
      if (contentHash === s.last_content_hash) {
        summary.unchanged++;
        await admin.from("knowledge_sources").update({
          last_fetched_at: nowIso, last_status: "unchanged", last_error: null, blocked: false, updated_at: nowIso,
        }).eq("source_slug", s.source_slug);
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      // ── Changed (or first fetch): re-embed and replace chunks ─────────
      const chunks = chunkText(text);
      await admin.from("knowledge_chunks").delete().eq("source_slug", s.source_slug);

      const pointer = `${s.url ?? target}, retrieved ${nowIso.slice(0, 10)}`;
      let idx = 0;
      for (const chunk of chunks) {
        const vec = geminiKey ? await embedText(chunk, geminiKey, EMBED_DIM) : null;
        const chunkHash = await sha256(chunk);
        await admin.from("knowledge_chunks").insert({
          source_slug: s.source_slug,
          chunk_id: `${s.source_slug}-${idx}`,
          chunk_index: idx,
          content: chunk,
          embedding: vec ? (vec as unknown as string) : null,
          tier: s.tier,
          retrieved_at: nowIso,
          source_pointer: pointer,
          hash: chunkHash,
          tokens: Math.round(chunk.length / 4),
        });
        idx++;
        summary.chunksWritten++;
      }

      // Diff-and-alert: flag dependent agents only on a real change (not the
      // very first load — there is nothing yet to refresh against).
      if (s.last_content_hash) {
        const { data: flagged } = await admin.rpc("flag_knowledge_source_change", {
          p_source_slug: s.source_slug,
          p_old_hash: s.last_content_hash,
          p_new_hash: contentHash,
        });
        if (typeof flagged === "number") summary.agentsFlagged += flagged;
      }

      summary.changed++;
      await admin.from("knowledge_sources").update({
        last_fetched_at: nowIso, last_content_hash: contentHash,
        last_status: "ok", last_error: null, blocked: false, updated_at: nowIso,
      }).eq("source_slug", s.source_slug);

      await sleep(RATE_LIMIT_MS);
    }

    return new Response(JSON.stringify({ ok: true, ms: Date.now() - started, embedded: !!geminiKey, ...summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
