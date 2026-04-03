import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGENT_KEYWORDS: Record<string, string[]> = {
  arai: ["hazard", "safety", "h&s", "risk", "ppe", "incident", "worksafe", "swms", "sssp", "toolbox", "height", "scaffold", "fall", "morearea", "induction", "notifiable"],
  kaupapa: ["payment", "claim", "project", "schedule", "variation", "cca", "gantt", "milestone", "budget", "programme", "delay", "progress", "retention", "subcontract"],
  ata: ["bim", "3d", "model", "clash", "revit", "ifc", "mep", "coordination", "digital twin", "autodesk"],
  kahu: ["contract", "retention", "dispute", "adjudication", "subcontract", "nzs 3910", "terms", "compliance"],
  rawa: ["resource", "workforce", "equipment", "material", "labour", "lbp", "procurement", "supply"],
  pai: ["quality", "inspection", "defect", "ncr", "punch list", "snag", "producer statement", "itp"],
  whakaae: ["consent", "building consent", "ccc", "council", "inspection", "code compliance", "bca", "resource consent"],
  kai: ["food", "alcohol", "licence", "hospitality", "allergen", "mpi", "menu", "kitchen", "chef", "restaurant", "cafe", "bar"],
  aroha: ["employment", "hiring", "firing", "leave", "kiwisaver", "wages", "disciplinary", "grievance", "redundancy", "hr", "salary", "staff", "parental leave", "sick leave"],
  signal: ["security", "vulnerability", "breach", "hack", "nzism", "firewall", "cyber", "phishing", "malware", "mfa", "encryption"],
  privacy: ["privacy", "data", "ipp", "breach notification", "personal information", "privacy act"],
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

    const selectedAgent = classifyAgent(message, agentId);

    // Load agent prompt from DB
    const { data: agentPrompt } = await supabase
      .from("agent_prompts")
      .select("*")
      .eq("agent_name", selectedAgent)
      .eq("is_active", true)
      .single();

    // Load shared prompts (privacy, tikanga, copywriter)
    const { data: sharedPrompts } = await supabase
      .from("agent_prompts")
      .select("system_prompt")
      .eq("pack", "shared")
      .eq("is_active", true)
      .in("agent_name", ["privacy", "tikanga", "copywriter"]);

    const basePrompt = agentPrompt?.system_prompt ||
      `You are IHO, Assembl's construction intelligence assistant. Help with NZ construction queries. Reference relevant NZ legislation.`;

    const complianceRules = (sharedPrompts || []).map(p => p.system_prompt).join("\n\n");

    const systemPrompt = `${basePrompt}\n\n--- COMPLIANCE RULES ---\n${complianceRules}\n\nAlways respond in a helpful, professional tone. Use markdown formatting. Reference NZ legislation where applicable.`;

    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role, content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Use model_preference from DB, with mapping to full model names
    const MODEL_MAP: Record<string, string> = {
      "gemini-2.5-flash": "google/gemini-2.5-flash",
      "gemini-2.5-pro": "google/gemini-2.5-pro",
      "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
      "gemini-3-flash-preview": "google/gemini-3-flash-preview",
      "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",
    };
    const rawPref = agentPrompt?.model_preference || "gemini-3-flash-preview";
    const model = MODEL_MAP[rawPref] || `google/${rawPref}`;

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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI error: ${status}`);
    }

    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("X-Agent-Name", encodeURIComponent(agentPrompt?.display_name || "IHO Brain"));
    headers.set("X-Agent-Code", selectedAgent);
    headers.set("X-Agent-Icon", agentPrompt?.icon || "Brain");
    headers.set("X-Agent-Model", model);
    headers.set("Access-Control-Expose-Headers", "X-Agent-Name, X-Agent-Code, X-Agent-Icon, X-Agent-Model");

    return new Response(response.body, { headers });
  } catch (e) {
    console.error("agent-router error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
