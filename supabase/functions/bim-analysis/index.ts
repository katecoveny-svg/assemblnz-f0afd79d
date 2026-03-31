import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

/* ── Gemini helper ── */
async function callGemini(apiKey: string, systemPrompt: string, userContent: any[], model = "google/gemini-2.5-pro"): Promise<string> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
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

/* ── System prompts ── */

const BIM_ANALYSIS_PROMPT = `You are ATA (ASM-010), Assembl's BIM & Design Coordination specialist for Aotearoa New Zealand construction.
You analyse architectural plans, BIM screenshots, IFC exports, and construction drawings with expert knowledge of:
- NZ Building Code (B1 Structure, B2 Durability, E2 External Moisture, F2 Hazardous substances, H1 Energy Efficiency)
- NZS 3604:2011 (Timber-framed buildings)
- NZS 3101:2006 (Concrete structures)
- NZS 3404:1997 (Steel structures)
- Health and Safety at Work Act 2015
- Building Act 2004

When analysing an uploaded image, provide a comprehensive structured report:

1. **Building Overview** — type (residential/commercial/industrial), stories, approximate GFA, structural system, foundation type
2. **BIM Elements Detected** — walls, floors, roof, columns, beams, openings, stairs, services visible
3. **Materials Analysis** — cladding system, framing (timber/steel/concrete), roofing material, glazing type, insulation visible
4. **NZ Code Observations**
   - E2 weathertightness risk assessment
   - B1 structural adequacy indicators
   - H1 energy efficiency considerations
   - Fire rating requirements (C/AS1–C/AS7)
5. **Coordination Notes** — potential MEP/structural clashes, services routing issues, buildability concerns
6. **BIM LOD Assessment** — estimated Level of Development (100–500) with justification
7. **Estimated Parameters** — approximate total area (m²), estimated construction cost range (NZD), build duration
8. **Recommendations** — next steps for detailed BIM modelling, priority areas for coordination

Format as structured markdown with clear headers. Be specific to NZ standards and reference clause numbers.`;

const CLASH_DETECTION_PROMPT = `You are ATA (ASM-010), Assembl's clash detection specialist for NZ construction projects.
Analyse uploaded construction drawings or BIM screenshots and produce a structured clash detection report.

For each potential clash found:
- **Clash ID** — sequential (CL-001, CL-002, etc.)
- **Type** — Hard clash / Soft clash / Clearance violation / 4D temporal clash
- **Disciplines** — Which trades conflict (Structural/Mechanical/Electrical/Plumbing/Fire/Hydraulic)
- **Location** — Grid reference, level, zone, or spatial description
- **Severity** — Critical (stop work) / Major (redesign needed) / Minor (field fix)
- **NZ Code Reference** — Relevant Building Code clause (B1, E2, G12, G13, etc.)
- **Resolution** — Recommended fix with trade priority and who should move
- **Cost Impact** — Estimated additional cost if unresolved (NZD range)

End with:
1. **Summary Table** — All clashes in tabular format
2. **Priority Matrix** — Critical path items requiring immediate resolution
3. **Trade Coordination Recommendations** — Meeting agenda items for next coordination session

Reference NZS 3101 (concrete), NZS 3404 (steel), NZS 3604 (timber), AS/NZS 3500 (plumbing), AS/NZS 3000 (electrical) where relevant.`;

const SCHEDULE_4D_PROMPT = `You are ATA (ASM-010), Assembl's 4D construction scheduling specialist for NZ projects.
From the uploaded plan/BIM image, generate a detailed phased construction sequence following NZ construction practices:

1. **Phase 1: Site Establishment** — enabling works, temporary facilities, H&S setup, site compound, environmental controls
2. **Phase 2: Foundations** — excavation, geotechnical, piling/ground improvement, concrete pours (NZS 3101), waterproofing
3. **Phase 3: Structure** — framing (NZS 3604 timber / NZS 3404 steel), floor systems, shear walls, bracing
4. **Phase 4: Envelope** — cladding (E2 compliance), roofing, glazing, flashings, weathertightness testing
5. **Phase 5: Services Rough-In** — plumbing (AS/NZS 3500), electrical (AS/NZS 3000), HVAC, fire protection (C/AS)
6. **Phase 6: Linings & Fit-Out** — GIB lining, joinery, tiling, painting, cabinetry
7. **Phase 7: Services Completion** — fixtures, commissioning, testing, balancing
8. **Phase 8: External Works** — landscaping, paving, stormwater (E1), fencing, driveways
9. **Phase 9: Completion** — practical completion, snagging, CCC preparation, defects liability period

For each phase provide:
- **Duration** (weeks) with logic
- **Key Dependencies** & critical path items
- **BCA Inspections Required** (pre-line, post-line, drainage, final)
- **H&S Considerations** per phase (PCBU duties)
- **Key Materials** & NZ supply chain lead times
- **Weather Windows** — seasonal considerations for NZ climate
- **Hold Points** — mandatory inspection/approval gates

Format as a detailed timeline. Include estimated total project duration and critical path summary.`;

const MODEL_PROMPT_PROMPT = `You are an architectural 3D prompt engineer specialising in NZ building typologies.
Analyse the floor plan and output ONLY a single paragraph prompt for a text-to-3D model generator.
Include: building type, number of floors, roof form, primary materials, architectural style, NZ context.
Must be under 200 characters. No preamble, no explanation — just the prompt.`;

/* ── Auth helper ── */
async function authenticate(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

/* ── Main handler ── */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const user = await authenticate(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { action, imageBase64, prompt, taskId, agentContext } = body;

    /* ── Status polling for Meshy 3D generation ── */
    if (action === "status" && taskId) {
      const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");
      if (!MESHY_API_KEY) throw new Error("MESHY_API_KEY is not configured");

      const res = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
      });
      if (!res.ok) throw new Error(`Meshy status error [${res.status}]: ${await res.text()}`);
      const data = await res.json();
      return new Response(JSON.stringify({
        status: data.status,
        progress: data.progress ?? 0,
        modelUrls: data.model_urls,
        thumbnailUrl: data.thumbnail_url,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    /* ── BIM Analysis ── */
    if (action === "analyze") {
      if (!imageBase64) throw new Error("imageBase64 is required for analysis");
      const contextNote = agentContext
        ? `\n\nContext: This analysis is being run by the ${agentContext} agent. Focus on aspects relevant to their domain.`
        : "";
      const result = await callGemini(LOVABLE_API_KEY, BIM_ANALYSIS_PROMPT + contextNote, [
        { type: "text", text: prompt || "Analyse this architectural plan / BIM model:" },
        { type: "image_url", image_url: { url: imageBase64 } },
      ]);
      return new Response(JSON.stringify({ analysis: result, action: "analyze" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* ── Clash Detection ── */
    if (action === "clash") {
      if (!imageBase64) throw new Error("imageBase64 is required for clash detection");
      const result = await callGemini(LOVABLE_API_KEY, CLASH_DETECTION_PROMPT, [
        { type: "text", text: prompt || "Perform clash detection analysis on this drawing:" },
        { type: "image_url", image_url: { url: imageBase64 } },
      ]);
      return new Response(JSON.stringify({ report: result, action: "clash" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* ── 4D Schedule ── */
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

    /* ── 3D Model Generation via Meshy ── */
    if (action === "generate") {
      const MESHY_API_KEY = Deno.env.get("MESHY_API_KEY");
      if (!MESHY_API_KEY) throw new Error("MESHY_API_KEY is not configured");

      let modelPrompt = prompt || "";
      if (imageBase64) {
        modelPrompt = await callGemini(LOVABLE_API_KEY, MODEL_PROMPT_PROMPT, [
          { type: "text", text: "Analyse this plan for 3D generation:" },
          { type: "image_url", image_url: { url: imageBase64 } },
        ], "google/gemini-2.5-flash");
      }
      if (!modelPrompt) throw new Error("Provide imageBase64 or prompt for generation");

      const meshyRes = await fetch("https://api.meshy.ai/openapi/v2/text-to-3d", {
        method: "POST",
        headers: { Authorization: `Bearer ${MESHY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "preview",
          prompt: `Architectural 3D model: ${modelPrompt}`,
          art_style: "realistic",
          should_remesh: true,
          topology: "quad",
          target_polycount: 30000,
        }),
      });
      if (!meshyRes.ok) throw new Error(`Meshy error [${meshyRes.status}]: ${await meshyRes.text()}`);

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
