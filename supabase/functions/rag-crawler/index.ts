// ═══════════════════════════════════════════════════════════════
// rag-crawler — fetches due rag.sources via HTML scraping of
// legislation.govt.nz (and other gov sources). Detects change via
// ETag + SHA-256 content hash, then enqueues changed content into
// rag.rechunk_queue and logs a change_event.
//
// Body: { source_id?: string, force?: boolean }   (no body = crawl all due)
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_LIMIT = 25;
const FETCH_TIMEOUT_MS = 30_000;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isDue(source: { last_fetched_at: string | null; update_cadence: string }): boolean {
  if (!source.last_fetched_at) return true;
  const last = new Date(source.last_fetched_at).getTime();
  const now = Date.now();
  const days = (now - last) / 86_400_000;
  if (source.update_cadence === "daily") return days >= 1;
  if (source.update_cadence === "weekly") return days >= 7;
  if (source.update_cadence === "monthly") return days >= 30;
  return false;
}

async function fetchSource(source: any) {
  const headers: Record<string, string> = {
    "User-Agent": "AssemblRAGCrawler/1.0 (+https://assemblnz.lovable.app)",
    "Accept": "text/html,application/xhtml+xml",
  };
  if (source.current_etag) headers["If-None-Match"] = source.current_etag;

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(source.fetch_url, { headers, signal: ctl.signal });
    if (r.status === 304) return { changed: false, etag: source.current_etag, content: null };
    if (!r.ok) throw new Error(`HTTP ${r.status} from ${source.fetch_url}`);
    const content = await r.text();
    const etag = r.headers.get("etag") || "";
    const hash = await sha256(content);
    const changed = hash !== source.current_content_hash;
    return { changed, etag, hash, content };
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { source_id, force } = body as { source_id?: string; force?: boolean };

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = admin.schema("rag" as any).from("sources").select("*").eq("active", true);
    if (source_id) query = query.eq("id", source_id);
    const { data: sources, error } = await query.limit(BATCH_LIMIT);
    if (error) throw error;

    const results: any[] = [];
    for (const s of sources ?? []) {
      if (!source_id && !force && !isDue(s)) {
        results.push({ short_name: s.short_name, skipped: "not_due" });
        continue;
      }
      try {
        const r = await fetchSource(s);
        const now = new Date().toISOString();

        const updates: any = {
          last_fetched_at: now,
          current_etag: r.etag || s.current_etag,
        };
        if (r.changed && r.content) {
          updates.last_changed_at = now;
          updates.current_content_hash = r.hash;
        }

        await admin.schema("rag" as any).from("sources").update(updates).eq("id", s.id);

        if (r.changed && r.content) {
          await admin.schema("rag" as any).from("rechunk_queue").insert({
            source_id: s.id,
            raw_content: r.content,
            status: "pending",
          });
          await admin.schema("rag" as any).from("change_events").insert({
            source_id: s.id,
            diff_summary: `Content hash changed (${(r.hash ?? "").slice(0, 12)}…). ${r.content.length} bytes fetched.`,
            status: "pending",
          });
        }
        results.push({
          short_name: s.short_name,
          changed: r.changed,
          bytes: r.content?.length ?? 0,
        });
      } catch (e) {
        results.push({ short_name: s.short_name, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, crawled: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
