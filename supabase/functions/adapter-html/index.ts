// ═══════════════════════════════════════════════════════════════
// adapter-html — uses Firecrawl /scrape to pull a single HTML page
// as clean markdown. Treats the whole page as one document keyed
// by its URL. Useful for IRD rate pages, Employment NZ, Privacy
// Commissioner, Building Performance — anything without an RSS.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { documentEnvelope } from "../_shared/opportunity-envelope.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";

async function sha256(s: string) {
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

async function scrapeMarkdown(url: string, firecrawlKey?: string | null): Promise<string> {
  if (firecrawlKey) {
    try {
      const fc = await fetch(`${FIRECRAWL_V2}/scrape`, {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      });
      const fj = await fc.json().catch(() => null);
      if (!fc.ok) {
        console.warn(`Firecrawl ${fc.status}; falling back to direct HTML fetch`);
      } else {
        const markdown = (fj?.markdown ?? fj?.data?.markdown ?? "").toString().slice(0, 50_000);
        if (markdown) return markdown;
      }
    } catch (err) {
      console.warn("Firecrawl scrape failed; falling back to direct HTML fetch", err);
    }
  }

  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html, application/xhtml+xml, */*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching HTML`);
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();
  const text = contentType.includes("html") ? htmlToText(body) : body;
  const clipped = text.slice(0, 50_000);
  if (!clipped) throw new Error("empty page content");
  return clipped;
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
    const { source_id } = await req.json();
    sourceId = source_id;
    if (!sourceId) throw new Error("source_id required");

    const { data: source } = await admin.from("kb_sources").select("*").eq("id", sourceId).single();
    if (!source) throw new Error("source not found");

    const { data: run } = await admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" }).select("id").single();
    runId = run?.id ?? null;

    const markdown = await scrapeMarkdown(source.url, firecrawlKey);
    const hash = await sha256(markdown);
    const envelope = documentEnvelope(source, "adapter-html", {
      extraction_scope: "source_page",
    });

    const externalId = source.url;
    const { data: existing } = await admin.from("kb_documents")
      .select("id, content_hash").eq("source_id", sourceId).eq("external_id", externalId).maybeSingle();

    let added = 0, updated = 0;
    if (!existing) {
      const { data: doc } = await admin.from("kb_documents").insert({
        source_id: sourceId, external_id: externalId, title: source.name, url: source.url,
        content: markdown, content_hash: hash, published_at: new Date().toISOString(),
        metadata: envelope.metadata,
        topic_tags: envelope.topic_tags,
      }).select("id").single();
      if (doc) {
        await admin.from("kb_changes").insert({ document_id: doc.id, source_id: sourceId, change_type: "new", diff_summary: source.name });
        added++;
      }
    } else if (existing.content_hash !== hash) {
      await admin.from("kb_documents").update({
        content: markdown,
        content_hash: hash,
        published_at: new Date().toISOString(),
        metadata: envelope.metadata,
        topic_tags: envelope.topic_tags,
      }).eq("id", existing.id);
      await admin.from("kb_changes").insert({ document_id: existing.id, source_id: sourceId, change_type: "updated", diff_summary: source.name });
      updated++;
    } else {
      await admin.from("kb_documents").update({
        metadata: envelope.metadata,
        topic_tags: envelope.topic_tags,
      }).eq("id", existing.id);
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
    if (sourceId) {
      await admin.from("kb_sources").update({ last_checked_at: new Date().toISOString(), status: "error" }).eq("id", sourceId);
      try {
        await admin.rpc("kb_inc_failures" as never, { p_source: sourceId } as never);
      } catch {
        // Source status remains visible even if the optional counter RPC is absent.
      }
    }
    if (runId) await admin.from("kb_source_runs").update({ finished_at: new Date().toISOString(), status: "error", error: { message: msg }, duration_ms: Date.now() - t0 }).eq("id", runId);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
