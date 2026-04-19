// ═══════════════════════════════════════════════════════════════
// kb-context — browser-safe RAG endpoint. Embeds a question via
// Lovable AI Gateway and returns top match_kb_knowledge snippets.
// Auth: requires JWT (any authenticated user).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovKey) throw new Error("LOVABLE_API_KEY missing");

    const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { question, agent_pack, top_k } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "question required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const er = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/text-embedding-004", input: question.slice(0, 4000) }),
    });
    if (!er.ok) throw new Error(`embed ${er.status}`);
    const ej = await er.json();
    const vec = ej?.data?.[0]?.embedding;
    if (!vec) throw new Error("no embedding");

    const { data, error } = await userClient.rpc("match_kb_knowledge" as never, {
      query_embedding: vec, agent_pack: agent_pack ?? null, top_k: top_k ?? 6,
    } as never);
    if (error) throw error;

    return new Response(JSON.stringify({ snippets: data ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
