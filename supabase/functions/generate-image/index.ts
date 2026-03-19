import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt, platform, contentType, topic, agentContext } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine dimensions based on platform
    let width = 1080;
    let height = 1080;
    if (platform === "instagram_story" || platform === "tiktok_caption") {
      width = 1080;
      height = 1920;
    } else if (platform === "linkedin_post" || platform === "facebook_post") {
      width = 1200;
      height = 628;
    }

    // Build the image generation prompt
    const imagePrompt = `Create a professional, eye-catching social media graphic for ${platform?.replace(/_/g, " ") || "social media"}. 
Content type: ${contentType?.replace(/_/g, " ") || "general"}.
${topic ? `Topic: ${topic}.` : ""}
${agentContext || ""}
Style: Modern, clean, professional with bold typography. Use vibrant colours on a dark or branded background. 
The image should be scroll-stopping and suitable for a NZ business audience.
Specific request: ${prompt}
IMPORTANT: Make text legible and prominent. Include a subtle "assembl.co.nz" watermark in the bottom corner.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
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
      throw new Error(`Image generation failed [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || "";

    if (!imageUrl) {
      throw new Error("No image was generated");
    }

    return new Response(
      JSON.stringify({ imageUrl, description }),
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
