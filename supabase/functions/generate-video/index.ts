import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Generate scene-by-scene visuals for a video storyboard using Lovable AI image generation.
 * Each scene gets a professional key frame image. Results are stored and returned.
 */

async function generateSceneImage(
  apiKey: string,
  scenePrompt: string,
  aspectRatio: string,
  retries = 2
): Promise<string | null> {
  const models = [
    "google/gemini-3-pro-image-preview",
    "google/gemini-3.1-flash-image-preview",
    "google/gemini-2.5-flash-image",
  ];

  // Map aspect ratios to descriptive text for the prompt
  const arDesc: Record<string, string> = {
    "9:16": "vertical portrait (9:16) for mobile/Stories/Reels",
    "16:9": "horizontal landscape (16:9) for YouTube/web",
    "1:1": "square (1:1) for social feed",
    "4:5": "vertical portrait (4:5) for Instagram feed",
  };

  const fullPrompt = `Create a cinematic video frame / key frame for a professional video production. This is a single frame from a high-production video, NOT a still photo. It should feel dynamic, mid-motion, with cinematic lighting and professional color grading. Format: ${arDesc[aspectRatio] || aspectRatio}. Scene description: ${scenePrompt}. Make it look like a frame grabbed from a premium commercial or brand film. Professional, broadcast quality.`;

  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: fullPrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (response.status === 429) {
          // Rate limited — wait and retry
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add funds to continue.");
        }
        if (!response.ok) {
          console.error(`Model ${model} error [${response.status}]`);
          continue;
        }

        const data = await response.json();
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
      } catch (e: unknown) {
        const msg = (e as Error).message;
        if (msg.includes("credits exhausted")) throw e;
        console.error(`Scene image attempt failed (${model}):`, e);
      }
      if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { scenes, aspectRatio, title, videoType } = await req.json();

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return new Response(JSON.stringify({ error: "Scenes array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate images for each scene (max 8 scenes to avoid timeouts)
    const maxScenes = Math.min(scenes.length, 8);
    const results: { sceneIndex: number; imageUrl: string | null; prompt: string }[] = [];

    for (let i = 0; i < maxScenes; i++) {
      const scene = scenes[i];
      const scenePrompt = scene.visual || scene.description || scene.prompt || `Scene ${i + 1}`;

      console.log(`Generating scene ${i + 1}/${maxScenes}: ${scenePrompt.substring(0, 80)}...`);

      const imageUrl = await generateSceneImage(
        LOVABLE_API_KEY,
        scenePrompt,
        aspectRatio || "16:9"
      );

      results.push({ sceneIndex: i, imageUrl, prompt: scenePrompt });

      // Small delay between generations to avoid rate limits
      if (i < maxScenes - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const successCount = results.filter((r) => r.imageUrl).length;

    // Log to exported_outputs
    await supabase.from("exported_outputs").insert({
      user_id: user.id,
      agent_id: "marketing",
      agent_name: "PRISM",
      output_type: "video_frames",
      title: title || "Video Scene Frames",
      content_preview: `${successCount}/${maxScenes} scenes generated for ${videoType || "video"} (${aspectRatio || "16:9"})`,
      format: "png",
    });

    return new Response(
      JSON.stringify({
        success: true,
        frames: results,
        total: maxScenes,
        generated: successCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("generate-video error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("credits exhausted") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
