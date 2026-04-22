/**
 * mcpChat — client helper for the secure /mcp-chat streaming endpoint.
 *
 * Streams tokens from openai/gpt-5 (via Lovable AI Gateway) through the
 * Mana Trust Layer (kahu_pre PII + tier gate, ta_inflight stamp,
 * mana_post rewrite). Caller passes onDelta to render tokens as they arrive
 * and onDone for cleanup. Final assistant text may be patched on close
 * (via `assembl_mana_patch.final_content`) — caller should replace the
 * buffer with that text when present.
 */
import { supabase } from "@/integrations/supabase/client";

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };

export type ChatMsg = { role: "user" | "assistant"; content: string | ContentPart[] };

export type StreamArgs = {
  agentId: "toro" | "manaaki" | "waihanga" | "auaha" | "pakihi" | "pikau" | string;
  messages: ChatMsg[];
  onDelta: (chunk: string) => void;
  onDone: (finalContent: string) => void;
  onError?: (err: { status: number; message: string }) => void;
  signal?: AbortSignal;
};

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-chat`;

export async function streamMcpChat(args: StreamArgs): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    args.onError?.({ status: 401, message: "Not signed in" });
    return;
  }

  let resp: Response;
  try {
    resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ agentId: args.agentId, messages: args.messages }),
      signal: args.signal,
    });
  } catch (e) {
    args.onError?.({ status: 0, message: (e as Error).message });
    return;
  }

  if (!resp.ok || !resp.body) {
    let message = `Request failed (${resp.status})`;
    try {
      const j = await resp.json();
      if (j?.error) message = j.error;
    } catch {
      /* noop */
    }
    args.onError?.({ status: resp.status, message });
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let assistantText = "";
  let manaPatchedFinal: string | null = null;
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, nl);
      textBuffer = textBuffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        streamDone = true;
        break;
      }
      try {
        const parsed = JSON.parse(json);
        if (parsed.assembl_mana_patch?.final_content) {
          manaPatchedFinal = parsed.assembl_mana_patch.final_content as string;
          continue;
        }
        const delta: string | undefined = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          assistantText += delta;
          args.onDelta(delta);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  args.onDone(manaPatchedFinal ?? assistantText);
}
