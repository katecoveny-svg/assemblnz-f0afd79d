// ═══════════════════════════════════════════════════════════════════════
// Shared server-side validation + sanitisation for the /chat edge fn.
//
// Goals:
//  1. Reject requests whose `agentId` is not in the allow-list (the union of
//     prompt keys + the frontend → prompt key mapping). Prevents callers from
//     coercing the function into running arbitrary system prompts.
//  2. Validate the overall body shape with Zod so malformed requests are
//     rejected before they reach the LLM.
//  3. Sanitise every message before forwarding to Claude / Gemini / GPT:
//     - cap individual message length (32 KB) and total payload length (256 KB)
//     - cap message count (60)
//     - strip ASCII control characters (except \n, \r, \t)
//     - strip Anthropic / OpenAI system tags that could be used to inject
//       a fake system message into the conversation history
//     - coerce content blocks to a safe shape (string | array of {type,text})
//
// Returns either a `Response` (caller returns it directly) or the parsed,
// sanitised body. Keeps the call site in chat/index.ts to a single early
// return + destructure.
// ═══════════════════════════════════════════════════════════════════════

import { z } from "https://esm.sh/zod@3.23.8";

// Hard limits — tuned for current Lovable AI Gateway / Anthropic limits.
const MAX_MESSAGES = 60;
const MAX_MESSAGE_CHARS = 32_000;
const MAX_TOTAL_CHARS = 256_000;
const MAX_AGENT_ID_LENGTH = 64;

// CORS headers must match chat/index.ts so error responses reach the browser.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Schemas ───────────────────────────────────────────────────────────
const ContentBlockSchema = z.object({
  type: z.enum(["text", "image_url"]),
  text: z.string().optional(),
  image_url: z
    .object({ url: z.string().url().max(2048) })
    .optional(),
});

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.union([z.string(), z.array(ContentBlockSchema)]),
  name: z.string().max(64).optional(),
  tool_call_id: z.string().max(128).optional(),
});

const BodySchema = z.object({
  agentId: z
    .string()
    .min(1)
    .max(MAX_AGENT_ID_LENGTH)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "agentId may only contain letters, digits, underscore, hyphen.",
    }),
  messages: z.array(MessageSchema).max(MAX_MESSAGES).optional().default([]),
  brandContext: z.unknown().optional(),
  brandLogoUrl: z.string().url().max(2048).optional().nullable(),
  teReoPrompt: z.string().max(2000).optional().nullable(),
  propertyMode: z.string().max(64).optional().nullable(),
  model: z.string().max(128).optional().nullable(),
  getSystemPrompt: z.boolean().optional(),
  receptionistMode: z.boolean().optional(),
});

export type ValidatedChatBody = z.infer<typeof BodySchema>;

// ─── Sanitisation ──────────────────────────────────────────────────────
// Strip ASCII control chars except common whitespace; drop zero-width chars
// that LLMs sometimes interpret as token boundaries; strip provider-specific
// system tags that could be used for prompt injection.
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const ZERO_WIDTH_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const INJECTION_TAGS_RE =
  /<\/?\s*(?:system|assistant|user|tool|human|s|h)\s*>/gi;
// Anthropic-specific Human:/Assistant: turn markers.
const TURN_MARKER_RE = /\b(?:Human|Assistant)\s*:\s*/g;

const sanitiseString = (s: string): string =>
  s
    .replace(CONTROL_CHARS_RE, "")
    .replace(ZERO_WIDTH_RE, "")
    .replace(INJECTION_TAGS_RE, "")
    .replace(TURN_MARKER_RE, "")
    .slice(0, MAX_MESSAGE_CHARS);

const sanitiseContent = (
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>,
): string | Array<{ type: string; text?: string; image_url?: { url: string } }> => {
  if (typeof content === "string") return sanitiseString(content);
  return content.map((block) => {
    if (block.type === "text" && typeof block.text === "string") {
      return { ...block, text: sanitiseString(block.text) };
    }
    return block;
  });
};

const measureContent = (
  content: string | Array<{ type: string; text?: string }>,
): number => {
  if (typeof content === "string") return content.length;
  return content.reduce((n, b) => n + (b.text?.length ?? 0), 0);
};

// ─── Helper: JSON error response ───────────────────────────────────────
const errorResponse = (
  status: number,
  payload: Record<string, unknown>,
): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ─── Public API ────────────────────────────────────────────────────────
export type ValidationContext = {
  /** Allow-list of agent IDs accepted from the client.
   *  Built in chat/index.ts as Object.keys(agentPrompts) ∪ Object.keys(AGENT_ID_TO_PROMPT_KEY). */
  allowedAgentIds: ReadonlySet<string>;
  /** Short request id for log correlation. */
  requestId: string;
};

/**
 * Parse + validate + sanitise a /chat request body.
 *
 * On success returns `{ ok: true, body }` with the sanitised body (messages
 * have been cleaned, oversized strings clipped). On failure returns
 * `{ ok: false, response }` — the caller should return that Response as-is.
 */
export const validateChatRequest = async (
  req: Request,
  ctx: ValidationContext,
): Promise<
  | { ok: true; body: ValidatedChatBody }
  | { ok: false; response: Response }
> => {
  // 1. Parse JSON safely.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: errorResponse(400, {
        error: "Invalid JSON",
        detail: "Request body must be valid JSON.",
        requestId: ctx.requestId,
      }),
    };
  }

  // 2. Schema validation.
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(
      `[chat:${ctx.requestId}] schema validation failed`,
      JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    return {
      ok: false,
      response: errorResponse(400, {
        error: "Invalid request body",
        detail: parsed.error.flatten().fieldErrors,
        requestId: ctx.requestId,
      }),
    };
  }
  const body = parsed.data;

  // 3. Agent allow-list — the security-critical check.
  if (!ctx.allowedAgentIds.has(body.agentId)) {
    console.warn(
      `[chat:${ctx.requestId}] rejected agentId not on allow-list`,
      JSON.stringify({ agentId: body.agentId }),
    );
    return {
      ok: false,
      response: errorResponse(403, {
        error: "Agent not allowed",
        detail: `agentId "${body.agentId}" is not on the server allow-list.`,
        requestId: ctx.requestId,
      }),
    };
  }

  // 4. Total payload size guard.
  const totalChars = body.messages.reduce(
    (n, m) => n + measureContent(m.content),
    0,
  );
  if (totalChars > MAX_TOTAL_CHARS) {
    return {
      ok: false,
      response: errorResponse(413, {
        error: "Payload too large",
        detail: `Total message content is ${totalChars} chars, max is ${MAX_TOTAL_CHARS}.`,
        requestId: ctx.requestId,
      }),
    };
  }

  // 5. Sanitise every message before forwarding.
  const sanitisedMessages = body.messages.map((m) => ({
    ...m,
    content: sanitiseContent(m.content),
  }));

  return {
    ok: true,
    body: { ...body, messages: sanitisedMessages },
  };
};

// Exported for tests + caller-side reuse.
export const __internals = {
  sanitiseString,
  sanitiseContent,
  BodySchema,
  MAX_MESSAGES,
  MAX_MESSAGE_CHARS,
  MAX_TOTAL_CHARS,
};
