import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { charityName, matchScore, dimensions, whyMatched } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an activation strategist for corporate-charity partnerships in New Zealand. Given a corporate sponsor matched with a charity, suggest exactly 5 activation ideas across these categories: Co-Branded Campaign, Event Activation, Digital & Social, Community Engagement, Employee Programme. For each idea provide: title, category, description (2 sentences max), estimatedReach (e.g. "5,000-10,000 people"), budgetRange (e.g. "$2,000-$5,000"), and timeline (e.g. "4-6 weeks").`;

    const userPrompt = `The corporate sponsor has been matched with "${charityName}" (${matchScore}% match). Match dimensions: ${dimensions.map((d: any) => `${d.label}: ${d.score}%`).join(", ")}. Why matched: ${whyMatched}. Generate 5 activation ideas.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_activations",
              description: "Return 5 activation ideas for a corporate-charity partnership.",
              parameters: {
                type: "object",
                properties: {
                  activations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["Co-Branded Campaign", "Event Activation", "Digital & Social", "Community Engagement", "Employee Programme"],
                        },
                        description: { type: "string" },
                        estimatedReach: { type: "string" },
                        budgetRange: { type: "string" },
                        timeline: { type: "string" },
                      },
                      required: ["title", "category", "description", "estimatedReach", "budgetRange", "timeline"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["activations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_activations" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No activations generated" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const activations = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(activations), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("activation-ideas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
