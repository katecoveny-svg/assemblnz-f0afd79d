import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════
// PROVIDER 1: Gemini (Lovable AI Gateway)
// Best for: fast drafts, brand assets, social media graphics
// ═══════════════════════════════════════════════════

const GEMINI_MODELS = [
  "google/gemini-3-pro-image-preview",
  "google/gemini-3.1-flash-image-preview",
  "google/gemini-2.5-flash-image",
];

async function generateGemini(apiKey: string, prompt: string): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini] model=${model}, attempt=${attempt + 1}`);
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) throw new Error("Rate limited — try again shortly.");
          if (response.status === 402) throw new Error("AI credits exhausted.");
          console.error(`[Gemini] error [${response.status}]:`, errorText);
          continue;
        }

        const data = await response.json();
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes("Rate limited") || msg.includes("credits exhausted")) throw e;
        console.error(`[Gemini] attempt failed:`, e);
      }
      if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════
// PROVIDER 2: Ideogram API
// Best for: text-in-image, stylised graphics, typography-heavy visuals
// ═══════════════════════════════════════════════════

const IDEOGRAM_ASPECT_MAP: Record<string, string> = {
  "1:1": "ASPECT_1_1",
  "16:9": "ASPECT_16_9",
  "9:16": "ASPECT_9_16",
  "4:3": "ASPECT_4_3",
  "3:4": "ASPECT_3_4",
  "3:2": "ASPECT_3_2",
  "2:3": "ASPECT_2_3",
};

async function generateIdeogram(apiKey: string, prompt: string, aspectRatio?: string, style?: string): Promise<string | null> {
  try {
    console.log(`[Ideogram] generating...`);
    const ideogramStyle = style?.toLowerCase().includes("photographic") ? "REALISTIC" : "AUTO";

    const response = await fetch("https://api.ideogram.ai/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_request: {
          prompt,
          aspect_ratio: IDEOGRAM_ASPECT_MAP[aspectRatio || "1:1"] || "ASPECT_1_1",
          model: "V_2A",
          style_type: ideogramStyle,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) throw new Error("Rate limited — try again shortly.");
      if (response.status === 402 || response.status === 403) throw new Error("Ideogram credits exhausted or invalid key.");
      console.error(`[Ideogram] error [${response.status}]:`, errorText);
      return null;
    }

    const data = await response.json();
    const url = data.data?.[0]?.url;
    if (url) return url;
    console.error("[Ideogram] no URL in response:", JSON.stringify(data).substring(0, 200));
    return null;
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Rate limited") || msg.includes("credits exhausted") || msg.includes("invalid key")) throw e;
    console.error("[Ideogram] failed:", e);
    return null;
  }
}

// ═══════════════════════════════════════════════════
// PROVIDER 3: Railway GPU Worker (Flux/ComfyUI)
// Best for: photorealistic renders, complex compositions, batch generation
// ═══════════════════════════════════════════════════

async function generateRailway(baseUrl: string, apiKey: string, prompt: string, aspectRatio?: string): Promise<string | null> {
  try {
    console.log(`[Railway] generating via ${baseUrl}...`);
    const response = await fetch(`${baseUrl}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: aspectRatio || "1:1",
        num_steps: 30,
        guidance_scale: 7.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Railway] error [${response.status}]:`, errorText);
      return null;
    }

    const data = await response.json();
    // Supports both { url: "..." } and { image: "base64..." } responses
    if (data.url) return data.url;
    if (data.image) return `data:image/png;base64,${data.image}`;
    console.error("[Railway] no image in response");
    return null;
  } catch (e) {
    console.error("[Railway] failed:", e);
    return null;
  }
}

// ═══════════════════════════════════════════════════
// INTELLIGENT ROUTER — picks the best provider per task
// ═══════════════════════════════════════════════════

type Provider = "gemini" | "ideogram" | "railway";

function selectProvider(prompt: string, style?: string, preferredProvider?: Provider): { primary: Provider; fallback: Provider } {
  // Explicit user override
  if (preferredProvider) {
    const fallbacks: Record<Provider, Provider> = { gemini: "ideogram", ideogram: "gemini", railway: "gemini" };
    return { primary: preferredProvider, fallback: fallbacks[preferredProvider] };
  }

  const lowerPrompt = (prompt + " " + (style || "")).toLowerCase();

  // Text-in-image → Ideogram excels at typography
  if (
    lowerPrompt.includes("text overlay") ||
    lowerPrompt.includes("typography") ||
    lowerPrompt.includes("headline") ||
    lowerPrompt.includes("logo with text") ||
    lowerPrompt.includes("poster") ||
    lowerPrompt.includes("quote")
  ) {
    return { primary: "ideogram", fallback: "gemini" };
  }

  // Photorealistic / complex renders → Railway GPU
  if (
    lowerPrompt.includes("photorealistic") ||
    lowerPrompt.includes("photo-realistic") ||
    lowerPrompt.includes("hyperrealistic") ||
    lowerPrompt.includes("3d render") ||
    lowerPrompt.includes("cinematic") ||
    lowerPrompt.includes("photographic")
  ) {
    return { primary: "railway", fallback: "ideogram" };
  }

  // Default → Gemini (fast, reliable, good for brand assets)
  return { primary: "gemini", fallback: "ideogram" };
}

function isProviderAvailable(provider: Provider): boolean {
  switch (provider) {
    case "gemini": return !!Deno.env.get("LOVABLE_API_KEY");
    case "ideogram": return !!Deno.env.get("IDEOGRAM_API_KEY");
    case "railway": return !!Deno.env.get("RAILWAY_GPU_URL") && !!Deno.env.get("RAILWAY_GPU_KEY");
    default: return false;
  }
}

async function generateWithProvider(provider: Provider, prompt: string, aspectRatio?: string, style?: string): Promise<string | null> {
  switch (provider) {
    case "gemini":
      return generateGemini(Deno.env.get("LOVABLE_API_KEY")!, prompt);
    case "ideogram":
      return generateIdeogram(Deno.env.get("IDEOGRAM_API_KEY")!, prompt, aspectRatio, style);
    case "railway":
      return generateRailway(Deno.env.get("RAILWAY_GPU_URL")!, Deno.env.get("RAILWAY_GPU_KEY")!, prompt, aspectRatio);
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt, style, aspectRatio, provider: preferredProvider } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const enhancedPrompt = `Create a professional, high-quality marketing visual: ${prompt}. Style: ${style || "modern, premium, commercial-grade"}. The design should look agency-produced with sophisticated colour palettes, clean composition, and crisp typography. Aspect ratio: ${aspectRatio || "1:1"}.`;

    // Route to best provider
    const { primary, fallback } = selectProvider(prompt, style, preferredProvider);
    console.log(`[Router] primary=${primary}, fallback=${fallback}, ideogram=${isProviderAvailable("ideogram")}, railway=${isProviderAvailable("railway")}`);

    let imageUrl: string | null = null;
    let source = primary;

    // Try primary
    if (isProviderAvailable(primary)) {
      imageUrl = await generateWithProvider(primary, enhancedPrompt, aspectRatio, style);
    }

    // Fallback
    if (!imageUrl && isProviderAvailable(fallback)) {
      console.log(`[Router] falling back to ${fallback}`);
      source = fallback;
      imageUrl = await generateWithProvider(fallback, enhancedPrompt, aspectRatio, style);
    }

    // Last resort: always try Gemini
    if (!imageUrl && source !== "gemini" && isProviderAvailable("gemini")) {
      console.log(`[Router] last resort: gemini`);
      source = "gemini";
      imageUrl = await generateGemini(LOVABLE_API_KEY, enhancedPrompt);
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image generation failed across all providers. Please try again with a different prompt." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        source,
        availableProviders: {
          gemini: isProviderAvailable("gemini"),
          ideogram: isProviderAvailable("ideogram"),
          railway: isProviderAvailable("railway"),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("stitch-generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("Rate limited") ? 429
      : errorMessage.includes("credits exhausted") || errorMessage.includes("invalid key") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
