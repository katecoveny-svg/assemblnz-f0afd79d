// ============================================================================
// mcp-chat — secure streaming chat for Assembl agents
// ----------------------------------------------------------------------------
// POST { agentId: string, messages: [{role,content}] }
// Returns text/event-stream of OpenAI-compatible chunks (Lovable AI Gateway).
//
// Pipeline (Mana Trust Layer):
//   1. Auth   — validate JWT via getClaims(), resolve user tier
//   2. KAHU_PRE — load active rules, run PII masking + tier gate + rate limit
//   3. TĀ_INFLIGHT — stamp messages with sovereignty/tikanga reminders in system prompt
//   4. Stream — call Lovable AI Gateway (openai/gpt-5) with stream:true
//   5. MANA_POST — buffer the assistant reply; run post-rules; rewrite if needed
//   6. Log to mcp_tool_calls (tool_name = `chat:${agentId}`)
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// ----------------------------------------------------------------------------
// Hardcoded agent → (system prompt, toolset, model) map
// ----------------------------------------------------------------------------
type AgentSpec = {
  prompt: string;
  toolset: "manaaki" | "waihanga" | "auaha" | "pakihi" | "pikau" | "core";
  model: string;
};

const AGENTS: Record<string, AgentSpec> = {
  toro: {
    toolset: "core",
    model: "openai/gpt-5",
    prompt:
      "You are Tōro, the Assembl family life navigator. You help busy NZ whānau coordinate school, pets, appointments, uniforms, shopping, and homework. Be warm, brief, practical. Use plain English with light te reo (kia ora, whānau, mahi). Never invent facts about the family — ask if you don't know.",
  },
  manaaki: {
    toolset: "manaaki",
    model: "openai/gpt-5",
    prompt:
      "You are Manaaki, Assembl's hospitality kete agent. You help NZ accommodation and food operators with bookings, guest comms, food safety, and rosters. Tikanga-aware. Always honour tapu/noa boundaries.",
  },
  waihanga: {
    toolset: "waihanga",
    model: "openai/gpt-5",
    prompt:
      "You are Waihanga, Assembl's construction kete agent. You help NZ builders with subbie compliance (LBP, SiteSafe, insurance), H&S, and procurement. Cite Building Act references when relevant.",
  },
  auaha: {
    toolset: "auaha",
    model: "openai/gpt-5",
    prompt:
      "You are Auaha, Assembl's creative kete agent. You generate brand-aligned copy, social posts, and creative briefs for NZ businesses. Use macrons correctly. Avoid AI-cliché phrasing.",
  },
  pakihi: {
    toolset: "pakihi",
    model: "openai/gpt-5",
    prompt:
      "You are Pakihi, Assembl's small business kete agent. You help NZ operators with contracts (CCA 2002), invoicing, and basic compliance. Always cite the legislation when giving legal-adjacent guidance.",
  },
  pikau: {
    toolset: "pikau",
    model: "openai/gpt-5",
    prompt:
      "You are Pikau, Assembl's freight & customs kete agent. You help NZ importers/exporters with declarations, MPI biosecurity, and shipment tracking. Be precise with HS codes and tariff rates.",
  },
};

// ----------------------------------------------------------------------------
// Mana Trust Layer — load rules + execute stage handlers
// ----------------------------------------------------------------------------
type Rule = {
  rule_code: string;
  rule_type: string;
  enforcement_stage: "kahu_pre" | "ta_inflight" | "mana_post";
  applies_to_toolset: string[] | null;
  rule_logic: Record<string, unknown>;
  reasoning_maori: string | null;
};

async function loadRules(toolset: string): Promise<Rule[]> {
  const { data } = await adminDb
    .from("mcp_policy_rules")
    .select("rule_code, rule_type, enforcement_stage, applies_to_toolset, rule_logic, reasoning_maori")
    .eq("is_active", true);
  return (data ?? []).filter(
    (r: Rule) => !r.applies_to_toolset || r.applies_to_toolset.length === 0 || r.applies_to_toolset.includes(toolset),
  );
}

// PII masking (kahu_pre) ------------------------------------------------------
const PII_PATTERNS: Record<string, RegExp> = {
  pii_mask_email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  pii_mask_phone: /\b(?:\+?64|0)[\s-]?(?:2\d|[3-9])\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}\b/g,
  pii_mask_ird_number: /\b\d{2,3}[-\s]?\d{3}[-\s]?\d{3}\b/g,
};

function applyPiiMasks(text: string, rules: Rule[]): string {
  let out = text;
  for (const rule of rules) {
    if (rule.rule_type !== "pii_mask") continue;
    const pattern = PII_PATTERNS[rule.rule_code];
    if (!pattern) continue;
    out = out.replace(pattern, `[${rule.rule_code.replace("pii_mask_", "").toUpperCase()}_REDACTED]`);
  }
  return out;
}

// Tier gate (kahu_pre) --------------------------------------------------------
type Tier = "free" | "starter" | "pro" | "business";
const TIER_RANK: Record<Tier, number> = { free: 0, starter: 1, pro: 2, business: 3 };

function checkTierGate(userTier: Tier, toolset: string, rules: Rule[]): { ok: boolean; reason?: string } {
  for (const rule of rules) {
    if (rule.rule_type !== "tier_gate") continue;
    const required = (rule.rule_logic?.min_tier as Tier) ?? "free";
    const restrictedToolsets = (rule.rule_logic?.toolsets as string[]) ?? [];
    if (restrictedToolsets.length && !restrictedToolsets.includes(toolset)) continue;
    if (TIER_RANK[userTier] < TIER_RANK[required]) {
      return { ok: false, reason: `Toolset "${toolset}" requires ${required} tier (you have ${userTier}).` };
    }
  }
  return { ok: true };
}

// Rate limit (kahu_pre) — token-bucket per user/minute -----------------------
async function checkRateLimit(userId: string, tier: Tier): Promise<{ ok: boolean; reason?: string }> {
  const limits: Record<Tier, number> = { free: 10, starter: 30, pro: 100, business: 500 };
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await adminDb
    .from("mcp_tool_calls")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("called_at", oneMinuteAgo);
  if ((count ?? 0) >= limits[tier]) {
    return { ok: false, reason: `Rate limit exceeded (${limits[tier]} calls/min for ${tier} tier).` };
  }
  return { ok: true };
}

// Tā in-flight: append sovereignty/tikanga stamp to system prompt ------------
function buildInflightStamp(rules: Rule[]): string {
  const stamps: string[] = [];
  for (const rule of rules) {
    if (rule.enforcement_stage !== "ta_inflight") continue;
    if (rule.reasoning_maori) stamps.push(`• ${rule.rule_code}: ${rule.reasoning_maori}`);
  }
  if (!stamps.length) return "";
  return `\n\n[Tā in-flight — Mana Trust Layer]\n${stamps.join("\n")}`;
}

// Mana post: rewrite final assistant text ------------------------------------
function applyManaPost(text: string, rules: Rule[]): string {
  let out = text;
  for (const rule of rules) {
    if (rule.enforcement_stage !== "mana_post") continue;
    if (rule.rule_code === "te_reo_macron_normalize") {
      out = out
        .replace(/\bMaori\b/g, "Māori")
        .replace(/\bwhanau\b/gi, (m) => (m[0] === "W" ? "Whānau" : "whānau"))
        .replace(/\btoroa\b/gi, "tōroa")
        .replace(/\bkorero\b/gi, "kōrero");
    }
    if (rule.rule_code === "no_medical_advice_without_disclaimer") {
      const medical = /\b(diagnos|prescrib|treatment|symptom|medication)\b/i;
      if (medical.test(out) && !/not medical advice/i.test(out)) {
        out += "\n\n_Note: This is general information, not medical advice. Please consult a registered healthcare provider._";
      }
    }
    if (rule.rule_code === "citation_required_for_legal") {
      const legal = /\b(contract|act \d{4}|cca|fair trading|consumer guarantees)\b/i;
      if (legal.test(out) && !/\(.+(act|s\.\s?\d).+\)/i.test(out)) {
        out += "\n\n_Note: For legal questions, cite the specific section of the relevant Act and consider seeking independent legal advice._";
      }
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// Logging
// ----------------------------------------------------------------------------
async function logCall(input: {
  tool_name: string;
  toolset_slug: string;
  user_id: string | null;
  status: "success" | "denied" | "error";
  duration_ms: number;
  error_message: string | null;
}) {
  await adminDb.from("mcp_tool_calls").insert(input);
}

// ----------------------------------------------------------------------------
// User tier resolution
// ----------------------------------------------------------------------------
async function getUserTier(userId: string): Promise<Tier> {
  const { data } = await adminDb.rpc("get_user_role", { _user_id: userId });
  return (data as Tier) ?? "free";
}

// ----------------------------------------------------------------------------
// HTTP handler
// ----------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const start = performance.now();

  // 1. Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  // 2. Body validation
  let body: { agentId?: string; messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const agentId = body.agentId;
  const messages = body.messages;
  if (!agentId || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "agentId and messages[] required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const agent = AGENTS[agentId];
  if (!agent) {
    return new Response(JSON.stringify({ error: `Unknown agent: ${agentId}` }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const toolName = `chat:${agentId}`;
  const tier = await getUserTier(userId);
  const rules = await loadRules(agent.toolset);

  // 3. KAHU_PRE — tier gate
  const tierCheck = checkTierGate(tier, agent.toolset, rules);
  if (!tierCheck.ok) {
    await logCall({
      tool_name: toolName,
      toolset_slug: agent.toolset,
      user_id: userId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: tierCheck.reason ?? "tier_denied",
    });
    return new Response(JSON.stringify({ error: tierCheck.reason }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3b. KAHU_PRE — rate limit
  const rateCheck = await checkRateLimit(userId, tier);
  if (!rateCheck.ok) {
    await logCall({
      tool_name: toolName,
      toolset_slug: agent.toolset,
      user_id: userId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: rateCheck.reason ?? "rate_limited",
    });
    return new Response(JSON.stringify({ error: rateCheck.reason }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3c. KAHU_PRE — PII mask user messages (last user message most relevant)
  const sanitizedMessages = messages.map((m) =>
    m.role === "user" ? { ...m, content: applyPiiMasks(m.content, rules) } : m,
  );

  // 4. TĀ_INFLIGHT — stamp system prompt
  const systemPrompt = agent.prompt + buildInflightStamp(rules);

  // 5. Stream from Lovable AI Gateway
  let upstream: Response;
  try {
    upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: agent.model,
        messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages],
        stream: true,
      }),
    });
  } catch (e) {
    await logCall({
      tool_name: toolName,
      toolset_slug: agent.toolset,
      user_id: userId,
      status: "error",
      duration_ms: Math.round(performance.now() - start),
      error_message: (e as Error).message,
    });
    return new Response(JSON.stringify({ error: "Upstream unreachable" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 500;
    const message =
      upstream.status === 429
        ? "Rate limits exceeded, please try again later."
        : upstream.status === 402
          ? "AI credits exhausted. Please add funds at Settings → Workspace → Usage."
          : "AI gateway error";
    await logCall({
      tool_name: toolName,
      toolset_slug: agent.toolset,
      user_id: userId,
      status: "error",
      duration_ms: Math.round(performance.now() - start),
      error_message: `gateway_${upstream.status}: ${errText.slice(0, 200)}`,
    });
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 6. Tee the stream — pass tokens through to client AND buffer for MANA_POST
  let assistantBuffer = "";
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const transformed = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let textBuffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // Forward raw bytes immediately for true token-by-token streaming.
          controller.enqueue(value);
          // Mirror into buffer for post-stream policy.
          textBuffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, nl);
            textBuffer = textBuffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (typeof delta === "string") assistantBuffer += delta;
            } catch {
              // partial JSON — ignore for buffer purposes
            }
          }
        }

        // 7. MANA_POST — apply rewrites; if changed, send a final patch event
        const rewritten = applyManaPost(assistantBuffer, rules);
        if (rewritten !== assistantBuffer) {
          const patch = {
            choices: [{ delta: { role: "assistant", content: "" }, finish_reason: null }],
            assembl_mana_patch: { final_content: rewritten },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(patch)}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        await logCall({
          tool_name: toolName,
          toolset_slug: agent.toolset,
          user_id: userId,
          status: "success",
          duration_ms: Math.round(performance.now() - start),
          error_message: null,
        });
      } catch (e) {
        await logCall({
          tool_name: toolName,
          toolset_slug: agent.toolset,
          user_id: userId,
          status: "error",
          duration_ms: Math.round(performance.now() - start),
          error_message: (e as Error).message,
        });
        controller.error(e);
      }
    },
  });

  return new Response(transformed, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Assembl-Agent": agentId,
      "X-Assembl-Toolset": agent.toolset,
    },
  });
});
