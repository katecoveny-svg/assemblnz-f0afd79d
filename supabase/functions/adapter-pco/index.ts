// adapter-pco — pulls authoritative legislation metadata from the
// New Zealand Legislation API v0, follows latest version format links,
// and writes current legislation records into the Knowledge Brain.
//
// Source rows use kb_sources.type = "json_api" plus config.adapter = "pco".
// Required Edge Function secret: PCO_API_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PCO_API_BASE = "https://api.legislation.govt.nz/v0";
const UA = "assembl-knowledge-brain/1.0 (+https://www.assembl.co.nz)";

type PcoFormat = {
  type?: string;
  url?: string;
};

type PcoWork = {
  title?: string;
  work_id?: string;
  legislation_status?: string;
  legislation_type?: string;
};

type PcoVersion = PcoWork & {
  version_id?: string;
  administering_agencies?: string[];
  formats?: PcoFormat[];
  act_type?: string;
  act_status?: string;
  bill_type?: string;
  bill_status?: string;
  instrument_type_group?: string;
  instrument_status?: string;
  instrument_classification?: string;
};

type SourceConfig = {
  adapter?: string;
  search_term?: string;
  search_field?: "title" | "fulltext";
  target_title?: string;
  legislation_status?: string;
  legislation_type?: string;
  max_works?: number;
  fetch_xml?: boolean;
  topic_tags?: string[];
};

async function sha256(s: string) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function textFromXml(xml: string): string {
  return xml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
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

function chooseFormat(formats: PcoFormat[] | undefined, type: "xml" | "html" | "pdf"): string | null {
  const wanted = type.toLowerCase();
  const found = formats?.find((format) => {
    const label = (format.type ?? "").toLowerCase();
    const url = (format.url ?? "").toLowerCase();
    return label.includes(wanted) || url.includes(`.${wanted}`);
  });
  return found?.url ?? null;
}

function exactTitleMatch(work: PcoWork, targetTitle?: string): boolean {
  if (!targetTitle) return true;
  return (work.title ?? "").trim().toLowerCase() === targetTitle.trim().toLowerCase();
}

async function pcoJson<T>(path: string, apiKey: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${PCO_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": UA,
      "X-Api-Key": apiKey,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PCO API ${res.status} for ${path}: ${body.slice(0, 240)}`);
  }

  return await res.json() as T;
}

async function fetchXmlText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/xml, text/xml, */*",
      "User-Agent": UA,
    },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const xml = await res.text();
  const text = textFromXml(xml);
  return text ? text.slice(0, 65_000) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const pcoApiKey = Deno.env.get("PCO_API_KEY");
  const admin = createClient(supabaseUrl, serviceKey);

  let sourceId: string | null = null;
  let runId: number | null = null;

  try {
    if (!pcoApiKey) throw new Error("PCO_API_KEY is not configured");

    const { source_id } = await req.json();
    sourceId = source_id;
    if (!sourceId) throw new Error("source_id required");

    const { data: source, error: sourceError } = await admin
      .from("kb_sources")
      .select("*")
      .eq("id", sourceId)
      .single();
    if (sourceError || !source) throw new Error(sourceError?.message ?? "source not found");

    const cfg = (source.config ?? {}) as SourceConfig;
    const { data: run } = await admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" }).select("id").single();
    runId = run?.id ?? null;

    const searchTerm = cfg.search_term ?? source.name.replace(/^PCO\s+—\s+/, "");
    const worksResponse = await pcoJson<{ results?: PcoWork[] }>("/works/", pcoApiKey, {
      search_term: searchTerm,
      search_field: cfg.search_field ?? "title",
      legislation_status: cfg.legislation_status ?? "current",
      legislation_type: cfg.legislation_type,
    });

    const works = (worksResponse.results ?? [])
      .filter((work) => work.work_id && exactTitleMatch(work, cfg.target_title))
      .slice(0, Math.max(1, Math.min(10, cfg.max_works ?? 1)));

    if (works.length === 0) {
      throw new Error(`No PCO works matched ${cfg.target_title ?? searchTerm}`);
    }

    let added = 0;
    let updated = 0;
    const newDocIds: string[] = [];

    for (const work of works) {
      const versionsResponse = await pcoJson<{ results?: PcoVersion[] }>(
        `/works/${work.work_id}/versions/`,
        pcoApiKey,
        { sort: "desc" },
      );
      const versionSummary = versionsResponse.results?.[0];
      if (!versionSummary?.version_id) continue;

      const version = await pcoJson<PcoVersion>(`/versions/${versionSummary.version_id}/`, pcoApiKey);
      const formats = version.formats ?? versionSummary.formats ?? [];
      const xmlUrl = chooseFormat(formats, "xml");
      const htmlUrl = chooseFormat(formats, "html");
      const pdfUrl = chooseFormat(formats, "pdf");
      const xmlText = cfg.fetch_xml !== false && xmlUrl ? await fetchXmlText(xmlUrl) : null;

      const contentParts = [
        `${version.title ?? work.title}`,
        `Work ID: ${version.work_id ?? work.work_id}`,
        `Version ID: ${version.version_id ?? versionSummary.version_id}`,
        `Status: ${version.legislation_status ?? work.legislation_status ?? "unknown"}`,
        `Type: ${version.legislation_type ?? work.legislation_type ?? "unknown"}`,
        version.administering_agencies?.length ? `Administering agencies: ${version.administering_agencies.join(", ")}` : "",
        htmlUrl ? `HTML: ${htmlUrl}` : "",
        pdfUrl ? `PDF: ${pdfUrl}` : "",
        xmlUrl ? `XML: ${xmlUrl}` : "",
        "",
        xmlText
          ? `XML-derived text for retrieval:\n${xmlText}`
          : "No XML text was fetched for this version; rely on the format URLs and version metadata.",
      ].filter(Boolean);

      const content = contentParts.join("\n");
      const contentHash = await sha256(content);
      const externalId = version.version_id ?? versionSummary.version_id;

      const { data: existing } = await admin.from("kb_documents")
        .select("id, content_hash")
        .eq("source_id", sourceId)
        .eq("external_id", externalId)
        .maybeSingle();

      const payload = {
        source_id: sourceId,
        external_id: externalId,
        title: version.title ?? work.title ?? source.name,
        url: htmlUrl ?? pdfUrl ?? xmlUrl ?? source.url,
        content,
        content_hash: contentHash,
        published_at: new Date().toISOString(),
        jurisdiction: "NZ",
        topic_tags: cfg.topic_tags ?? ["legislation", "pco"],
        metadata: {
          provider: "Parliamentary Counsel Office",
          api: "New Zealand Legislation API v0",
          work_id: version.work_id ?? work.work_id,
          version_id: externalId,
          legislation_status: version.legislation_status ?? work.legislation_status,
          legislation_type: version.legislation_type ?? work.legislation_type,
          formats,
        },
      };

      if (!existing) {
        const { data: doc, error: insertError } = await admin.from("kb_documents")
          .insert(payload)
          .select("id")
          .single();
        if (insertError) throw insertError;
        if (doc) {
          newDocIds.push(doc.id);
          await admin.from("kb_changes").insert({
            document_id: doc.id,
            source_id: sourceId,
            change_type: "new",
            diff_summary: `${payload.title} (${externalId})`,
          });
          added++;
        }
      } else if (existing.content_hash !== contentHash) {
        const { error: updateError } = await admin.from("kb_documents")
          .update(payload)
          .eq("id", existing.id);
        if (updateError) throw updateError;
        await admin.from("kb_changes").insert({
          document_id: existing.id,
          source_id: sourceId,
          change_type: "updated",
          diff_summary: `${payload.title} (${externalId})`,
        });
        updated++;
      }
    }

    if (newDocIds.length) {
      for (const docId of newDocIds) {
        await admin.from("kb_documents")
          .update({ superseded_by: docId })
          .eq("source_id", sourceId)
          .is("superseded_by", null)
          .neq("id", docId);
      }
    }

    const nowIso = new Date().toISOString();
    await admin.from("kb_sources").update({
      last_checked_at: nowIso,
      last_updated_at: added + updated > 0 ? nowIso : source.last_updated_at,
      status: "ok",
      consecutive_failures: 0,
    }).eq("id", sourceId);

    if (runId) {
      await admin.from("kb_source_runs").update({
        finished_at: nowIso,
        status: "ok",
        new_docs: added,
        updated_docs: updated,
        duration_ms: Date.now() - t0,
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({ ok: true, added, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("adapter-pco error:", msg);
    if (sourceId) {
      await admin.from("kb_sources")
        .update({ last_checked_at: new Date().toISOString(), status: "error" })
        .eq("id", sourceId);
      try {
        await admin.rpc("kb_inc_failures" as never, { p_source: sourceId } as never);
      } catch {
        await admin.from("kb_sources").update({ consecutive_failures: 1 } as never).eq("id", sourceId);
      }
    }
    if (runId) {
      await admin.from("kb_source_runs").update({
        finished_at: new Date().toISOString(),
        status: "error",
        error: { message: msg },
        duration_ms: Date.now() - t0,
      }).eq("id", runId);
    }
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
