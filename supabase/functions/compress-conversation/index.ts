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

const TOKEN_ESTIMATE_PER_MSG = 400;
const COMPRESS_THRESHOLD_MSGS = 20;
const COMPRESS_THRESHOLD_TOKENS = 80_000;
const KEEP_RECENT = 6;
const MIN_COMPRESSIBLE = 8;

// ─── Industry agent sets ───────────────────────────────
const WAIHANGA_AGENTS = new Set([
  "apex", "arai", "kaupapa", "ata", "rawa", "pai", "whakaae",
]);

const AUAHA_AGENTS = new Set([
  "prism", "echo", "spark", "flux", "muse", "toi", "kōrero", "whakaata", "ahua",
]);

// ─── Industry-specific extraction schemas ──────────────
const WAIHANGA_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ construction/trades AI platform.
Compress the conversation into structured JSON, extracting NZ construction-specific data.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"],
  "construction": {
    "project": { "address": "", "consent_ref": "", "consent_authority": "" },
    "participants": [{ "lbp_name": "", "lbp_number": "", "lbp_class": "" }],
    "code_decisions": [{ "clause": "E2", "decision": "cavity system", "reason": "exposure zone HIGH" }],
    "inspection_stage": "pre-line | framing | post-line | pre-clad | final",
    "upcoming_inspections": [{ "type": "", "date": "", "items_to_prep": "" }],
    "retentions": { "amount": "", "held_by": "", "release_date": "", "trust_compliant": true }
  }
}
Extract NZ-specific construction data:
- Building consent references (e.g., BCA-2025-XXXX)
- LBP licence numbers and classes (BP, DC, SC, etc.)
- Building Code clauses (B1, B2, E1, E2, E3, F7, H1, etc.)
- Inspection stages and results
- CCA 2002 retention details — trust compliance since 2023 amendment
- Exposure zones (LOW, MEDIUM, HIGH, VERY HIGH per E2/AS1)
- Producer statements (PS1, PS2, PS3, PS4)
Omit any "construction" sub-object fields that are empty/unknown.`;

const AUAHA_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ creative & marketing AI platform.
Compress the conversation into structured JSON, extracting brand and content performance data.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"],
  "creative": {
    "brand_dna": {
      "primary_colour": "",
      "voice_formality": 0,
      "tone_notes": "",
      "forbidden_words": [],
      "approved_phrases": []
    },
    "content_performance": [
      { "platform": "", "format": "", "engagement_rate": 0, "what_worked": "", "what_failed": "" }
    ],
    "audience_insights": {
      "top_locations": [],
      "best_posting_day": "",
      "best_posting_time": "",
      "demographic_skew": ""
    },
    "style_preferences": {
      "preferred_formats": [],
      "rejected_styles": [],
      "edit_patterns": []
    },
    "competitor_notes": [],
    "seasonal_calendar": []
  }
}
Extract NZ creative/marketing-specific data:
- Brand voice preferences (formality level, humour style, words to avoid/prefer)
- Content performance data (engagement rates, what worked/bombed, platform breakdowns)
- Audience demographics and behaviour (NZ location skews, posting times)
- User edit patterns — when they change "innovative" to "practical", log the preference
- Competitor observations and seasonal NZ events (Matariki, ANZAC Day, school holidays)
- Platform-specific insights (LinkedIn vs Instagram vs Facebook performance)
Omit any "creative" sub-object fields that are empty/unknown.`;

const DEFAULT_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ business AI platform. Compress the conversation into structured JSON. Extract: decisions made, facts learned, action items, compliance notes. Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1", "decision 2"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"]
}`;

function getExtractionPrompt(agentId: string): string {
  const id = agentId?.toLowerCase();
  if (WAIHANGA_AGENTS.has(id)) return WAIHANGA_EXTRACTION_PROMPT;
  if (AUAHA_AGENTS.has(id)) return AUAHA_EXTRACTION_PROMPT;
  return DEFAULT_EXTRACTION_PROMPT;
}

function getIndustry(agentId: string): "waihanga" | "auaha" | "default" {
  const id = agentId?.toLowerCase();
  if (WAIHANGA_AGENTS.has(id)) return "waihanga";
  if (AUAHA_AGENTS.has(id)) return "auaha";
  return "default";
}

// ─── Industry-specific tool schemas ────────────────────
function getToolSchema(agentId: string) {
  const base: Record<string, any> = {
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
  };

  const industry = getIndustry(agentId);

  if (industry === "waihanga") {
    base.construction = {
      type: "object",
      properties: {
        project: {
          type: "object",
          properties: {
            address: { type: "string" },
            consent_ref: { type: "string" },
            consent_authority: { type: "string" },
          },
        },
        participants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lbp_name: { type: "string" },
              lbp_number: { type: "string" },
              lbp_class: { type: "string" },
            },
          },
        },
        code_decisions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              clause: { type: "string" },
              decision: { type: "string" },
              reason: { type: "string" },
            },
            required: ["clause", "decision"],
          },
        },
        inspection_stage: { type: "string" },
        upcoming_inspections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              date: { type: "string" },
              items_to_prep: { type: "string" },
            },
          },
        },
        retentions: {
          type: "object",
          properties: {
            amount: { type: "string" },
            held_by: { type: "string" },
            release_date: { type: "string" },
            trust_compliant: { type: "boolean" },
          },
        },
      },
    };
  }

  if (industry === "auaha") {
    base.creative = {
      type: "object",
      properties: {
        brand_dna: {
          type: "object",
          properties: {
            primary_colour: { type: "string" },
            voice_formality: { type: "number", description: "0-10 scale" },
            tone_notes: { type: "string" },
            forbidden_words: { type: "array", items: { type: "string" } },
            approved_phrases: { type: "array", items: { type: "string" } },
          },
        },
        content_performance: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { type: "string" },
              format: { type: "string" },
              engagement_rate: { type: "number" },
              what_worked: { type: "string" },
              what_failed: { type: "string" },
            },
          },
        },
        audience_insights: {
          type: "object",
          properties: {
            top_locations: { type: "array", items: { type: "string" } },
            best_posting_day: { type: "string" },
            best_posting_time: { type: "string" },
            demographic_skew: { type: "string" },
          },
        },
        style_preferences: {
          type: "object",
          properties: {
            preferred_formats: { type: "array", items: { type: "string" } },
            rejected_styles: { type: "array", items: { type: "string" } },
            edit_patterns: { type: "array", items: { type: "string", description: "e.g. 'changed innovative→practical'" } },
          },
        },
        competitor_notes: { type: "array", items: { type: "string" } },
        seasonal_calendar: { type: "array", items: { type: "string" } },
      },
    };
  }

  return base;
}

// ─── Construction fact flattener ───────────────────────
function flattenConstructionFacts(construction: any): Array<{ key: string; value: string; confidence: number }> {
  const facts: Array<{ key: string; value: string; confidence: number }> = [];
  if (!construction) return facts;

  const p = construction.project;
  if (p?.address) facts.push({ key: "project.address", value: p.address, confidence: 0.9 });
  if (p?.consent_ref) facts.push({ key: "project.consent_ref", value: p.consent_ref, confidence: 0.95 });
  if (p?.consent_authority) facts.push({ key: "project.consent_authority", value: p.consent_authority, confidence: 0.9 });

  if (construction.participants?.length) {
    for (const pt of construction.participants) {
      if (pt.lbp_number) {
        facts.push({ key: `participants.lbp.${pt.lbp_number}`, value: `${pt.lbp_name || "Unknown"} (${pt.lbp_class || "?"})`, confidence: 0.95 });
      }
    }
  }

  if (construction.code_decisions?.length) {
    for (const cd of construction.code_decisions) {
      facts.push({ key: `code_decision.${cd.clause}`, value: `${cd.decision}${cd.reason ? " — " + cd.reason : ""}`, confidence: 0.9 });
    }
  }

  if (construction.inspection_stage) {
    facts.push({ key: "project.inspection_stage", value: construction.inspection_stage, confidence: 0.85 });
  }

  if (construction.retentions?.amount) {
    facts.push({ key: "project.retentions.amount", value: construction.retentions.amount, confidence: 0.9 });
    if (construction.retentions.trust_compliant !== undefined) {
      facts.push({ key: "project.retentions.trust_compliant", value: String(construction.retentions.trust_compliant), confidence: 0.9 });
    }
  }

  return facts;
}

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

    const isWaihanga = WAIHANGA_AGENTS.has(agentId?.toLowerCase());
    console.log(
      `[compress] Compressing ${toCompress.length} messages for agent=${agentId}, user=${userId}${isWaihanga ? " [WAIHANGA]" : ""}`
    );

    // Call Lovable AI Gateway with industry-specific extraction
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
            { role: "system", content: getExtractionPrompt(agentId) },
            {
              role: "user",
              content: JSON.stringify(
                toCompress.map((m: any) => ({
                  role: m.role,
                  content: typeof m.content === "string" ? m.content.slice(0, 2000) : m.content,
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
                  properties: getToolSchema(agentId),
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

    // Persist to database
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
    const allFacts = [
      ...(parsed.facts || []),
      ...flattenConstructionFacts(parsed.construction),
    ];

    if (allFacts.length) {
      for (const fact of allFacts) {
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
      `[compress] Done: ${toCompress.length} msgs → summary + ${allFacts.length} facts${isWaihanga ? ` (incl. construction data)` : ""}`
    );

    // 3. Rebuild compressed message array
    const compressionMessage = {
      role: "assistant" as const,
      content:
        `[EARLIER IN THIS CONVERSATION]\n${parsed.summary}\n` +
        (parsed.decisions?.length ? `Decisions: ${parsed.decisions.join("; ")}\n` : "") +
        (parsed.pending_actions?.length ? `Pending: ${parsed.pending_actions.join("; ")}\n` : "") +
        (parsed.compliance_notes?.length ? `Compliance: ${parsed.compliance_notes.join("; ")}\n` : "") +
        (isWaihanga && parsed.construction?.inspection_stage
          ? `Inspection Stage: ${parsed.construction.inspection_stage}\n`
          : "") +
        (isWaihanga && parsed.construction?.code_decisions?.length
          ? `Code Decisions: ${parsed.construction.code_decisions.map((c: any) => `${c.clause}: ${c.decision}`).join("; ")}\n`
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
          facts_extracted: allFacts.length,
          decisions: parsed.decisions?.length || 0,
          construction_data: isWaihanga,
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
