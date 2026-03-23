const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { org_name, mission, funding_goal, beneficiaries, location } = await req.json();

    if (!org_name || !mission) {
      return new Response(
        JSON.stringify({ error: "Organisation name and mission are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert fundraising copywriter for New Zealand charities and community organisations. You write compelling, authentic content that connects with sponsors and donors. Use NZ English spelling. Be warm but professional.`;

    const userPrompt = `Write campaign content for this organisation:

Organisation: ${org_name}
Mission: ${mission}
${funding_goal ? `Funding Goal: $${funding_goal}` : ""}
${beneficiaries ? `Beneficiaries: ${beneficiaries}` : ""}
${location ? `Location: ${location}` : ""}

Generate all four content pieces using the generate_campaign tool.`;

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
              name: "generate_campaign",
              description: "Generate complete campaign content for a charity or community organisation.",
              parameters: {
                type: "object",
                properties: {
                  narrative: {
                    type: "string",
                    description: "A compelling 2-3 paragraph campaign narrative that tells the story of the cause, the need, and the impact of funding.",
                  },
                  sponsor_pitch: {
                    type: "string",
                    description: "A professional pitch letter (3-4 paragraphs) addressed to potential business sponsors, highlighting mutual benefits and ESG alignment.",
                  },
                  social_posts: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 social media posts (each under 280 characters) for promoting the campaign. Include relevant emojis and hashtags.",
                  },
                  grant_summary: {
                    type: "string",
                    description: "A 2-paragraph grant application summary suitable for funding applications, focusing on outcomes and measurability.",
                  },
                },
                required: ["narrative", "sponsor_pitch", "social_posts", "grant_summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_campaign" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output received from AI");
    }

    const campaign = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(campaign), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("campaign-writer error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
