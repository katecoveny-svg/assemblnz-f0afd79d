import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Intent classification keywords per agent
const AGENT_KEYWORDS: Record<string, string[]> = {
  arai: ["hazard", "safety", "h&s", "risk", "ppe", "incident", "worksafe", "swms", "sssp", "toolbox", "height", "scaffold", "fall", "morearea"],
  kaupapa: ["payment", "claim", "project", "schedule", "variation", "cca", "gantt", "milestone", "budget", "programme", "delay", "progress"],
  ata: ["bim", "3d", "model", "clash", "revit", "ifc", "mep", "coordination", "digital twin"],
  kahu: ["contract", "retention", "dispute", "adjudication", "subcontract", "nzs 3910", "terms"],
  rawa: ["resource", "workforce", "equipment", "material", "labour", "lbp", "procurement", "supply"],
  pai: ["quality", "inspection", "defect", "ncr", "punch list", "snag", "producer statement", "itp"],
  whakaae: ["consent", "building consent", "ccc", "council", "inspection", "code compliance", "bca", "resource consent"],
};

function classifyAgent(message: string, explicitAgent?: string): string {
  if (explicitAgent) return explicitAgent;
  const lc = message.toLowerCase();
  let bestAgent = "iho";
  let bestScore = 0;
  for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lc.includes(kw)) score += kw.length > 5 ? 2 : 1;
    }
    if (score > bestScore) { bestScore = score; bestAgent = agent; }
  }
  return bestAgent;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, packId = "hanga", agentId, messages = [] } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Classify which agent should handle this
    const selectedAgent = classifyAgent(message, agentId);

    // Load agent prompt from DB
    const { data: agentPrompt } = await supabase
      .from("agent_prompts")
      .select("*")
      .eq("agent_name", selectedAgent)
      .eq("is_active", true)
      .single();

    // Load shared prompts (privacy, tikanga)
    const { data: sharedPrompts } = await supabase
      .from("agent_prompts")
      .select("system_prompt")
      .eq("pack", "shared")
      .eq("is_active", true)
      .in("agent_name", ["privacy", "tikanga"]);

    // Build system prompt
    const basePrompt = agentPrompt?.system_prompt ||
      `You are IHO, Assembl's construction intelligence assistant. Help with NZ construction queries. Reference relevant NZ legislation.`;

    const complianceRules = (sharedPrompts || []).map(p => p.system_prompt).join("\n\n");

    const systemPrompt = `${basePrompt}\n\n--- COMPLIANCE RULES ---\n${complianceRules}\n\nAlways respond in a helpful, professional tone. Use markdown formatting. Reference NZ legislation where applicable.`;

    // Build conversation
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role, content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Stream from Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: conversationMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI error: ${status}`);
    }

    // Return SSE stream with agent metadata header
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("X-Agent-Name", agentPrompt?.display_name || "IHO Brain");
    headers.set("X-Agent-Code", selectedAgent);
    headers.set("X-Agent-Icon", agentPrompt?.icon || "Brain");
    // Expose custom headers to browser
    headers.set("Access-Control-Expose-Headers", "X-Agent-Name, X-Agent-Code, X-Agent-Icon");

    return new Response(response.body, { headers });
  } catch (e) {
    console.error("agent-router error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
