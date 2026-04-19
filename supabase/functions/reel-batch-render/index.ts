import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * REEL-BATCH-RENDER
 * =================
 * Generates a stack of N reel video MP4s in one shot via Fal.ai Kling.
 *
 * Modes:
 *   POST { action: "submit", topic, count?=10, audience?, brand?, aspect_ratio?="9:16" }
 *     → 1) AI expands the topic into N distinct shot prompts
 *       2) submits N Fal.ai Kling jobs (queue, async)
 *       3) inserts N reel_renders rows (status="queued", request_id set)
 *       4) returns { batch_id, renders: [{ id, request_id, prompt }] }
 *
 *   POST { action: "poll", batch_id }
 *     → polls Fal.ai for every queued render in the batch, persists video URLs
 *       to storage, updates rows. Returns the latest snapshot.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const FAL_BASE = "https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video";

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function generatePrompts(apiKey: string, topic: string, count: number, audience?: string, brand?: string): Promise<string[]> {
  const sys = `You are AUAHA's reel director. Given a topic, return EXACTLY ${count} short distinct video prompts (one per line, no numbering, no markdown). Each prompt must be 1-2 sentences, cinematic, NZ-aware, and optimised for vertical 9:16 short-form video. Each prompt must be a different angle, shot, or sub-topic so the batch covers the full story.`;
  const user = `Topic: ${topic}\nAudience: ${audience || "general NZ business"}\nBrand voice: ${brand || "AUAHA"}\n\nReturn ${count} prompts, one per line.`;

  const resp = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      max_tokens: 1500,
    }),
  });

  if (!resp.ok) {
    console.error("Prompt gen failed:", resp.status, await resp.text());
    return Array.from({ length: count }, (_, i) => `${topic} — angle ${i + 1}`);
  }

  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  const lines = text.split("\n").map((l: string) => l.replace(/^[-*\d.)\s]+/, "").trim()).filter(Boolean);
  while (lines.length < count) lines.push(`${topic} — extra angle ${lines.length + 1}`);
  return lines.slice(0, count);
}

async function falSubmit(apiKey: string, prompt: string, aspectRatio: string): Promise<{ requestId?: string; error?: string }> {
  try {
    const res = await fetch(FAL_BASE, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, duration: "5", aspect_ratio: aspectRatio }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { error: `Fal submit ${res.status}: ${txt.slice(0, 100)}` };
    }
    const data = await res.json();
    if (data.video?.url) return { requestId: `done:${data.video.url}` };
    if (data.request_id) return { requestId: data.request_id };
    return { error: "no_request_id" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

async function falCheck(apiKey: string, requestId: string): Promise<{ status: string; videoUrl?: string }> {
  try {
    if (requestId.startsWith("done:")) return { status: "completed", videoUrl: requestId.slice(5) };
    const sr = await fetch(`${FAL_BASE}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    if (!sr.ok) return { status: "polling" };
    const status = await sr.json();
    if (status.status === "COMPLETED") {
      const rr = await fetch(`${FAL_BASE}/requests/${requestId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      if (!rr.ok) return { status: "error" };
      const result = await rr.json();
      return { status: "completed", videoUrl: result.video?.url };
    }
    if (status.status === "FAILED") return { status: "failed" };
    return { status: "processing" };
  } catch (e) {
    console.error("Fal check error:", e);
    return { status: "error" };
  }
}

async function persistVideo(supabaseUrl: string, serviceKey: string, videoUrl: string, userId: string, renderId: string): Promise<string> {
  try {
    const sb = createClient(supabaseUrl, serviceKey);
    const r = await fetch(videoUrl);
    if (!r.ok) return videoUrl;
    const buf = await r.arrayBuffer();
    const fileName = `reel-batches/${userId}/${renderId}.mp4`;
    const { error } = await sb.storage.from("video-assets").upload(fileName, buf, {
      contentType: "video/mp4", upsert: true,
    });
    if (error) return videoUrl;
    const { data } = sb.storage.from("video-assets").getPublicUrl(fileName);
    return data?.publicUrl || videoUrl;
  } catch { return videoUrl; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");

    if (!FAL_API_KEY) return respond({ error: "FAL_API_KEY not configured" }, 500);
    if (!LOVABLE_API_KEY) return respond({ error: "LOVABLE_API_KEY not configured" }, 500);

    const sb = createClient(supabaseUrl, serviceKey);

    // Resolve user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id ?? null;
    }
    if (!userId) return respond({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const action = body.action || "submit";

    if (action === "submit") {
      const { topic, count = 10, audience, brand, aspect_ratio = "9:16", tenant_id } = body;
      if (!topic) return respond({ error: "topic required" }, 400);
      const N = Math.min(Math.max(parseInt(count) || 10, 1), 12);

      const prompts = await generatePrompts(LOVABLE_API_KEY, topic, N, audience, brand);
      const batchId = crypto.randomUUID();

      const renders: any[] = [];
      // Submit jobs sequentially (Fal queue handles parallelism upstream)
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const sub = await falSubmit(FAL_API_KEY, prompt, aspect_ratio);
        const status = sub.error ? "failed" : (sub.requestId?.startsWith("done:") ? "completed" : "processing");
        const videoUrl = sub.requestId?.startsWith("done:") ? sub.requestId.slice(5) : null;

        const { data: row, error: insErr } = await sb.from("reel_renders").insert({
          user_id: userId,
          tenant_id: tenant_id || null,
          batch_id: batchId,
          batch_index: i,
          topic,
          prompt,
          aspect_ratio,
          provider: "fal-kling",
          status,
          request_id: sub.requestId || null,
          video_url: videoUrl,
          error: sub.error || null,
        }).select("id, batch_index, prompt, status, request_id, video_url").single();

        if (insErr) console.error("reel_renders insert err:", insErr);
        if (row) renders.push(row);
      }

      return respond({ batch_id: batchId, count: renders.length, renders });
    }

    if (action === "poll") {
      const { batch_id } = body;
      if (!batch_id) return respond({ error: "batch_id required" }, 400);

      const { data: pending } = await sb
        .from("reel_renders")
        .select("*")
        .eq("batch_id", batch_id)
        .eq("user_id", userId)
        .in("status", ["queued", "processing"]);

      for (const row of pending || []) {
        if (!row.request_id) continue;
        const r = await falCheck(FAL_API_KEY, row.request_id);
        if (r.status === "completed" && r.videoUrl) {
          const persisted = await persistVideo(supabaseUrl, serviceKey, r.videoUrl, userId, row.id);
          await sb.from("reel_renders").update({
            status: "completed", video_url: persisted,
          }).eq("id", row.id);
        } else if (r.status === "failed") {
          await sb.from("reel_renders").update({ status: "failed", error: "fal_failed" }).eq("id", row.id);
        }
      }

      const { data: all } = await sb
        .from("reel_renders")
        .select("id, batch_index, prompt, status, video_url, error, created_at")
        .eq("batch_id", batch_id)
        .eq("user_id", userId)
        .order("batch_index", { ascending: true });

      const completed = (all || []).filter(r => r.status === "completed").length;
      const failed = (all || []).filter(r => r.status === "failed").length;
      const total = all?.length || 0;
      return respond({
        batch_id,
        renders: all || [],
        total,
        completed,
        failed,
        done: completed + failed === total,
      });
    }

    if (action === "regenerate") {
      const { render_id, new_prompt, aspect_ratio = "9:16" } = body;
      if (!render_id) return respond({ error: "render_id required" }, 400);

      // Fetch existing row, ensure ownership
      const { data: row } = await sb.from("reel_renders")
        .select("id, user_id, prompt, batch_id, batch_index, aspect_ratio")
        .eq("id", render_id).maybeSingle();
      if (!row || row.user_id !== userId) return respond({ error: "Not found" }, 404);

      const promptToUse = (new_prompt && new_prompt.trim()) ? new_prompt.trim() : row.prompt;
      const sub = await falSubmit(FAL_API_KEY, promptToUse, row.aspect_ratio || aspect_ratio);
      const status = sub.error ? "failed" : (sub.requestId?.startsWith("done:") ? "completed" : "processing");
      const videoUrl = sub.requestId?.startsWith("done:") ? sub.requestId.slice(5) : null;

      const { data: updated } = await sb.from("reel_renders").update({
        prompt: promptToUse,
        status,
        request_id: sub.requestId || null,
        video_url: videoUrl,
        error: sub.error || null,
      }).eq("id", render_id).select("id, batch_index, prompt, status, video_url, error").single();

      return respond({ render: updated, batch_id: row.batch_id });
    }

    if (action === "list") {
      const { data: batches } = await sb
        .from("reel_renders")
        .select("batch_id, topic, status, video_url, created_at, batch_index")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);
      return respond({ renders: batches || [] });
    }

    return respond({ error: "unknown action" }, 400);
  } catch (e) {
    console.error("reel-batch-render error:", e);
    return respond({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
