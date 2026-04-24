// ============================================================
// IHO-ROUTER ANALYTICS MODULE
// "Use the data you collect as the moat" — Greg Isenberg Step 5
// Logs every agent interaction to assembl_agent_analytics via the
// assembl_log_agent_interaction RPC. Fire-and-forget — never block
// the user's request.
// ============================================================

export interface AgentInteraction {
  userId: string;
  agentCode: string;
  keteCode: string;
  modelUsed: string;
  modelTier: string;
  intent: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  workflowType?: string;
  metadata?: Record<string, unknown>;
}

// Use a permissive client type — this module is shared across edge
// functions and we don't want to import the full Supabase types.
type SupabaseLike = {
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ error: unknown }>;
  from: (table: string) => {
    select: (cols: string) => {
      order?: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: unknown[] | null }> };
      eq?: (col: string, val: unknown) => { order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: unknown[] | null }> } };
      limit?: (n: number) => Promise<{ data: unknown[] | null }>;
    };
    insert: (rows: unknown[]) => Promise<{ error: unknown }>;
  };
};

export async function logAgentInteraction(
  supabase: SupabaseLike,
  interaction: AgentInteraction,
): Promise<void> {
  try {
    const { error } = await supabase.rpc("assembl_log_agent_interaction", {
      p_user_id: interaction.userId,
      p_agent_code: interaction.agentCode,
      p_kete_code: interaction.keteCode,
      p_model_used: interaction.modelUsed,
      p_model_tier: interaction.modelTier,
      p_intent: interaction.intent,
      p_input_tokens: interaction.inputTokens,
      p_output_tokens: interaction.outputTokens,
      p_latency_ms: interaction.latencyMs,
      p_success: interaction.success,
      p_workflow_type: interaction.workflowType ?? null,
      p_metadata: interaction.metadata ?? {},
    });
    if (error) console.error("[analytics] RPC error:", error);
  } catch (error) {
    // Analytics failures must never block the user's request
    console.error("[analytics] Logging failed:", error);
  }
}

export function detectWorkflowType(intent: string): string {
  const mapping: Record<string, string[]> = {
    compliance: [
      "compliance_check", "risk_assessment", "safety_inspection",
      "consent_check", "policy_review", "audit", "compliance",
    ],
    scheduling: [
      "shift_roster", "schedule", "booking", "appointment",
      "calendar", "roster", "dispatch",
    ],
    creative: [
      "content_generation", "image_generation", "video_production",
      "copywriting", "design", "brand", "social_media",
    ],
    reporting: [
      "report", "summary", "dashboard", "analytics",
      "evidence_pack", "export",
    ],
    financial: [
      "budget", "invoice", "payment", "claim", "ledger",
      "cost", "quote", "pricing",
    ],
    communication: [
      "email", "message", "notification", "alert",
      "handover", "briefing",
    ],
    knowledge: ["knowledge", "explain", "decision_support", "analysis"],
  };

  const lc = intent.toLowerCase();
  for (const [type, keywords] of Object.entries(mapping)) {
    if (keywords.some((kw) => lc.includes(kw))) return type;
  }
  return "general";
}

export function modelTierFromName(model: string): "fast" | "balanced" | "deep" {
  const m = model.toLowerCase();
  if (m.includes("flash-lite") || m.includes("nano") || m.includes("haiku")) return "fast";
  if (m.includes("opus") || m.includes("pro") || m.includes("gpt-5") || m.includes("sonnet")) return "deep";
  return "balanced";
}
