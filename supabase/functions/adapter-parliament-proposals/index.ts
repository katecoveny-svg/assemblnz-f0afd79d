// adapter-parliament-proposals — snapshots New Zealand Parliament's official
// Proposed Members' Bills page before those proposals become Parliamentary
// business. Parliament can later remove proposals from the page, so this
// adapter preserves the signal and records when a proposal disappears.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const BASE = "https://bills.parliament.nz";
const UA = "Mozilla/5.0 (compatible; AssemblRegulatoryHorizon/1.0; +https://www.assembl.co.nz)";

type Proposal = {
  id: string;
  title: string;
  url: string;
  context: string;
};

type ExistingDoc = {
  id: string;
  external_id: string;
  title: string;
  content_hash: string | null;
  metadata: Record<string, unknown> | null;
};

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function htmlToText(html: string) {
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

async function fetchPage(url: string) {
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (firecrawlKey) {
    try {
      const response = await fetch(`${FIRECRAWL_V2}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
          waitFor: 2500,
        }),
      });
      const payload = await response.json().catch(() => null);
      const markdown = (payload?.markdown ?? payload?.data?.markdown ?? "").toString();
      if (response.ok && markdown) return markdown.slice(0, 100_000);
      console.warn(`Firecrawl proposed-members scrape returned ${response.status}; using direct fetch`);
    } catch (error) {
      console.warn("Firecrawl proposed-members scrape failed; using direct fetch", error);
    }
  }

  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html, application/xhtml+xml, */*" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching proposed Members' Bills`);
  const html = await response.text();
  return html.slice(0, 150_000);
}

function cleanTitle(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`#]/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function absoluteUrl(value: string) {
  return value.startsWith("http") ? value : `${BASE}${value.startsWith("/") ? "" : "/"}${value}`;
}

function proposalId(url: string) {
  return url.match(/\/v\/\d+\/([a-f0-9-]+)/i)?.[1] ?? url;
}

function extractProposals(page: string): Proposal[] {
  const found = new Map<string, Proposal>();

  const add = (rawTitle: string, rawUrl: string, index: number) => {
    const title = cleanTitle(rawTitle);
    const url = absoluteUrl(rawUrl.replace(/&amp;/g, "&"));
    if (!/\bbill\b/i.test(title) || !/bills\.parliament\.nz\/v\/\d+\//i.test(url)) return;
    const id = proposalId(url);
    const context = htmlToText(page.slice(Math.max(0, index - 700), Math.min(page.length, index + 1400))).slice(0, 1800);
    found.set(id, { id, title, url, context });
  };

  // Firecrawl markdown links.
  const markdown = /\[([^\]\n]{3,300})\]\(((?:https?:\/\/bills\.parliament\.nz)?\/v\/\d+\/[a-f0-9-]+[^)]*)\)/gi;
  for (const match of page.matchAll(markdown)) add(match[1] ?? "", match[2] ?? "", match.index ?? 0);

  // Direct HTML fallback.
  const html = /<a[^>]+href=["']((?:https?:\/\/bills\.parliament\.nz)?\/v\/\d+\/[a-f0-9-]+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of page.matchAll(html)) add(match[2] ?? "", match[1] ?? "", match.index ?? 0);

  return [...found.values()];
}

async function upsertSnapshot(
  admin: ReturnType<typeof createClient>,
  sourceId: string,
  sourceUrl: string,
  page: string,
  now: string,
) {
  const externalId = "proposed-members-page-snapshot";
  const content = htmlToText(page).slice(0, 60_000);
  const contentHash = await sha256(content);
  const { data: existing } = await admin.from("kb_documents")
    .select("id,content_hash")
    .eq("source_id", sourceId)
    .eq("external_id", externalId)
    .maybeSingle();

  const payload = {
    source_id: sourceId,
    external_id: externalId,
    title: "NZ Parliament — Proposed Members Bills",
    url: sourceUrl,
    content,
    content_hash: contentHash,
    published_at: now,
    jurisdiction: "NZ",
    topic_tags: ["regulatory-horizon", "signal", "members-bills"],
    metadata: {
      provider: "New Zealand Parliament",
      horizon_stage: "SIGNAL",
      source_kind: "proposed_members_bills_page",
      parse_mode: "page_snapshot",
      captured_at: now,
    },
  };

  if (!existing) {
    const { data: doc, error } = await admin.from("kb_documents").insert(payload).select("id").single();
    if (error) throw error;
    if (doc) await admin.from("kb_changes").insert({
      document_id: doc.id,
      source_id: sourceId,
      change_type: "new",
      diff_summary: "SIGNAL: Proposed Members' Bills page first captured",
    });
    return { added: 1, updated: 0 };
  }

  if (existing.content_hash !== contentHash) {
    const { error } = await admin.from("kb_documents").update(payload).eq("id", existing.id);
    if (error) throw error;
    await admin.from("kb_changes").insert({
      document_id: existing.id,
      source_id: sourceId,
      change_type: "updated",
      diff_summary: "SIGNAL: Proposed Members' Bills page changed",
    });
    return { added: 0, updated: 1 };
  }

  return { added: 0, updated: 0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const started = Date.now();
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

    const { data: source, error: sourceError } = await admin.from("kb_sources")
      .select("*")
      .eq("id", sourceId)
      .single();
    if (sourceError || !source) throw new Error(sourceError?.message ?? "source not found");

    const { data: run } = await admin.from("kb_source_runs")
      .insert({ source_id: sourceId, status: "running" })
      .select("id")
      .single();
    runId = run?.id ?? null;

    const page = await fetchPage(source.url);
    const proposals = extractProposals(page);
    const now = new Date().toISOString();
    let added = 0;
    let updated = 0;
    let removed = 0;

    if (proposals.length === 0) {
      // Never infer removals from a failed/partial render. Keep the page snapshot
      // so a query can still find text that Parliament returned.
      const snapshot = await upsertSnapshot(admin, sourceId, source.url, page, now);
      added += snapshot.added;
      updated += snapshot.updated;
    } else {
      const { data: existingRows, error: existingError } = await admin.from("kb_documents")
        .select("id,external_id,title,content_hash,metadata")
        .eq("source_id", sourceId)
        .like("external_id", "proposal:%");
      if (existingError) throw existingError;

      const existing = (existingRows ?? []) as ExistingDoc[];
      const byExternalId = new Map(existing.map((row) => [row.external_id, row]));
      const seen = new Set<string>();

      for (const proposal of proposals) {
        const externalId = `proposal:${proposal.id}`;
        seen.add(externalId);
        const content = [proposal.title, proposal.context, `Official Parliament page: ${proposal.url}`].join("\n\n");
        const contentHash = await sha256(content);
        const current = byExternalId.get(externalId);
        const firstSeen = String(current?.metadata?.first_seen ?? now);
        const metadata = {
          provider: "New Zealand Parliament",
          horizon_stage: "SIGNAL",
          source_kind: "proposed_members_bill",
          proposal_id: proposal.id,
          active: true,
          first_seen: firstSeen,
          last_seen: now,
        };
        const payload = {
          source_id: sourceId,
          external_id: externalId,
          title: proposal.title,
          url: proposal.url,
          content,
          content_hash: contentHash,
          published_at: firstSeen,
          jurisdiction: "NZ",
          topic_tags: ["regulatory-horizon", "signal", "members-bills"],
          metadata,
        };

        if (!current) {
          const { data: doc, error } = await admin.from("kb_documents").insert(payload).select("id").single();
          if (error) throw error;
          if (doc) {
            await admin.from("kb_changes").insert({
              document_id: doc.id,
              source_id: sourceId,
              change_type: "new",
              diff_summary: `SIGNAL: ${proposal.title}`,
            });
            added++;
          }
        } else {
          const wasInactive = current.metadata?.active === false;
          if (current.content_hash !== contentHash || wasInactive) {
            const { error } = await admin.from("kb_documents").update(payload).eq("id", current.id);
            if (error) throw error;
            await admin.from("kb_changes").insert({
              document_id: current.id,
              source_id: sourceId,
              change_type: "updated",
              diff_summary: wasInactive ? `SIGNAL RETURNED: ${proposal.title}` : `SIGNAL UPDATED: ${proposal.title}`,
            });
            updated++;
          } else {
            await admin.from("kb_documents").update({ metadata }).eq("id", current.id);
          }
        }
      }

      // Keep withdrawn/removed proposals in the archive. A disappearing ballot
      // item is itself useful intelligence, but it is not Parliamentary progress.
      for (const old of existing) {
        if (seen.has(old.external_id) || old.metadata?.active === false) continue;
        const metadata = { ...(old.metadata ?? {}), active: false, removed_at: now, last_seen: now };
        await admin.from("kb_documents").update({ metadata }).eq("id", old.id);
        await admin.from("kb_changes").insert({
          document_id: old.id,
          source_id: sourceId,
          change_type: "updated",
          diff_summary: `SIGNAL REMOVED: ${old.title}`,
        });
        removed++;
      }
    }

    await admin.from("kb_sources").update({
      last_checked_at: now,
      last_successful_fetch: now,
      last_updated_at: added + updated + removed > 0 ? now : source.last_updated_at,
      status: "ok",
      consecutive_failures: 0,
    }).eq("id", sourceId);

    if (runId) await admin.from("kb_source_runs").update({
      finished_at: now,
      status: "ok",
      new_docs: added,
      updated_docs: updated + removed,
      duration_ms: Date.now() - started,
    }).eq("id", runId);

    return new Response(JSON.stringify({
      ok: true,
      parsed_proposals: proposals.length,
      added,
      updated,
      removed,
      snapshot_only: proposals.length === 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("adapter-parliament-proposals error:", message);
    const now = new Date().toISOString();
    if (sourceId) await admin.from("kb_sources")
      .update({ last_checked_at: now, status: "error" })
      .eq("id", sourceId);
    if (runId) await admin.from("kb_source_runs").update({
      finished_at: now,
      status: "error",
      error: { message },
      duration_ms: Date.now() - started,
    }).eq("id", runId);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
