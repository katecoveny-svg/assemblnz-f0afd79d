// ═══════════════════════════════════════════════════════════════
// adapter-html — uses Firecrawl /scrape to pull a single HTML page
// as clean markdown. Treats the whole page as one document keyed
// by its URL. Useful for IRD rate pages, Employment NZ, Privacy
// Commissioner, Building Performance — anything without an RSS.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

async function sha256(s: string) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  const admin = createClient(supabaseUrl, serviceKey);

  let sourceId: string | null = null;
  let runId: number | null = null;

  try {
    if (!firecrawlKey) throw new Error("FIRECRAWL_API_KEY not configured");
    const { source_id } = await req.json();
    sourceId = source_id;
    if (!sourceId) throw new Error("source_id required");

    const { data: source } = await admin.from("kb_sources").select("*").eq("id", sourceId).single();
    if (!source) throw new Error("source not found");

    const { data: run } = await admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" }).select("id").single();
    runId = run?.id ?? null;

    const fc = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: source.url, formats: ["markdown"], onlyMainContent: true }),
    });
    const fj = await fc.json().catch(() => null);
    if (!fc.ok) throw new Error(`Firecrawl ${fc.status}: ${fj?.error ?? "scrape failed"}`);
    const markdown = (fj?.markdown ?? fj?.data?.markdown ?? "").toString().slice(0, 50_000);
    if (!markdown) throw new Error("empty markdown");
    const hash = await sha256(markdown);

    const externalId = source.url;
    const { data: existing } = await admin.from("kb_documents")
      .select("id, content_hash").eq("source_id", sourceId).eq("external_id", externalId).maybeSingle();

    let added = 0, updated = 0;
    if (!existing) {
      const { data: doc } = await admin.from("kb_documents").insert({
        source_id: sourceId, external_id: externalId, title: source.name, url: source.url,
        content: markdown, content_hash: hash, published_at: new Date().toISOString(),
      }).select("id").single();
      if (doc) {
        await admin.from("kb_changes").insert({ document_id: doc.id, source_id: sourceId, change_type: "new", diff_summary: source.name });
        added++;
      }
    } else if (existing.content_hash !== hash) {
      await admin.from("kb_documents").update({ content: markdown, content_hash: hash, published_at: new Date().toISOString() }).eq("id", existing.id);
      await admin.from("kb_changes").insert({ document_id: existing.id, source_id: sourceId, change_type: "updated", diff_summary: source.name });
      updated++;
    }

    const nowIso = new Date().toISOString();
    await admin.from("kb_sources").update({
      last_checked_at: nowIso,
      last_updated_at: added + updated > 0 ? nowIso : source.last_updated_at,
      status: "ok", consecutive_failures: 0,
    }).eq("id", sourceId);

    if (runId) await admin.from("kb_source_runs").update({
      finished_at: nowIso, status: "ok", new_docs: added, updated_docs: updated, duration_ms: Date.now() - t0,
    }).eq("id", runId);

    return new Response(JSON.stringify({ ok: true, added, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("adapter-html error:", msg);
    if (sourceId) await admin.from("kb_sources").update({ last_checked_at: new Date().toISOString(), status: "error" }).eq("id", sourceId);
    if (runId) await admin.from("kb_source_runs").update({ finished_at: new Date().toISOString(), status: "error", error: { message: msg }, duration_ms: Date.now() - t0 }).eq("id", runId);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
