// ═══════════════════════════════════════════════════════════════════════
// ikb-ingest — fetch + chunk + embed pipeline for Industry Knowledge Base.
//
// Two modes:
//   1. POST { documentId } — ingest a single row (called from /admin UI
//      or kicked off by the nightly cron loop).
//   2. POST { batch: true, limit: N } — pulls up to N rows from
//      industry_knowledge_base where next_review_due <= today (or never
//      fetched) and ingests each one. Service-role only.
//
// For each document:
//   • Firecrawl /v2/scrape → markdown (skip if no source_url).
//   • Hash content. If hash unchanged, mark verified and skip embedding work.
//   • Chunk markdown into ~1200-char windows with 150-char overlap.
//   • Embed each chunk with Lovable AI Gateway (google/text-embedding-004,
//      768-dim). Batched 32 at a time.
//   • Replace prior chunks for the document. Update content + bookkeeping
//      columns on industry_knowledge_base.
//
// Auth: requires either bearer token belonging to a `business` user OR
//       the Supabase service-role key (so cron + admin UI both work).
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const LOVABLE_AI_BASE = "https://ai.gateway.lovable.dev/v1";
const EMBED_MODEL = "google/text-embedding-004"; // 768-dim
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;
const EMBED_BATCH = 32;

// ─── helpers ────────────────────────────────────────────────────────────
async function sha256(text: string) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function chunkMarkdown(md: string): string[] {
  const clean = md.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  // Prefer paragraph boundaries, fall back to fixed windows.
  const paragraphs = clean.split(/\n\n+/);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if ((buf.length + p.length + 2) <= CHUNK_SIZE) {
      buf = buf ? `${buf}\n\n${p}` : p;
    } else {
      if (buf) chunks.push(buf);
      if (p.length <= CHUNK_SIZE) {
        buf = p;
      } else {
        // Sliding window for very long paragraphs.
        for (let i = 0; i < p.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
          chunks.push(p.slice(i, i + CHUNK_SIZE));
        }
        buf = "";
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

interface EmbedResp { data?: Array<{ embedding: number[] }>; error?: { message?: string } }

async function embedBatch(texts: string[], lovableKey: string): Promise<number[][]> {
  const res = await fetch(`${LOVABLE_AI_BASE}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  const json = (await res.json().catch(() => null)) as EmbedResp | null;
  if (!res.ok || !json?.data) {
    throw new Error(`Embed call failed [${res.status}]: ${json?.error?.message ?? "unknown"}`);
  }
  return json.data.map((d) => d.embedding);
}

interface IkbRow {
  id: string;
  kete: string;
  tier: number;
  doc_title: string;
  doc_source_url: string | null;
  applicable_agents: unknown;
  content_hash: string | null;
}

interface IngestResult {
  documentId: string;
  status: "ok" | "unchanged" | "skipped" | "error";
  bytes?: number;
  chunks?: number;
  error?: string;
}

async function ingestOne(
  admin: ReturnType<typeof createClient>,
  doc: IkbRow,
  firecrawlKey: string,
  lovableKey: string,
): Promise<IngestResult> {
  const now = new Date().toISOString();

  if (!doc.doc_source_url) {
    await admin.from("industry_knowledge_base").update({
      last_fetched_at: now,
      last_fetch_status: "skipped: no source_url",
    }).eq("id", doc.id);
    return { documentId: doc.id, status: "skipped" };
  }

  // 1. Scrape
  const fcRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url: doc.doc_source_url, formats: ["markdown"], onlyMainContent: true }),
  });
  const fcJson = await fcRes.json().catch(() => null) as
    | { markdown?: string; data?: { markdown?: string }; error?: string }
    | null;

  if (!fcRes.ok) {
    const msg = `firecrawl ${fcRes.status}: ${(fcJson?.error || "scrape failed").slice(0, 200)}`;
    await admin.from("industry_knowledge_base").update({
      last_fetched_at: now, last_fetch_status: msg,
    }).eq("id", doc.id);
    return { documentId: doc.id, status: "error", error: msg };
  }

  const markdown = (fcJson?.markdown ?? fcJson?.data?.markdown ?? "").trim();
  if (!markdown) {
    await admin.from("industry_knowledge_base").update({
      last_fetched_at: now, last_fetch_status: "empty: scrape returned no markdown",
    }).eq("id", doc.id);
    return { documentId: doc.id, status: "error", error: "empty markdown" };
  }

  // 2. Hash check
  const hash = await sha256(markdown);
  if (hash === doc.content_hash) {
    const reviewDue = new Date(); reviewDue.setDate(reviewDue.getDate() + 90);
    await admin.from("industry_knowledge_base").update({
      last_fetched_at: now,
      last_reviewed: now.slice(0, 10),
      next_review_due: reviewDue.toISOString().slice(0, 10),
      last_fetch_status: "unchanged",
    }).eq("id", doc.id);
    return { documentId: doc.id, status: "unchanged", bytes: markdown.length };
  }

  // 3. Chunk
  const chunks = chunkMarkdown(markdown);
  if (chunks.length === 0) {
    return { documentId: doc.id, status: "error", error: "no chunks produced" };
  }

  // 4. Embed (batched)
  const embeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    const out = await embedBatch(batch, lovableKey);
    embeddings.push(...out);
  }

  // 5. Replace chunks for this document
  await admin.from("industry_kb_chunks").delete().eq("document_id", doc.id);

  const rows = chunks.map((text, idx) => ({
    document_id: doc.id,
    kete: doc.kete,
    tier: doc.tier,
    applicable_agents: doc.applicable_agents ?? [],
    chunk_index: idx,
    chunk_text: text,
    token_estimate: Math.ceil(text.length / 4),
    embedding: embeddings[idx] as unknown as string,
    source_url: doc.doc_source_url,
    doc_title: doc.doc_title,
  }));

  // Insert in batches of 50 to stay well under request limits.
  for (let i = 0; i < rows.length; i += 50) {
    const slice = rows.slice(i, i + 50);
    const { error: insertErr } = await admin.from("industry_kb_chunks").insert(slice);
    if (insertErr) throw new Error(`chunk insert failed: ${insertErr.message}`);
  }

  // 6. Bookkeeping on parent
  const reviewDue = new Date(); reviewDue.setDate(reviewDue.getDate() + 90);
  await admin.from("industry_knowledge_base").update({
    content: markdown.slice(0, 60000), // store cached body (cap at 60KB)
    content_hash: hash,
    chunk_count: chunks.length,
    last_fetched_at: now,
    last_reviewed: now.slice(0, 10),
    next_review_due: reviewDue.toISOString().slice(0, 10),
    last_fetch_status: "ok",
  }).eq("id", doc.id);

  return { documentId: doc.id, status: "ok", bytes: markdown.length, chunks: chunks.length };
}

// ─── HTTP entry ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth: accept either service-role bearer (cron) or business-role user.
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    let allowed = token === serviceKey;
    if (!allowed) {
      if (!token) {
        return new Response(JSON.stringify({ error: "Missing bearer token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth } },
      });
      const { data: userResp } = await userClient.auth.getUser();
      if (!userResp?.user) {
        return new Response(JSON.stringify({ error: "Unauthenticated" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const admin = createClient(supabaseUrl, serviceKey);
      const { data: roleRow } = await admin.from("user_roles")
        .select("role").eq("user_id", userResp.user.id).eq("role", "business").maybeSingle();
      allowed = !!roleRow;
    }
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json().catch(() => ({}));

    let docs: IkbRow[] = [];
    if (body?.documentId && typeof body.documentId === "string") {
      const { data, error } = await admin.from("industry_knowledge_base")
        .select("id,kete,tier,doc_title,doc_source_url,applicable_agents,content_hash")
        .eq("id", body.documentId).maybeSingle();
      if (error || !data) {
        return new Response(JSON.stringify({ error: "Document not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      docs = [data as IkbRow];
    } else if (body?.batch === true) {
      const limit = Math.min(Math.max(Number(body?.limit ?? 5), 1), 25);
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await admin.from("industry_knowledge_base")
        .select("id,kete,tier,doc_title,doc_source_url,applicable_agents,content_hash")
        .or(`next_review_due.is.null,next_review_due.lte.${today}`)
        .not("doc_source_url", "is", null)
        .order("tier", { ascending: true })
        .order("last_fetched_at", { ascending: true, nullsFirst: true })
        .limit(limit);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      docs = (data ?? []) as IkbRow[];
    } else {
      return new Response(JSON.stringify({ error: "Provide { documentId } or { batch: true, limit }" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: IngestResult[] = [];
    for (const doc of docs) {
      try {
        results.push(await ingestOne(admin, doc, firecrawlKey, lovableKey));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        await admin.from("industry_knowledge_base").update({
          last_fetched_at: new Date().toISOString(),
          last_fetch_status: `error: ${msg.slice(0, 200)}`,
        }).eq("id", doc.id);
        results.push({ documentId: doc.id, status: "error", error: msg });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
