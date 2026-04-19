import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * IHO-INTENT-ROUTER
 * =================
 * Lightweight AI intent classifier. Given an inbound message and the list of
 * available kete for a tenant, returns the best-matching kete slug + confidence.
 *
 * Used by tnz-inbound BEFORE the keyword routing fallback, so a user's first
 * free-form message lands at the correct specialist.
 *
 * Input:  { message: string, kete: [{ slug, display_name, description, keywords }] }
 * Output: { kete: "manaaki", confidence: 0.92, reasoning: "..." }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface RouteRequest {
  message: string;
  kete: Array<{
    slug: string;
    display_name?: string;
    description?: string;
    keywords?: string[];
  }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, kete }: RouteRequest = await req.json();
    if (!message || !Array.isArray(kete) || kete.length === 0) {
      return new Response(JSON.stringify({ error: "message and kete[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keteCatalog = kete.map(k =>
      `- ${k.slug}: ${k.display_name || k.slug}${k.description ? ` — ${k.description}` : ""}${k.keywords?.length ? ` [keywords: ${k.keywords.slice(0, 6).join(", ")}]` : ""}`
    ).join("\n");

    const systemPrompt = `You are Iho, the routing intelligence for Assembl. You read an inbound user message and decide which specialist (kete) should answer.

Available kete:
${keteCatalog}

Return STRICT JSON: {"kete":"<slug>","confidence":<0..1>,"reasoning":"<one sentence>"}.
- "kete" MUST be one of the slugs listed above.
- If unsure, default to the closest business-operations match.
- Confidence > 0.6 means clear match, 0.3-0.6 fuzzy, < 0.3 uncertain.`;

    const aiResp = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("Iho intent AI error:", aiResp.status, txt.slice(0, 200));
      // graceful fallback — caller will use keyword routing
      return new Response(
        JSON.stringify({ kete: kete[0].slug, confidence: 0, reasoning: "ai_unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResp.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: { kete?: string; confidence?: number; reasoning?: string } = {};
    try { parsed = JSON.parse(raw); } catch { /* ignore */ }

    const validSlugs = new Set(kete.map(k => k.slug));
    const chosen = parsed.kete && validSlugs.has(parsed.kete) ? parsed.kete : kete[0].slug;

    return new Response(
      JSON.stringify({
        kete: chosen,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
        reasoning: parsed.reasoning || "ai_classified",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("iho-intent-router error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
