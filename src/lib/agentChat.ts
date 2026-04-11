/**
 * Shared Agent Router helper — replaces all legacy supabase.functions.invoke("chat") calls.
 * Routes through agent-router for full skill wiring, memory, symbiotic context, and governance.
 */

const AGENT_ROUTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`;

interface AgentChatOptions {
  agentId: string;
  message: string;
  messages?: { role: string; content: string }[];
  packId?: string;
  systemPrompt?: string;
}

/**
 * One-shot (non-streaming) call to agent-router.
 * Collects the full SSE stream and returns the complete response text.
 */
export async function agentChat({ agentId, message, messages = [], packId, systemPrompt }: AgentChatOptions): Promise<string> {
  const resp = await fetch(AGENT_ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      message,
      agentId,
      packId: packId || agentId,
      messages,
      ...(systemPrompt ? { systemPromptOverride: systemPrompt } : {}),
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

/**
 * Streaming call to agent-router.
 * Calls onDelta for each token chunk, onDone when complete.
 */
export async function agentChatStream({
  agentId,
  message,
  messages = [],
  packId,
  systemPrompt,
  onDelta,
  onDone,
  onError,
}: AgentChatOptions & {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}): Promise<void> {
  try {
    const resp = await fetch(AGENT_ROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        message,
        agentId,
        packId: packId || agentId,
        messages,
        ...(systemPrompt ? { systemPromptOverride: systemPrompt } : {}),
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
