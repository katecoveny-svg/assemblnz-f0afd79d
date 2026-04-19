// ═══════════════════════════════════════════════════════════════
// embed-worker — drains kb_embed_queue. For each pending document:
//   1. Splits content into ~800-token chunks (~3200 char proxy)
//   2. Embeds each chunk via Lovable AI Gateway (text-embedding-004, 768-dim)
//   3. Replaces existing chunks for that document
//   4. Marks queue row finished
// Triggered on cron OR via direct invoke. Processes up to 5 docs/run.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHUNK_CHARS = 3200; // ~800 tokens
const CHUNK_OVERLAP = 200;

function chunkText(text: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + CHUNK_CHARS);
    out.push(text.slice(i, end));
    if (end === text.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return out;
}

async function embed(input: string, apiKey: string): Promise<number[] | null> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/text-embedding-004", input }),
  });
  if (!r.ok) {
    console.error("embed failed", r.status, await r.text().catch(() => ""));
    return null;
  }
  const j = await r.json();
  return j?.data?.[0]?.embedding ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovKey) throw new Error("LOVABLE_API_KEY missing");
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: jobs } = await admin
      .from("kb_embed_queue")
      .select("id, document_id")
      .eq("status", "pending")
      .order("enqueued_at", { ascending: true })
      .limit(5);

    let processed = 0, chunksWritten = 0;

    for (const job of jobs ?? []) {
      await admin.from("kb_embed_queue").update({ status: "processing", picked_at: new Date().toISOString() }).eq("id", job.id);
      try {
        const { data: doc } = await admin.from("kb_documents").select("id, content").eq("id", job.document_id).single();
        if (!doc) throw new Error("doc gone");

        const chunks = chunkText(doc.content);
        // Replace existing chunks for this doc
        await admin.from("kb_doc_chunks").delete().eq("document_id", doc.id);

        let idx = 0;
        for (const chunk of chunks) {
          const vec = await embed(chunk, lovKey);
          if (!vec) continue;
          await admin.from("kb_doc_chunks").insert({
            document_id: doc.id, chunk_index: idx++,
            content: chunk, embedding: vec as unknown as string, tokens: Math.round(chunk.length / 4),
          });
          chunksWritten++;
        }

        await admin.from("kb_embed_queue").update({ status: "done", finished_at: new Date().toISOString() }).eq("id", job.id);
        processed++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        await admin.from("kb_embed_queue").update({ status: "error", finished_at: new Date().toISOString(), error: msg }).eq("id", job.id);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed, chunksWritten }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
