import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Knowledge Brain grounding (768-dim Gemini → match_kb_knowledge) ───
const GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
async function gatherLiveGrounding(question: string, agentPack: string, sb: ReturnType<typeof createClient>): Promise<string> {
  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey || !question) return "";
    const r = await fetch(`${GEMINI_EMBED_URL}?key=${geminiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: question.slice(0, 8000) }] }, outputDimensionality: 768 }),
    });
    if (!r.ok) return "";
    const j = await r.json();
    const vec = j?.embedding?.values;
    if (!Array.isArray(vec)) return "";
    const { data } = await sb.rpc("match_kb_knowledge", { query_embedding: vec, agent_pack: agentPack, top_k: 5 });
    if (!data?.length) return "";
    return "\n\n=== LIVE KNOWLEDGE BRAIN (verified NZ travel sources) ===\n" +
      (data as Array<Record<string, unknown>>).map((s, i) => `[${i+1}] ${s.title} — ${s.source_name}\n${s.snippet}`).join("\n---\n") +
      "\n=== END KNOWLEDGE BRAIN ===\n";
  } catch (e) { console.warn("[odyssey] grounding failed:", (e as Error).message); return ""; }
}

/* ══════════════════════════════════════════════════════════
   ODYSSEY — AI Travel Planner for Aotearoa
   Generates structured NZ itineraries with local knowledge,
   weather-aware scheduling, budget breakdowns, and DOC/i-SITE tips.
   ══════════════════════════════════════════════════════════ */

const NZ_REGIONS = [
  "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne",
  "Hawke's Bay", "Taranaki", "Manawatū-Whanganui", "Wellington",
  "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury",
  "Otago", "Southland",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { action, ...params } = await req.json();

    // ── Generate Itinerary ──
    if (action === "generate") {
      const { destination, startDate, endDate, travellers, budgetNzd, interests, accommodationStyle, userId } = params;

      const dayCount = startDate && endDate
        ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
        : 5;

      const systemPrompt = `You are ODYSSEY, an elite NZ travel planning AI. You know every corner of Aotearoa — from hidden DOC huts to luxury lodges, from the Karangahake Gorge to the Catlins.

RULES:
1. Generate a day-by-day itinerary as a JSON array
2. Each day: { "day": 1, "date": "2026-04-10", "title": "Arrive in Queenstown", "activities": [...], "meals": {...}, "accommodation": {...}, "tips": [...], "estimatedCostNzd": 350 }
3. Each activity: { "time": "09:00", "name": "...", "description": "...", "duration": "2h", "costNzd": 0, "bookingRequired": false, "type": "adventure|culture|nature|food|relaxation" }
4. meals: { "breakfast": "...", "lunch": "...", "dinner": "..." } with venue suggestions
5. accommodation: { "name": "...", "type": "hotel|motel|airbnb|doc-hut|camping|lodge", "costNzd": 150 }
6. Include real NZ place names, real trails, real restaurants
7. Factor in NZ driving times — don't plan unrealistic distances
8. Include te reo Māori place name origins where interesting
9. Flag DOC Great Walk bookings that need advance booking
10. Weather awareness: ${startDate ? `Trip starts ${startDate}` : "Flexible dates"} — suggest appropriate activities for season
11. Budget: NZ$${budgetNzd || "2000"} total for ${travellers || 2} people
12. Interests: ${(interests || []).join(", ") || "general sightseeing"}
13. Accommodation preference: ${accommodationStyle || "mixed"}

OUTPUT: Return ONLY valid JSON: { "itinerary": [...days], "summary": "2-sentence overview", "totalEstimatedCostNzd": number, "bestTimeToBook": "string", "packingTips": ["..."] }`;

      const grounding = await gatherLiveGrounding(`Travel to ${destination} ${(interests || []).join(" ")}`, "voyage", sb);
      const groundedSystem = systemPrompt + grounding;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: groundedSystem },
            { role: "user", content: `Plan a ${dayCount}-day trip to ${destination || "South Island"} for ${travellers || 2} travellers. Budget: NZ$${budgetNzd || 2000}. Interests: ${(interests || []).join(", ") || "adventure, nature, food"}.` },
          ],
          max_tokens: 4000,
          tools: [{
            type: "function",
            function: {
              name: "create_itinerary",
              description: "Generate a structured NZ travel itinerary",
              parameters: {
                type: "object",
                properties: {
                  itinerary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "number" },
                        date: { type: "string" },
                        title: { type: "string" },
                        activities: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              time: { type: "string" },
                              name: { type: "string" },
                              description: { type: "string" },
                              duration: { type: "string" },
                              costNzd: { type: "number" },
                              bookingRequired: { type: "boolean" },
                              type: { type: "string" }
                            },
                            required: ["time", "name", "description"]
                          }
                        },
                        meals: {
                          type: "object",
                          properties: {
                            breakfast: { type: "string" },
                            lunch: { type: "string" },
                            dinner: { type: "string" }
                          }
                        },
                        accommodation: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            type: { type: "string" },
                            costNzd: { type: "number" }
                          }
                        },
                        tips: { type: "array", items: { type: "string" } },
                        estimatedCostNzd: { type: "number" }
                      },
                      required: ["day", "title", "activities"]
                    }
                  },
                  summary: { type: "string" },
                  totalEstimatedCostNzd: { type: "number" },
                  bestTimeToBook: { type: "string" },
                  packingTips: { type: "array", items: { type: "string" } }
                },
                required: ["itinerary", "summary", "totalEstimatedCostNzd"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "create_itinerary" } },
        }),
      });

      if (!aiResp.ok) {
        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited — try again shortly" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits needed — top up in workspace settings" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${aiResp.status}`);
      }

      const aiResult = await aiResp.json();
      let itineraryData: any = null;

      // Extract from tool call
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          itineraryData = JSON.parse(toolCall.function.arguments);
        } catch { /* parse failed */ }
      }

      // Fallback: try content
      if (!itineraryData) {
        const content = aiResult.choices?.[0]?.message?.content || "";
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) itineraryData = JSON.parse(jsonMatch[0]);
        } catch { /* fallback failed */ }
      }

      if (!itineraryData) {
        return new Response(JSON.stringify({ error: "Failed to generate itinerary" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Save to DB if user authenticated
      if (userId) {
        await sb.from("travel_itineraries").insert({
          user_id: userId,
          destination: destination || "South Island",
          start_date: startDate || null,
          end_date: endDate || null,
          travellers: travellers || 2,
          budget_nzd: budgetNzd || 2000,
          interests: interests || [],
          accommodation_style: accommodationStyle || "mixed",
          itinerary: itineraryData.itinerary || [],
          summary: itineraryData.summary || "",
          status: "generated",
        });
      }

      return new Response(JSON.stringify({ success: true, data: itineraryData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Discover Destinations ──
    if (action === "discover") {
      const { region, interests, season } = params;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are ODYSSEY. Return 6 NZ destination recommendations as JSON array: [{ name, region, description, highlights: string[], bestSeason, budgetRange, imageQuery }]. Use real places. Include hidden gems alongside popular spots." },
            { role: "user", content: `Suggest destinations in ${region || "all of NZ"} for someone interested in ${(interests || []).join(", ") || "general travel"} during ${season || "any season"}.` },
          ],
          max_tokens: 1500,
        }),
      });

      if (!aiResp.ok) throw new Error(`AI error: ${aiResp.status}`);
      const result = await aiResp.json();
      const content = result.choices?.[0]?.message?.content || "[]";

      let destinations = [];
      try {
        const match = content.match(/\[[\s\S]*\]/);
        if (match) destinations = JSON.parse(match[0]);
      } catch { /* parse failed */ }

      return new Response(JSON.stringify({ success: true, destinations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action", regions: NZ_REGIONS }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("odyssey-travel error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
