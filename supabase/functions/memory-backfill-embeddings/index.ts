// supabase/functions/memory-backfill-embeddings/index.ts
// One-off backfill: embed any agent_memory rows that are missing embeddings.
// Invoke manually after data migration. Safe to re-run.

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

  const { data: rows, error } = await supabase
    .from("agent_memory")
    .select("id, subject, content, memory_key, memory_value")
    .is("embedding", null)
    .limit(200);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let done = 0;
  const failures: { id: string; error: string }[] = [];

  for (const row of rows ?? []) {
    try {
      // Build a sensible string from whatever's available
      const subject = row.subject || row.memory_key || "(untitled)";
      let content = row.content;
      if (!content && row.memory_value) {
        content = typeof row.memory_value === "string"
          ? row.memory_value
          : JSON.stringify(row.memory_value);
      }
      const text = `${subject}: ${content || ""}`.trim();
      if (text.length < 3) continue;

      const e = await embed(text);
      const { error: updErr } = await supabase
        .from("agent_memory")
        .update({ embedding: e })
        .eq("id", row.id);

      if (updErr) {
        failures.push({ id: row.id, error: updErr.message });
      } else {
        done++;
      }
    } catch (err: any) {
      failures.push({ id: row.id, error: String(err?.message || err) });
    }
  }

  return new Response(
    JSON.stringify({
      candidates: rows?.length ?? 0,
      backfilled: done,
      failures,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
