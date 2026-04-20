// ═══════════════════════════════════════════════════════════════════════
// ikb-search — vector similarity search over the Industry Knowledge Base.
//
// POST { query, kete?, agent?, limit?, minSimilarity? }
// → { ok, hits: Array<{ doc_title, source_url, kete, tier, similarity, chunk_text }> }
//
// Embeds the query via Gemini embeddings (768-dim) and calls the
// search_industry_kb RPC. Lovable AI Gateway no longer exposes an
// embeddings endpoint, so we call Google's API directly via the
// shared embedText helper. Requires GEMINI_API_KEY.
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
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

    // 1. Embed the query (Gemini, 768-dim — matches existing pgvector schema)
    const embedding = await embedText(query, geminiKey, 768);
    if (!embedding) {
      return new Response(JSON.stringify({ error: "embedding failed" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
