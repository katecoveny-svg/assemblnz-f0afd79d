import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODELS = {
  fast: "google/gemini-2.5-flash-image",
  pro: "google/gemini-3-pro-image-preview",
  flash_pro: "google/gemini-3.1-flash-image-preview",
};

const ASSEMBL_BRAND = {
  name: "Assembl",
  tagline: "The Operating System for NZ Business",
  background: "#0A0A14",
  accents: ["#00FF88", "#00E5FF", "#FF2D9B"],
  text: "#FAFAFA",
  typography: "General Sans for display, Inter for body, JetBrains Mono for code/details",
};

function buildBrandedPrompt({
  prompt,
  platform,
  contentType,
  topic,
  agentContext,
  brandContext,
}: {
  prompt: string;
  platform?: string;
  contentType?: string;
  topic?: string;
  agentContext?: string;
  brandContext?: {
    business_name?: string;
    tone?: string;
    industry?: string;
    audience?: string;
  };
}) {
  const businessName = brandContext?.business_name || ASSEMBL_BRAND.name;
  const tone = brandContext?.tone || "confident, warm, direct, authentically Kiwi";
  const industry = brandContext?.industry || "New Zealand business technology";
  const audience = brandContext?.audience || "NZ business owners, operators, and founders";

  return [
    `Create a premium commercial marketing image for ${businessName}.`,
    `Brand tagline: ${ASSEMBL_BRAND.tagline}.`,
    `Industry: ${industry}. Audience: ${audience}. Tone: ${tone}.`,
    `Use a dark-first canvas (${ASSEMBL_BRAND.background}) with controlled accents of ${ASSEMBL_BRAND.accents.join(", ")} and text colour ${ASSEMBL_BRAND.text}.`,
    `Typography reference: ${ASSEMBL_BRAND.typography}. If text appears in-image, keep it minimal, crisp, and fully legible.`,
    platform ? `Platform: ${platform.replace(/_/g, " ")}.` : null,
    contentType ? `Content type: ${contentType.replace(/_/g, " ")}.` : null,
    topic ? `Topic: ${topic}.` : null,
    agentContext ? `Context: ${agentContext}` : null,
    `Creative direction: ${prompt}`,
    "The output must feel agency-grade, bold, minimal, polished, and unmistakably Assembl-branded.",
    "Avoid generic stock imagery, washed-out colours, weak contrast, clutter, and unreadable text.",
    "Generate an actual high-resolution image, not a text response.",
  ].filter(Boolean).join(" ");
}

function createFallbackDesign({
  prompt,
  platform,
  contentType,
  topic,
}: {
  prompt: string;
  platform?: string;
  contentType?: string;
  topic?: string;
}) {
  return {
    headline: topic || ASSEMBL_BRAND.tagline,
    platform: platform || "marketing material",
    contentType: contentType || "visual asset",
    palette: [ASSEMBL_BRAND.background, ...ASSEMBL_BRAND.accents, ASSEMBL_BRAND.text],
    typography: ASSEMBL_BRAND.typography,
    layout: "Dark near-black background, strong left-aligned headline, neon accent lines, one hero visual zone, premium glassmorphism card treatment, compact Assembl branding.",
    productionNotes: prompt,
  };
}

async function attemptImageGeneration(apiKey: string, imagePrompt: string, model: string): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: imagePrompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Gateway error:", response.status, errorText);
    if (response.status === 429) throw new Error("Rate limited — please try again in a moment.");
    if (response.status === 402) throw new Error("AI credits exhausted — please top up in workspace settings.");
    throw new Error(`Image generation failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const _userId = user.id;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt, platform, contentType, topic, agentContext, quality, brandContext } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const selectedModel = quality === "pro" ? MODELS.pro
      : quality === "flash_pro" ? MODELS.flash_pro
      : MODELS.fast;

    const imagePrompt = buildBrandedPrompt({
      prompt,
      platform,
      contentType,
      topic,
      agentContext,
      brandContext,
    });

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
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: "The AI model did not return an image. A branded fallback design brief has been generated instead.",
          fallbackDesign: createFallbackDesign({ prompt: imagePrompt, platform, contentType, topic }),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl, model: selectedModel, prompt: imagePrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: errorMessage,
        fallbackDesign: createFallbackDesign({ prompt: "Assembl-branded premium social creative", platform: "marketing_material", contentType: "visual_asset" }),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
