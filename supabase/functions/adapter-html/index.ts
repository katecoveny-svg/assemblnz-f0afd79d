// ═══════════════════════════════════════════════════════════════
// adapter-html — uses Firecrawl /scrape to pull a single HTML page
// as clean markdown. Treats the whole page as one document keyed
// by its URL. Useful for IRD rate pages, Employment NZ, Privacy
// Commissioner, Building Performance — anything without an RSS.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { assertNotHtmlChallenge, HtmlResponseError } from "./challenge.ts";
import { pageObservation } from "./observation.ts";
import { documentEnvelope } from "../_shared/opportunity-envelope.ts";

import { durable, DurabilityError } from "./durability.ts";

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
      signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      });
      const fj = await fc.json().catch(() => null);
      if ([403, 429].includes(fc.status)) throw new HtmlResponseError();
      if (!fc.ok) {
        console.warn(`Firecrawl ${fc.status}; falling back to direct HTML fetch`);
      } else {
        const markdown = (fj?.markdown ?? fj?.data?.markdown ?? "").toString().slice(0, 50_000);
        assertNotHtmlChallenge(markdown, fc.status, "text/markdown");
        if (markdown) return markdown;
      }
    } catch (err) {
      if (err instanceof HtmlResponseError) throw err;
      console.warn("Firecrawl scrape failed; falling back to direct HTML fetch", err);
    }
  }

  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html, application/xhtml+xml, */*" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching HTML`);
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();
  assertNotHtmlChallenge(body, res.status, contentType);
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
  let durableDocuments = 0;
  let documentWriteAttempts = 0;
  let sourceBefore: Record<string, unknown> | null = null;
  let completionAt: string | null = null;
  let sourceCompletionConfirmed = false;

  try {
    const { source_id } = await req.json();
    sourceId = source_id;
    if (!sourceId) throw new Error("source_id required");

    const { data: source } = await durable(admin.from("kb_sources").select("*").eq("id", sourceId).single(), "source_lookup");
    if (!source) throw new DurabilityError("source_lookup", false);
    sourceBefore = { ...source };

    const { data: run } = await durable(admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" }).select("id").single(), "run_start");
    if (!run) throw new DurabilityError("run_start", false);
    runId = run.id;

    const markdown = await scrapeMarkdown(source.url, firecrawlKey);
    const hash = await sha256(markdown);
    const observation = pageObservation(new Date().toISOString());
    const envelope = documentEnvelope(source, "adapter-html", observation.metadata);

    const externalId = source.url;
    const { data: existing } = await durable(admin.from("kb_documents")
      .select("id, content_hash").eq("source_id", sourceId).eq("external_id", externalId).maybeSingle(), "document_lookup");

    let added = 0, updated = 0;
    if (!existing) {
      documentWriteAttempts++;
        const { data: doc } = await durable(admin.from("kb_documents").insert({
        source_id: sourceId, external_id: externalId, title: source.name, url: source.url,
        content: markdown, content_hash: hash, published_at: observation.published_at,
        metadata: envelope.metadata,
        topic_tags: envelope.topic_tags,
      }).select("id").single(), "document_insert");
      if (!doc) throw new DurabilityError("document_insert", false);
      durableDocuments++;
      if (doc) {
        await durable(admin.from("kb_changes").insert({ document_id: doc.id, source_id: sourceId, change_type: "new", diff_summary: source.name }), "change_insert");
        added++;
      }
    } else if (existing.content_hash !== hash) {
      documentWriteAttempts++;
        await durable(admin.from("kb_documents").update({
        content: markdown,
        content_hash: hash,
        published_at: observation.published_at,
        metadata: envelope.metadata,
        topic_tags: envelope.topic_tags,
      }).eq("id", existing.id).select("id").single(), "document_update");
        durableDocuments++;
      await durable(admin.from("kb_changes").insert({ document_id: existing.id, source_id: sourceId, change_type: "updated", diff_summary: source.name }), "change_insert");
      updated++;
    } else {
      documentWriteAttempts++;
        await durable(admin.from("kb_documents").update({
        metadata: envelope.metadata,
        topic_tags: envelope.topic_tags,
      }).eq("id", existing.id).select("id").single(), "document_update");
        durableDocuments++;
    }

    const nowIso = new Date().toISOString();
    completionAt = nowIso;
    let sourceFinish = admin.from("kb_sources").update({
      last_checked_at: nowIso,
      last_updated_at: added + updated > 0 ? nowIso : source.last_updated_at,
      status: "ok", consecutive_failures: 0,
    }).eq("id", sourceId);
    // Reject an older poll before overwriting any newer observation or success.
    for (const field of ["last_checked_at", "last_updated_at", "last_successful_fetch"] as const) {
      const expected = sourceBefore?.[field];
      sourceFinish = expected == null ? sourceFinish.is(field, null) : sourceFinish.eq(field, expected);
    }
    await durable(sourceFinish.select("id").single(), "source_finish");
    sourceCompletionConfirmed = true;

    if (runId) await durable(admin.from("kb_source_runs").update({
      finished_at: nowIso, status: "ok", new_docs: added, updated_docs: updated, duration_ms: Date.now() - t0,
    }).eq("id", runId).select("id").single(), "run_finish");

    return new Response(JSON.stringify({ ok: true, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts, unknown_document_writes: 0, added, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (err instanceof DurabilityError && err.uncertain) {
      // An unacknowledged write may have committed. Never compensate it or race a later success.
      return new Response(JSON.stringify({
        ok: false, error: msg, completion_state: ["source_finish", "run_finish"].includes(err.stage) ? "finalization_unknown" : "persistence_unknown",
        stage: err.stage, unknown_document_writes: ["document_insert", "document_update"].includes(err.stage) ? 1 : 0, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts,
        audit_persistence: "not_attempted_after_unknown_ack",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const completionState = err instanceof DurabilityError && err.uncertain ? "uncertain" : durableDocuments > 0 ? "partial" : "failed";
    const details = {
      message: msg, completion_state: completionState, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts, unknown_document_writes: 0,
      ...(err instanceof HtmlResponseError ? { code: err.code } : {}),
      ...(err instanceof DurabilityError ? { code: "ingestion_persistence_error", stage: err.stage, commit_outcome: err.uncertain ? "unknown" : "failed" } : {}),
    };
    const auditPersistence: Record<string, string> = {};
    let failureCounterStatus = "unavailable";
    if (sourceId && sourceBefore) {
      try {
        let update = admin.from("kb_sources").update({
          status: "error", last_checked_at: new Date().toISOString(),
          // No timestamp compensation: remotely committed writes cannot be rolled back here.
        }).eq("id", sourceId);
        if (sourceBefore) {
          const expected = sourceCompletionConfirmed ? completionAt : sourceBefore.last_checked_at;
          update = expected == null ? update.is("last_checked_at", null) : update.eq("last_checked_at", expected);
          const successBefore = sourceBefore.last_successful_fetch;
          update = successBefore == null ? update.is("last_successful_fetch", null) : update.eq("last_successful_fetch", successBefore);
        }
        await durable(update.select("id").single(), "source_failure");
        auditPersistence.source = "recorded";
      } catch (cleanupError) {
        auditPersistence.source = "unconfirmed";
        if (cleanupError instanceof DurabilityError && cleanupError.uncertain) return new Response(JSON.stringify({ ok: false, error: msg, completion_state: "failure_recording_unknown", audit_persistence: auditPersistence, unknown_document_writes: 0, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (auditPersistence.source === "recorded") try {
        const counter = await admin.rpc("kb_inc_failures" as never, { p_source: sourceId } as never);
        // Resolved status 0 is as uncertain as a rejected request: stop all writes.
        if (counter.status === 0) throw new DurabilityError("failure_counter", true);
        if (!counter.error) failureCounterStatus = "updated";
      } catch {
        return new Response(JSON.stringify({ ok: false, error: msg, completion_state: "failure_counter_unknown", failure_counter_status: "unavailable", audit_persistence: auditPersistence, unknown_document_writes: 0, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
    if (sourceId && !sourceBefore) auditPersistence.source = "not_attempted_without_snapshot";
    if (runId) {
      try {
        await durable(admin.from("kb_source_runs").update({
          finished_at: new Date().toISOString(), status: "error",
          error: { ...details, failure_counter_status: failureCounterStatus }, duration_ms: Date.now() - t0,
        }).eq("id", runId).select("id").single(), "run_failure");
        auditPersistence.run = "recorded";
      } catch (cleanupError) {
        auditPersistence.run = "unconfirmed";
        if (cleanupError instanceof DurabilityError && cleanupError.uncertain) return new Response(JSON.stringify({ ok: false, error: msg, completion_state: "failure_recording_unknown", audit_persistence: auditPersistence, unknown_document_writes: 0, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
    return new Response(JSON.stringify({ ok: false, error: msg, error_code: details.code, completion_state: completionState, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts, unknown_document_writes: 0, audit_persistence: auditPersistence }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
