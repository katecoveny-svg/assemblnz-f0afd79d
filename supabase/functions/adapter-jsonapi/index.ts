// ═══════════════════════════════════════════════════════════════
// adapter-jsonapi — fetches JSON endpoints (CKAN, NVD, GeoNet,
// Crossref, World Bank, CSV-as-JSON). Source.config can specify:
//   path: dot-path to the array of items (e.g. "features", "vulnerabilities", "result.results")
//   id_field, title_field, content_field, url_field, date_field
// Falls back to flattening top-level array when no path.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(s: string) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function dig(obj: unknown, path?: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

function pickString(obj: Record<string, unknown>, candidates: string[]): string | null {
  for (const k of candidates) {
    const v = obj[k];
    if (typeof v === "string" && v.length) return v;
  }
  return null;
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

    const cfg = (source.config ?? {}) as Record<string, string>;
    const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";
    const resp = await fetch(source.url, {
      headers: { Accept: "application/json, text/csv, */*", "User-Agent": UA },
      redirect: "follow",
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const items = dig(json, cfg.path);
    const list = Array.isArray(items) ? items : Array.isArray(json) ? json : [];

    let added = 0, updated = 0;
    for (const raw of list.slice(0, 50)) {
      if (!raw || typeof raw !== "object") continue;
      const item = raw as Record<string, unknown>;
      const externalId = pickString(item, [cfg.id_field ?? "id", "publicID", "guid", "uuid"]) ?? JSON.stringify(item).slice(0, 80);
      const title = pickString(item, [cfg.title_field ?? "title", "name", "summary", "headline"]) ?? "Untitled";
      const url = pickString(item, [cfg.url_field ?? "url", "link", "href"]);
      const dateStr = pickString(item, [cfg.date_field ?? "published", "date", "publishedDate", "pubDate", "created", "modified"]);
      const contentRaw = pickString(item, [cfg.content_field ?? "description", "summary", "abstract", "body"]) ?? JSON.stringify(item);
      const content = contentRaw.slice(0, 5000);
      const hash = await sha256(content);

      const { data: existing } = await admin.from("kb_documents")
        .select("id, content_hash").eq("source_id", sourceId).eq("external_id", externalId).maybeSingle();

      if (!existing) {
        const { data: doc } = await admin.from("kb_documents").insert({
          source_id: sourceId, external_id: externalId, title, url, content, content_hash: hash,
          published_at: dateStr ? new Date(dateStr).toISOString() : null,
          metadata: { raw_keys: Object.keys(item).slice(0, 20) },
        }).select("id").single();
        if (doc) {
          await admin.from("kb_changes").insert({ document_id: doc.id, source_id: sourceId, change_type: "new", diff_summary: title });
          added++;
        }
      } else if (existing.content_hash !== hash) {
        await admin.from("kb_documents").update({ content, content_hash: hash, published_at: dateStr ? new Date(dateStr).toISOString() : null }).eq("id", existing.id);
        await admin.from("kb_changes").insert({ document_id: existing.id, source_id: sourceId, change_type: "updated", diff_summary: title });
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
    console.error("adapter-jsonapi error:", msg);
    if (sourceId) await admin.from("kb_sources").update({ last_checked_at: new Date().toISOString(), status: "error" }).eq("id", sourceId);
    if (runId) await admin.from("kb_source_runs").update({ finished_at: new Date().toISOString(), status: "error", error: { message: msg }, duration_ms: Date.now() - t0 }).eq("id", runId);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
