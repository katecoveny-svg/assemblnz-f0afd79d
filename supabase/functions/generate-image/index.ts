import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_MODELS = {
  fast: "google/gemini-2.5-flash-image",
  pro: "google/gemini-3-pro-image-preview",
  flash_pro: "google/gemini-3.1-flash-image-preview",
};

/* ── Lovable AI Gateway ── */
async function generateWithLovable(apiKey: string, prompt: string, model: string): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], modalities: ["image", "text"] }),
  });
  if (!response.ok) {
    const t = await response.text();
    console.error("Lovable AI error:", response.status, t);
    if (response.status === 429) throw new Error("Rate limited — please try again in a moment.");
    if (response.status === 402) throw new Error("AI credits exhausted — please top up in workspace settings.");
    throw new Error(`Lovable AI [${response.status}]: ${t}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
}

/* ── Fal.ai ── */
async function generateWithFal(apiKey: string, prompt: string, style: string): Promise<string | null> {
  const modelMap: Record<string, string> = {
    photorealistic: "fal-ai/flux-pro/v1.1",
    illustration: "fal-ai/flux-pro/v1.1",
    "3d": "fal-ai/flux-pro/v1.1",
    default: "fal-ai/flux/dev",
  };
  const model = modelMap[style] || modelMap.default;
  try {
    // Submit
    const submitRes = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_size: "landscape_16_9", num_images: 1, enable_safety_checker: true }),
    });
    if (!submitRes.ok) { console.error("Fal submit error:", submitRes.status); return null; }
    const submitData = await submitRes.json();
    // If synchronous response
    if (submitData.images?.[0]?.url) return submitData.images[0].url;
    // Poll queue
    const requestId = submitData.request_id;
    if (!requestId) return null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.status === "COMPLETED") {
        const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
          headers: { Authorization: `Key ${apiKey}` },
        });
        if (!resultRes.ok) return null;
        const result = await resultRes.json();
        return result.images?.[0]?.url || null;
      }
      if (status.status === "FAILED") return null;
    }
    return null;
  } catch (e) { console.error("Fal error:", e); return null; }
}

/* ── Runway (Gen-3 Alpha) ── */
async function generateWithRunway(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_image", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Runway-Version": "2024-11-06" },
      body: JSON.stringify({ model: "gen3a_turbo", promptText: prompt }),
    });
    if (!res.ok) { console.error("Runway error:", res.status); return null; }
    const data = await res.json();
    // Poll for completion
    const taskId = data.id;
    if (!taskId) return data.output?.[0] || null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.status === "SUCCEEDED") return status.output?.[0] || null;
      if (status.status === "FAILED") return null;
    }
    return null;
  } catch (e) { console.error("Runway error:", e); return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    let _userId = "anonymous";
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) _userId = user.id;
      } catch { /* continue anonymous */ }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt, platform, contentType, topic, agentContext, quality, brandContext, provider, style } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brandSection = brandContext
      ? `Brand guidelines: Business "${brandContext.business_name || ""}". Tone: ${brandContext.tone || "professional"}. Industry: ${brandContext.industry || "technology"}.`
      : "";

    const imagePrompt = `Generate a high-quality, professional image.
Platform: ${platform?.replace(/_/g, " ") || "marketing material"}.
Content type: ${contentType?.replace(/_/g, " ") || "visual asset"}.
${topic ? `Topic: ${topic}.` : ""}
${brandSection}
${agentContext || ""}
Style: Premium, polished, commercial-grade.
Visual direction: ${prompt}
BRANDING: Include a small, subtle "assembl" watermark text in the bottom-right corner (30% opacity).
IMPORTANT: Generate an actual high-resolution image.`;

    let imageUrl: string | null = null;
    let usedProvider = "lovable";

    // Provider routing: explicit provider > auto-select
    if (provider === "fal" && FAL_API_KEY) {
      console.log("Routing to Fal.ai");
      imageUrl = await generateWithFal(FAL_API_KEY, prompt, style || "default");
      usedProvider = "fal";
    } else if (provider === "runway" && RUNWAY_API_KEY) {
      console.log("Routing to Runway");
      imageUrl = await generateWithRunway(RUNWAY_API_KEY, prompt);
      usedProvider = "runway";
    }

    // Fallback chain: Lovable AI models
    if (!imageUrl) {
      const selectedModel = quality === "pro" ? LOVABLE_MODELS.pro
        : quality === "flash_pro" ? LOVABLE_MODELS.flash_pro
        : LOVABLE_MODELS.fast;

      const fallbackModels = [selectedModel];
      if (selectedModel === LOVABLE_MODELS.pro) fallbackModels.push(LOVABLE_MODELS.flash_pro, LOVABLE_MODELS.fast);
      else if (selectedModel === LOVABLE_MODELS.flash_pro) fallbackModels.push(LOVABLE_MODELS.fast);

      for (const model of fallbackModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          console.log(`Lovable AI: model=${model}, attempt=${attempt + 1}`);
          try {
            imageUrl = await generateWithLovable(LOVABLE_API_KEY, imagePrompt, model);
            if (imageUrl) { usedProvider = "lovable"; break; }
          } catch (e) {
            console.error("Attempt failed:", e);
            if ((e as Error).message.includes("Rate limited") || (e as Error).message.includes("credits exhausted")) throw e;
          }
          if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
        }
        if (imageUrl) break;
      }
    }

    // Last resort: try Fal if available and not already tried
    if (!imageUrl && FAL_API_KEY && provider !== "fal") {
      console.log("Last resort: Fal.ai");
      imageUrl = await generateWithFal(FAL_API_KEY, prompt, style || "default");
      if (imageUrl) usedProvider = "fal";
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No provider could generate an image. Please try a simpler prompt." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl, provider: usedProvider }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("credits exhausted") ? 402 : errorMessage.includes("Rate limited") ? 429 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
