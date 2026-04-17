import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ── Fal.ai: Submit job (returns request_id, does NOT wait) ── */
async function falSubmit(apiKey: string, prompt: string, aspectRatio: string): Promise<{ requestId: string } | null> {
  try {
    const res = await fetch("https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video", {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, duration: "5", aspect_ratio: aspectRatio || "16:9" }),
    });
    if (!res.ok) { console.error("Fal submit error:", res.status, await res.text()); return null; }
    const data = await res.json();
    // If video returned immediately (unlikely but possible)
    if (data.video?.url) return { requestId: `done:${data.video.url}` };
    if (data.request_id) return { requestId: data.request_id };
    console.error("Fal submit: no request_id", data);
    return null;
  } catch (e) { console.error("Fal submit error:", e); return null; }
}

/* ── Fal.ai: Check job status ── */
async function falCheck(apiKey: string, requestId: string): Promise<{ status: string; videoUrl?: string }> {
  try {
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video/requests/${requestId}/status`,
      { headers: { Authorization: `Key ${apiKey}` } }
    );
    if (!statusRes.ok) return { status: "polling" };
    const status = await statusRes.json();

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video/requests/${requestId}`,
        { headers: { Authorization: `Key ${apiKey}` } }
      );
      if (!resultRes.ok) return { status: "error" };
      const result = await resultRes.json();
      return { status: "completed", videoUrl: result.video?.url || undefined };
    }
    if (status.status === "FAILED") return { status: "failed" };
    return { status: "processing" };
  } catch (e) { console.error("Fal check error:", e); return { status: "error" }; }
}

/* ── Runway Gen-3 Alpha (shorter timeout — 50s max) ── */
async function generateVideoWithRunway(apiKey: string, prompt: string, duration = 5): Promise<string | null> {
  try {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Runway-Version": "2024-11-06" },
      body: JSON.stringify({ model: "gen3a_turbo", promptText: prompt, duration, watermark: false }),
    });
    if (!res.ok) { console.error("Runway error:", res.status); return null; }
    const data = await res.json();
    const taskId = data.id;
    if (!taskId) return data.output?.[0] || null;
    // Poll for max ~45 seconds
    for (let i = 0; i < 9; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const sr = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });
      if (!sr.ok) continue;
      const s = await sr.json();
      if (s.status === "SUCCEEDED") return s.output?.[0] || null;
      if (s.status === "FAILED") return null;
    }
    return null;
  } catch (e) { console.error("Runway error:", e); return null; }
}

/* ── Lovable AI scene frames ── */
async function generateSceneWithLovable(apiKey: string, prompt: string, aspectRatio: string): Promise<string | null> {
  const arDesc: Record<string, string> = {
    "9:16": "vertical portrait (9:16)",
    "16:9": "horizontal landscape (16:9)",
    "1:1": "square (1:1)",
    "4:5": "vertical portrait (4:5)",
  };
  const fullPrompt = `Create a cinematic video frame. Format: ${arDesc[aspectRatio] || aspectRatio}. Scene: ${prompt}. Broadcast quality.`;
  const models = ["google/gemini-3-pro-image-preview", "google/gemini-3.1-flash-image-preview"];
  for (const model of models) {
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "user", content: fullPrompt }], modalities: ["image", "text"] }),
      });
      if (res.status === 429) { await new Promise(r => setTimeout(r, 2000)); continue; }
      if (res.status === 402) throw new Error("AI credits exhausted.");
      if (!res.ok) continue;
      const data = await res.json();
      const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (url) return url;
    } catch (e: unknown) {
      if ((e as Error).message.includes("credits exhausted")) throw e;
      console.error(`Lovable scene fail (${model}):`, e);
    }
  }
  return null;
}

/* ── Upload video to storage ── */
async function persistVideo(supabaseUrl: string, videoUrl: string, userId: string): Promise<string> {
  try {
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) return videoUrl;
    const videoBlob = await videoRes.arrayBuffer();
    const fileName = `videos/${userId}/${Date.now()}.mp4`;
    const { error } = await serviceClient.storage.from("auaha-assets").upload(fileName, videoBlob, { contentType: "video/mp4", upsert: true });
    if (error) return videoUrl;
    const { data: urlData } = serviceClient.storage.from("auaha-assets").getPublicUrl(fileName);
    return urlData?.publicUrl || videoUrl;
  } catch { return videoUrl; }
}

/* ── Save to creative_assets so it appears in gallery ── */
async function saveToGallery(supabase: any, userId: string, fileUrl: string, prompt: string, assetType: "video" | "image", provider: string) {
  try {
    await supabase.from("creative_assets").insert({
      user_id: userId,
      file_url: fileUrl,
      asset_type: assetType,
      prompt: prompt || "",
      style: provider,
      metadata: { provider, generated_at: new Date().toISOString() },
    });
  } catch (e) { console.error("saveToGallery error:", e); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Service-role client so generation works for admins (full access — no JWT gate).
    const supabase = createClient(supabaseUrl, serviceKey);

    // Best-effort user attribution; fall back to system user when unauthenticated.
    let userId = "00000000-0000-0000-0000-000000000000";
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !authHeader.endsWith(anonKey)) {
      try {
        const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
        const { data: { user: authedUser } } = await userClient.auth.getUser();
        if (authedUser?.id) userId = authedUser.id;
      } catch (_) { /* ignore — fall through */ }
    }
    const user = { id: userId };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { action, scenes, aspectRatio, title, videoType, provider, prompt: videoPrompt, requestId } = body;

    console.log("[generate-video] action:", action, "provider:", provider, "prompt:", videoPrompt?.substring(0, 50));

    // ── ACTION: poll — check Fal.ai job status ──
    if (action === "poll" && requestId) {
      if (!FAL_API_KEY) return respond({ error: "FAL_API_KEY not configured" }, 500);
      const result = await falCheck(FAL_API_KEY, requestId);
      console.log("[generate-video] poll result:", result.status);

      if (result.status === "completed" && result.videoUrl) {
        const persistedUrl = await persistVideo(supabaseUrl, result.videoUrl, user.id);
        // Save to both tables so gallery works
        await saveToGallery(supabase, user.id, persistedUrl, videoPrompt || title || "", "video", "fal-kling");
        await supabase.from("exported_outputs").insert({
          user_id: user.id, agent_id: "marketing", agent_name: "PRISM",
          output_type: "video", title: title || "AI Video",
          content_preview: `fal video: ${(videoPrompt || "").substring(0, 100)}`, format: "mp4",
          image_url: persistedUrl,
        });
        return respond({ status: "completed", videoUrl: persistedUrl });
      }
      return respond({ status: result.status });
    }

    // ── ACTION: generate (default) — submit video job ──
    if (videoPrompt) {
      const selectedProvider = provider === "auto" ? "fal" : provider;
      console.log("[generate-video] using provider:", selectedProvider);

      // Runway: try to complete within edge function timeout
      if (selectedProvider === "runway" && RUNWAY_API_KEY) {
        const videoUrl = await generateVideoWithRunway(RUNWAY_API_KEY, videoPrompt);
        if (videoUrl) {
          const persistedUrl = await persistVideo(supabaseUrl, videoUrl, user.id);
          await saveToGallery(supabase, user.id, persistedUrl, videoPrompt, "video", "runway");
          await supabase.from("exported_outputs").insert({
            user_id: user.id, agent_id: "marketing", agent_name: "PRISM",
            output_type: "video", title: title || "AI Video",
            content_preview: `runway video: ${videoPrompt.substring(0, 100)}`, format: "mp4",
            image_url: persistedUrl,
          });
          return respond({ success: true, videoUrl: persistedUrl, provider: "runway" });
        }
        console.log("[generate-video] Runway failed, falling through");
      }

      // Fal.ai: submit async job, return requestId for client polling
      if (FAL_API_KEY) {
        const result = await falSubmit(FAL_API_KEY, videoPrompt, aspectRatio || "16:9");
        if (result) {
          // If video came back immediately
          if (result.requestId.startsWith("done:")) {
            const url = result.requestId.replace("done:", "");
            const persistedUrl = await persistVideo(supabaseUrl, url, user.id);
            await saveToGallery(supabase, user.id, persistedUrl, videoPrompt, "video", "fal-kling");
            return respond({ success: true, videoUrl: persistedUrl, provider: "fal" });
          }
          // Return requestId for client-side polling
          console.log("[generate-video] Fal job submitted:", result.requestId);
          return respond({ success: true, status: "submitted", requestId: result.requestId, provider: "fal" });
        }
        console.error("[generate-video] Fal submit returned null");
      }

      return respond({ error: "No video provider available. Check FAL_API_KEY or RUNWAY_API_KEY configuration." }, 500);
    }

    // ── Scene-by-scene frames (original behavior) ──
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return respond({ error: "Scenes array or video prompt required" }, 400);
    }

    const maxScenes = Math.min(scenes.length, 8);
    const results: { sceneIndex: number; imageUrl: string | null; prompt: string }[] = [];
    for (let i = 0; i < maxScenes; i++) {
      const scene = scenes[i];
      const scenePrompt = scene.visual || scene.description || scene.prompt || `Scene ${i + 1}`;
      const imageUrl = await generateSceneWithLovable(LOVABLE_API_KEY, scenePrompt, aspectRatio || "16:9");
      results.push({ sceneIndex: i, imageUrl, prompt: scenePrompt });
      if (i < maxScenes - 1) await new Promise(r => setTimeout(r, 1000));
    }

    const successCount = results.filter(r => r.imageUrl).length;
    // Save frames to gallery too
    for (const r of results) {
      if (r.imageUrl) {
        await saveToGallery(supabase, user.id, r.imageUrl, r.prompt, "image", "lovable-ai");
      }
    }
    await supabase.from("exported_outputs").insert({
      user_id: user.id, agent_id: "marketing", agent_name: "PRISM",
      output_type: "video_frames", title: title || "Video Scene Frames",
      content_preview: `${successCount}/${maxScenes} scenes`, format: "png",
    });

    return respond({ success: true, frames: results, total: maxScenes, generated: successCount });
  } catch (error: unknown) {
    console.error("generate-video error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("credits exhausted") ? 402 : 500;
    return respond({ error: errorMessage }, status);
  }
});
