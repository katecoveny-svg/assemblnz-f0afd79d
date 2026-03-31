import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * BIM Analysis Edge Function
 * Uses Gemini Vision to analyse BIM models / architectural plans for:
 *  - Geometry & material analysis
 *  - Clash detection between trades (structural vs MEP etc.)
 *  - 4D schedule sequencing (construction phases over time)
 *
 * Actions:
 *  - "analyze"   → Gemini Vision analyses uploaded image/plan
 *  - "clash"     → Clash detection report from plan images
 *  - "schedule"  → 4D construction sequencing from plan + programme
 *  - "generate"  → Meshy 3D model generation from analysis
 *  - "status"    → Poll Meshy task status
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callGemini(apiKey: string, systemPrompt: string, userContent: any[]): Promise<string> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMITED");
    if (res.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`Gemini error [${res.status}]: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

const BIM_ANALYSIS_PROMPT = `You are ATA (ASM-010), Assembl's BIM & Design Coordination specialist for New Zealand construction.
You analyse architectural plans, BIM screenshots, and construction drawings with expert knowledge of:
- NZ Building Code (clauses B1, E2, H1)
- NZS 3604 (Timber-framed buildings)
- Health and Safety at Work Act 2015
- Building Act 2004

When analysing an uploaded image, provide:
1. **Building Overview** — type, stories, approximate area, structural system
2. **Materials Detected** — cladding, framing, roofing, glazing
3. **NZ Code Observations** — any visible compliance considerations (E2 weathertightness, B1 structure, H1 energy)
4. **Coordination Notes** — potential MEP/structural clashes visible
5. **BIM LOD Assessment** — estimated Level of Development if it's a BIM screenshot
6. **Recommendations** — next steps for detailed BIM modelling

Format as structured markdown with headers. Be specific to NZ standards.`;

const CLASH_DETECTION_PROMPT = `You are ATA (ASM-010), Assembl's clash detection specialist. Analyse the uploaded construction drawing(s) or BIM screenshot(s) and produce a structured clash detection report.

For each potential clash found:
- **Clash ID** — sequential (CL-001, CL-002, etc.)
- **Type** — Hard clash / Soft clash / Clearance violation
- **Disciplines** — Which trades conflict (e.g., Structural vs Mechanical, Plumbing vs Electrical)
- **Location** — Grid reference or spatial description
- **Severity** — Critical / Major / Minor
- **NZ Code Reference** — Relevant Building Code clause if applicable
- **Resolution** — Recommended fix with trade priority

End with a summary table and priority actions. Reference NZS 3101 (concrete), NZS 3404 (steel), NZS 3604 (timber), AS/NZS 3500 (plumbing) where relevant.`;

const SCHEDULE_4D_PROMPT = `You are ATA (ASM-010), Assembl's 4D construction scheduling specialist.
From the uploaded plan/BIM image, generate a phased construction sequence following NZ construction practices:

1. **Phase 1: Site Establishment** — enabling works, temporary facilities, health & safety setup
2. **Phase 2: Foundations** — excavation, piling, concrete pours (NZS 3101)
3. **Phase 3: Structure** — framing, steelwork, floor systems
4. **Phase 4: Envelope** — cladding (E2 compliance), roofing, glazing, weathertightness
5. **Phase 5: Services Rough-In** — plumbing, electrical, HVAC, fire protection
6. **Phase 6: Linings & Fit-Out** — GIB, joinery, tiling, painting
7. **Phase 7: Services Completion** — fixtures, commissioning, testing
8. **Phase 8: External Works** — landscaping, paving, drainage
9. **Phase 9: Completion** — practical completion, snagging, CCC preparation

For each phase provide:
- Estimated duration (in weeks)
- Key dependencies and critical path items
- Required inspections (Building Consent Authority)
- H&S considerations per phase
- Key materials and lead times (NZ supply chain)

Format as a timeline with visual markers. Include Gantt-style notation.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { action, imageBase64, prompt, taskId, agentContext } = body;

    // ── Status polling for Meshy 3D generation ──
    if (action === "status" && taskId) {
      const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");
      if (!MESHY_API_KEY) throw new Error("MESHY_API_KEY is not configured");

      const res = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Meshy status error [${res.status}]: ${err}`);
      }
      const data = await res.json();
      return new Response(JSON.stringify({
        status: data.status,
        progress: data.progress ?? 0,
        modelUrls: data.model_urls,
        thumbnailUrl: data.thumbnail_url,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── BIM Analysis ──
    if (action === "analyze") {
      if (!imageBase64) throw new Error("imageBase64 is required for analysis");

      const contextNote = agentContext
        ? `\n\nAdditional context from the ${agentContext} agent: Focus analysis on aspects relevant to ${agentContext}'s domain.`
        : "";

      const result = await callGemini(
        LOVABLE_API_KEY,
        BIM_ANALYSIS_PROMPT + contextNote,
        [
          { type: "text", text: prompt || "Analyse this architectural plan / BIM model:" },
          { type: "image_url", image_url: { url: imageBase64 } },
        ]
      );

      return new Response(JSON.stringify({ analysis: result, action: "analyze" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Clash Detection ──
    if (action === "clash") {
      if (!imageBase64) throw new Error("imageBase64 is required for clash detection");

      const result = await callGemini(
        LOVABLE_API_KEY,
        CLASH_DETECTION_PROMPT,
        [
          { type: "text", text: prompt || "Perform clash detection analysis on this drawing:" },
          { type: "image_url", image_url: { url: imageBase64 } },
        ]
      );

      return new Response(JSON.stringify({ report: result, action: "clash" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 4D Schedule ──
    if (action === "schedule") {
      const userContent: any[] = [
        { type: "text", text: prompt || "Generate a 4D construction schedule from this plan:" },
      ];
      if (imageBase64) {
        userContent.push({ type: "image_url", image_url: { url: imageBase64 } });
      }

      const result = await callGemini(LOVABLE_API_KEY, SCHEDULE_4D_PROMPT, userContent);

      return new Response(JSON.stringify({ schedule: result, action: "schedule" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 3D Model Generation via Meshy ──
    if (action === "generate") {
      const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");
      if (!MESHY_API_KEY) throw new Error("MESHY_API_KEY is not configured");

      let modelPrompt = prompt || "";

      if (imageBase64) {
        modelPrompt = await callGemini(
          LOVABLE_API_KEY,
          `You are an architectural 3D prompt engineer. Analyse the floor plan and output ONLY a single paragraph prompt for a text-to-3D generator. Include building type, floors, roof, materials, style. Under 200 chars. No preamble.`,
          [
            { type: "text", text: "Analyse this plan for 3D generation:" },
            { type: "image_url", image_url: { url: imageBase64 } },
          ]
        );
      }

      if (!modelPrompt) throw new Error("Provide imageBase64 or prompt for generation");

      const meshyRes = await fetch("https://api.meshy.ai/openapi/v2/text-to-3d", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MESHY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "preview",
          prompt: `Architectural 3D model: ${modelPrompt}`,
          art_style: "realistic",
          should_remesh: true,
          topology: "quad",
          target_polycount: 30000,
        }),
      });

      if (!meshyRes.ok) {
        const err = await meshyRes.text();
        throw new Error(`Meshy error [${meshyRes.status}]: ${err}`);
      }

      const meshyData = await meshyRes.json();
      return new Response(JSON.stringify({
        taskId: meshyData.result,
        status: "PENDING",
        analysisPrompt: modelPrompt,
        action: "generate",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: analyze, clash, schedule, generate, status" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("bim-analysis error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";

    if (msg === "RATE_LIMITED") {
      return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (msg === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted — please top up in Settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
