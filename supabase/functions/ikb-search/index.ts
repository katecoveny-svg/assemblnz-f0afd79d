// ═══════════════════════════════════════════════════════════════════════
// ikb-search — vector similarity search over the Industry Knowledge Base.
//
// POST { query, kete?, agent?, limit?, minSimilarity? }
// → { ok, hits: Array<{ doc_title, source_url, kete, tier, similarity, chunk_text }> }
//
// Embeds the query via Lovable AI Gateway (google/text-embedding-004,
// 768-dim) and calls the search_industry_kb RPC.
//
// No auth required — KB rows are publicly readable. Rate-limit at the
// edge if abuse appears.
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_BASE = "https://ai.gateway.lovable.dev/v1";
const EMBED_MODEL = "google/text-embedding-004";

interface EmbedResp { data?: Array<{ embedding: number[] }>; error?: { message?: string } }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kete   = typeof body?.kete   === "string" && body.kete   ? body.kete   : null;
    const agent  = typeof body?.agent  === "string" && body.agent  ? body.agent  : null;
    const limit  = Math.min(Math.max(Number(body?.limit ?? 6), 1), 20);
    const minSim = Math.min(Math.max(Number(body?.minSimilarity ?? 0.2), 0), 1);

    // 1. Embed the query
    const embedRes = await fetch(`${LOVABLE_AI_BASE}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input: query }),
    });
    const embedJson = (await embedRes.json().catch(() => null)) as EmbedResp | null;
    if (!embedRes.ok || !embedJson?.data?.[0]?.embedding) {
      return new Response(JSON.stringify({
        error: `embed failed [${embedRes.status}]: ${embedJson?.error?.message ?? "unknown"}`,
      }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const embedding = embedJson.data[0].embedding;

    // 2. Run RPC
    const admin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await admin.rpc("search_industry_kb", {
      query_embedding: embedding as unknown as string,
      filter_kete: kete,
      filter_agent: agent,
      match_count: limit,
      min_similarity: minSim,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, hits: data ?? [] }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
