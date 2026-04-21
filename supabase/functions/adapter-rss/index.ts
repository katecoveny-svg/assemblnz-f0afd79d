// ═══════════════════════════════════════════════════════════════
// adapter-rss — fetches an RSS/Atom feed, normalises items into
// kb_documents, hashes content for change detection, logs every
// new/updated row to kb_changes, and writes telemetry to
// kb_source_runs. Triggers auto-enqueue embedding via DB trigger.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Parser from "https://esm.sh/rss-parser@3.13.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  const admin = createClient(supabaseUrl, serviceKey);

  let sourceId: string | null = null;
  let runId: number | null = null;

  try {
    const { source_id } = await req.json();
    sourceId = source_id;
    if (!sourceId) throw new Error("source_id required");

    const { data: source } = await admin.from("kb_sources").select("*").eq("id", sourceId).single();
    if (!source) throw new Error("source not found");

    const { data: run } = await admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" }).select("id").single();
    runId = run?.id ?? null;

    const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";
    const parser = new Parser({
      timeout: 20_000,
      headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
    });
    // Fetch ourselves so we can follow redirects + control headers, then parse the body.
    const resp = await fetch(source.url, {
      headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
      redirect: "follow",
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching feed`);
    const xml = await resp.text();
    const feed = await parser.parseString(xml);
    let added = 0, updated = 0;

    for (const item of feed.items.slice(0, 50)) {
      const externalId = item.guid ?? item.link ?? item.title ?? "";
      if (!externalId) continue;
      const content = (item.contentSnippet ?? item.content ?? item.summary ?? "").toString().trim();
      if (!content) continue;
      const hash = await sha256(content);

      const { data: existing } = await admin.from("kb_documents")
        .select("id, content_hash")
        .eq("source_id", sourceId).eq("external_id", externalId).maybeSingle();

      if (!existing) {
        const { data: doc } = await admin.from("kb_documents").insert({
          source_id: sourceId, external_id: externalId,
          title: item.title ?? "Untitled", url: item.link, content, content_hash: hash,
          published_at: item.isoDate ?? null,
        }).select("id").single();
        if (doc) {
          await admin.from("kb_changes").insert({
            document_id: doc.id, source_id: sourceId, change_type: "new",
            diff_summary: item.title ?? null,
          });
          added++;
        }
      } else if (existing.content_hash !== hash) {
        await admin.from("kb_documents").update({
          content, content_hash: hash, published_at: item.isoDate ?? null,
        }).eq("id", existing.id);
        await admin.from("kb_changes").insert({
          document_id: existing.id, source_id: sourceId, change_type: "updated",
          diff_summary: item.title ?? null,
        });
        updated++;
      }
    }

    const nowIso = new Date().toISOString();
    await admin.from("kb_sources").update({
      last_checked_at: nowIso,
      last_updated_at: added + updated > 0 ? nowIso : source.last_updated_at,
      status: "ok", consecutive_failures: 0,
    }).eq("id", sourceId);

    if (runId) {
      await admin.from("kb_source_runs").update({
        finished_at: nowIso, status: "ok",
        new_docs: added, updated_docs: updated, duration_ms: Date.now() - t0,
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({ ok: true, added, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("adapter-rss error:", msg);
    if (sourceId) {
      await admin.from("kb_sources").update({
        last_checked_at: new Date().toISOString(),
        status: "error",
      }).eq("id", sourceId);
      try {
        await admin.rpc("kb_inc_failures" as never, { p_source: sourceId } as never);
      } catch {
        await admin.from("kb_sources").update({ consecutive_failures: 1 } as never).eq("id", sourceId);
      }
    }
    if (runId) {
      await admin.from("kb_source_runs").update({
        finished_at: new Date().toISOString(),
        status: "error", error: { message: msg }, duration_ms: Date.now() - t0,
      }).eq("id", runId);
    }
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
