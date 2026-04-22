/**
 * Shared Agent Router helper.
 *
 * Routing strategy:
 * 1. If the agent is registered in /mcp-chat (Mana Trust Layer agents:
 *    toro, manaaki, waihanga, auaha, pakihi, pikau), stream through
 *    /mcp-chat with the user's auth token. This is the new secure path
 *    with PII masking, tier gates, rate limits, tikanga stamp, and
 *    mana-post rewrites.
 * 2. Otherwise fall back to the legacy /agent-router for full skill
 *    wiring, memory, symbiotic context, and governance (uses anon key).
 *
 * Includes Privacy Shield PII scrubbing client-side and Global Brand DNA
 * injection across ALL agents on the legacy router path.
 */

import { searchMemory, buildMemoryBlock } from "@/lib/searchMemory";
import { scrubPII } from "@/lib/privacyShield";
import { streamMcpChat } from "@/lib/mcpChat";
import { supabase } from "@/integrations/supabase/client";

const AGENT_ROUTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`;

/** Agents registered in the /mcp-chat edge function. Must match AGENTS map there. */
const MCP_AGENTS = new Set(["toro", "manaaki", "waihanga", "auaha", "pakihi", "pikau"]);

/** Global Brand DNA injection — set by BrandDnaContext, read by every agentChat call */
let _globalBrandPrompt: string = "";
export function setGlobalBrandPrompt(prompt: string) {
  _globalBrandPrompt = prompt;
}
export function getGlobalBrandPrompt(): string {
  return _globalBrandPrompt;
}

/** Optional model parameters surfaced to users via the in-chat settings panel. */
export interface AgentChatParams {
  temperature?: number;
  max_tokens?: number;
}

interface AgentChatOptions {
  agentId: string;
  message: string;
  messages?: { role: string; content: string }[];
  packId?: string;
  systemPrompt?: string;
  /** If provided, search memory for this user and inject relevant context */
  userId?: string;
  /** Skip memory injection even if userId is set */
  skipMemory?: boolean;
  /** Skip Brand DNA injection for this call */
  skipBrandDna?: boolean;
  /** Optional per-call model tuning (forwarded to /mcp-chat). */
  params?: AgentChatParams;
}

/** True if this agent should be streamed through the new /mcp-chat pipeline. */
function isMcpAgent(agentId: string, packId?: string): boolean {
  if (MCP_AGENTS.has(agentId)) return true;
  // Some kete dashboards use a sub-agent id (e.g. "aura") with packId="manaaki".
  // Route on packId when it matches a known kete.
  if (packId && MCP_AGENTS.has(packId)) return true;
  return false;
}

/**
 * One-shot (non-streaming) call. Collects the full SSE stream and
 * returns the complete response text.
 */
export async function agentChat(opts: AgentChatOptions): Promise<string> {
  const { agentId, message, messages = [], packId, params } = opts;

  // New path: stream through /mcp-chat and accumulate.
  if (isMcpAgent(agentId, packId)) {
    let buffer = "";
    let final: string | null = null;
    let errMsg: string | null = null;
    const mcpAgent = MCP_AGENTS.has(agentId) ? agentId : (packId as string);
    await streamMcpChat({
      agentId: mcpAgent,
      messages: [...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user", content: message }],
      params,
      onDelta: (chunk) => { buffer += chunk; },
      onDone: (finalContent) => { final = finalContent; },
      onError: (e) => { errMsg = e.message; },
    });
    if (errMsg) throw new Error(errMsg);
    return final ?? buffer ?? "Sorry, I couldn't generate a response. Please try again.";
  }

  // Legacy path — agent-router with full skill wiring.
  return legacyAgentChat(opts);
}

/**
 * Streaming call. Calls onDelta for each token chunk, onDone when complete.
 */
export async function agentChatStream({
  agentId,
  message,
  messages = [],
  packId,
  systemPrompt,
  userId,
  skipMemory,
  params,
  onDelta,
  onDone,
  onError,
}: AgentChatOptions & {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}): Promise<void> {
  // New path: /mcp-chat with auth.
  if (isMcpAgent(agentId, packId)) {
    const mcpAgent = MCP_AGENTS.has(agentId) ? agentId : (packId as string);
    try {
      await streamMcpChat({
        agentId: mcpAgent,
        messages: [
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user", content: message },
        ],
        params,
        onDelta,
        onDone: () => onDone(),
        onError: (e) => {
          onError?.(new Error(e.message || `Chat error (${e.status})`));
          onDone();
        },
      });
    } catch (e) {
      onError?.(e as Error);
      onDone();
    }
    return;
  }

  // Legacy path
  return legacyAgentChatStream({ agentId, message, messages, packId, systemPrompt, userId, skipMemory, onDelta, onDone, onError });
}

// ---------------------------------------------------------------------------
// Legacy /agent-router implementation (unchanged behaviour)
// ---------------------------------------------------------------------------
async function legacyAgentChat({ agentId, message, messages = [], packId, systemPrompt, userId, skipMemory, skipBrandDna }: AgentChatOptions): Promise<string> {
  const { scrubbed: scrubbedMessage } = scrubPII(message);
  const scrubbedMessages = messages.map((m) =>
    m.role === "user" ? { ...m, content: scrubPII(m.content).scrubbed } : m,
  );

  let enrichedPrompt = systemPrompt;
  if (!skipBrandDna && _globalBrandPrompt) {
    enrichedPrompt = (enrichedPrompt || "") + _globalBrandPrompt;
  }

  if (userId && !skipMemory) {
    try {
      const memories = await searchMemory(userId, scrubbedMessage, agentId, 3);
      const block = buildMemoryBlock(memories);
      if (block) enrichedPrompt = (enrichedPrompt || "") + block;
    } catch { /* non-blocking */ }
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const resp = await fetch(AGENT_ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      message: scrubbedMessage,
      agentId,
      packId: packId || agentId,
      messages: scrubbedMessages,
      ...(enrichedPrompt ? { systemPromptOverride: enrichedPrompt } : {}),
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error("Rate limited — please try again shortly.");
    if (resp.status === 402) throw new Error("AI credits exhausted. Please top up.");
    if (resp.status === 401) throw new Error("Unauthorized — please sign in.");
    throw new Error(`Agent error: ${resp.status}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) result += c;
      } catch { /* partial JSON, skip */ }
    }
  }

  return result || "Sorry, I couldn't generate a response. Please try again.";
}

async function legacyAgentChatStream({
  agentId,
  message,
  messages = [],
  packId,
  systemPrompt,
  userId,
  skipMemory,
  onDelta,
  onDone,
  onError,
}: AgentChatOptions & {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}): Promise<void> {
  try {
    const { scrubbed: scrubbedMessage } = scrubPII(message);
    const scrubbedMessages = messages.map((m) =>
      m.role === "user" ? { ...m, content: scrubPII(m.content).scrubbed } : m,
    );

    let enrichedPrompt = systemPrompt;
    if (_globalBrandPrompt) enrichedPrompt = (enrichedPrompt || "") + _globalBrandPrompt;

    if (userId && !skipMemory) {
      try {
        const memories = await searchMemory(userId, scrubbedMessage, agentId, 3);
        const block = buildMemoryBlock(memories);
        if (block) enrichedPrompt = (enrichedPrompt || "") + block;
      } catch { /* non-blocking */ }
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const resp = await fetch(AGENT_ROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: scrubbedMessage,
        agentId,
        packId: packId || agentId,
        messages: scrubbedMessages,
        ...(enrichedPrompt ? { systemPromptOverride: enrichedPrompt } : {}),
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) throw new Error("Rate limited — please try again shortly.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please top up.");
      if (resp.status === 401) throw new Error("Unauthorized — please sign in.");
      throw new Error(`Agent error: ${resp.status}`);
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch { /* partial JSON */ }
      }
    }

    onDone();
  } catch (e: any) {
    onError?.(e);
    onDone();
  }
}
