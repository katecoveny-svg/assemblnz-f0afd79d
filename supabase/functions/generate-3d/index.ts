import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

async function createTextTo3DTask(prompt: string, apiKey: string): Promise<string> {
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
    throw new Error(`Meshy text-to-3d error [${res.status}]: ${err}`);
  }
  const data = await res.json();
  return data.result;
}

async function createImageTo3DTask(imageUrl: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      should_remesh: true,
      topology: "quad",
      target_polycount: 30000,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy image-to-3d error [${res.status}]: ${err}`);
  }
  const data = await res.json();
  return data.result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require authentication
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
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const taskIdParam = url.searchParams.get("taskId");
  const endpointType = url.searchParams.get("type") || "text-to-3d";

  // Status polling mode
  if (taskIdParam && req.method === "GET") {
    const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");
    if (!MESHY_API_KEY) {
      return new Response(JSON.stringify({ error: "MESHY_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    try {
      const pollEndpoint = endpointType === "image-to-3d" ? "image-to-3d" : "text-to-3d";
      const apiVersion = pollEndpoint === "image-to-3d" ? "v1" : "v2";
      const res = await fetch(`https://api.meshy.ai/openapi/${apiVersion}/${pollEndpoint}/${taskIdParam}`, {
        headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
      });
      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: err }), {
          status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const body = await req.json();
    const { userPrompt, imageUrl } = body;

    if (!userPrompt && !imageUrl) {
      return new Response(JSON.stringify({ error: "userPrompt or imageUrl is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let taskId: string;
    let optimizedPrompt = "";
    let pollEndpoint: "text-to-3d" | "image-to-3d";

    if (imageUrl) {
      taskId = await createImageTo3DTask(imageUrl, MESHY_API_KEY);
      optimizedPrompt = "Generated from uploaded image";
      pollEndpoint = "image-to-3d";
    } else {
      if (!ANTHROPIC_API_KEY) {
        return new Response(
          JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      optimizedPrompt = await optimizePrompt(userPrompt!, ANTHROPIC_API_KEY);
      taskId = await createTextTo3DTask(optimizedPrompt, MESHY_API_KEY);
      pollEndpoint = "text-to-3d";
    }

    return new Response(
      JSON.stringify({
        taskId,
        status: "PENDING",
        prompt: optimizedPrompt,
        type: pollEndpoint,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-3d error:", error);
    const message =
      String(error).includes("failed")
        ? "Model generation failed. Try simplifying your description or trying again."
        : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
