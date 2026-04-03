import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Model mapping from DB preferences to Lovable AI Gateway models
const MODEL_MAP: Record<string, string> = {
  "gemini-2.5-flash": "google/gemini-2.5-flash",
  "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",
  "gemini-2.5-pro": "google/gemini-2.5-pro",
};

// Intent classification keywords per agent
const AGENT_KEYWORDS: Record<string, string[]> = {
  arai: ["hazard", "safety", "h&s", "risk", "ppe", "incident", "worksafe", "swms", "sssp", "toolbox", "height", "scaffold", "fall", "induction", "notifiable"],
  kaupapa: ["payment", "claim", "project", "schedule", "variation", "cca", "gantt", "milestone", "budget", "programme", "delay", "progress", "retention", "eot"],
  ata: ["bim", "3d", "model", "clash", "revit", "ifc", "mep", "coordination", "digital twin", "autodesk"],
  kahu: ["contract", "retention", "dispute", "adjudication", "subcontract", "nzs 3910", "terms", "unfair"],
  rawa: ["resource", "workforce", "equipment", "material", "labour", "lbp", "procurement", "supply"],
  pai: ["quality", "inspection", "defect", "ncr", "punch list", "snag", "producer statement", "itp"],
  whakaae: ["consent", "building consent", "ccc", "council", "code compliance", "bca", "resource consent"],
  kai: ["food", "restaurant", "café", "cafe", "kitchen", "liquor", "alcohol", "licence", "license", "hospitality", "menu", "allergen", "mpi", "food safety"],
  aroha: ["employment", "hr", "leave", "sick", "holiday", "kiwisaver", "payroll", "contract", "redundancy", "grievance", "hiring", "firing", "wage", "salary", "staff", "employee", "disciplinary", "parental"],
  signal: ["security", "vulnerability", "breach", "hack", "nzism", "firewall", "cyber", "phishing", "malware", "encryption", "mfa"],
  privacy: ["privacy", "data", "ipp", "pii", "personal information", "breach notification", "privacy act"],
};

function classifyAgent(message: string, packId: string, explicitAgent?: string): string {
  if (explicitAgent) return explicitAgent;
  const lc = message.toLowerCase();

  // Pack-specific agents get priority
  const packAgents: Record<string, string[]> = {
    hanga: ["arai", "kaupapa", "ata", "kahu", "rawa", "pai", "whakaae"],
    manaaki: ["kai"],
    pakihi: ["aroha"],
    hangarau: ["signal"],
  };

  const priorityAgents = packAgents[packId] || [];
  let bestAgent = "iho";
  let bestScore = 0;

  for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lc.includes(kw)) score += kw.length > 5 ? 2 : 1;
    }
    // Boost agents in the current pack
    if (priorityAgents.includes(agent)) score += 2;
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
    const selectedAgent = classifyAgent(message, packId, agentId);

    // Load agent prompt from DB (try pack-specific first, then shared)
    let agentPrompt: any = null;
    const { data: packPrompt } = await supabase
      .from("agent_prompts")
      .select("*")
      .eq("agent_name", selectedAgent)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    agentPrompt = packPrompt;

    // Load shared compliance prompts
    const { data: sharedPrompts } = await supabase
      .from("agent_prompts")
      .select("system_prompt, agent_name")
      .eq("pack", "shared")
      .eq("is_active", true)
      .in("agent_name", ["privacy", "tikanga", "copywriter"]);

    // Build system prompt
    const basePrompt = agentPrompt?.system_prompt ||
      `You are IHO, Assembl's intelligence assistant for New Zealand businesses. Help with queries relevant to the ${packId} industry pack. Reference relevant NZ legislation.`;

    const complianceRules = (sharedPrompts || []).map(p => p.system_prompt).join("\n\n---\n\n");

    const systemPrompt = `${basePrompt}\n\n--- COMPLIANCE LAYER ---\n${complianceRules}\n\nIMPORTANT: Always respond in a helpful, professional tone. Use markdown formatting with ## headings. Reference NZ legislation where applicable. Provide actionable next steps.`;

    // Build conversation
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role, content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Select model from agent preference
    const modelPref = agentPrompt?.model_preference || "gemini-3-flash-preview";
    const model = MODEL_MAP[modelPref] || "google/gemini-3-flash-preview";

    // Stream from Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up at Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI service error: ${status}`);
    }

    // Return SSE stream with agent metadata headers
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("X-Agent-Name", encodeURIComponent(agentPrompt?.display_name || "IHO Brain"));
    headers.set("X-Agent-Code", selectedAgent);
    headers.set("X-Agent-Icon", agentPrompt?.icon || "Brain");
    headers.set("Access-Control-Expose-Headers", "X-Agent-Name, X-Agent-Code, X-Agent-Icon");

    return new Response(response.body, { headers });
  } catch (e) {
    console.error("agent-router error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "I'm temporarily unable to connect to the AI service. Please try again shortly.",
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
