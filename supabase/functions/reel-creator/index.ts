import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * REEL-CREATOR
 * ============
 * Generates a viral 5-act reel plan for short-form video
 * (Instagram Reels / TikTok / YouTube Shorts) using NZ-aware
 * audience cues and AUAHA brand voice.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are AUAHA's viral reel strategist. You write data-backed short-form video plans for NZ businesses using a proven 5-act structure.

You MUST return valid JSON with EXACTLY this shape:
{
  "act1_hook": { "title_card": "...", "voiceover": "...", "duration_s": 3 },
  "act2_conflict": { "stakes": "...", "voiceover": "...", "duration_s": 4 },
  "act3_build": { "steps": ["1. ...", "2. ...", "3. ..."], "voiceover": "...", "duration_s": 12 },
  "act4_resolution": { "payoff": "...", "voiceover": "...", "duration_s": 5 },
  "act5_cta": { "tease": "...", "cta": "...", "duration_s": 3 },
  "shot_list": ["[ ] shot 1", "[ ] shot 2", "..."],
  "caption": "ready-to-post caption with line breaks",
  "hashtags": ["#tag1", "#tag2"],
  "best_posting_time_nz": "e.g. Tue 7:30am NZST",
  "aesthetic_notes": "lighting / colour / pace direction"
}

Rules:
• Hook must stop the scroll in ≤3 seconds
• Use NZ English and cultural cues (no Americanisms like "y'all")
• Caption max 200 chars before "...more"
• 5-10 hashtags, mix of broad + niche NZ tags
• Total runtime 25-30s`;

interface ReelRequest {
  topic: string;
  audience?: string;
  content_type?: string;
  brand?: string;
  tenant_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: ReelRequest = await req.json();
    if (!body.topic?.trim()) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Topic: ${body.topic}
Audience: ${body.audience || "general NZ business"}
Content type: ${body.content_type || "educational"}
Brand: ${body.brand || "generic NZ brand"}

Generate the full 5-act reel plan now.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway ${resp.status}: ${txt.slice(0, 200)}`);
    }

    const data = await resp.json();
    const plan = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    // Persist
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tenantId = body.tenant_id || "00000000-0000-0000-0000-000000000001";

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { data: { user } } = await sb.auth.getUser(authHeader.slice(7));
        userId = user?.id ?? null;
      } catch { /* ignore */ }
    }

    let planId: string | null = null;
    if (userId) {
      const { data: row } = await sb.from("reel_plans").insert({
        tenant_id: tenantId,
        user_id: userId,
        topic: body.topic,
        audience: body.audience,
        content_type: body.content_type,
        brand: body.brand,
        plan_json: plan,
      }).select("id").single();
      planId = row?.id ?? null;
    }

    return new Response(JSON.stringify({ success: true, plan_id: planId, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("reel-creator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
