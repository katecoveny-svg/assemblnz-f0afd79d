// ═══════════════════════════════════════════════════════════════
// adapter-jsonapi — fetches JSON endpoints (CKAN, NVD, GeoNet,
// Crossref, World Bank, CSV-as-JSON). Source.config can specify:
//   path: dot-path to the array of items (e.g. "features", "vulnerabilities", "result.results")
//   id_field, title_field, content_field, url_field, date_field
// Falls back to flattening top-level array when no path.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { collectionItems, JsonFeedError, legacyExternalId, normalizeItem } from "./normalization.ts";
import { documentEnvelope } from "../_shared/opportunity-envelope.ts";

import { durable, DurabilityError } from "./durability.ts";

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

    const cfg = (source.config ?? {}) as Record<string, unknown>;
    const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";
    const resp = await fetch(source.url, {
      headers: { Accept: "application/json, text/csv, */*", "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const list = collectionItems(json, cfg).map((raw) => ({ raw, normalized: normalizeItem(raw, cfg) }));

    // Old prefix/nested-ID rows must not silently duplicate when this algorithm changes.
    if (list.some(({ raw, normalized }) => normalized.externalId == null || normalized.externalId !== legacyExternalId(raw, cfg))) {
      const { data: legacy } = await durable(admin.from("kb_documents").select("id")
        .eq("source_id", sourceId).or("metadata->>identity_scheme.is.null,metadata->>identity_scheme.neq.json-v2")
        .limit(1).maybeSingle(), "identity_lookup");
      if (legacy) throw new JsonFeedError("identity_reconciliation_needed", "Existing JSON source identities require reviewed reconciliation before polling");
    }
    let added = 0, updated = 0;
    for (const { raw: item, normalized } of list) {
      const { title, url, content, publishedAt } = normalized;
      // Full-item hash is deterministic; a JSON prefix is not a collision-safe ID.
      const externalId = normalized.externalId ?? await sha256(JSON.stringify(item));
      const hash = await sha256(content);
      const envelope = documentEnvelope(source, "adapter-jsonapi", {
        raw_keys: Object.keys(item).slice(0, 20),
        collection_path: cfg.path ?? null,
        publisher_date_raw: normalized.publisherDateRaw,
        identity_scheme: "json-v2",
      });

      const { data: existing } = await durable(admin.from("kb_documents")
        .select("id, content_hash").eq("source_id", sourceId).eq("external_id", externalId).maybeSingle(), "document_lookup");

      if (!existing) {
        documentWriteAttempts++;
        const { data: doc } = await durable(admin.from("kb_documents").insert({
          source_id: sourceId, external_id: externalId, title, url, content, content_hash: hash,
          published_at: publishedAt,
          metadata: envelope.metadata,
          topic_tags: envelope.topic_tags,
        }).select("id").single(), "document_insert");
        if (!doc) throw new DurabilityError("document_insert", false);
        durableDocuments++;
        if (doc) {
          await durable(admin.from("kb_changes").insert({ document_id: doc.id, source_id: sourceId, change_type: "new", diff_summary: title }), "change_insert");
          added++;
        }
      } else if (existing.content_hash !== hash) {
        documentWriteAttempts++;
        await durable(admin.from("kb_documents").update({
          title,
          url,
          content,
          content_hash: hash,
          published_at: publishedAt,
          metadata: envelope.metadata,
          topic_tags: envelope.topic_tags,
        }).eq("id", existing.id).select("id").single(), "document_update");
        durableDocuments++;
        await durable(admin.from("kb_changes").insert({ document_id: existing.id, source_id: sourceId, change_type: "updated", diff_summary: title }), "change_insert");
        updated++;
      } else {
        documentWriteAttempts++;
        await durable(admin.from("kb_documents").update({
          metadata: envelope.metadata,
          topic_tags: envelope.topic_tags,
        }).eq("id", existing.id).select("id").single(), "document_update");
        durableDocuments++;
      }
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

    if (runId) {
      await durable(admin.from("kb_source_runs").update({
        finished_at: nowIso, status: "ok",
        new_docs: added, updated_docs: updated, duration_ms: Date.now() - t0,
      }).eq("id", runId).select("id").single(), "run_finish");
    }
    return new Response(JSON.stringify({ ok: true, confirmed_document_writes: durableDocuments, document_write_attempts: documentWriteAttempts, unknown_document_writes: 0, added, updated, collection_state: list.length ? "items" : "no_results" }), {
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
      ...(err instanceof DurabilityError ? { code: "ingestion_persistence_error", stage: err.stage, commit_outcome: err.uncertain ? "unknown" : "failed" } : {}),
      ...(err instanceof JsonFeedError ? { code: err.code } : {}),
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
