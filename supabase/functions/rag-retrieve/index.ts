// ═══════════════════════════════════════════════════════════════
// rag-retrieve — agent-facing query function.
// Body: { query: string, kete?: string[], max_tier?: 1|2|3, top_k?: number }
// Embeds the query via Gemini, calls public.rag_retrieve RPC,
// returns top-K chunks with citations + a confidence signal.
// Public (verify_jwt = false) so any agent edge function can call it.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  query: string;
  kete?: string[];
  max_tier?: number;
  top_k?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.query || typeof body.query !== "string" || body.query.length > 4000) {
      return new Response(JSON.stringify({ ok: false, error: "query (1–4000 chars) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

    const vec = await embedText(body.query, geminiKey, 768);
    if (!vec) throw new Error("query embedding failed");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await admin.rpc("rag_retrieve", {
      query_embedding: vec as unknown as string,
      query_kete: body.kete ?? null,
      max_tier: body.max_tier ?? 3,
      top_k: Math.min(Math.max(body.top_k ?? 8, 1), 25),
    });
    if (error) throw error;

    const results = (data ?? []) as any[];
    const topTier = results[0]?.tier ?? null;
    const confidence_signal =
      topTier === null ? "none" :
      topTier <= 1 ? "high" :
      topTier <= 2 ? "medium" : "low";

    return new Response(
      JSON.stringify({
        ok: true,
        query: body.query,
        kete: body.kete ?? null,
        confidence_signal,
        result_count: results.length,
        results: results.map((r) => ({
          chunk_id: r.chunk_id,
          source: r.source_short_name,
          citation: r.structural_label,
          tier: r.tier,
          authority_weight: r.authority_weight,
          similarity: Number(r.similarity?.toFixed?.(4) ?? r.similarity),
          kete: r.kete,
          excerpt: r.content.length > 1200 ? r.content.slice(0, 1200) + "…" : r.content,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
