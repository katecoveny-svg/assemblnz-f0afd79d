import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TOKEN_ESTIMATE_PER_MSG = 400; // rough average tokens per message
const COMPRESS_THRESHOLD_MSGS = 20;
const COMPRESS_THRESHOLD_TOKENS = 80_000;
const KEEP_RECENT = 6;
const MIN_COMPRESSIBLE = 8;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentId, userId, conversationId } = await req.json();

    if (!messages || !agentId || !userId) {
      return new Response(
        JSON.stringify({ error: "messages, agentId, and userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const estimatedTokens = messages.length * TOKEN_ESTIMATE_PER_MSG;
    const shouldCompress =
      messages.length > COMPRESS_THRESHOLD_MSGS ||
      estimatedTokens > COMPRESS_THRESHOLD_TOKENS;

    if (!shouldCompress) {
      return new Response(
        JSON.stringify({ compressed: false, messages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Split: keep system prompt (0) + last N messages
    const systemPrompt = messages[0]?.role === "system" ? messages[0] : null;
    const startIdx = systemPrompt ? 1 : 0;
    const keepRecent = messages.slice(-KEEP_RECENT);
    const toCompress = messages.slice(startIdx, -KEEP_RECENT);

    if (toCompress.length < MIN_COMPRESSIBLE) {
      return new Response(
        JSON.stringify({ compressed: false, messages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[compress] Compressing ${toCompress.length} messages for agent=${agentId}, user=${userId}`
    );

    // Call Lovable AI Gateway to compress
    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a conversation compressor for a NZ business AI platform. Compress the conversation into structured JSON. Extract: decisions made, facts learned, action items, compliance notes. Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1", "decision 2"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"]
}`,
            },
            {
              role: "user",
              content: JSON.stringify(
                toCompress.map((m: any) => ({
                  role: m.role,
                  content:
                    typeof m.content === "string"
                      ? m.content.slice(0, 2000)
                      : m.content,
                }))
              ),
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "compress_conversation",
                description: "Return structured compression of conversation",
                parameters: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    facts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          value: { type: "string" },
                          confidence: { type: "number" },
                        },
                        required: ["key", "value", "confidence"],
                      },
                    },
                    decisions: { type: "array", items: { type: "string" } },
                    pending_actions: { type: "array", items: { type: "string" } },
                    compliance_notes: { type: "array", items: { type: "string" } },
                  },
                  required: ["summary", "facts", "decisions", "pending_actions"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "compress_conversation" },
          },
        }),
      }
    );

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[compress] AI error:", aiResp.status, errText);
      // Return original messages on AI failure — non-destructive
      return new Response(
        JSON.stringify({ compressed: false, messages, error: "AI compression failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any;

    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[compress] Could not parse AI response");
        return new Response(
          JSON.stringify({ compressed: false, messages }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    // Persist to database using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Save conversation summary with lineage
    const { error: summaryError } = await supabase
      .from("conversation_summaries")
      .insert({
        user_id: userId,
        agent_id: agentId,
        summary: parsed.summary,
        key_facts_extracted: parsed,
        original_message_count: toCompress.length,
        compression_level: 1,
      });

    if (summaryError) {
      console.error("[compress] Summary save error:", summaryError.message);
    }

    // 2. Upsert extracted facts to shared_context
    if (parsed.facts?.length) {
      for (const fact of parsed.facts) {
        const { error: ctxError } = await supabase
          .from("shared_context")
          .upsert(
            {
              user_id: userId,
              context_key: fact.key,
              context_value: fact.value,
              source_agent: agentId,
              confidence: fact.confidence ?? 0.5,
            },
            { onConflict: "user_id,context_key" }
          );
        if (ctxError) {
          console.error(`[compress] Context upsert error for ${fact.key}:`, ctxError.message);
        }
      }
    }

    console.log(
      `[compress] Done: ${toCompress.length} msgs → summary + ${parsed.facts?.length || 0} facts`
    );

    // 3. Rebuild compressed message array
    const compressionMessage = {
      role: "assistant" as const,
      content:
        `[EARLIER IN THIS CONVERSATION]\n${parsed.summary}\n` +
        (parsed.decisions?.length
          ? `Decisions: ${parsed.decisions.join("; ")}\n`
          : "") +
        (parsed.pending_actions?.length
          ? `Pending: ${parsed.pending_actions.join("; ")}\n`
          : "") +
        (parsed.compliance_notes?.length
          ? `Compliance: ${parsed.compliance_notes.join("; ")}`
          : ""),
    };

    const compressedMessages = [
      ...(systemPrompt ? [systemPrompt] : []),
      compressionMessage,
      ...keepRecent,
    ];

    return new Response(
      JSON.stringify({
        compressed: true,
        messages: compressedMessages,
        stats: {
          original_count: messages.length,
          compressed_count: compressedMessages.length,
          facts_extracted: parsed.facts?.length || 0,
          decisions: parsed.decisions?.length || 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[compress] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
