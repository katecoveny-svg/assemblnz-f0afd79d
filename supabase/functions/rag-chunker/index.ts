// ═══════════════════════════════════════════════════════════════
// rag-chunker — drains rag.rechunk_queue. For each pending row:
//   1. Strips HTML chrome (nav/footer/script/style)
//   2. Splits by section markers (legislation.govt.nz uses
//      <h*> headings + <p class="prov*"> paragraphs)
//   3. Falls back to ~3000-char chunking for non-legislation pages
//   4. Marks existing chunks superseded; inserts new chunks (current=true,
//      embedding=null — embedder picks them up next)
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CHUNK_CHARS = 3000;
const MIN_CHUNK_CHARS = 80;
const BATCH = 5;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

interface RawChunk { path: string; label: string; text: string }

// Split legislation.govt.nz HTML by <h2>/<h3>/<h4>/<h5> headings.
// Each heading + following content becomes one chunk (subdivided if too long).
function chunkLegislationHtml(html: string, sourceTitle: string): RawChunk[] {
  // Drop chrome
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Split on headings (keep delimiter)
  const parts = body.split(/(?=<h[2-5][\s>])/i);
  const chunks: RawChunk[] = [];

  for (const part of parts) {
    const headingMatch = part.match(/<h[2-5][^>]*>([\s\S]*?)<\/h[2-5]>/i);
    const heading = headingMatch ? stripHtml(headingMatch[1]) : "";
    const text = stripHtml(part);
    if (text.length < MIN_CHUNK_CHARS) continue;

    const label = heading || sourceTitle;
    // Try to extract section number from heading (e.g. "18A Retention money…")
    const sectionMatch = heading.match(/^(?:Section\s+)?(\d+[A-Z]{0,3})\b/i);
    const path = sectionMatch ? `Section ${sectionMatch[1]}` : (heading.slice(0, 60) || "general");

    if (text.length <= MAX_CHUNK_CHARS) {
      chunks.push({ path, label, text });
    } else {
      // Sub-split long sections by sentences
      const sentences = text.split(/(?<=[.!?])\s+/);
      let buf = "";
      let idx = 0;
      for (const s of sentences) {
        if ((buf + " " + s).length > MAX_CHUNK_CHARS && buf.length >= MIN_CHUNK_CHARS) {
          idx++;
          chunks.push({ path: `${path}.${idx}`, label: `${label} (part ${idx})`, text: buf.trim() });
          buf = s;
        } else {
          buf = buf ? `${buf} ${s}` : s;
        }
      }
      if (buf.trim().length >= MIN_CHUNK_CHARS) {
        idx++;
        chunks.push({ path: `${path}.${idx}`, label: `${label} (part ${idx})`, text: buf.trim() });
      }
    }
  }

  // Fallback: nothing parsed — chunk the whole stripped text
  if (chunks.length === 0) {
    const flat = stripHtml(body);
    for (let i = 0; i < flat.length; i += MAX_CHUNK_CHARS) {
      const piece = flat.slice(i, i + MAX_CHUNK_CHARS);
      if (piece.length >= MIN_CHUNK_CHARS) {
        chunks.push({
          path: `block.${Math.floor(i / MAX_CHUNK_CHARS) + 1}`,
          label: `${sourceTitle} (block ${Math.floor(i / MAX_CHUNK_CHARS) + 1})`,
          text: piece,
        });
      }
    }
  }

  return chunks;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: jobs } = await admin
      .schema("rag" as any).from("rechunk_queue")
      .select("id, source_id, raw_content")
      .eq("status", "pending")
      .order("fetched_at", { ascending: true })
      .limit(BATCH);

    let processed = 0;
    let totalChunks = 0;
    const results: any[] = [];

    for (const job of jobs ?? []) {
      await admin.schema("rag" as any).from("rechunk_queue")
        .update({ status: "processing", picked_at: new Date().toISOString() })
        .eq("id", job.id);

      try {
        const { data: source } = await admin.schema("rag" as any).from("sources")
          .select("id, short_name, full_title, tier, authority_weight, kete")
          .eq("id", job.source_id).single();
        if (!source) throw new Error("source missing");

        const rawChunks = chunkLegislationHtml(job.raw_content, source.full_title);

        // Mark old chunks for this source as superseded
        await admin.schema("rag" as any).from("chunks")
          .update({ current: false })
          .eq("source_id", source.id)
          .eq("current", true);

        // Insert new chunks (in batches of 200)
        const rows = rawChunks.map((c) => ({
          source_id: source.id,
          source_short_name: source.short_name,
          structural_path: c.path,
          structural_label: c.label,
          content: c.text,
          content_tokens: Math.round(c.text.length / 4),
          tier: source.tier,
          authority_weight: source.authority_weight,
          kete: source.kete,
          current: true,
        }));

        for (let i = 0; i < rows.length; i += 200) {
          const slice = rows.slice(i, i + 200);
          const { error: insertErr } = await admin.schema("rag" as any).from("chunks").insert(slice);
          if (insertErr) throw insertErr;
        }

        await admin.schema("rag" as any).from("rechunk_queue").update({
          status: "done",
          finished_at: new Date().toISOString(),
          chunks_produced: rows.length,
        }).eq("id", job.id);

        processed++;
        totalChunks += rows.length;
        results.push({ source: source.short_name, chunks: rows.length });
      } catch (e) {
        await admin.schema("rag" as any).from("rechunk_queue").update({
          status: "error",
          finished_at: new Date().toISOString(),
          error: (e as Error).message,
        }).eq("id", job.id);
        results.push({ job_id: job.id, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed, totalChunks, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
