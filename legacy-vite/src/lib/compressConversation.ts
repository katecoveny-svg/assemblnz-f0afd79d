/**
 * Client-side helper to compress long conversations via the compress-conversation edge function.
 * Call before sending messages when conversation length exceeds thresholds.
 */

const COMPRESS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compress-conversation`;

const MSG_THRESHOLD = 20;
const TOKEN_ESTIMATE_PER_MSG = 400;
const TOKEN_THRESHOLD = 80_000;

export interface CompressResult {
  compressed: boolean;
  messages: { role: string; content: string }[];
  stats?: {
    original_count: number;
    compressed_count: number;
    facts_extracted: number;
    decisions: number;
  };
}

/**
 * Check if a conversation should be compressed based on message count / token estimate.
 */
export function shouldCompress(messages: { role: string; content: string }[]): boolean {
  return (
    messages.length > MSG_THRESHOLD ||
    messages.length * TOKEN_ESTIMATE_PER_MSG > TOKEN_THRESHOLD
  );
}

/**
 * Compress a conversation via the edge function.
 * Returns the original messages if compression fails or isn't needed.
 */
export async function compressConversation(
  messages: { role: string; content: string }[],
  agentId: string,
  userId: string
): Promise<CompressResult> {
  if (!shouldCompress(messages)) {
    return { compressed: false, messages };
  }

  try {
    const resp = await fetch(COMPRESS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, agentId, userId }),
    });

    if (!resp.ok) {
      console.warn("[compressConversation] Failed:", resp.status);
      return { compressed: false, messages };
    }

    return await resp.json();
  } catch (e) {
    console.warn("[compressConversation] Error:", e);
    return { compressed: false, messages };
  }
}
