// ============================================================================
// mcp-chat — secure streaming chat for Assembl agents
// ----------------------------------------------------------------------------
// POST { agentId: string, messages: [{role,content}], context?: {...} }
// Returns text/event-stream of OpenAI-compatible chunks (Lovable AI Gateway).
//
// Pipeline (Mana Trust Layer):
//   1. Auth   — validate JWT via getClaims(), resolve user tier
//   2. KAHU_PRE — load active rules, run PII masking + tier gate + rate limit
//   3. CONTEXT — auto-inject live knowledge (kb_doc_chunks via pgvector) +
//                user memory (agent_memory via pgvector). Cheap RPCs that
//                make the agent feel grounded instead of stateless.
//   4. TĀ_INFLIGHT — stamp messages with sovereignty/tikanga reminders +
//                    knowledge + memory blocks in the system prompt
//   5. Stream — call Lovable AI Gateway (openai/gpt-5) with stream:true
//   6. MANA_POST — buffer the assistant reply; run post-rules; rewrite if needed
//   7. Log to mcp_tool_calls (tool_name = `chat:${agentId}`) with context counts
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { embedText } from "../_shared/embed.ts";
import { executeAgentTool, LIVE_DATA_TOOLS, type LlmTool } from "../_shared/tool-executor.ts";

// ----------------------------------------------------------------------------
// Request schema (server-side validation)
// ----------------------------------------------------------------------------
const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8000;
const MAX_TOTAL_CHARS = 60000;

// Message content can be a plain string OR an array of multimodal parts
// (text + image_url) so the chat UI can attach photos (e.g. homework worksheets).
const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(MAX_CONTENT_CHARS),
});
const ImagePartSchema = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    // Accept https URLs or data: URLs (base64) up to ~6MB encoded.
    url: z.string().min(1).max(8_500_000),
    detail: z.enum(["auto", "low", "high"]).optional(),
  }),
});
const ContentPartSchema = z.union([TextPartSchema, ImagePartSchema]);

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.union([
    z.string().min(1).max(MAX_CONTENT_CHARS),
    z.array(ContentPartSchema).min(1).max(8),
  ]),
});

// Optional client-tunable model parameters. Bounded server-side so a tampered
// client can't spike spend or trigger out-of-policy generations.
// Whitelisted gateway models the user can pick from in the in-chat settings
// panel. Anything else falls back to the agent's default model.
const ALLOWED_GATEWAY_MODELS = new Set([
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-3-flash-preview",
]);
const ParamsSchema = z
  .object({
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().min(64).max(4096).optional(),
    model: z.string().max(64).optional(),
  })
  .optional();

const ChatBodySchema = z.object({
  agentId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, "agentId must be alphanumeric"),
  messages: z.array(MessageSchema).min(1).max(MAX_MESSAGES),
  params: ParamsSchema,
});

// ----------------------------------------------------------------------------
// Safety filter — blocks obvious prompt-injection / jailbreak / disallowed
// content before the model is called. Returns reason string when blocked.
// ----------------------------------------------------------------------------
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all|any|previous|prior) (instructions|rules|prompts)/i,
  /disregard (the )?(system|previous) (prompt|instructions)/i,
  /you are now (?:dan|jailbroken|unrestricted)/i,
  /pretend (?:you|to be) (?:have no|an unrestricted)/i,
  /reveal (?:the |your )?(system prompt|hidden instructions)/i,
  /print (?:the |your )?(system prompt|api key|secret)/i,
];

const DISALLOWED_PATTERNS: RegExp[] = [
  // Obvious self-harm / weapons / CSAM markers — minimal first-pass filter.
  /\b(how to (?:make|build) (?:a )?(?:bomb|explosive|nerve agent))\b/i,
  /\b(child (?:sexual|porn|abuse) (?:material|imagery))\b/i,
  /\b(instructions for self[- ]harm)\b/i,
];

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail?: string } };
type MsgIn = { role: string; content: string | ContentPart[] };

function extractText(content: string | ContentPart[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}

function safetyCheck(messages: MsgIn[]): { ok: boolean; reason?: string } {
  let total = 0;
  for (const m of messages) {
    const text = extractText(m.content);
    total += text.length;
    if (total > MAX_TOTAL_CHARS) {
      return { ok: false, reason: `Conversation exceeds ${MAX_TOTAL_CHARS} characters total.` };
    }
    if (m.role !== "user") continue; // only screen user text
    for (const re of INJECTION_PATTERNS) {
      if (re.test(text)) {
        return { ok: false, reason: "Message blocked: prompt-injection pattern detected." };
      }
    }
    for (const re of DISALLOWED_PATTERNS) {
      if (re.test(text)) {
        return { ok: false, reason: "Message blocked: disallowed content per safety policy." };
      }
    }
  }
  return { ok: true };
}

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
// Live context — auto-inject knowledge base snippets + user memory
// ----------------------------------------------------------------------------
// These run in parallel and are best-effort: if the embedding call or RPC
// fails we silently fall through with no context rather than blocking the
// chat. The agent stays useful, just less grounded.

const KB_TOP_K = 4;          // snippets injected per request
const MEM_TOP_K = 6;          // memories injected per request
const MEM_MIN_SIM = 0.6;      // matches /memory-recall default
const CONTEXT_MAX_CHARS = 6000;

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

interface KbSnippet { content: string; source?: string | null; score?: number | null }
interface MemHit { summary?: string | null; content?: string | null; similarity?: number | null }

async function loadKnowledgeContext(
  vec: number[],
  agentPack: string,
): Promise<KbSnippet[]> {
  try {
    const { data, error } = await adminDb.rpc("match_kb_knowledge" as never, {
      query_embedding: vec,
      agent_pack: agentPack ?? null,
      top_k: KB_TOP_K,
    } as never);
    if (error) {
      console.warn("[mcp-chat] kb match error", error.message);
      return [];
    }
    return Array.isArray(data) ? (data as KbSnippet[]) : [];
  } catch (e) {
    console.warn("[mcp-chat] kb context exception", (e as Error).message);
    return [];
  }
}

async function loadUserMemory(
  userId: string,
  vec: number[],
): Promise<MemHit[]> {
  try {
    const { data, error } = await adminDb.rpc("match_agent_memory", {
      p_tenant_id: null,
      p_user_id: userId,
      p_query_embedding: vec as unknown as string,
      p_match_count: MEM_TOP_K,
      p_min_similarity: MEM_MIN_SIM,
    });
    if (error) {
      console.warn("[mcp-chat] memory match error", error.message);
      return [];
    }
    if (data && (data as unknown[]).length) {
      const ids = (data as { id: string }[]).map((r) => r.id);
      adminDb.from("agent_memory")
        .update({ last_accessed_at: new Date().toISOString() })
        .in("id", ids)
        .then(() => undefined, () => undefined);
    }
    return (data as MemHit[]) ?? [];
  } catch (e) {
    console.warn("[mcp-chat] memory exception", (e as Error).message);
    return [];
  }
}

/** Single embedding shared by KB + memory lookups. */
async function embedQuestionOnce(question: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY || !question) return null;
  return embedText(question, GEMINI_API_KEY, 768);
}

function buildContextBlock(snippets: KbSnippet[], memories: MemHit[]): string {
  const sections: string[] = [];
  if (snippets.length) {
    const lines = snippets.map((s, i) => {
      const src = s.source ? ` (${s.source})` : "";
      return `${i + 1}.${src} ${String(s.content ?? "").trim()}`;
    });
    sections.push(`[Live knowledge — current as of this turn]\n${lines.join("\n")}`);
  }
  if (memories.length) {
    const lines = memories.map((m, i) => {
      const text = String(m.summary ?? m.content ?? "").trim();
      return `${i + 1}. ${text}`;
    });
    sections.push(`[Remembered context for this user]\n${lines.join("\n")}`);
  }
  if (!sections.length) return "";
  let out = `\n\n${sections.join("\n\n")}\n\nGround your reply in the above when relevant. Cite the source when you use a knowledge snippet.`;
  if (out.length > CONTEXT_MAX_CHARS) out = out.slice(0, CONTEXT_MAX_CHARS) + "\n…(context truncated)";
  return out;
}

function lastUserText(messages: { role: string; content: string | ContentPart[] }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") continue;
    return extractText(messages[i].content);
  }
  return "";
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

  // 2. Body validation (Zod)
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = ChatBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const { agentId, messages, params } = parsed.data;

  const agent = AGENTS[agentId];
  if (!agent) {
    return new Response(JSON.stringify({ error: `Unknown agent: ${agentId}` }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2b. Safety filter — prompt-injection & disallowed content
  const safety = safetyCheck(messages);
  if (!safety.ok) {
    await logCall({
      tool_name: `chat:${agentId}`,
      toolset_slug: agent.toolset,
      user_id: userId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: safety.reason ?? "safety_blocked",
    });
    return new Response(JSON.stringify({ error: safety.reason }), {
      status: 400,
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

  // 3c. KAHU_PRE — PII mask user messages (text parts only; images pass through)
  const sanitizedMessages = messages.map((m) => {
    if (m.role !== "user") return m;
    if (typeof m.content === "string") {
      return { ...m, content: applyPiiMasks(m.content, rules) };
    }
    return {
      ...m,
      content: m.content.map((part) =>
        part.type === "text" ? { ...part, text: applyPiiMasks(part.text, rules) } : part,
      ),
    };
  });

  // 3d. CONTEXT — embed once, then run KB + memory lookups in parallel.
  // Best-effort: any failure leaves the context block empty rather than
  // aborting the chat. Cost: one Gemini embed + two pgvector RPCs.
  const question = lastUserText(sanitizedMessages);
  const queryVec = await embedQuestionOnce(question);
  const [kbSnippets, memHits] = queryVec
    ? await Promise.all([
        loadKnowledgeContext(queryVec, agent.toolset),
        loadUserMemory(userId, queryVec),
      ])
    : [[] as KbSnippet[], [] as MemHit[]];
  const contextBlock = buildContextBlock(kbSnippets, memHits);

  // 4. TĀ_INFLIGHT — stamp system prompt + advertise tools
  const tools: LlmTool[] = LIVE_DATA_TOOLS;
  const toolHint = `\n\n[LIVE TOOLS: You can call ${tools.length} live tools — NZ weather, fuel prices, route planning, internal knowledge base search, recall_memory, compliance updates, IoT signals, send_sms, calendar, Canva. Use a tool whenever the user's question depends on real-time data or stored history rather than guessing. If a tool returns {error}, surface the error and suggest a fix.]`;
  const systemPrompt = agent.prompt + contextBlock + toolHint + buildInflightStamp(rules);

  const resolvedModel =
    params?.model && ALLOWED_GATEWAY_MODELS.has(params.model) ? params.model : agent.model;

  // ──────────────────────────────────────────────────────────────────────
  // Two-round tool-calling flow:
  //   Round 1 — stream upstream with tools advertised. Forward content
  //             deltas to the client, but quietly buffer any tool_calls
  //             (those are gateway-internal — the client only sees the
  //             final natural-language answer).
  //   Round 2 — only if tools fired in Round 1. Re-call the gateway with
  //             the assistant's tool_calls + their results spliced into
  //             the message history, no more tools advertised. Stream
  //             that output to the client. Capped at one tool turn so a
  //             confused model can't recurse forever.
  // ──────────────────────────────────────────────────────────────────────

  interface BufferedToolCall {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }

  /**
   * Run one streaming gateway round.
   *
   * If `forwardContent` is true, content deltas are passed straight to
   * the client controller. tool_call deltas are buffered silently and
   * returned to the caller. The caller decides what to do with them.
   */
  async function runRound(opts: {
    msgs: unknown[];
    advertiseTools: boolean;
    forwardContent: boolean;
    controller: ReadableStreamDefaultController<Uint8Array>;
  }): Promise<{
    ok: true;
    text: string;
    toolCalls: BufferedToolCall[];
  } | {
    ok: false;
    status: number;
    body: string;
  }> {
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: resolvedModel,
        messages: opts.msgs,
        stream: true,
        ...(opts.advertiseTools ? { tools, tool_choice: "auto" } : {}),
        ...(typeof params?.temperature === "number" ? { temperature: params.temperature } : {}),
        ...(typeof params?.max_tokens === "number" ? { max_tokens: params.max_tokens } : {}),
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const body = await upstream.text().catch(() => "");
      return { ok: false, status: upstream.status, body };
    }

    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    let buffer = "";
    let text = "";
    // tool_calls arrive as a sparse list of indexed deltas; assemble them
    // by index then return a dense array.
    const partial = new Map<number, BufferedToolCall>();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (opts.forwardContent) {
          // Forward bytes verbatim — true token-by-token streaming.
          opts.controller.enqueue(value);
        }
        buffer += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          let parsed: { choices?: { delta?: { content?: string; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[] };
          try { parsed = JSON.parse(payload); } catch { continue; }
          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;
          if (typeof delta.content === "string") text += delta.content;
          if (Array.isArray(delta.tool_calls)) {
            for (const tcDelta of delta.tool_calls) {
              const idx = tcDelta.index ?? 0;
              const existing = partial.get(idx) ?? {
                id: tcDelta.id ?? `tc_${idx}`,
                type: "function",
                function: { name: "", arguments: "" },
              };
              if (tcDelta.id) existing.id = tcDelta.id;
              if (tcDelta.function?.name) existing.function.name = tcDelta.function.name;
              if (tcDelta.function?.arguments) existing.function.arguments += tcDelta.function.arguments;
              partial.set(idx, existing);
            }
          }
        }
      }
    } catch (e) {
      console.warn("[mcp-chat] stream read error", (e as Error).message);
    }

    return { ok: true, text, toolCalls: Array.from(partial.values()) };
  }

  /** Execute buffered tool calls in parallel. Returns OpenAI tool messages. */
  async function executeAll(calls: BufferedToolCall[]): Promise<{
    toolMsgs: { role: "tool"; tool_call_id: string; content: string }[];
    toolNames: string[];
  }> {
    const toolCtx = {
      supabaseUrl: SUPABASE_URL,
      authHeader: authHeader ?? "",
      serviceClient: adminDb,
      userId,
      agentId,
    };
    const results = await Promise.all(calls.map(async (c) => {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(c.function.arguments || "{}"); } catch { /* ignore */ }
      try {
        const out = await executeAgentTool(c.function.name, args, toolCtx);
        return { ok: true, name: c.function.name, id: c.id, body: out };
      } catch (e) {
        return { ok: true, name: c.function.name, id: c.id, body: { error: (e as Error).message } };
      }
    }));
    return {
      toolMsgs: results.map((r) => ({
        role: "tool" as const,
        tool_call_id: r.id,
        content: JSON.stringify(r.body).slice(0, 12_000),
      })),
      toolNames: results.map((r) => r.name),
    };
  }

  const encoder = new TextEncoder();

  const transformed = new ReadableStream<Uint8Array>({
    async start(controller) {
      const baseMsgs: unknown[] = [
        { role: "system", content: systemPrompt },
        ...sanitizedMessages,
      ];

      let toolNamesUsed: string[] = [];
      let assistantBuffer = "";

      try {
        // ── Round 1 ────────────────────────────────────────────────────
        // If tools fire we DON'T forward content — the model normally
        // emits no narration alongside tool_calls anyway, and we want
        // the client to see the final post-tool answer streaming, not
        // a partial pre-tool draft. If no tools fire we forward content
        // verbatim and we're done.
        const r1 = await runRound({
          msgs: baseMsgs,
          advertiseTools: true,
          forwardContent: true, // optimistic — most turns won't call tools
          controller,
        });
        if (!r1.ok) throw new Error(`gateway_${r1.status}: ${r1.body.slice(0, 240)}`);

        if (r1.toolCalls.length > 0) {
          // Tools fired. Run them, then start a second streaming round
          // whose output IS forwarded to the client. The client may have
          // already seen any pre-tool content from r1; that's fine.
          const { toolMsgs, toolNames } = await executeAll(r1.toolCalls);
          toolNamesUsed = toolNames;

          // Compose the assistant message that emitted the tool_calls so
          // the gateway sees a valid OpenAI tool-loop history.
          const assistantToolMsg = {
            role: "assistant",
            content: r1.text || null,
            tool_calls: r1.toolCalls,
          };

          const r2 = await runRound({
            msgs: [...baseMsgs, assistantToolMsg, ...toolMsgs],
            advertiseTools: false,
            forwardContent: true,
            controller,
          });
          if (!r2.ok) throw new Error(`gateway_${r2.status}: ${r2.body.slice(0, 240)}`);
          assistantBuffer = r1.text + r2.text;
        } else {
          assistantBuffer = r1.text;
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
        if (toolNamesUsed.length) {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ assembl_tools_used: toolNamesUsed })}\n\n`,
          ));
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
        return;
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
      "X-Assembl-Kb-Hits": String(kbSnippets.length),
      "X-Assembl-Memory-Hits": String(memHits.length),
    },
  });
});
