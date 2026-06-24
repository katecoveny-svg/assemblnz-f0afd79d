import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Step 1: Use Gemini Vision to analyze an architectural plan image
 * Step 2: Use Meshy API to generate a 3D model from the description
 */

async function analyzeFloorPlan(apiKey: string, imageBase64: string): Promise<string> {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-pro",
      messages: [
        {
          role: "system",
          content: `You are an architectural analysis AI. Analyze the floor plan image and output a detailed 3D modeling prompt.
Include: building type, number of floors, room layout, approximate dimensions, roof style, material palette, window placement, any notable architectural features.
Output ONLY a single paragraph prompt suitable for a text-to-3D model generator. Be specific about geometry and proportions. Do not add any preamble.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this architectural floor plan and generate a 3D modeling prompt:" },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Vision analysis error:", response.status, err);
    throw new Error(`Floor plan analysis failed [${response.status}]`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "A modern residential building with clean lines";
}

async function generateMeshy3D(meshyKey: string, prompt: string): Promise<{ taskId: string; status: string }> {
  const response = await fetch("https://api.meshy.ai/openapi/v2/text-to-3d", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${meshyKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "preview",
      prompt: `Architectural 3D model: ${prompt}`,
      art_style: "realistic",
      should_remesh: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Meshy error:", response.status, err);
    throw new Error(`3D generation failed [${response.status}]: ${err}`);
  }

  const data = await response.json();
  return { taskId: data.result, status: "pending" };
}

async function checkMeshyStatus(meshyKey: string, taskId: string) {
  const response = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
    headers: { Authorization: `Bearer ${meshyKey}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Status check failed [${response.status}]: ${err}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
    const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!MESHY_API_KEY) throw new Error("MESHY_API_KEY is not configured");

    const { action, imageBase64, prompt, taskId } = await req.json();

    // Action: check — poll Meshy task status
    if (action === "check" && taskId) {
      const status = await checkMeshyStatus(MESHY_API_KEY, taskId);
      return new Response(JSON.stringify(status), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: generate — either from image or direct prompt
    let modelPrompt = prompt || "";

    if (imageBase64) {
      console.log("Analyzing floor plan with Gemini Vision...");
      modelPrompt = await analyzeFloorPlan(LOVABLE_API_KEY, imageBase64);
      console.log("Vision analysis complete:", modelPrompt.substring(0, 100));
    }

    if (!modelPrompt) {
      return new Response(JSON.stringify({ error: "Provide imageBase64 or prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating 3D model with Meshy...");
    const result = await generateMeshy3D(MESHY_API_KEY, modelPrompt);

    return new Response(
      JSON.stringify({ ...result, analysisPrompt: modelPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("plan-to-3d error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
