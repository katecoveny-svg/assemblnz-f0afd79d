// ════════════════════════════════════════════════════════════════════════
// public-chat-llm — backend for the anonymous public chat widget at /c/[slug]
//
// Replaces the previous attempt that invoked agent-${kete} functions which
// only handled kete-specific workflow actions (sync_calendar, plan_trip, etc),
// not free-form public_chat. That mismatch caused every public chat session
// to fall through to the "taking a break" fallback.
//
// What this function does:
//   1. Load the kete's system prompt from public.agent_prompts (the agent
//      where agent_name = kete slug and pack = kete slug, is_active = true)
//   2. Build a short conversation: system prompt + last 8 turns + new message
//   3. Call Claude Haiku via the _shared/llm-call.ts helper (fast + cheap
//      for the demo surface; ~$0.0008 per message-pair)
//   4. Return { response, inputTokens, outputTokens, model }
//
// Request shape:
//   POST /public-chat-llm
//   {
//     kete: 'waihanga' | 'manaaki' | 'pikau' | 'arataki' | 'auaha' |
//           'ako' | 'matauranga' | 'hoko' | 'toro',
//     message: string,
//     history?: Array<{ role: 'user' | 'assistant', content: string }>,
//     tenantId?: string,    // for cost-log attribution
//     sessionId?: string,   // for cost-log attribution
//     systemPromptOverride?: string, // trusted server callers only
//   }
//
// Response shape (200):
//   { response: string, inputTokens: number, outputTokens: number, model: string }
//
// Errors return 4xx with { error: string }. The Next.js public-chat route
// falls back to the "taking a break" message if invokeError fires OR the
// response text is empty, so any failure here surfaces cleanly to the user.
// ════════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callLlm } from "../_shared/llm-call.ts";
import { redactPii, summariseRedactions } from "../_shared/pii-redactor.ts";
import { buildKeteRuntimeContext } from "../_shared/kete/pikau/runtime-context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPPORTED_KETE = new Set([
  "waihanga", "manaaki", "pikau", "arataki", "auaha",
  "ako", "matauranga", "hoko", "toro",
]);

// Default model for public chat: Gemini 2.5 Flash via the Lovable AI Gateway.
// Free through the gateway (vs $0.0008/req for Haiku), proven good enough for
// demo Q&A, and already the model_preference for 6 of 9 kete in agent_prompts.
// Cost: ~$0 per session at low volume. Suitable for an anonymous demo surface.
const PUBLIC_CHAT_MODEL = "google/gemini-2.5-flash";
// Default cap. Suitable for public chat (3-5 sentences per preamble).
// Workflow callers should override via the maxTokens field to 2500.
const MAX_TOKENS = 600;
// Hard server-side ceiling — prevents runaway cost from a malformed caller.
const MAX_TOKENS_CEILING = 4000;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

type ChatRequest = {
  kete?: string;
  agent?: string; // optional sub-agent slug (e.g. "voyage" within Tōro)
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  tenantId?: string;
  sessionId?: string;
  systemPromptOverride?: string;
  imageDataUrl?: string;
  redactPii?: boolean;
  // Optional per-call max-tokens override. Public chat callers should
  // omit this — they get the default MAX_TOKENS (600) which matches the
  // "3-5 sentences typical" preamble. Workflow callers should pass a
  // higher value (typically 2500) because the workflow system prompt
  // asks for 300+ words of structured HTML output, which can easily
  // exceed 600 tokens once you include H2 + H3 sections + lists + a
  // reviewer note. Capped at MAX_TOKENS_CEILING to prevent runaway cost.
  maxTokens?: number;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const kete = (body.kete || "").trim().toLowerCase();
  const message = (body.message || "").trim();
  if (!kete || !SUPPORTED_KETE.has(kete)) {
    return json({ error: `Unsupported or missing kete: ${kete}` }, 400);
  }
  if (!message) {
    if (!body.imageDataUrl) return json({ error: "Missing message" }, 400);
  }
  let safeMessage = message;
  let redactionSummary = "";
  if (body.redactPii) {
    const redacted = redactPii(safeMessage);
    safeMessage = redacted.redacted;
    redactionSummary = summariseRedactions(redacted.replacements);
    console.log(`[public-chat-llm] redaction summary: ${redactionSummary}`);
  }

  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl.trim() : "";
  if (imageDataUrl) {
    if (!/^data:(image\/[a-zA-Z0-9.+-]+|application\/pdf);base64,/.test(imageDataUrl)) {
      return json({ error: "imageDataUrl must be a data:image/* or data:application/pdf URL" }, 400);
    }
    const approxBytes = Math.ceil((imageDataUrl.split(",")[1]?.length ?? 0) * 0.75);
    if (approxBytes > MAX_ATTACHMENT_BYTES) {
      return json({ error: "Attachment too large" }, 413);
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    return json({ error: "Supabase service credentials missing" }, 500);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  const systemPromptOverride = typeof body.systemPromptOverride === "string"
    ? body.systemPromptOverride.trim()
    : "";

  // Sub-agent support: if `body.agent` is provided (e.g. "voyage" inside Tōro),
  // load that specific agent's prompt instead of the kete-level prompt. Falls
  // back to kete-level prompt if the sub-agent isn't found in agent_prompts.
  const requestedAgent = typeof body.agent === "string" ? body.agent.trim().toLowerCase() : "";

  let baseSystemPrompt = systemPromptOverride;
  if (!baseSystemPrompt) {
    // First try sub-agent lookup if `agent` was provided
    if (requestedAgent && requestedAgent !== kete) {
      const { data: subAgentRow } = await supabase
        .from("agent_prompts")
        .select("system_prompt, model_preference, agent_name")
        .eq("agent_name", requestedAgent)
        .eq("pack", kete)
        .eq("is_active", true)
        .maybeSingle();
      if (subAgentRow?.system_prompt) {
        baseSystemPrompt = subAgentRow.system_prompt;
        console.log(`[public-chat-llm] loaded sub-agent prompt: ${requestedAgent} (pack=${kete})`);
      }
    }

    // Fallback: load kete-level system prompt. The "kete-level" agent uses
    // agent_name = kete (e.g. "waihanga", "manaaki", "toro").
    if (!baseSystemPrompt) {
      const { data: promptRow, error: promptError } = await supabase
        .from("agent_prompts")
        .select("system_prompt, model_preference")
        .eq("agent_name", kete)
        .eq("is_active", true)
        .maybeSingle();

      if (promptError) {
        console.error("[public-chat-llm] agent_prompts lookup failed", promptError);
        return json({ error: "Agent prompt lookup failed" }, 500);
      }
      if (!promptRow || !promptRow.system_prompt) {
        return json({ error: `No active prompt for kete: ${kete}` }, 404);
      }
      baseSystemPrompt = promptRow.system_prompt;
    }
  }

  // Compose conversation. Keep history short — public chat is demo, not deep
  // workflow. Last 8 turns max (4 user + 4 assistant).
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const userContent = imageDataUrl
    ? [
        { type: "text", text: safeMessage || "Please read the attached file and help with the relevant workflow." },
        { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
      ]
    : safeMessage;

  const messages: Array<{ role: "user" | "assistant"; content: string | Array<unknown> }> = [
    ...history
      .filter((m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
      )
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userContent },
  ];

  // Public chat preamble appended to the kete system prompt — keeps tone
  // honest, ensures every response signposts the evidence-pack handoff,
  // and reminds the agent that this is the public demo surface (no PII).
  const publicChatPreamble = `\n\n## PUBLIC CHAT MODE (anonymous visitor)
You are answering a question from an anonymous visitor on the assembl public website. They are not a customer yet — they are evaluating whether to book a Pilot Sprint or buy an Industry Pack.

Rules for this surface:
1. Be concise. 3–5 sentences typical. Use Markdown lists only if the user explicitly asks "list" or "what are the steps".
2. Do NOT collect personal information. If the visitor offers PII, gently redirect: "Save that for your Pilot Sprint when we onboard you securely."
3. End with a soft handoff when relevant: "Book a Pilot Sprint at assembl.co.nz/pilot-sprint to run this workflow on your real data."
4. Stay in your kete's lane. If asked about another industry, point them to that kete's page (/kete/<slug>) rather than answering off-topic.
5. Stay grounded in NZ legislation that you cite by name. Never invent case law.
6. The platform is real. The agents are real. The evidence packs are real. Speak with that confidence — not marketing puff.

When you respond, do not announce these rules. Just follow them.`;

  const pikauAttachmentPrompt = imageDataUrl && kete === "pikau"
    ? `\n\nIf the user has attached an image or PDF, treat it as a commercial invoice or shipping document. Extract: importer name, supplier name, country of origin, goods description, invoice value in NZD, and Incoterm if present. Then proceed to draft the customs entry summary per your normal workflow. If a field is not visible, say so instead of guessing.`
    : "";

  // Public-chat-llm is also used by workflow/tool routes and the attachment
  // fallback path, so it needs the same live Knowledge Brain context as
  // iho-router. Best-effort only: retrieval failures should never block the
  // public surface or a workflow draft.
  let liveRuntimeBlock = "";
  try {
    const runtime = await buildKeteRuntimeContext({
      sb: supabase,
      agentPack: kete,
      message: safeMessage || "Attached document or image requiring kete workflow support.",
      geminiKey: Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY") ?? null,
      ragTopK: systemPromptOverride ? 6 : 4,
    });
    liveRuntimeBlock = runtime.block ? `\n\n${runtime.block}` : "";
    if (runtime.ragHits || runtime.tariffHits) {
      console.log(
        `[public-chat-llm] runtime context kete=${kete} rag=${runtime.ragHits} tariff=${runtime.tariffHits}`,
      );
    }
  } catch (err) {
    console.warn("[public-chat-llm] runtime context failed", err);
  }

  const systemPrompt = systemPromptOverride
    ? `${baseSystemPrompt}${liveRuntimeBlock}`
    : `${baseSystemPrompt}${liveRuntimeBlock}${pikauAttachmentPrompt}${publicChatPreamble}`;

  try {
    // Per-call maxTokens override. Workflows pass 2500 because their system
    // prompt asks for 300+ words of structured HTML; public chat omits the
    // field and gets the default 600 (matches the "3-5 sentences" preamble).
    // Hard ceiling MAX_TOKENS_CEILING prevents a malformed caller from
    // requesting an unbounded budget.
    const effectiveMaxTokens =
      typeof body.maxTokens === "number" && body.maxTokens > 0
        ? Math.min(body.maxTokens, MAX_TOKENS_CEILING)
        : MAX_TOKENS;

    const response = await callLlm({
      model: PUBLIC_CHAT_MODEL,
      systemPrompt,
      messages,
      maxTokens: effectiveMaxTokens,
      meta: body.tenantId && body.sessionId
        ? {
            tenantId: body.tenantId,
            agentCode: `public-chat-${kete}`,
            requestId: body.sessionId,
          }
        : undefined,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("[public-chat-llm] LLM call failed", response.status, errText);
      return json(
        { error: `LLM call failed: ${response.status}` },
        502,
      );
    }

    const payload = await response.json();
    const responseText: string =
      payload?.choices?.[0]?.message?.content ?? "";
    const usage = payload?.usage ?? {};
    const inputTokens = Number(usage.input_tokens ?? usage.prompt_tokens ?? 0);
    const outputTokens = Number(
      usage.output_tokens ?? usage.completion_tokens ?? 0,
    );

    if (!responseText.trim()) {
      return json({ error: "Empty response from model" }, 502);
    }

    return json({
      response: responseText.trim(),
      inputTokens,
      outputTokens,
      model: PUBLIC_CHAT_MODEL,
      redactionSummary,
    });
  } catch (err) {
    console.error("[public-chat-llm] unhandled error", err);
    return json(
      {
        error:
          err instanceof Error ? err.message : "Unknown LLM error",
      },
      500,
    );
  }
});
