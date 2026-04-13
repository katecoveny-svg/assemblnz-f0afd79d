/**
 * ═══════════════════════════════════════════════════════════
 * INDUSTRY-AWARE TOOL LOADING SYSTEM
 * ═══════════════════════════════════════════════════════════
 *
 * Maps industry pack subscriptions to automatic tool injection.
 * When a user subscribes to a pack (e.g. Manaaki), every agent
 * in their account automatically gets hospitality-specific tools.
 *
 * Shared agents (LEDGER, AROHA, ANCHOR) load industry-specific
 * templates based on which packs the user has active.
 */

// ─── Pack → Tool mappings ──────────────────────────────

export const INDUSTRY_TOOLSETS: Record<string, string[]> = {
  manaaki: [
    "assembl_aura_fcp_daily_check",
    "assembl_aura_temp_logger",
    "assembl_aura_verifier_pack",
    "assembl_aura_liquor_licence_renewal",
    "assembl_nova_qualmark_prep",
    "assembl_cellar_stock_take",
    "assembl_saffron_supplier_audit",
    "assembl_pau_event_runsheet",
  ],
  hanga: [
    "assembl_apex_safety_plan",
    "assembl_apex_schedule_risk",
    "assembl_kaupapa_progress_claim",
    "assembl_arai_hazard_register",
    "assembl_whakaae_consent_checklist",
    "assembl_pai_quality_itp",
    "assembl_rawa_procurement",
    "assembl_pinnacle_tender_response",
  ],
  auaha: [
    "assembl_prism_brand_scanner",
    "assembl_prism_campaign_engine",
    "assembl_prism_brand_lock",
    "assembl_echo_content_calendar",
    "assembl_echo_analytics_feedback",
    "assembl_muse_copy_generator",
    "assembl_pixel_image_generator",
    "assembl_flux_social_scheduler",
  ],
  arataki: [
    "assembl_forge_ruc_calculator",
    "assembl_forge_cin_generator",
    "assembl_forge_wof_tracker",
    "assembl_forge_service_reminder",
    "assembl_forge_fleet_dashboard",
    "assembl_forge_trademe_listing",
    "assembl_forge_finance_comparison",
  ],
  pikau: [
    "assembl_gateway_customs_entry",
    "assembl_gateway_hs_lookup",
    "assembl_gateway_tariff_calculator",
    "assembl_gateway_biosecurity_check",
    "assembl_gateway_broker_handoff",
    "assembl_transit_route_optimizer",
  ],
  toro: [
    "assembl_toro_nait_tracker",
    "assembl_toro_fep_builder",
    "assembl_toro_ets_calculator",
    "assembl_toro_milk_price",
    "assembl_toro_weather_ops",
    "assembl_toro_seasonal_sweep",
  ],
};

// ─── Shared agents get industry-specific templates ─────
// These agents work across ALL packs but load different
// templates and context depending on active packs

export const SHARED_AGENT_TEMPLATES: Record<string, Record<string, string[]>> = {
  ledger: {
    manaaki: ["hospitality_gst", "food_cost_analysis", "seasonal_forecasting", "tip_pooling"],
    hanga: ["progress_claim_accounting", "retention_tracking", "cca_payment_schedule", "construction_gst"],
    auaha: ["campaign_roi", "content_cost_tracking", "freelancer_invoicing"],
    arataki: ["vehicle_depreciation", "ruc_expense", "fleet_cost_analysis", "finance_settlement"],
    pikau: ["customs_duty_accounting", "freight_cost_allocation", "currency_conversion"],
    toro: ["farm_operating_expenses", "seasonal_cashflow", "ets_carbon_accounting"],
  },
  aroha: {
    manaaki: ["hospitality_employment", "split_shift_agreements", "food_handler_training", "rse_worker_onboarding"],
    hanga: ["construction_employment", "site_induction_template", "subcontractor_agreements", "lbp_registration"],
    auaha: ["creative_contracts", "freelancer_agreements", "ip_assignment", "flexible_work"],
    arataki: ["workshop_employment", "mechanic_certification", "apprenticeship", "on_call_agreements"],
    pikau: ["transport_employment", "driver_agreements", "fatigue_management", "chain_of_responsibility"],
    toro: ["farm_employment", "accommodation_agreements", "rse_pastoral_care", "seasonal_worker_contracts"],
  },
  anchor: {
    manaaki: ["hospitality_agreements", "franchise_agreements", "liquor_licence_applications"],
    hanga: ["construction_contracts", "subcontract_agreements", "cca_compliance", "retention_bonds"],
    auaha: ["service_agreements", "nda_templates", "licensing_agreements", "sponsorship_contracts"],
    arataki: ["vehicle_sale_agreements", "warranty_terms", "finance_agreements", "trade_in_contracts"],
    pikau: ["freight_contracts", "customs_broker_agreements", "warehouse_agreements"],
    toro: ["farm_sale_agreements", "sharemilking_agreements", "succession_plans", "lease_agreements"],
  },
};

// ─── Pack → Agent membership ───────────────────────────

export const PACK_AGENTS: Record<string, string[]> = {
  manaaki: ["aura", "saffron", "cellar", "luxe", "moana", "coast", "kura", "pau", "summit"],
  hanga: ["arai", "kaupapa", "ata", "rawa", "whakaae", "pai", "arc", "terra", "pinnacle"],
  auaha: ["prism", "muse", "pixel", "verse", "echo", "flux", "chromatic", "rhythm", "market"],
  arataki: ["motor", "transit", "mariner"],
  pikau: ["gateway", "harvest", "grove"],
  toro: ["toroa"],
  shared: ["charter", "arbiter", "shield", "anchor", "aroha", "pulse", "scholar", "nova", "ledger", "vault", "catalyst", "compass", "haven", "counter", "sage", "ascend", "pilot"],
};

// ─── Core functions ────────────────────────────────────

/**
 * Get all tools available to a specific agent given active pack subscriptions.
 * Shared agents get their base tools + industry-specific templates.
 */
export function getToolsForAgent(agentId: string, activePacks: string[]): string[] {
  const tools: Set<string> = new Set();

  // 1. Check if agent belongs to a pack — load that pack's tools
  for (const pack of activePacks) {
    const packAgents = PACK_AGENTS[pack] || [];
    if (packAgents.includes(agentId)) {
      const packTools = INDUSTRY_TOOLSETS[pack] || [];
      packTools.forEach(t => tools.add(t));
    }
  }

  // 2. Shared agents always get base tools + industry-specific templates
  const isShared = PACK_AGENTS.shared?.includes(agentId);
  if (isShared) {
    const agentTemplates = SHARED_AGENT_TEMPLATES[agentId];
    if (agentTemplates) {
      for (const pack of activePacks) {
        const templates = agentTemplates[pack];
        if (templates) {
          templates.forEach(t => tools.add(`assembl_${agentId}_${t}`));
        }
      }
    }
  }

  return Array.from(tools);
}

/**
 * Get the industry context prompt additions for a shared agent
 * based on active packs.
 */
export function getIndustryContext(agentId: string, activePacks: string[]): string {
  const isShared = PACK_AGENTS.shared?.includes(agentId);
  if (!isShared || activePacks.length === 0) return "";

  const packNames: Record<string, string> = {
    manaaki: "Hospitality & Tourism",
    hanga: "Construction",
    auaha: "Creative & Media",
    arataki: "Automotive",
    pikau: "Freight & Customs",
    toro: "Agriculture & Farming",
  };

  const activeNames = activePacks.map(p => packNames[p] || p).join(", ");
  let context = `\n\n--- INDUSTRY CONTEXT ---\nThis user has active industry packs: ${activeNames}.\n`;

  const agentTemplates = SHARED_AGENT_TEMPLATES[agentId];
  if (agentTemplates) {
    context += `Load industry-specific templates for:\n`;
    for (const pack of activePacks) {
      const templates = agentTemplates[pack];
      if (templates) {
        context += `- ${packNames[pack] || pack}: ${templates.join(", ")}\n`;
      }
    }
    context += `Use the most relevant industry templates based on the user's question.\n`;
  }

  return context;
}

/**
 * Determine which packs a user has access to based on agent_access table.
 */
export async function getUserActivePacks(
  supabase: any,
  userId: string,
  tenantId?: string
): Promise<string[]> {
  // If we have a tenant_id, check agent_access
  if (tenantId) {
    const { data: access } = await supabase
      .from("agent_access")
      .select("pack_id")
      .eq("tenant_id", tenantId)
      .eq("is_enabled", true);

    if (access?.length) {
      return [...new Set(access.map((a: any) => a.pack_id))] as string[];
    }
  }

  // Fallback: check user's shared_context for industry indicators
  const { data: context } = await supabase
    .from("shared_context")
    .select("context_key, context_value")
    .eq("user_id", userId)
    .like("context_key", "company.industry%")
    .limit(5);

  if (!context?.length) return [];

  const industryMap: Record<string, string> = {
    hospitality: "manaaki", restaurant: "manaaki", cafe: "manaaki", hotel: "manaaki", tourism: "manaaki",
    construction: "hanga", building: "hanga", contractor: "hanga",
    creative: "auaha", marketing: "auaha", media: "auaha", design: "auaha",
    automotive: "arataki", dealership: "arataki", workshop: "arataki", mechanic: "arataki",
    freight: "pikau", logistics: "pikau", customs: "pikau", shipping: "pikau",
    farming: "toro", agriculture: "toro", dairy: "toro", horticulture: "toro",
  };

  const packs: Set<string> = new Set();
  for (const c of context) {
    const val = String(c.context_value).toLowerCase();
    for (const [keyword, pack] of Object.entries(industryMap)) {
      if (val.includes(keyword)) packs.add(pack);
    }
  }

  return Array.from(packs);
}
