// ═══════════════════════════════════════════════════════════════
// rag-embedder — picks up rag.chunks where embedding IS NULL and
// generates 768-dim Gemini embeddings, writing them back.
// Reuses the shared embedText helper. Processes up to BATCH chunks
// per invocation to stay well under the edge-function timeout.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pending, error } = await admin
      .schema("rag" as any).from("chunks")
      .select("id, content")
      .is("embedding", null)
      .eq("current", true)
      .order("created_at", { ascending: true })
      .limit(BATCH);
    if (error) throw error;

    let embedded = 0;
    let failed = 0;
    for (const row of pending ?? []) {
      const vec = await embedText(row.content, geminiKey, 768);
      if (!vec || vec.length !== 768) {
        failed++;
        continue;
      }
      const { error: updErr } = await admin
        .schema("rag" as any).from("chunks")
        .update({
          embedding: vec as unknown as string,
          embedded_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (updErr) {
        failed++;
        console.error("[rag-embedder] update failed", updErr.message);
      } else {
        embedded++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, scanned: pending?.length ?? 0, embedded, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
