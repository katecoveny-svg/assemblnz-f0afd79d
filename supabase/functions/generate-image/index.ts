import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODELS = {
  fast: "google/gemini-2.5-flash-image",
  pro: "google/gemini-3-pro-image-preview",
  flash_pro: "google/gemini-3.1-flash-image-preview",
};

async function attemptImageGeneration(apiKey: string, imagePrompt: string, model: string): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: imagePrompt,
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Gateway error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("Rate limited — please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted — please top up in workspace settings.");
    }
    throw new Error(`Image generation failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  console.log("Model used:", model, "| Choices:", data.choices?.length);

  return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt, platform, contentType, topic, agentContext, quality, brandContext } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Select model based on quality tier
    const selectedModel = quality === "pro" ? MODELS.pro
      : quality === "flash_pro" ? MODELS.flash_pro
      : MODELS.fast;

    // Build brand section
    const brandSection = brandContext
      ? `Brand guidelines: Business "${brandContext.business_name || ""}". Tone: ${brandContext.tone || "professional"}. Industry: ${brandContext.industry || "technology"}. Audience: ${brandContext.audience || "business professionals"}. Use brand-consistent colours and styling.`
      : "";

    const imagePrompt = `Generate a high-quality, professional image.
Platform: ${platform?.replace(/_/g, " ") || "marketing material"}.
Content type: ${contentType?.replace(/_/g, " ") || "visual asset"}.
${topic ? `Topic: ${topic}.` : ""}
${brandSection}
${agentContext || ""}
Style: Premium, polished, commercial-grade. Use sophisticated colour palettes, clean composition, and professional typography where needed. The image should look like it was created by a professional design agency.
Visual direction: ${prompt}
IMPORTANT: Generate an actual high-resolution image, not text. Any text in the image must be crisp and legible.`;

    // Try up to 3 times, falling back to flash_pro then fast
    let imageUrl: string | null = null;
    const fallbackModels = [selectedModel];
    if (selectedModel === MODELS.pro) fallbackModels.push(MODELS.flash_pro, MODELS.fast);
    else if (selectedModel === MODELS.flash_pro) fallbackModels.push(MODELS.fast);

    for (const model of fallbackModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        console.log(`Image generation: model=${model}, attempt=${attempt + 1}`);
        try {
          imageUrl = await attemptImageGeneration(LOVABLE_API_KEY, imagePrompt, model);
          if (imageUrl) break;
        } catch (e) {
          console.error(`Attempt failed:`, e);
          if ((e as Error).message.includes("Rate limited") || (e as Error).message.includes("credits exhausted")) throw e;
        }
        if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
      }
      if (imageUrl) break;
      console.log(`Falling back from ${model}...`);
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "The AI model did not return an image. Please try again with a simpler prompt." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl, model: selectedModel }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
