// ════════════════════════════════════════════════════════════════════════
// Second routing layer — provider dispatcher.
//
// The Lovable Gateway only natively supports `google/*` and `openai/*`
// models. For agents whose `agent_prompts.model_preference` resolves to
// `anthropic/*` or `perplexity/*`, we MUST call those providers directly
// instead of routing through the gateway (which would 400 and silently
// downgrade to gemini-flash-lite).
//
// This helper takes a fully-qualified resolved model string and returns a
// normalised chat-completion response, regardless of which
// underlying provider was used. The caller (chat/index.ts) is provider-
// agnostic — it just inspects `data.choices[0].message` like before.
//
// COST LOGGING (Kaihanga, 1 May 2026):
// Pass `meta` on LlmCallOptions and every successful or failed call is
// logged to public.agent_cost_log via cost-logger.ts. Backward-compatible:
// callers that don't pass `meta` still work, just without logging.
// ════════════════════════════════════════════════════════════════════════

import { logCost } from "./cost-logger.ts";
import { chatWithGemini, type GeminiModelKey } from "./gemini-provider.ts";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<unknown>;
  tool_calls?: unknown[];
  tool_call_id?: string;
  name?: string;
};

export type LlmCallMeta = {
  /** Tenant UUID for per-tenant gross-margin tracking. */
  tenantId: string;
  /** Agent slug (e.g. "arai", "kaupapa") for per-agent rollups. */
  agentCode: string;
  /** Optional correlation id for multi-agent run tracing. */
  requestId?: string;
  /** Optional parent request id for cross-agent handoff trees. */
  parentRequestId?: string;
};

export type LlmCallOptions = {
  model: string;                          // fully-qualified, e.g. "anthropic/claude-opus-4-6"
  systemPrompt: string;
  messages: ChatMessage[];                // the user/assistant turn history (no system message)
  maxTokens?: number;
  tools?: unknown[];                      // Tool definitions — only forwarded for gateway calls
  /** Optional cost-logging metadata. When provided, every call is logged. */
  meta?: LlmCallMeta;
};

export type Provider = "google" | "openai-gateway" | "anthropic" | "perplexity";
type OpenAiMediaBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: string } };

export function detectProvider(model: string): Provider {
  if (model.startsWith("anthropic/")) return "anthropic";
  if (model.startsWith("perplexity/")) return "perplexity";
  if (model.startsWith("google/")) return "google";
  return "openai-gateway";
}

/**
 * Call the appropriate LLM provider and return a standard `Response`
 * whose JSON body matches the OpenAI chat-completion shape:
 *   { choices: [{ message: { role, content, tool_calls? } }], usage: {...} }
 *
 * Always returns a Response — even on provider errors — so callers can
 * inspect `.ok` / `.status` exactly as they do for the gateway today.
 *
 * If `opts.meta` is provided, writes one row to public.agent_cost_log per
 * call (success or error). Cost logging is fire-and-forget and never
 * throws — caller never sees logging-related errors.
 */
export async function callLlm(opts: LlmCallOptions): Promise<Response> {
  const provider = detectProvider(opts.model);
  const start = Date.now();

  let response: Response;
  switch (provider) {
    case "anthropic":  response = await callAnthropic(opts); break;
    case "perplexity": response = await callPerplexity(opts); break;
    case "google": {
      response = await callGoogleDirect(opts);
      if (response.status === 502 || response.status === 503) {
        console.warn("[llm-call] Google direct returned", response.status, "— falling back to Lovable Gateway");
        const fallback = await callGateway(opts);
        const headers = new Headers(fallback.headers);
        headers.set("X-LLM-Provider", "lovable-fallback");
        response = new Response(fallback.body, { status: fallback.status, headers });
      }
      break;
    }
    case "openai-gateway":
    default: response = await callGateway(opts); break;
  }

  // Cost logging — fire-and-forget. Never blocks the caller.
  if (opts.meta?.tenantId && opts.meta?.agentCode) {
    logCallCost(response, opts, Date.now() - start).catch((err) => {
      console.error("[llm-call] cost logging failed:", err);
    });
  }

  return response;
}

/**
 * Read the response body once (via clone, so the caller still gets the
 * original) and write a row to agent_cost_log. Never throws.
 */
async function logCallCost(response: Response, opts: LlmCallOptions, latencyMs: number): Promise<void> {
  const meta = opts.meta!;
  if (!response.ok) {
    await logCost({
      tenantId: meta.tenantId,
      agentCode: meta.agentCode,
      model: opts.model,
      tokensIn: 0,
      tokensOut: 0,
      latencyMs,
      requestId: meta.requestId,
      parentRequestId: meta.parentRequestId,
      status: "error",
      errorCode: `http_${response.status}`,
    });
    return;
  }

  // Clone so we don't consume the body the caller will read.
  const clone = response.clone();
  let usage: { prompt_tokens?: number; completion_tokens?: number } = {};
  try {
    const data = await clone.json();
    usage = data?.usage ?? {};
  } catch {
    // body wasn't JSON or already consumed — log with zeros, status completed
  }

  await logCost({
    tenantId: meta.tenantId,
    agentCode: meta.agentCode,
    model: opts.model,
    tokensIn: usage.prompt_tokens ?? 0,
    tokensOut: usage.completion_tokens ?? 0,
    latencyMs,
    requestId: meta.requestId,
    parentRequestId: meta.parentRequestId,
    status: "completed",
  });
}

async function callGoogleDirect(opts: LlmCallOptions): Promise<Response> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) {
    return jsonResponse(503, { error: "GEMINI_API_KEY_NOT_SET" });
  }

  const shortName = opts.model.replace(/^google\//, "");
  const modelKey: GeminiModelKey =
    shortName.includes("flash-image") ? "gemini-2.5-flash" :
    shortName.includes("3.1-pro") ? "gemini-2.5-pro" :
    shortName.includes("3-flash") ? "gemini-3-flash" :
    shortName.includes("2.5-pro") ? "gemini-2.5-pro" :
    shortName.includes("flash-lite") ? "gemini-2.5-flash" :
    "gemini-2.5-flash";

  try {
    const text = await chatWithGemini(
      modelKey,
      opts.systemPrompt,
      opts.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { maxTokens: opts.maxTokens },
    );

    if (!text.trim()) {
      return jsonResponse(502, { error: "GEMINI_DIRECT_EMPTY" });
    }

    const inputWords = opts.systemPrompt.split(/\s+/).length +
      opts.messages.reduce((sum, message) => {
        const content = typeof message.content === "string" ? message.content : "";
        return sum + content.split(/\s+/).length;
      }, 0);
    const outputWords = text.split(/\s+/).length;
    const normalised = {
      id: `gemini-direct-${crypto.randomUUID()}`,
      model: opts.model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      }],
      usage: {
        prompt_tokens: Math.ceil(inputWords * 1.35),
        completion_tokens: Math.ceil(outputWords * 1.35),
        total_tokens: Math.ceil((inputWords + outputWords) * 1.35),
      },
    };

    return jsonResponse(200, normalised, { "X-LLM-Provider": "google-direct" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown Google direct error";
    console.error("[llm-call] Google direct failed, will fall back:", detail);
    return jsonResponse(502, { error: "GEMINI_DIRECT_FAILED", detail });
  }
}

// ─── Lovable Gateway (openai/* fallback path) ─────────────────────────────
async function callGateway(opts: LlmCallOptions): Promise<Response> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return errResponse(500, "LOVABLE_API_KEY not configured");
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: opts.model,
      messages: [{ role: "system", content: opts.systemPrompt }, ...opts.messages],
      max_tokens: opts.maxTokens ?? 4096,
      ...(opts.tools && opts.tools.length > 0 ? { tools: opts.tools } : {}),
    }),
  });
}

// ─── Anthropic direct (anthropic/*) ──────────────────────────────
async function callAnthropic(opts: LlmCallOptions): Promise<Response> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return errResponse(500, "ANTHROPIC_API_KEY not configured");

  const modelId = opts.model.replace(/^anthropic\//, "");

  // Anthropic requires `system` as a top-level field, not inside messages.
  // It also rejects role:"tool" and role:"system" inside the messages array.
  const cleanedMessages = opts.messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({
      role: m.role,
      content: contentToAnthropic(m.content),
    }));

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelId,
      system: opts.systemPrompt,
      messages: cleanedMessages,
      max_tokens: opts.maxTokens ?? 4096,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("[anthropic] error", upstream.status, text);
    return errResponse(upstream.status, `Anthropic error: ${text.slice(0, 300)}`);
  }

  const raw = await upstream.json();
  const text = Array.isArray(raw?.content)
    ? raw.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("\n")
    : "";
  const normalised = {
    id: raw?.id,
    model: raw?.model,
    choices: [{
      index: 0,
      message: { role: "assistant", content: text },
      finish_reason: raw?.stop_reason ?? "stop",
    }],
    usage: {
      prompt_tokens:    raw?.usage?.input_tokens ?? 0,
      completion_tokens: raw?.usage?.output_tokens ?? 0,
      total_tokens: (raw?.usage?.input_tokens ?? 0) + (raw?.usage?.output_tokens ?? 0),
    },
  };
  return jsonResponse(200, normalised);
}

// ─── Perplexity direct (perplexity/*) ──────────────────────────
async function callPerplexity(opts: LlmCallOptions): Promise<Response> {
  // Prefer dedicated PERPLEXITY_API_KEY; OPENROUTER_API_KEY is a fallback
  // because some workspaces store the Perplexity key under that name.
  const key = Deno.env.get("PERPLEXITY_API_KEY") ?? Deno.env.get("OPENROUTER_API_KEY");
  if (!key) return errResponse(500, "PERPLEXITY_API_KEY (or OPENROUTER_API_KEY) not configured");

  const modelId = opts.model.replace(/^perplexity\//, "");

  // Perplexity follows the same chat-completions shape. It also rejects role:"tool" entries.
  const cleanedMessages = opts.messages
    .filter(m => m.role === "user" || m.role === "assistant" || m.role === "system")
    .map(m => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }));

  const upstream = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "system", content: opts.systemPrompt }, ...cleanedMessages],
      max_tokens: opts.maxTokens ?? 4096,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("[perplexity] error", upstream.status, text);
    return errResponse(upstream.status, `Perplexity error: ${text.slice(0, 300)}`);
  }

  // Perplexity already returns chat-completion JSON — pass through, but ensure
  // citations (if any) are appended to the assistant content for transparency.
  const raw = await upstream.json();
  const msg = raw?.choices?.[0]?.message ?? { role: "assistant", content: "" };
  if (Array.isArray(raw?.citations) && raw.citations.length > 0) {
    const cites = raw.citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n");
    msg.content = `${msg.content ?? ""}\n\nSources:\n${cites}`.trim();
  }
  const normalised = {
    id: raw?.id,
    model: raw?.model,
    choices: [{ index: 0, message: msg, finish_reason: raw?.choices?.[0]?.finish_reason ?? "stop" }],
    usage: raw?.usage ?? {},
  };
  return jsonResponse(200, normalised);
}

// ─── helpers ──────────────────────────────────────────────────
function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
  });
}
function errResponse(status: number, message: string): Response {
  return jsonResponse(status, { error: message });
}

function dataUrlParts(url: string): { mimeType: string; data: string } | null {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(url);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function contentToAnthropic(content: ChatMessage["content"]): string | unknown[] {
  if (typeof content === "string") return content;
  const blocks: unknown[] = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const item = block as OpenAiMediaBlock;
    if (item.type === "text" && typeof item.text === "string") {
      blocks.push({ type: "text", text: item.text });
      continue;
    }
    if (item.type === "image_url" && typeof item.image_url?.url === "string") {
      const parsed = dataUrlParts(item.image_url.url);
      if (!parsed) continue;
      if (parsed.mimeType === "application/pdf") {
        blocks.push({
          type: "document",
          source: { type: "base64", media_type: parsed.mimeType, data: parsed.data },
        });
      } else {
        blocks.push({
          type: "image",
          source: { type: "base64", media_type: parsed.mimeType, data: parsed.data },
        });
      }
    }
  }
  return blocks.length > 0 ? blocks : JSON.stringify(content);
}
