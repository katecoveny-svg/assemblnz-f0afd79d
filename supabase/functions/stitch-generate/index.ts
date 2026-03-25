import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STITCH_MCP_URL = "https://stitch.googleapis.com/mcp";

/** Call Google Stitch MCP endpoint */
async function callStitchMcp(apiKey: string, method: string, params: Record<string, unknown>) {
  const res = await fetch(STITCH_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tools/call",
      params: { name: method, arguments: params },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Stitch MCP error [${res.status}]:`, errText);
    throw new Error(`Stitch API error [${res.status}]: ${errText}`);
  }

  return await res.json();
}

/** Fallback: use Lovable AI Gateway for image generation */
async function fallbackLovableImage(apiKey: string, prompt: string): Promise<string | null> {
  const models = [
    "google/gemini-3-pro-image-preview",
    "google/gemini-3.1-flash-image-preview",
    "google/gemini-2.5-flash-image",
  ];

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
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
          console.error(`Lovable AI error [${response.status}]:`, errorText);
          continue;
        }

        const data = await response.json();
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes("Rate limited") || msg.includes("credits exhausted")) throw e;
        console.error(`Fallback attempt failed:`, e);
      }
      if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STITCH_API_KEY = Deno.env.get("STITCH_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!STITCH_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("Neither STITCH_API_KEY nor LOVABLE_API_KEY is configured");
    }

    const { prompt, style, aspectRatio } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const enhancedPrompt = `Create a professional, high-quality marketing visual: ${prompt}. Style: ${style || "modern, premium, commercial-grade"}. The design should look agency-produced with sophisticated colour palettes, clean composition, and crisp typography. Aspect ratio: ${aspectRatio || "1:1"}.`;

    let imageUrl: string | null = null;
    let source = "unknown";

    // Try Google Stitch first
    if (STITCH_API_KEY) {
      try {
        console.log("Attempting Google Stitch generation...");

        // Create a temporary project
        const createResult = await callStitchMcp(STITCH_API_KEY, "create_project", {
          name: `prism-${Date.now()}`,
          description: enhancedPrompt,
        });

        const projectId =
          createResult?.result?.content?.[0]?.text?.match(/"id"\s*:\s*"([^"]+)"/)?.[1] ||
          createResult?.result?.project?.id;

        if (projectId) {
          // Generate a screen from the prompt
          const genResult = await callStitchMcp(STITCH_API_KEY, "generate_screen_from_text", {
            project_id: projectId,
            text: enhancedPrompt,
            fidelity: "high",
          });

          // Extract image URL from result
          const screenContent = JSON.stringify(genResult?.result || {});
          const imgMatch = screenContent.match(/https:\/\/[^"'\s]+\.(png|jpg|jpeg|webp|svg)[^"'\s]*/i);
          if (imgMatch) {
            imageUrl = imgMatch[0];
            source = "stitch";
            console.log("Stitch generation successful");
          } else {
            // Try to get the screen image
            const screenId = screenContent.match(/"id"\s*:\s*"([^"]+)"/)?.[1];
            if (screenId) {
              const screenResult = await callStitchMcp(STITCH_API_KEY, "get_screen", {
                project_id: projectId,
                screen_id: screenId,
              });
              const screenImgContent = JSON.stringify(screenResult?.result || {});
              const imgMatch2 = screenImgContent.match(/https:\/\/[^"'\s]+\.(png|jpg|jpeg|webp)[^"'\s]*/i);
              if (imgMatch2) {
                imageUrl = imgMatch2[0];
                source = "stitch";
              }
            }
          }
        }
      } catch (e) {
        console.error("Stitch generation failed, falling back:", e);
      }
    }

    // Fallback to Lovable AI Gateway
    if (!imageUrl && LOVABLE_API_KEY) {
      console.log("Using Lovable AI Gateway for image generation...");
      imageUrl = await fallbackLovableImage(LOVABLE_API_KEY, enhancedPrompt);
      if (imageUrl) source = "lovable-ai";
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image generation failed. Please try again with a different prompt." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl, source }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("stitch-generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
