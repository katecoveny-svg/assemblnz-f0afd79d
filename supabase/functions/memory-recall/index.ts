// supabase/functions/memory-recall/index.ts
// Called by the Iho router at the start of every new conversation.
// Returns the top-N most relevant memories for the user + prompt.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.39.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tenant_id, user_id, query, limit = 10 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const queryEmbedding = await embed(String(query));

    const { data, error } = await supabase.rpc("match_agent_memory", {
      p_tenant_id: tenant_id ?? null,
      p_user_id: user_id ?? null,
      p_query_embedding: queryEmbedding,
      p_match_count: limit,
      p_min_similarity: 0.6,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      const ids = data.map((r: any) => r.id);
      await supabase
        .from("agent_memory")
        .update({ last_accessed_at: new Date().toISOString() })
        .in("id", ids);
    }

    return new Response(
      JSON.stringify({ memories: data ?? [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
