// ════════════════════════════════════════════════════════════════
// suggest-toolsets — single-batch Gemini Flash call
// Input: { tools: [{ id, tool_name, description, tool_category }] }
// Output: { suggestions: [{ id, toolset, tool_name, confidence, reasoning }] }
// ════════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOOLSETS = ["manaaki", "waihanga", "auaha", "pakihi", "pikau", "core"];

const SYSTEM = `You are a classifier helping the Assembl team migrate their tool_registry into MCP toolsets.

Toolsets (LOCKED — pick exactly one per tool):
- manaaki  — hospitality (bookings, guest comms, hotel/restaurant ops)
- waihanga — construction & trades (consents, BIM, subbies, site, photos)
- auaha    — creative & marketing (campaigns, content, image/video gen)
- pakihi   — business & professional services (legal, finance, GST, invoices, contracts)
- pikau    — customs, freight, logistics (CBAFF, MPI, biosecurity, shipments)
- core     — tikanga, compliance, te reo, base utilities used by all tiers

Return strict JSON only.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tools } = await req.json();
    if (!Array.isArray(tools) || tools.length === 0) {
      return new Response(JSON.stringify({ error: "tools[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userPayload = tools.map((t: any) => ({
      id: t.id,
      name: t.tool_name,
      description: t.description ?? "",
      category: t.tool_category ?? "",
    }));

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Classify these ${tools.length} tools into one toolset each. Return suggestions[] with the same id values.\n\n${JSON.stringify(userPayload, null, 2)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_suggestions",
              description: "Toolset assignments for the input tools",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        toolset: { type: "string", enum: TOOLSETS },
                        tool_name: { type: "string" },
                        confidence: { type: "number" },
                        reasoning: { type: "string" },
                      },
                      required: ["id", "toolset", "tool_name", "confidence", "reasoning"],
                    },
                  },
                },
                required: ["suggestions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_suggestions" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please wait." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Workspace credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gateway ${resp.status}`);
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No tool_call returned");
    const parsed = JSON.parse(args);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("suggest-toolsets error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
