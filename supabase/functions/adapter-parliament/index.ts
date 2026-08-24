// adapter-parliament — tracks bills and their progress from New Zealand Parliament's
// public, keyless bills.parliament.nz JSON API.
//
// This source is deliberately separate from adapter-pco:
// - Parliament tells us what is being proposed and where a Bill is in the House.
// - PCO remains the authoritative source for legislation text / versions.
//
// Source rows use kb_sources.type = "json_api" plus config.adapter = "parliament".

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = "https://bills.parliament.nz";
const SEARCH_URL = `${BASE}/api/data/search`;
const BILL_URL = `${BASE}/api/data/Bill`;
const UA = "assembl-regulatory-horizon/1.0 (+https://www.assembl.co.nz)";

type SourceConfig = {
  adapter?: string;
  bill_tab?: "Current" | "All";
  keyword?: string;
  page_size?: number;
  max_pages?: number;
  topic_tags?: string[];
};

type BillSummary = {
  id?: string;
  title?: string;
  billNumber?: string;
  itemType?: string;
  status?: string;
  billCurrentStageName?: string;
  parliamentNumber?: number;
  lastStageDate?: string;
  lastModified?: string;
  publicationDate?: string;
};

type BillDetail = {
  Id?: string;
  Title?: string;
  BillNumber?: string;
  BillTypeName?: string;
  BillStatusName?: string;
  BillCurrentStageName?: string;
  ParliamentNumber?: number;
  Description?: string;
  IntroducedDate?: string;
  InitiationDate?: string;
  FirstReadingDate?: string;
  BillLegislationUrl?: string;
  PublicSubmissionCalled?: boolean;
  SelectCommitteeInfo?: { Name?: string; CommitteeName?: string } | string | null;
  Members?: Array<Record<string, unknown>>;
  Stages?: Array<Record<string, unknown>>;
};

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function pageUrl(id: string) {
  return `${BASE}/v/6/${id}`;
}

function searchPayload(config: SourceConfig, page: number) {
  return {
    id: null,
    documentPreset: 1,
    keyword: config.keyword ?? null,
    selectCommittee: null,
    status: [],
    documentTypes: [],
    documentSubtypes: [],
    beforeCommittee: null,
    billStages: [],
    billTab: config.bill_tab ?? "All",
    billId: null,
    includeBillStages: true,
    subject: null,
    person: null,
    parliament: null,
    dateFrom: null,
    dateTo: null,
    datePeriod: null,
    restrictedFrom: null,
    restrictedTo: null,
    terminatedReason: null,
    prettyTerminatedReason: null,
    terminatedReasons: [],
    column: 17,
    direction: 1,
    pageSize: Math.max(1, Math.min(config.page_size ?? 50, 50)),
    page,
  };
}

async function parliamentJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      Origin: BASE,
      Referer: `${BASE}/`,
      "User-Agent": UA,
      ...(init?.body ? { "Content-Type": "application/json; charset=utf-8" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Parliament API ${res.status}: ${body.slice(0, 240)}`);
  }
  return await res.json() as T;
}

function stageName(detail: BillDetail, summary: BillSummary) {
  return detail.BillCurrentStageName ?? summary.billCurrentStageName ?? detail.BillStatusName ?? summary.status ?? "Unknown";
}

function horizonStage(detail: BillDetail, summary: BillSummary) {
  const stages = (detail.Stages ?? []).map((s) => String(s.Name ?? s.StageName ?? "").toLowerCase());
  const current = stageName(detail, summary).toLowerCase();
  const status = String(detail.BillStatusName ?? summary.status ?? "").toLowerCase();
  if (stages.some((s) => s.includes("royal assent")) || status.includes("assent") || status.includes("passed")) {
    return "PASSED";
  }
  if (current || detail.IntroducedDate || detail.InitiationDate) return "PARLIAMENT";
  return "SIGNAL";
}

function memberNames(detail: BillDetail) {
  return (detail.Members ?? []).map((m) =>
    String(m.PreferredFormOfAddress ?? m.DisplayName ?? m.SortedName ?? "").trim()
  ).filter(Boolean);
}

function committeeName(detail: BillDetail) {
  if (typeof detail.SelectCommitteeInfo === "string") return detail.SelectCommitteeInfo;
  return detail.SelectCommitteeInfo?.Name ?? detail.SelectCommitteeInfo?.CommitteeName ?? null;
}

function canonicalContent(detail: BillDetail, summary: BillSummary) {
  const id = detail.Id ?? summary.id!;
  const title = detail.Title ?? summary.title ?? "Untitled bill";
  const stages = (detail.Stages ?? []).map((s) => ({
    name: s.Name ?? s.StageName ?? null,
    date: s.Date ?? s.StageDate ?? null,
  }));
  const record = {
    title,
    bill_number: detail.BillNumber ?? summary.billNumber ?? null,
    type: detail.BillTypeName ?? summary.itemType ?? null,
    status: detail.BillStatusName ?? summary.status ?? null,
    current_stage: stageName(detail, summary),
    horizon_stage: horizonStage(detail, summary),
    parliament: detail.ParliamentNumber ?? summary.parliamentNumber ?? null,
    introduced: detail.IntroducedDate ?? detail.InitiationDate ?? null,
    first_reading: detail.FirstReadingDate ?? null,
    last_activity: summary.lastStageDate ?? summary.lastModified ?? summary.publicationDate ?? null,
    members: memberNames(detail),
    select_committee: committeeName(detail),
    public_submissions: detail.PublicSubmissionCalled ?? null,
    description: detail.Description ?? null,
    legislation_url: detail.BillLegislationUrl ?? null,
    stages,
    parliament_url: pageUrl(id),
  };
  return { record, content: JSON.stringify(record, null, 2) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let sourceId: string | null = null;
  let runId: number | null = null;

  try {
    const body = await req.json();
    sourceId = body.source_id ?? null;
    if (!sourceId) throw new Error("source_id required");

    const { data: source, error: sourceError } = await admin
      .from("kb_sources")
      .select("*")
      .eq("id", sourceId)
      .single();
    if (sourceError || !source) throw new Error(sourceError?.message ?? "source not found");

    const config = (source.config ?? {}) as SourceConfig;
    const { data: run } = await admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" })
      .select("id")
      .single();
    runId = run?.id ?? null;

    const maxPages = Math.max(1, Math.min(config.max_pages ?? 3, 6));
    const summaries: BillSummary[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const result = await parliamentJson<{ results?: BillSummary[]; totalResults?: number }>(SEARCH_URL, {
        method: "POST",
        body: JSON.stringify(searchPayload(config, page)),
      });
      const rows = result.results ?? [];
      summaries.push(...rows.filter((b) => b.id));
      if (rows.length < (config.page_size ?? 50)) break;
    }

    let added = 0;
    let updated = 0;

    for (const summary of summaries) {
      if (!summary.id) continue;
      const detail = await parliamentJson<BillDetail>(`${BILL_URL}/${encodeURIComponent(summary.id)}`);
      const { record, content } = canonicalContent(detail, summary);
      const contentHash = await sha256(content);
      const externalId = summary.id;

      const { data: existing } = await admin.from("kb_documents")
        .select("id, content_hash, metadata")
        .eq("source_id", sourceId)
        .eq("external_id", externalId)
        .maybeSingle();

      const metadata = {
        provider: "New Zealand Parliament",
        api: "bills.parliament.nz public JSON API",
        bill_id: externalId,
        bill_number: record.bill_number,
        bill_type: record.type,
        bill_status: record.status,
        current_stage: record.current_stage,
        horizon_stage: record.horizon_stage,
        members: record.members,
        select_committee: record.select_committee,
        topic_tags: config.topic_tags ?? ["regulatory-horizon", "parliament", "bills"],
      };

      const payload = {
        source_id: sourceId,
        external_id: externalId,
        title: record.title,
        url: record.parliament_url,
        content,
        content_hash: contentHash,
        published_at: record.last_activity ?? record.introduced ?? new Date().toISOString(),
        jurisdiction: "NZ",
        topic_tags: config.topic_tags ?? ["regulatory-horizon", "parliament", "bills"],
        metadata,
      };

      if (!existing) {
        const { data: doc, error } = await admin.from("kb_documents").insert(payload).select("id").single();
        if (error) throw error;
        if (doc) {
          await admin.from("kb_changes").insert({
            document_id: doc.id,
            source_id: sourceId,
            change_type: "new",
            diff_summary: `${record.horizon_stage}: ${record.title} — ${record.current_stage}`,
          });
          added++;
        }
      } else if (existing.content_hash !== contentHash) {
        const previousStage = (existing.metadata as Record<string, unknown> | null)?.current_stage;
        const { error } = await admin.from("kb_documents").update(payload).eq("id", existing.id);
        if (error) throw error;
        await admin.from("kb_changes").insert({
          document_id: existing.id,
          source_id: sourceId,
          change_type: "updated",
          diff_summary: `${record.title}: ${String(previousStage ?? "unknown")} → ${record.current_stage}`,
        });
        updated++;
      }
    }

    const now = new Date().toISOString();
    await admin.from("kb_sources").update({
      last_checked_at: now,
      last_updated_at: added + updated > 0 ? now : source.last_updated_at,
      last_successful_fetch: now,
      status: "ok",
      consecutive_failures: 0,
    }).eq("id", sourceId);

    if (runId) {
      await admin.from("kb_source_runs").update({
        finished_at: now,
        status: "ok",
        new_docs: added,
        updated_docs: updated,
        duration_ms: Date.now() - t0,
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({ ok: true, scanned: summaries.length, added, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("adapter-parliament error:", message);
    const now = new Date().toISOString();
    if (sourceId) {
      await admin.from("kb_sources").update({ last_checked_at: now, status: "error" }).eq("id", sourceId);
    }
    if (runId) {
      await admin.from("kb_source_runs").update({
        finished_at: now,
        status: "error",
        error: { message },
        duration_ms: Date.now() - t0,
      }).eq("id", runId);
    }
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
