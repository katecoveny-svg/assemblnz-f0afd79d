import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

/**
 * ASSEMBL-COUNCIL
 * ===============
 * Strategic advisory panel: 7 specialist advisors fan-out in parallel,
 * each grounded in NZ business context, then synthesised into a single
 * recommendation with vote tally, agreement, tension, and next steps.
 *
 * Modes:
 *   full   — all 7 advisors
 *   quick  — 3 most relevant
 *   devil  — RANGI only (pushback)
 *   stress — all 7, risk-focused
 *
 * Stores every session in council_sessions for the Evidence Pack export.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CouncilRequest {
  question: string;
  context?: Record<string, unknown>;
  mode?: "full" | "quick" | "devil" | "stress";
  tenant_id?: string;
}

interface AdvisorResponse {
  agent_id: string;
  agent_name: string;
  role: string;
  color: string;
  position: "YES" | "NO" | "CONDITIONAL";
  confidence: "low" | "medium" | "high";
  analysis: string;
  key_numbers: string;
  biggest_risk: string;
  question: string;
  raw: string;
}

const ALL_ADVISORS = [
  { id: "rewa", name: "REWA", role: "Revenue Strategist", color: "#D4A853" },
  { id: "matiu", name: "MATIU", role: "Operations Architect", color: "#3A7D6E" },
  { id: "hine", name: "HINE", role: "Customer Voice", color: "#E88D67" },
  { id: "tama", name: "TAMA", role: "Risk & Compliance", color: "#C75050" },
  { id: "aroha-advisor", name: "AROHA", role: "People & Culture", color: "#9B7ED8" },
  { id: "kahu-advisor", name: "KAHU", role: "Brand & Market", color: "#5B9BD5" },
  { id: "rangi", name: "RANGI", role: "The Contrarian", color: "#F5F0E8" },
];

function pickQuick(question: string): typeof ALL_ADVISORS {
  const q = question.toLowerCase();
  const scored = ALL_ADVISORS.map(a => {
    let score = 0;
    if (a.id === "rewa" && /(revenue|price|sale|margin|cash|profit|growth|customer\s*acqui)/.test(q)) score += 3;
    if (a.id === "matiu" && /(ops|capacity|deliver|process|hire|scale|system|throughput)/.test(q)) score += 3;
    if (a.id === "hine" && /(customer|user|nps|churn|experience|feedback|retention)/.test(q)) score += 3;
    if (a.id === "tama" && /(legal|compl|risk|privacy|hswa|liab|contract|regul)/.test(q)) score += 3;
    if (a.id === "aroha-advisor" && /(team|hire|fire|culture|wage|wellbeing|burnout|staff)/.test(q)) score += 3;
    if (a.id === "kahu-advisor" && /(brand|market|positioning|launch|campaign|narrative)/.test(q)) score += 3;
    if (a.id === "rangi" && /(should\s*we|big\s*decision|pivot|kill|sunset)/.test(q)) score += 2;
    score += Math.random() * 0.5; // tiny tiebreak
    return { advisor: a, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.advisor);
}

function parseAdvisorResponse(raw: string, advisor: typeof ALL_ADVISORS[0]): AdvisorResponse {
  const upper = raw.toUpperCase();
  let position: "YES" | "NO" | "CONDITIONAL" = "CONDITIONAL";
  if (/\bYES\b/.test(upper.slice(0, 200))) position = "YES";
  else if (/\bNO\b/.test(upper.slice(0, 200))) position = "NO";
  else if (/\bCONDITIONAL\b/.test(upper.slice(0, 200))) position = "CONDITIONAL";

  let confidence: "low" | "medium" | "high" = "medium";
  if (/\b(high\s*confidence|very\s*confident|strongly)\b/i.test(raw)) confidence = "high";
  else if (/\b(low\s*confidence|uncertain|hard\s*to\s*say)\b/i.test(raw)) confidence = "low";

  const numMatch = raw.match(/(?:key\s*numbers?|numbers?:)([^\n]{5,200})/i);
  const riskMatch = raw.match(/(?:biggest\s*risk|risk:)([^\n]{5,200})/i);
  const qMatch = raw.match(/(?:question|sharpening\s*question):?([^\n]{5,200})/i);

  return {
    agent_id: advisor.id,
    agent_name: advisor.name,
    role: advisor.role,
    color: advisor.color,
    position,
    confidence,
    analysis: raw,
    key_numbers: numMatch?.[1]?.trim() || "—",
    biggest_risk: riskMatch?.[1]?.trim() || "—",
    question: qMatch?.[1]?.trim() || "—",
    raw,
  };
}

async function askAdvisor(
  advisor: typeof ALL_ADVISORS[0],
  question: string,
  context: Record<string, unknown>,
  mode: string,
  systemPrompt: string,
  apiKey: string,
): Promise<AdvisorResponse> {
  const ctxBlock = Object.keys(context).length
    ? `\n\nBUSINESS CONTEXT:\n${Object.entries(context).map(([k, v]) => `• ${k}: ${v}`).join("\n")}`
    : "";

  const modeBlock = mode === "stress"
    ? "\n\nSTRESS-TEST MODE: Focus heavily on what could go wrong. Pessimistic lens."
    : mode === "devil"
      ? "\n\nDEVIL'S ADVOCATE MODE: Push back hard. Find every weakness."
      : "";

  const fullSystem = systemPrompt + ctxBlock + modeBlock + `

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
Position: YES / NO / CONDITIONAL
Confidence: low / medium / high
Analysis: [3-5 sentences]
Key numbers: [specific NZD figures or metrics]
Biggest risk: [one sentence]
Question: [one sharpening question]`;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: advisorModel,
        messages: [
          { role: "system", content: fullSystem },
          { role: "user", content: question },
        ],
        temperature: advisor.id === "rangi" ? 0.8 : 0.5,
        max_tokens: 500,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return {
        agent_id: advisor.id, agent_name: advisor.name, role: advisor.role, color: advisor.color,
        position: "CONDITIONAL", confidence: "low",
        analysis: `[${advisor.name} unavailable: ${resp.status}]`,
        key_numbers: "—", biggest_risk: "—", question: "—",
        raw: txt.slice(0, 200),
      };
    }
    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || "[no response]";
    return parseAdvisorResponse(raw, advisor);
  } catch (e) {
    return {
      agent_id: advisor.id, agent_name: advisor.name, role: advisor.role, color: advisor.color,
      position: "CONDITIONAL", confidence: "low",
      analysis: `[error: ${e instanceof Error ? e.message : String(e)}]`,
      key_numbers: "—", biggest_risk: "—", question: "—", raw: "",
    };
  }
}

async function synthesise(question: string, advisors: AdvisorResponse[], apiKey: string) {
  const yesCount = advisors.filter(a => a.position === "YES").length;
  const noCount = advisors.filter(a => a.position === "NO").length;
  const condCount = advisors.filter(a => a.position === "CONDITIONAL").length;

  const sys = `You are IHO, the Assembl Brain synthesising the Council's verdict. Your output MUST be valid JSON with this exact shape:
{
  "agreement_points": ["...", "..."],
  "tension_points": ["...", "..."],
  "recommendation": "single clear sentence",
  "next_steps": ["1. ...", "2. ...", "3. ..."]
}
Be ruthless. NZ English. Max 3 items per array.`;

  const ctx = advisors.map(a => `${a.agent_name} (${a.role}) — ${a.position}: ${a.analysis.slice(0, 300)}`).join("\n\n");

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: synthModel,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Question: ${question}\n\n${ctx}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 600,
      }),
    });
    if (!resp.ok) throw new Error(`synth ${resp.status}`);
    const data = await resp.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return {
      vote_tally: { yes: yesCount, no: noCount, conditional: condCount },
      agreement_points: parsed.agreement_points || [],
      tension_points: parsed.tension_points || [],
      recommendation: parsed.recommendation || "(synthesis unavailable)",
      next_steps: parsed.next_steps || [],
    };
  } catch (e) {
    return {
      vote_tally: { yes: yesCount, no: noCount, conditional: condCount },
      agreement_points: [],
      tension_points: [],
      recommendation: `(synthesis error: ${e instanceof Error ? e.message : String(e)})`,
      next_steps: [],
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: CouncilRequest = await req.json();
    if (!body.question?.trim()) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const mode = body.mode || "full";
    const context = body.context || {};
    const tenantId = body.tenant_id || "00000000-0000-0000-0000-000000000001";

    // Pick advisors based on mode
    let chosen: typeof ALL_ADVISORS;
    if (mode === "devil") chosen = ALL_ADVISORS.filter(a => a.id === "rangi");
    else if (mode === "quick") chosen = pickQuick(body.question);
    else chosen = ALL_ADVISORS;

    // Load system prompts
    const { data: prompts } = await sb
      .from("agent_prompts")
      .select("agent_name, system_prompt")
      .in("agent_name", chosen.map(c => c.id))
      .eq("pack", "council");
    const promptMap = new Map((prompts || []).map(p => [p.agent_name, p.system_prompt as string]));

    const t0 = Date.now();
    const advisors = await Promise.all(
      chosen.map(a => askAdvisor(a, body.question, context, mode, promptMap.get(a.id) || "", apiKey))
    );

    const synthesis = advisors.length > 1
      ? await synthesise(body.question, advisors, apiKey)
      : {
          vote_tally: { yes: 0, no: 0, conditional: 0 },
          agreement_points: [],
          tension_points: [],
          recommendation: advisors[0]?.analysis || "",
          next_steps: [],
        };

    const durationMs = Date.now() - t0;

    // Persist (auth user resolved from JWT; fall back to anonymous if needed)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { data: { user } } = await sb.auth.getUser(authHeader.slice(7));
        userId = user?.id ?? null;
      } catch { /* ignore */ }
    }

    let sessionId: string | null = null;
    if (userId) {
      const { data: row } = await sb.from("council_sessions").insert({
        tenant_id: tenantId,
        user_id: userId,
        question: body.question,
        context,
        mode,
        advisors_json: advisors,
        synthesis_json: synthesis,
        duration_ms: durationMs,
      }).select("id").single();
      sessionId = row?.id ?? null;
    }

    return new Response(JSON.stringify({
      success: true,
      session_id: sessionId,
      question: body.question,
      mode,
      advisors,
      synthesis,
      duration_ms: durationMs,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("assembl-council error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
