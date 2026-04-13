/**
 * Context Compression — The Learning Loop
 * Compresses conversations >20 messages, extracts facts to shared_context.
 * Called when: conversation exceeds 20 msgs, user navigates away, or after 5min inactivity.
 */
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

interface CompressedResult {
  summary: string;
  facts: { key: string; value: string; confidence: number }[];
  decisions: string[];
  pending_actions: string[];
}

export async function compressAndLearn(
  messages: Msg[],
  agentId: string,
  userId: string
): Promise<void> {
  // Keep system prompt + last 6 messages
  const toCompress = messages.slice(0, -6);
  if (toCompress.length < 8) return; // Not enough to compress

  try {
    // Call the edge function to compress via AI
    const { data, error } = await supabase.functions.invoke("compress-context", {
      body: {
        messages: toCompress,
        agentId,
        userId,
      },
    });

    if (error || !data) {
      console.warn("Context compression failed:", error);
      return;
    }

    const parsed: CompressedResult = data;

    // Save summary with lineage
    await supabase.from("conversation_summaries").insert({
      user_id: userId,
      agent_id: agentId,
      summary: parsed.summary,
      key_facts_extracted: parsed.facts as any,
      original_message_count: toCompress.length,
      compression_level: 1,
    });

    // Upsert extracted facts to shared_context
    for (const fact of parsed.facts) {
      if (fact.confidence >= 0.7) {
        await supabase.from("shared_context").upsert(
          {
            user_id: userId,
            context_key: fact.key,
            context_value: { value: fact.value } as any,
            source_agent: agentId,
            confidence: fact.confidence,
          },
          { onConflict: "user_id,context_key" }
        );
      }
    }

    // Store pending actions in agent_memory
    if (parsed.pending_actions.length > 0) {
      await supabase.from("agent_memory").upsert(
        {
          user_id: userId,
          agent_id: agentId,
          memory_key: "pending_actions",
          memory_value: parsed.pending_actions as any,
        },
        { onConflict: "user_id,agent_id,memory_key" }
      );
    }
  } catch (e) {
    console.warn("compressAndLearn error:", e);
  }
}
