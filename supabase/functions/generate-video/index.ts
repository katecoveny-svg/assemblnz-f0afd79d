import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Lovable AI scene frames ── */
async function generateSceneWithLovable(apiKey: string, prompt: string, aspectRatio: string): Promise<string | null> {
  const arDesc: Record<string, string> = {
    "9:16": "vertical portrait (9:16) for mobile/Stories/Reels",
    "16:9": "horizontal landscape (16:9) for YouTube/web",
    "1:1": "square (1:1) for social feed",
    "4:5": "vertical portrait (4:5) for Instagram feed",
  };
  const fullPrompt = `Create a cinematic video frame for a professional video. Format: ${arDesc[aspectRatio] || aspectRatio}. Scene: ${prompt}. Broadcast quality.`;
  const models = ["google/gemini-3-pro-image-preview", "google/gemini-3.1-flash-image-preview", "google/gemini-2.5-flash-image"];
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: [{ role: "user", content: fullPrompt }], modalities: ["image", "text"] }),
        });
        if (res.status === 429) { await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); continue; }
        if (res.status === 402) throw new Error("AI credits exhausted.");
        if (!res.ok) continue;
        const data = await res.json();
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
      } catch (e: unknown) {
        if ((e as Error).message.includes("credits exhausted")) throw e;
        console.error(`Lovable scene fail (${model}):`, e);
      }
      if (attempt < 1) await new Promise(r => setTimeout(r, 800));
    }
  }
  return null;
}

/* ── Runway Gen-3 Alpha video generation ── */
async function generateVideoWithRunway(apiKey: string, prompt: string, duration: number = 5): Promise<string | null> {
  try {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Runway-Version": "2024-11-06" },
      body: JSON.stringify({ model: "gen3a_turbo", promptText: prompt, duration, watermark: false }),
    });
    if (!res.ok) { console.error("Runway video error:", res.status, await res.text()); return null; }
    const data = await res.json();
    const taskId = data.id;
    if (!taskId) return data.output?.[0] || null;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.status === "SUCCEEDED") return status.output?.[0] || null;
      if (status.status === "FAILED") { console.error("Runway video task failed"); return null; }
    }
    return null;
  } catch (e) { console.error("Runway video error:", e); return null; }
}

/* ── Fal.ai video (Kling) ── */
async function generateVideoWithFal(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video", {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, duration: "5", aspect_ratio: "16:9" }),
    });
    if (!res.ok) { console.error("Fal video error:", res.status); return null; }
    const data = await res.json();
    if (data.video?.url) return data.video.url;
    const requestId = data.request_id;
    if (!requestId) return null;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await fetch(`https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video/requests/${requestId}/status`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.status === "COMPLETED") {
        const resultRes = await fetch(`https://queue.fal.run/fal-ai/kling-video/v1/standard/text-to-video/requests/${requestId}`, {
          headers: { Authorization: `Key ${apiKey}` },
        });
        if (!resultRes.ok) return null;
        const result = await resultRes.json();
        return result.video?.url || null;
      }
      if (status.status === "FAILED") return null;
    }
    return null;
  } catch (e) { console.error("Fal video error:", e); return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { scenes, aspectRatio, title, videoType, provider, prompt: videoPrompt } = await req.json();

    // Mode 1: Full video generation (Runway or Fal)
    if (videoPrompt && (provider === "runway" || provider === "fal")) {
      let videoUrl: string | null = null;
      let usedProvider = provider;

      if (provider === "runway" && RUNWAY_API_KEY) {
        videoUrl = await generateVideoWithRunway(RUNWAY_API_KEY, videoPrompt);
      } else if (provider === "fal" && FAL_API_KEY) {
        videoUrl = await generateVideoWithFal(FAL_API_KEY, videoPrompt);
      }

      // Fallback
      if (!videoUrl && FAL_API_KEY && provider !== "fal") {
        videoUrl = await generateVideoWithFal(FAL_API_KEY, videoPrompt);
        usedProvider = "fal";
      }
      if (!videoUrl && RUNWAY_API_KEY && provider !== "runway") {
        videoUrl = await generateVideoWithRunway(RUNWAY_API_KEY, videoPrompt);
        usedProvider = "runway";
      }

      if (!videoUrl) {
        return new Response(JSON.stringify({ error: "Video generation failed across all providers." }), {
          status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("exported_outputs").insert({
        user_id: user.id, agent_id: "marketing", agent_name: "PRISM",
        output_type: "video", title: title || "AI Video",
        content_preview: `${usedProvider} video: ${videoPrompt.substring(0, 100)}`, format: "mp4",
      });

      return new Response(JSON.stringify({ success: true, videoUrl, provider: usedProvider }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode 2: Scene-by-scene frames (original behavior)
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return new Response(JSON.stringify({ error: "Scenes array or video prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxScenes = Math.min(scenes.length, 8);
    const results: { sceneIndex: number; imageUrl: string | null; prompt: string }[] = [];

    for (let i = 0; i < maxScenes; i++) {
      const scene = scenes[i];
      const scenePrompt = scene.visual || scene.description || scene.prompt || `Scene ${i + 1}`;
      console.log(`Scene ${i + 1}/${maxScenes}: ${scenePrompt.substring(0, 80)}...`);
      const imageUrl = await generateSceneWithLovable(LOVABLE_API_KEY, scenePrompt, aspectRatio || "16:9");
      results.push({ sceneIndex: i, imageUrl, prompt: scenePrompt });
      if (i < maxScenes - 1) await new Promise(r => setTimeout(r, 1000));
    }

    const successCount = results.filter(r => r.imageUrl).length;
    await supabase.from("exported_outputs").insert({
      user_id: user.id, agent_id: "marketing", agent_name: "PRISM",
      output_type: "video_frames", title: title || "Video Scene Frames",
      content_preview: `${successCount}/${maxScenes} scenes (${aspectRatio || "16:9"})`, format: "png",
    });

    return new Response(
      JSON.stringify({ success: true, frames: results, total: maxScenes, generated: successCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("generate-video error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("credits exhausted") ? 402 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
