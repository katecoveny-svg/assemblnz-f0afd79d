// supabase/functions/memory-recall/index.ts
// Called by the Iho router at the start of every new conversation.
// Returns the top-N most relevant memories for the user + prompt.
//
// Switched 2026-04-20 from OpenRouter embeddings → Gemini embeddings
// (matches ikb-search and the 768-dim pgvector schema).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { embedText } from "../_shared/embed.ts";
import { memoryPrincipal, memoryUserId, resolveMemoryUser } from "../_shared/memory-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: { ...corsHeaders, Allow: "POST, OPTIONS" } });
  }

  try {
    const principal = await memoryPrincipal(req, SUPABASE_SERVICE_KEY, async (token) => {
      const { data, error } = await supabase.auth.getUser(token);
      return error ? null : data.user;
    });
    if (principal.kind === 'anonymous') {
      return new Response(JSON.stringify({ error: "Sign in to use private memory." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body;
    try { body = await req.json(); } catch {
      return new Response(null, { status: 400, headers: corsHeaders });
    }
    const { tenant_id, user_id, query, limit = 10 } = body ?? {};
    const ownerId = resolveMemoryUser(principal, user_id);
    if (!ownerId || (user_id != null && memoryUserId(user_id) !== ownerId)) {
      return new Response(JSON.stringify({ error: "Memory owner does not match this request." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof query !== 'string' || !query.trim() || query.length > 8000 ||
        !Number.isInteger(limit) || limit < 1 || limit > 20 ||
        (tenant_id != null && !memoryUserId(tenant_id))) {
      return new Response(JSON.stringify({ error: "Invalid memory query." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const queryEmbedding = await embedText(String(query), GEMINI_API_KEY, 768);
    if (!queryEmbedding) {
      return new Response(
        JSON.stringify({ error: "embedding failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase.rpc("match_agent_memory", {
      p_tenant_id: tenant_id ?? null,
      p_user_id: ownerId,
      p_query_embedding: queryEmbedding as unknown as string,
      p_match_count: limit,
      p_min_similarity: 0.6,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      const ids = data.map((r: any) => r.id);
      await supabase
        .from("agent_memory")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("user_id", ownerId)
        .in("id", ids);
    }

    return new Response(
      JSON.stringify({ memories: data ?? [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
        JSON.stringify({ error: "Memory recall is unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
