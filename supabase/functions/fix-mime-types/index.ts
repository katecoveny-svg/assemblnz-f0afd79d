// Re-uploads objects in the video-assets bucket with the correct
// Content-Type header. Process one folder at a time via ?folder=kete-clips.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const folder = url.searchParams.get("folder") ?? "kete-clips";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const bucket = "video-assets";

  const { data: items, error: listErr } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
  });
  if (listErr) {
    return new Response(JSON.stringify({ error: listErr.message }), { status: 500 });
  }

  const results: Array<{ path: string; ok: boolean; mime: string; error?: string }> = [];
  for (const item of items ?? []) {
    const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME_BY_EXT[ext];
    if (!mime) continue;
    const fullPath = `${folder}/${item.name}`;
    try {
      const { data: blob, error: dlErr } = await supabase.storage.from(bucket).download(fullPath);
      if (dlErr || !blob) throw dlErr ?? new Error("no blob");
      const buf = await blob.arrayBuffer();
      const { error: upErr } = await supabase.storage.from(bucket).upload(fullPath, buf, {
        contentType: mime,
        upsert: true,
      });
      if (upErr) throw upErr;
      results.push({ path: fullPath, ok: true, mime });
    } catch (e) {
      results.push({ path: fullPath, ok: false, mime, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ folder, count: results.length, results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
