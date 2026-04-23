// ═══════════════════════════════════════════════════════════════════════
// Second routing layer — provider dispatcher.
//
// The Lovable AI Gateway only natively supports `google/*` and `openai/*`
// models. For agents whose `agent_prompts.model_preference` resolves to
// `anthropic/*` or `perplexity/*`, we MUST call those providers directly
// instead of routing through the gateway (which would 400 and silently
// downgrade to gemini-flash-lite).
//
// This helper takes a fully-qualified resolved model string and returns a
// normalised OpenAI-style chat completion response, regardless of which
// underlying provider was used. The caller (chat/index.ts) is provider-
// agnostic — it just inspects `data.choices[0].message` like before.
// ═══════════════════════════════════════════════════════════════════════

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<unknown>;
  tool_calls?: unknown[];
  tool_call_id?: string;
  name?: string;
};

export type LlmCallOptions = {
  model: string;                  // fully-qualified, e.g. "anthropic/claude-opus-4-6"
  systemPrompt: string;
  messages: ChatMessage[];        // the user/assistant turn history (no system message)
  maxTokens?: number;
  tools?: unknown[];              // OpenAI-style tools — only forwarded for gateway calls
};

export type Provider = "gateway" | "anthropic" | "perplexity";

export function detectProvider(model: string): Provider {
  if (model.startsWith("anthropic/")) return "anthropic";
  if (model.startsWith("perplexity/")) return "perplexity";
  return "gateway"; // google/* + openai/* + anything else
}

/**
 * Call the appropriate LLM provider and return a standard `Response`
 * whose JSON body matches the OpenAI chat-completion shape:
 *   { choices: [{ message: { role, content, tool_calls? } }], usage: {...} }
 *
 * Always returns a Response — even on provider errors — so callers can
 * inspect `.ok` / `.status` exactly as they do for the gateway today.
 */
export async function callLlm(opts: LlmCallOptions): Promise<Response> {
  const provider = detectProvider(opts.model);
  switch (provider) {
    case "anthropic":  return callAnthropic(opts);
    case "perplexity": return callPerplexity(opts);
    default:           return callGateway(opts);
  }
}

// ─── Lovable AI Gateway (google/* + openai/*) ─────────────────────────
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

// ─── Anthropic direct (anthropic/*) ───────────────────────────────────
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
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
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

// ─── Perplexity direct (perplexity/*) ─────────────────────────────────
async function callPerplexity(opts: LlmCallOptions): Promise<Response> {
  // Prefer dedicated PERPLEXITY_API_KEY; OPENROUTER_API_KEY is a fallback
  // because some workspaces store the Perplexity key under that name.
  const key = Deno.env.get("PERPLEXITY_API_KEY") ?? Deno.env.get("OPENROUTER_API_KEY");
  if (!key) return errResponse(500, "PERPLEXITY_API_KEY (or OPENROUTER_API_KEY) not configured");

  const modelId = opts.model.replace(/^perplexity\//, "");

  // Perplexity is OpenAI-compatible. It also rejects role:"tool" entries.
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

  // Perplexity already returns OpenAI-shaped JSON — pass through, but ensure
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

// ─── helpers ──────────────────────────────────────────────────────────
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
function errResponse(status: number, message: string): Response {
  return jsonResponse(status, { error: message });
}
