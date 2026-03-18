import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function optimizePrompt(userPrompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system:
        "You are a 3D prompt engineer for architectural models. Take the user's building description and output ONLY a detailed, specific prompt optimised for AI 3D model generation. Include: building type, number of stories, roof style, materials, architectural style, surrounding context. Keep it under 200 characters. Do not include any explanation, just the prompt.",
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || userPrompt;
}

async function createMeshyTask(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.meshy.ai/openapi/v2/text-to-3d", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "preview",
      prompt,
      art_style: "realistic",
      should_remesh: true,
      topology: "quad",
      target_polycount: 30000,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy create task error [${res.status}]: ${err}`);
  }
  const data = await res.json();
  return data.result;
}

async function pollMeshyTask(
  taskId: string,
  apiKey: string,
  timeoutMs = 120000
): Promise<{ status: string; progress: number; modelUrls: any; thumbnailUrl: string; prompt: string }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meshy poll error [${res.status}]: ${err}`);
    }
    const data = await res.json();
    if (data.status === "SUCCEEDED") {
      return {
        status: "SUCCEEDED",
        progress: 100,
        modelUrls: data.model_urls,
        thumbnailUrl: data.thumbnail_url,
        prompt: data.prompt,
      };
    }
    if (data.status === "FAILED") {
      throw new Error("Meshy generation failed");
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("TIMEOUT");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");
  // Status polling mode
  if (taskId && req.method === "GET") {
    const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");
    if (!MESHY_API_KEY) {
      return new Response(JSON.stringify({ error: "MESHY_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    try {
      const res = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
      });
      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: err }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await res.json();
      return new Response(
        JSON.stringify({
          status: data.status,
          progress: data.progress ?? 0,
          modelUrls: data.model_urls,
          thumbnailUrl: data.thumbnail_url,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Main generation endpoint
  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");

    if (!MESHY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "3D generation is not configured yet. Add your Meshy API key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userPrompt } = await req.json();
    if (!userPrompt) {
      return new Response(JSON.stringify({ error: "userPrompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Optimize prompt with Claude
    const optimizedPrompt = await optimizePrompt(userPrompt, ANTHROPIC_API_KEY);

    // Step 2: Create Meshy task
    const taskId = await createMeshyTask(optimizedPrompt, MESHY_API_KEY);

    // Step 3: Poll for completion
    try {
      const result = await pollMeshyTask(taskId, MESHY_API_KEY);
      return new Response(
        JSON.stringify({
          taskId,
          status: result.status,
          modelUrls: result.modelUrls,
          thumbnailUrl: result.thumbnailUrl,
          prompt: optimizedPrompt,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (pollErr) {
      const msg = String(pollErr);
      if (msg.includes("TIMEOUT")) {
        // Return taskId so frontend can poll separately
        return new Response(
          JSON.stringify({
            taskId,
            status: "IN_PROGRESS",
            prompt: optimizedPrompt,
            message: "Generation is still in progress. Use the status endpoint to check.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw pollErr;
    }
  } catch (error) {
    console.error("generate-3d error:", error);
    const message =
      String(error).includes("failed")
        ? "Model generation failed. Try simplifying your description or trying again."
        : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
