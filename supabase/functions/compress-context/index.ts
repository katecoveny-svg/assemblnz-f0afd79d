import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, agentId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a conversation compressor for the Assembl platform. Compress the conversation into structured JSON. Extract:
- summary: 2-3 sentence overview of what was discussed and decided
- facts: array of {key, value, confidence} where key uses dot notation (e.g. "company.revenue", "company.industry", "preference.tone")
- decisions: array of strings — decisions the user made
- pending_actions: array of strings — things the user committed to doing

Agent context: ${agentId}. Focus on business-relevant facts. Be precise with NZ-specific details (IRD numbers, company numbers, legislation references).

Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: JSON.stringify(messages),
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "compress_conversation",
              description: "Return structured compression of conversation",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  facts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        value: { type: "string" },
                        confidence: { type: "number" },
                      },
                      required: ["key", "value", "confidence"],
                    },
                  },
                  decisions: { type: "array", items: { type: "string" } },
                  pending_actions: { type: "array", items: { type: "string" } },
                },
                required: ["summary", "facts", "decisions", "pending_actions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "compress_conversation" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI compression failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No tool call in response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compress-context error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
