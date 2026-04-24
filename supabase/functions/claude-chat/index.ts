// ============================================================================
// claude-chat — streaming chat via Anthropic Claude
// ----------------------------------------------------------------------------
// Companion to /mcp-chat. The Lovable AI Gateway only serves OpenAI + Gemini,
// so when the user picks a Claude model in the in-chat settings panel we route
// here instead. Same auth model (validated JWT), same per-agent system prompt
// catalogue, same streaming SSE shape so the existing client parser
// (mcpChat.ts) works unchanged.
//
// POST { agentId, messages, model?, params? }
// Returns text/event-stream of OpenAI-compatible chunks.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import {
  deriveActionFromMessage,
  evaluateWaihangaCompliance,
  type WaihangaAction,
  type WaihangaWorld,
} from "../_shared/waihanga-compliance.ts";

const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8000;

const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(MAX_CONTENT_CHARS),
});
const ImagePartSchema = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
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

// Whitelisted Claude models surfaced in the UI picker.
const CLAUDE_MODELS = [
  "claude-opus-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
] as const;

const ParamsSchema = z
  .object({
    temperature: z.number().min(0).max(1).optional(),
    max_tokens: z.number().int().min(64).max(4096).optional(),
  })
  .optional();

const ChatBodySchema = z.object({
  agentId: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/i),
  messages: z.array(MessageSchema).min(1).max(MAX_MESSAGES),
  model: z.enum(CLAUDE_MODELS).optional(),
  params: ParamsSchema,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

// Per-agent system prompts. Mirrors AGENTS in /mcp-chat so swapping providers
// in the settings panel doesn't change the agent's persona.
const AGENT_PROMPTS: Record<string, string> = {
  toro: "You are Tōro, the Assembl family life navigator. You help busy NZ whānau coordinate school, pets, appointments, uniforms, shopping, and homework. Be warm, brief, practical. Use plain English with light te reo (kia ora, whānau, mahi). Never invent facts about the family — ask if you don't know.",
  manaaki: "You are Manaaki, Assembl's hospitality kete agent. You help NZ accommodation and food operators with bookings, guest comms, food safety, and rosters. Tikanga-aware. Always honour tapu/noa boundaries.",
  waihanga: "You are Waihanga, Assembl's construction kete agent. You help NZ builders with subbie compliance (LBP, SiteSafe, insurance), H&S, and procurement. Cite Building Act references when relevant.",
  auaha: "You are Auaha, Assembl's creative kete agent. You generate brand-aligned copy, social posts, and creative briefs for NZ businesses. Use macrons correctly. Avoid AI-cliché phrasing.",
  pakihi: "You are Pakihi, Assembl's small business kete agent. You help NZ operators with contracts (CCA 2002), invoicing, and basic compliance. Always cite the legislation when giving legal-adjacent guidance.",
  pikau: "You are Pikau, Assembl's freight & customs kete agent. You help NZ importers/exporters with declarations, MPI biosecurity, and shipment tracking. Be precise with HS codes and tariff rates.",
};

const DEFAULT_PROMPT =
  "You are an Assembl AI assistant helping a New Zealand business. Be warm, brief, and practical. Use plain English with light te reo where appropriate (kia ora, whānau, mahi). Never invent facts.";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((p: any) => p?.type === "text")
    .map((p: any) => p.text)
    .join("\n");
}

// Convert OpenAI-style messages (used everywhere else in the app) into the
// shape Anthropic expects. System messages get pulled out into a top-level
// `system` field.
function toAnthropicMessages(messages: Array<{ role: string; content: unknown }>): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: any }>;
} {
  const systemParts: string[] = [];
  const out: Array<{ role: "user" | "assistant"; content: any }> = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(extractText(m.content));
      continue;
    }
    const role = m.role === "assistant" ? "assistant" : "user";

    if (typeof m.content === "string") {
      out.push({ role, content: m.content });
      continue;
    }

    if (Array.isArray(m.content)) {
      const blocks: any[] = [];
      for (const part of m.content as any[]) {
        if (part.type === "text") {
          blocks.push({ type: "text", text: part.text });
        } else if (part.type === "image_url") {
          const url: string = part.image_url?.url ?? "";
          // Anthropic accepts base64 image blocks; pass URL-style images through
          // by converting data: URIs into the {type:"base64"} source shape.
          if (url.startsWith("data:")) {
            const match = url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              blocks.push({
                type: "image",
                source: { type: "base64", media_type: match[1], data: match[2] },
              });
            }
          } else {
            blocks.push({ type: "image", source: { type: "url", url } });
          }
        }
      }
      if (blocks.length) out.push({ role, content: blocks });
    }
  }

  return {
    system: systemParts.join("\n\n"),
    messages: out,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Claude is not configured on this server (missing ANTHROPIC_API_KEY)." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Auth — same pattern as /mcp-chat
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

  // Body validation
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
  const { agentId, messages, model, params } = parsed.data;

  const systemPrompt = AGENT_PROMPTS[agentId] ?? DEFAULT_PROMPT;
  const { system: extraSystem, messages: anthMessages } = toAnthropicMessages(messages);
  const fullSystem = extraSystem ? `${systemPrompt}\n\n${extraSystem}` : systemPrompt;

  // Anthropic always requires max_tokens; default to 1024 to match the rest of
  // the app's defaults.
  const requestBody = {
    model: model ?? DEFAULT_MODEL,
    system: fullSystem,
    messages: anthMessages,
    max_tokens: params?.max_tokens ?? 1024,
    temperature: params?.temperature ?? 0.7,
    stream: true,
  };

  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: `Upstream fetch failed: ${(e as Error).message}` }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    let detail = "";
    try {
      detail = await upstream.text();
    } catch { /* ignore */ }
    console.error("Anthropic error", upstream.status, detail);
    return new Response(
      JSON.stringify({ error: `Anthropic API error (${upstream.status})`, detail: detail.slice(0, 500) }),
      { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Translate Anthropic's SSE event stream into OpenAI-compatible
  // `data: {choices:[{delta:{content}}]}\n\n` chunks so the existing
  // client parser in mcpChat.ts works without changes.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buf.indexOf("\n")) !== -1) {
            const line = buf.slice(0, idx).trimEnd();
            buf = buf.slice(idx + 1);
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (!payload) continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                const text: string = evt.delta.text ?? "";
                if (text) send({ choices: [{ delta: { content: text } }] });
              } else if (evt.type === "message_stop") {
                // graceful end
              } else if (evt.type === "error") {
                send({ error: evt.error?.message ?? "stream error" });
              }
            } catch { /* skip partial */ }
          }
        }
      } catch (e) {
        send({ error: (e as Error).message });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
