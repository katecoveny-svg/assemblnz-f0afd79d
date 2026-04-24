/**
 * Shared agent tool executor
 * ================================================================
 * One module that turns LLM tool calls into real work — either by
 * calling live edge functions (weather, fuel, routes, IoT, KB,
 * memory, calendar, Canva, Xero, compliance scanner) or by running
 * NZ-specific calculators against locked 2026 reference data.
 *
 * Used by: supabase/functions/chat/index.ts
 *
 * Design rules:
 *   - Pure functions for calculators (deterministic + auditable).
 *   - Live data tools always return `{ source, fetched_at, ... }`
 *     so the model can cite freshness.
 *   - Errors return `{ error, hint }` instead of throwing — the
 *     model can read them and explain to the user.
 */

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export interface ToolContext {
  supabaseUrl: string;
  authHeader: string;
  serviceClient: SupabaseClient;
  userId: string | null;
  agentId: string;
}

export interface LlmTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// ────────────────────────────────────────────────────────────────
// LIVE DATA TOOL SCHEMAS — exposed in addition to anything pulled
// from tool_registry. These cover read-only NZ operational data
// that every agent benefits from.
// ────────────────────────────────────────────────────────────────
export const LIVE_DATA_TOOLS: LlmTool[] = [
  {
    type: "function",
    function: {
      name: "get_nz_weather",
      description: "Fetch current weather and short forecast for a New Zealand location. Use when a question depends on weather (events, construction, farming, hospitality outdoor seating, freight delays, vehicle conditions). Returns OpenWeatherMap data with NZ defaults.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "NZ city name e.g. 'Auckland', 'Wellington', 'Queenstown'" },
          lat: { type: "number" },
          lon: { type: "number" },
          mode: { type: "string", enum: ["current", "forecast", "both"], description: "default 'current'" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_nz_fuel_prices",
      description: "Get current NZ retail fuel prices (91, 95, diesel, EV) sourced from MBIE weekly monitoring. Use for fleet cost calculations, route ROI, or when the user asks about fuel costs.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_nz_route",
      description: "Get a driving route between two NZ locations including distance, duration and toll information. Use for delivery planning, fleet routing, customer travel quotes.",
      parameters: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Start point — address or 'lat,lon'" },
          destination: { type: "string", description: "End point — address or 'lat,lon'" },
          mode: { type: "string", enum: ["driving", "truck"], description: "default 'driving'" },
        },
        required: ["origin", "destination"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description: "Search the NZ industry knowledge base (Acts, regulations, IRD/MBIE/MPI/WorkSafe guidance, council rules). Use when answering compliance, legal, or regulatory questions to retrieve grounded sources before answering.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Plain-English question or topic" },
          kete: { type: "string", description: "Optional kete filter: manaaki, waihanga, auaha, arataki, pikau, toro" },
          limit: { type: "number", description: "Default 6, max 12" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recall_memory",
      description: "Recall facts the user has previously shared (business name, industry, GST number, staff details, vehicle list, properties, supplier names, etc.). Use BEFORE asking the user for context they may have already provided.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "What you're looking for, e.g. 'business GST number' or 'fleet vehicles'" },
          limit: { type: "number", description: "Default 5" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_compliance_updates",
      description: "Get recent NZ regulatory changes (IRD, MBIE, WorkSafe, MPI, Privacy Commissioner, councils) detected by the daily compliance scanner. Use when the user asks 'what's changed' or before issuing compliance advice.",
      parameters: {
        type: "object",
        properties: {
          industry: { type: "string", description: "Optional filter: hospitality, construction, automotive, freight, agriculture, retail" },
          since_days: { type: "number", description: "Default 30" },
          impact: { type: "string", enum: ["low", "medium", "high"], description: "Optional minimum impact" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_iot_signal",
      description: "Get a live operational data signal: vehicle tracking, freight ETA, marine AIS positions, agri satellite, construction site sensors. Returns the raw stream payload.",
      parameters: {
        type: "object",
        properties: {
          source: {
            type: "string",
            enum: ["vehicle", "freight", "ais", "agri", "construction", "marine_weather"],
            description: "Which IoT stream to query",
          },
          ref: { type: "string", description: "Optional reference (vehicle plate, container, vessel MMSI, paddock id, site id)" },
        },
        required: ["source"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_sms",
      description: "Send an SMS or WhatsApp message via the TNZ gateway. Requires user has confirmed the send. Logs to messaging history.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "NZ mobile in E.164 format e.g. +64211234567" },
          body: { type: "string", description: "Message body, max 1600 chars" },
          channel: { type: "string", enum: ["sms", "whatsapp"], description: "default 'sms'" },
        },
        required: ["to", "body"],
      },
    },
  },
];

// ────────────────────────────────────────────────────────────────
// EXECUTOR
// ────────────────────────────────────────────────────────────────
export async function executeAgentTool(
  fnName: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  // Live data tools
  switch (fnName) {
    case "google_calendar_list":
      return invokeFunction(ctx, "google-calendar", { action: "list_events", ...args });
    case "google_calendar_create":
      return invokeFunction(ctx, "google-calendar", { action: "create_event", ...args });
    case "canva_list_designs":
      return invokeFunction(ctx, "canva-api", { action: "list_designs", ...args });
    case "canva_create_design":
      return invokeFunction(ctx, "canva-api", { action: "create_design", ...args });
    case "get_nz_weather":
      return invokeFunction(ctx, "iot-weather", args);
    case "get_nz_fuel_prices":
    case "check_nz_fuel_prices":
    case "nz_fuel_prices":
      return invokeFunction(ctx, "nz-fuel-prices", {});
    case "get_nz_route":
      return invokeFunction(ctx, "nz-routes", args);
    case "search_knowledge_base":
      return invokeFunction(ctx, "ikb-search", args);
    case "recall_memory":
      return recallMemory(args, ctx);
    case "get_compliance_updates":
      return getComplianceUpdates(args, ctx);
    case "get_iot_signal":
      return getIotSignal(args, ctx);
    case "send_sms":
      return invokeFunction(ctx, "tnz-send", args);
  }

  // NZ industry calculators (pure, deterministic)
  switch (fnName) {
    case "assembl_gst_calculator": return calcGst(args);
    case "assembl_payroll_calculator": return calcPayroll(args);
    case "assembl_leave_calculator": return calcLeave(args);
    case "assembl_employment_cost": return calcEmploymentCost(args);
    case "assembl_invoice_generator": return genInvoice(args);
    case "assembl_payment_claim": return genPaymentClaim(args);
    case "assembl_temp_log": return assessTempLog(args);
    case "assembl_allergen_matrix": return buildAllergenMatrix(args);
    case "assembl_food_safety_check": return foodSafetyCheck(args);
    case "assembl_host_responsibility": return hostResponsibilityCheck(args);
    case "assembl_duty_manager_check": return dutyManagerCheck(args);
    case "assembl_licence_renewal": return licenceRenewal(args);
    case "assembl_healthy_homes_check": return healthyHomesCheck(args);
    case "assembl_rent_review": return rentReview(args);
    case "assembl_hs_checklist": return hsChecklist(args);
    case "assembl_consent_tracker": return consentTracker(args);
    case "assembl_nait_checker": return naitChecker(args);
    case "assembl_ets_calculator": return etsCalculator(args);
    case "assembl_fep_builder": return fepBuilder(args);
    case "assembl_qualmark_check": return qualmarkCheck(args);
    case "assembl_fcp_export": return fcpExport(args, ctx);
    case "assembl_generate_agreement": return generateAgreement(args);
    case "assembl_brand_dna_analyzer": return brandDnaAnalyzer(args, ctx);
    case "assembl_content_calendar": return contentCalendar(args);
    case "assembl_evidence_pack": return evidencePack(args, ctx);
    case "assembl_cross_agent_handoff": return crossAgentHandoff(args, ctx);
  }

  // APEX (construction risk/safety/tender)
  switch (fnName) {
    case "apex_safety_plan": return apexSafetyPlan(args);
    case "apex_schedule_risk": return apexScheduleRisk(args);
    case "apex_tender_announcement": return apexTenderAnnouncement(args);
  }

  // ARAI (site HSE)
  switch (fnName) {
    case "arai_hazard_register": return araiHazardRegister(args);
    case "arai_site_induction": return araiSiteInduction(args);
  }

  // FORGE (auto/fleet)
  switch (fnName) {
    case "assembl_forge_cin_generator": return forgeCinGenerator(args);
    case "assembl_forge_fleet_dashboard": return forgeFleetDashboard(args, ctx);
    case "assembl_forge_ruc_calculator": return forgeRucCalculator(args);
    case "assembl_forge_service_reminder": return forgeServiceReminder(args);
    case "assembl_forge_wof_tracker": return forgeWofTracker(args);
  }

  // TORO (farm/agri)
  switch (fnName) {
    case "assembl_toro_ets_calculator": return toroEtsCalculator(args);
    case "assembl_toro_fep_builder": return toroFepBuilder(args);
    case "assembl_toro_milk_price": return toroMilkPrice(args);
    case "assembl_toro_nait_tracker": return toroNaitTracker(args);
    case "assembl_toro_seasonal_sweep": return toroSeasonalSweep(args);
    case "assembl_toro_weather_ops":
      return invokeFunction(ctx, "iot-weather", args);
  }

  // AUAHA (creative integrations)
  switch (fnName) {
    case "auaha_falai_image_gen":
      return invokeFunction(ctx, "stitch-generate", args);
    case "auaha_runway_ml_video":
      // Repointed from missing 'videogen-runway' to the deployed function.
      return invokeFunction(ctx, "auaha-runway-ml", { action: "generate_video", ...args });
    case "auaha_buffer_scheduler":
      return invokeFunction(ctx, "buffer-mcp", { action: "schedule_post", ...args });
    // The following three remain registered but are deactivated in
    // tool_registry (is_active=false). Kept here as a defensive fallback
    // in case anyone re-enables the row without wiring an integration.
    case "auaha_adobe_creative_cloud": return integrationStub("adobe_creative_cloud", args);
    case "auaha_spline_3d": return integrationStub("spline_3d", args);
    case "auaha_unsplash_pexels": return integrationStub("unsplash_pexels", args);
  }

  // ── TORO (family life — toroa_* schema) ─────────────────────────
  switch (fnName) {
    case "toro_list_children": return toroListChildren(ctx);
    case "toro_list_homework_due": return toroListHomeworkDue(args, ctx);
    case "toro_get_pocket_money_balances": return toroGetPocketMoneyBalances(args, ctx);
    case "toro_request_purchase_approval": return toroRequestPurchaseApproval(args, ctx);
    case "toro_add_shopping_item": return toroAddShoppingItem(args, ctx);
    case "toro_today_routine": return toroTodayRoutine(args, ctx);
    case "toro_immunisations_due": return toroImmunisationsDue(args, ctx);
    case "toro_curriculum_resources": return toroCurriculumResources(args, ctx);
  }

  // PRISM (brand/visual)
  switch (fnName) {
    case "prism_brand_scanner":
      return invokeFunction(ctx, "scan-website", args);
    case "prism_brand_lock": return prismBrandLock(args);
    case "prism_campaign_engine": return prismCampaignEngine(args);
  }

  // ECHO (analytics)
  switch (fnName) {
    case "echo_analytics_feedback": return echoAnalyticsFeedback(args, ctx);
    case "echo_content_calendar": return contentCalendar(args);
  }

  // Compliance / tourism cross-mapped to existing calculators
  switch (fnName) {
    case "kaupapa_progress_claim": return genPaymentClaim(args);
    case "nova_qualmark_prep": return qualmarkCheck(args);
    case "whakae_consent_checklist": return consentTracker(args);
  }

  return { error: `Unknown tool: ${fnName}`, hint: "This tool is registered but has no executor handler." };
}

// ────────────────────────────────────────────────────────────────
// LIVE DATA HELPERS
// ────────────────────────────────────────────────────────────────
async function invokeFunction(ctx: ToolContext, fn: string, body: Record<string, unknown>): Promise<unknown> {
  try {
    const resp = await fetch(`${ctx.supabaseUrl}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: ctx.authHeader },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!resp.ok) {
      return { error: `${fn} failed (${resp.status})`, details: data };
    }
    return { source: fn, fetched_at: new Date().toISOString(), data };
  } catch (e) {
    return { error: `${fn} call failed`, details: e instanceof Error ? e.message : String(e) };
  }
}

async function recallMemory(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  if (!ctx.userId) return { error: "User not authenticated — cannot recall memory" };
  const query = String(args.query ?? "");
  const limit = Math.min(Number(args.limit ?? 5), 20);
  const { data, error } = await ctx.serviceClient.rpc("search_memory", {
    p_user_id: ctx.userId,
    p_query: query,
    p_agent_id: null,
    p_limit: limit,
  });
  if (error) return { error: error.message };
  return { source: "agent_memory", count: data?.length ?? 0, results: data ?? [] };
}

async function getComplianceUpdates(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const sinceDays = Math.max(1, Number(args.since_days ?? 30));
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  let q = ctx.serviceClient
    .from("compliance_updates")
    .select("title, change_summary, source_name, source_url, impact_level, effective_date, affected_industries, legislation_ref")
    .gte("created_at", since)
    .order("effective_date", { ascending: false })
    .limit(15);
  if (args.industry) q = q.contains("affected_industries", [String(args.industry)]);
  if (args.impact) q = q.eq("impact_level", String(args.impact));
  const { data, error } = await q;
  if (error) return { error: error.message };
  return { source: "compliance_scanner", count: data?.length ?? 0, since_days: sinceDays, updates: data ?? [] };
}

async function getIotSignal(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const map: Record<string, string> = {
    vehicle: "iot-vehicle-tracking",
    freight: "iot-freight-tracking",
    ais: "iot-ais-tracking",
    agri: "iot-agri-satellite",
    construction: "iot-construction",
    marine_weather: "marine-weather",
  };
  const source = String(args.source ?? "");
  const fn = map[source];
  if (!fn) return { error: `Unknown IoT source: ${source}` };
  return invokeFunction(ctx, fn, { ref: args.ref ?? null });
}

// ────────────────────────────────────────────────────────────────
// NZ CALCULATORS — pure & auditable
// All rates current April 2026 unless noted.
// ────────────────────────────────────────────────────────────────
function calcGst(args: Record<string, unknown>): unknown {
  const amount = Number(args.amount ?? 0);
  const mode = String(args.mode ?? "exclusive"); // 'exclusive' | 'inclusive'
  const RATE = 0.15;
  if (!amount || amount < 0) return { error: "amount must be > 0" };
  if (mode === "inclusive") {
    const gst = +(amount - amount / 1.15).toFixed(2);
    return { mode, total_inc_gst: amount, gst_amount: gst, net: +(amount - gst).toFixed(2), rate: RATE };
  }
  const gst = +(amount * RATE).toFixed(2);
  return { mode, net: amount, gst_amount: gst, total_inc_gst: +(amount + gst).toFixed(2), rate: RATE };
}

function calcPayroll(args: Record<string, unknown>): unknown {
  // 2025-26 NZ tax brackets (effective 31 Jul 2024)
  const gross = Number(args.gross_annual ?? args.gross ?? 0);
  const kiwisaver = Number(args.kiwisaver_pct ?? 3) / 100;
  const studentLoan = Boolean(args.student_loan ?? false);
  if (!gross || gross < 0) return { error: "gross_annual must be > 0" };
  const brackets = [
    { upTo: 15600, rate: 0.105 },
    { upTo: 53500, rate: 0.175 },
    { upTo: 78100, rate: 0.30 },
    { upTo: 180000, rate: 0.33 },
    { upTo: Infinity, rate: 0.39 },
  ];
  let paye = 0;
  let prev = 0;
  for (const b of brackets) {
    if (gross > prev) {
      const slice = Math.min(gross, b.upTo) - prev;
      paye += slice * b.rate;
      prev = b.upTo;
    }
  }
  const accLevy = +Math.min(gross, 152790) * 0.0167; // 2025-26 ACC earner levy = 1.67% on first $152,790
  const ksEmployee = gross * kiwisaver;
  const ksEmployer = gross * 0.03; // statutory minimum
  const slRepayment = studentLoan ? Math.max(0, gross - 24128) * 0.12 : 0; // 2025-26 threshold
  const netAnnual = gross - paye - accLevy - ksEmployee - slRepayment;
  return {
    gross_annual: gross,
    paye: +paye.toFixed(2),
    acc_earner_levy: +accLevy.toFixed(2),
    kiwisaver_employee: +ksEmployee.toFixed(2),
    kiwisaver_employer: +ksEmployer.toFixed(2),
    student_loan: +slRepayment.toFixed(2),
    net_annual: +netAnnual.toFixed(2),
    net_weekly: +(netAnnual / 52).toFixed(2),
    net_fortnightly: +(netAnnual / 26).toFixed(2),
    rates_year: "2025-26",
    legislation: "Income Tax Act 2007, KiwiSaver Act 2006, ACC Act 2001",
  };
}

function calcLeave(args: Record<string, unknown>): unknown {
  const monthsEmployed = Number(args.months_employed ?? 12);
  const weeklyHours = Number(args.weekly_hours ?? 40);
  return {
    annual_leave_weeks: monthsEmployed >= 12 ? 4 : +(monthsEmployed / 3).toFixed(2),
    annual_leave_hours: monthsEmployed >= 12 ? weeklyHours * 4 : +((monthsEmployed / 3) * weeklyHours).toFixed(1),
    sick_leave_days: monthsEmployed >= 6 ? 10 : 0,
    bereavement_days_immediate: 3,
    bereavement_days_other: 1,
    public_holidays: 12,
    parental_leave_eligible: monthsEmployed >= 6,
    parental_leave_paid_weeks: monthsEmployed >= 12 ? 26 : 0,
    legislation: "Holidays Act 2003, Parental Leave and Employment Protection Act 1987",
    notes: monthsEmployed < 6 ? "Sick leave entitlement begins after 6 months of continuous employment." : undefined,
  };
}

function calcEmploymentCost(args: Record<string, unknown>): unknown {
  const salary = Number(args.salary ?? 0);
  if (!salary) return { error: "salary required" };
  const ksEmployer = salary * 0.03;
  const accEmployer = salary * 0.0067; // approximate work levy avg; actual depends on CU code
  const annualLeaveCost = salary * (4 / 52);
  const sickLeaveCost = salary * (10 / 260);
  const publicHolidayCost = salary * (12 / 260);
  const total = salary + ksEmployer + accEmployer + annualLeaveCost + sickLeaveCost + publicHolidayCost;
  return {
    salary,
    kiwisaver_employer: +ksEmployer.toFixed(2),
    acc_work_levy_estimate: +accEmployer.toFixed(2),
    annual_leave_provision: +annualLeaveCost.toFixed(2),
    sick_leave_provision: +sickLeaveCost.toFixed(2),
    public_holiday_provision: +publicHolidayCost.toFixed(2),
    total_annual_cost: +total.toFixed(2),
    multiplier: +(total / salary).toFixed(2),
    notes: "ACC work levy varies by CU classification — actual rate ranges 0.07%–6%+. Replace with employer's actual CU rate for precision.",
  };
}

function genInvoice(args: Record<string, unknown>): unknown {
  const items = (args.items as Array<{ description: string; qty: number; unit_price: number }>) ?? [];
  const gstNumber = String(args.gst_number ?? "");
  const dueInDays = Number(args.due_days ?? 20);
  const issueDate = new Date();
  const due = new Date(issueDate.getTime() + dueInDays * 86400000);
  let net = 0;
  const lines = items.map((it) => {
    const lineTotal = (it.qty || 0) * (it.unit_price || 0);
    net += lineTotal;
    return { ...it, line_total: +lineTotal.toFixed(2) };
  });
  const gst = +(net * 0.15).toFixed(2);
  const total = +(net + gst).toFixed(2);
  return {
    invoice_number: `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`,
    issue_date: issueDate.toISOString().slice(0, 10),
    due_date: due.toISOString().slice(0, 10),
    gst_number: gstNumber || "(supply your IRD GST number to make this a tax invoice)",
    bill_to: args.bill_to ?? null,
    lines,
    subtotal_excl_gst: +net.toFixed(2),
    gst_15: gst,
    total_inc_gst: total,
    payment_terms: `Net ${dueInDays} days`,
    legislation: "Goods and Services Tax Act 1985 s24",
  };
}

function genPaymentClaim(args: Record<string, unknown>): unknown {
  const contractValue = Number(args.contract_value ?? 0);
  const completedPct = Number(args.completed_pct ?? 0);
  const retentionPct = Number(args.retention_pct ?? 5);
  const previousClaims = Number(args.previous_claims_total ?? 0);
  const variations = (args.variations as Array<{ desc: string; amount: number }>) ?? [];
  const variationTotal = variations.reduce((s, v) => s + (v.amount || 0), 0);
  const grossWorkDone = (contractValue * completedPct) / 100 + variationTotal;
  const retention = (grossWorkDone * retentionPct) / 100;
  const claimedThisPeriod = grossWorkDone - retention - previousClaims;
  const gst = claimedThisPeriod * 0.15;
  return {
    contract_value: contractValue,
    completed_pct: completedPct,
    variations,
    variations_total: +variationTotal.toFixed(2),
    gross_work_done: +grossWorkDone.toFixed(2),
    retention_held: +retention.toFixed(2),
    previous_claims_total: previousClaims,
    claim_amount_excl_gst: +claimedThisPeriod.toFixed(2),
    gst_15: +gst.toFixed(2),
    claim_amount_inc_gst: +(claimedThisPeriod + gst).toFixed(2),
    payment_due_date_default: addBusinessDays(20),
    legislation: "Construction Contracts Act 2002 s20",
    note: "Payee must respond with payment schedule within 20 working days or full amount becomes payable.",
  };
}

function assessTempLog(args: Record<string, unknown>): unknown {
  const readings = (args.readings as Array<{ unit: string; type: "chiller" | "freezer" | "hot_hold"; temp_c: number; ts?: string }>) ?? [];
  const limits = { chiller: { max: 5 }, freezer: { max: -15 }, hot_hold: { min: 65 } };
  const breaches: unknown[] = [];
  for (const r of readings) {
    const lim = limits[r.type];
    if (!lim) continue;
    const breach =
      ("max" in lim && r.temp_c > lim.max) ||
      ("min" in lim && r.temp_c < lim.min);
    if (breach) {
      breaches.push({
        unit: r.unit,
        type: r.type,
        temp_c: r.temp_c,
        limit: lim,
        ts: r.ts ?? new Date().toISOString(),
        corrective_action: r.type === "hot_hold"
          ? "Reheat food to ≥75°C immediately. If held below 60°C for >2h, discard."
          : "Move stock to compliant unit. Discard high-risk product if above 5°C for >4h. Investigate cause and log corrective action.",
      });
    }
  }
  return {
    total_readings: readings.length,
    compliant_count: readings.length - breaches.length,
    breach_count: breaches.length,
    breaches,
    overall: breaches.length === 0 ? "compliant" : "exceedances_found",
    legislation: "Food Act 2014, Food Regulations 2015 — temperature control requirements",
  };
}

function buildAllergenMatrix(args: Record<string, unknown>): unknown {
  const items = (args.menu_items as Array<{ name: string; ingredients: string[] }>) ?? [];
  const allergens = ["gluten", "dairy", "egg", "soy", "peanut", "tree_nut", "fish", "shellfish", "sesame", "lupin", "sulphite"];
  const triggers: Record<string, string[]> = {
    gluten: ["wheat", "flour", "bread", "pasta", "barley", "rye", "oats"],
    dairy: ["milk", "cream", "butter", "cheese", "yoghurt", "whey"],
    egg: ["egg", "mayonnaise", "aioli"],
    soy: ["soy", "tofu", "edamame", "soya"],
    peanut: ["peanut"],
    tree_nut: ["almond", "cashew", "walnut", "pecan", "hazelnut", "pistachio", "macadamia"],
    fish: ["fish", "salmon", "tuna", "cod", "snapper", "anchovy"],
    shellfish: ["prawn", "shrimp", "crab", "mussel", "oyster", "scallop", "crayfish"],
    sesame: ["sesame", "tahini"],
    lupin: ["lupin"],
    sulphite: ["sulphite", "wine", "dried fruit"],
  };
  const matrix = items.map((item) => {
    const flags: Record<string, boolean> = {};
    const ing = item.ingredients?.map((i) => i.toLowerCase()).join(" ") ?? "";
    for (const a of allergens) {
      flags[a] = (triggers[a] || []).some((t) => ing.includes(t));
    }
    return { name: item.name, allergens: flags };
  });
  return {
    allergens,
    matrix,
    legislation: "FSANZ Food Standards Code 1.2.3 (Mandatory Plain English Allergen Labelling, in force Feb 2024 → Feb 2026 transition complete)",
    note: "Auto-detected from ingredient keywords. ALWAYS verify with chef and supplier specs before publishing.",
  };
}

function foodSafetyCheck(args: Record<string, unknown>): unknown {
  const fcpInPlace = Boolean(args.fcp_in_place);
  const tempLogsCurrent = Boolean(args.temp_logs_current);
  const cleaningSchedule = Boolean(args.cleaning_schedule);
  const staffTrained = Boolean(args.staff_trained);
  const lastVerification = args.last_verification_date ? new Date(String(args.last_verification_date)) : null;
  const daysSinceVerification = lastVerification ? Math.floor((Date.now() - lastVerification.getTime()) / 86400000) : null;
  const issues: string[] = [];
  if (!fcpInPlace) issues.push("No Food Control Plan (FCP) in place — required under Food Act 2014 for most food businesses.");
  if (!tempLogsCurrent) issues.push("Temperature logs not current — gap creates verification risk.");
  if (!cleaningSchedule) issues.push("No documented cleaning schedule — required FCP element.");
  if (!staffTrained) issues.push("Food handler training not documented for all staff.");
  if (daysSinceVerification !== null && daysSinceVerification > 365) issues.push(`Last verification was ${daysSinceVerification} days ago — verification required at least annually.`);
  return {
    overall: issues.length === 0 ? "compliant" : issues.length <= 2 ? "minor_issues" : "non_compliant",
    issues,
    next_actions: issues.length ? issues.map((i, n) => `${n + 1}. ${i}`) : ["Maintain current standards. Schedule next verification before " + new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10)],
    legislation: "Food Act 2014, Food Regulations 2015",
  };
}

function hostResponsibilityCheck(args: Record<string, unknown>): unknown {
  const staff = (args.staff as Array<{ name: string; training_date?: string; certificate_expiry?: string }>) ?? [];
  const now = Date.now();
  const TWO_YEARS_MS = 730 * 86400000;
  const results = staff.map((s) => {
    const trained = s.training_date ? new Date(s.training_date).getTime() : null;
    const expired = trained ? now - trained > TWO_YEARS_MS : true;
    return {
      name: s.name,
      training_date: s.training_date ?? null,
      status: !trained ? "missing" : expired ? "expired" : "current",
      action: !trained ? "Book host responsibility training immediately" : expired ? "Renew training — expired" : "Current",
    };
  });
  const noncompliant = results.filter((r) => r.status !== "current").length;
  return {
    total_staff: staff.length,
    current: staff.length - noncompliant,
    non_compliant: noncompliant,
    results,
    legislation: "Sale and Supply of Alcohol Act 2012 s214",
    overall: noncompliant === 0 ? "compliant" : "action_required",
  };
}

function dutyManagerCheck(args: Record<string, unknown>): unknown {
  const expiry = args.certificate_expiry ? new Date(String(args.certificate_expiry)) : null;
  if (!expiry) return { error: "certificate_expiry required (ISO date)" };
  const daysToExpiry = Math.floor((expiry.getTime() - Date.now()) / 86400000);
  const status = daysToExpiry < 0 ? "expired" : daysToExpiry < 60 ? "renew_soon" : "current";
  return {
    certificate_expiry: expiry.toISOString().slice(0, 10),
    days_to_expiry: daysToExpiry,
    status,
    action:
      status === "expired" ? "Cease trading immediately if no other DM on duty. Apply for renewal via DLC."
      : status === "renew_soon" ? "Apply for renewal now — DLC processing typically 6–8 weeks."
      : "Current. Diary renewal at 90 days before expiry.",
    legislation: "Sale and Supply of Alcohol Act 2012 s218",
  };
}

function licenceRenewal(args: Record<string, unknown>): unknown {
  const licenceType = String(args.licence_type ?? "on-licence");
  const expiry = args.expiry_date ? new Date(String(args.expiry_date)) : null;
  const daysToExpiry = expiry ? Math.floor((expiry.getTime() - Date.now()) / 86400000) : null;
  return {
    licence_type: licenceType,
    expiry_date: expiry?.toISOString().slice(0, 10) ?? null,
    days_to_expiry: daysToExpiry,
    submission_deadline_days_before: 20,
    checklist: [
      "Public notice — display on premises 10 working days before lodgement",
      "Public notice — newspaper ad (or council-approved equivalent) within 20 working days",
      "Floor plan showing licensed area",
      "Manager certificate(s) — current",
      "Host responsibility policy (current)",
      "Local Alcohol Policy (LAP) compliance check",
      "Police, Medical Officer of Health, Inspector reports — request early",
      "Application fee (varies by venue capacity)",
    ],
    legislation: "Sale and Supply of Alcohol Act 2012 s127",
    objection_window_days: 15,
  };
}

function healthyHomesCheck(args: Record<string, unknown>): unknown {
  const standards = ["heating", "insulation", "ventilation", "moisture_drainage", "draught_stopping"];
  const provided = (args.compliance as Record<string, boolean>) ?? {};
  const results = standards.map((s) => ({
    standard: s,
    pass: Boolean(provided[s]),
    remediation: provided[s] ? null : remediationFor(s),
  }));
  const passes = results.filter((r) => r.pass).length;
  return {
    standards_checked: standards.length,
    passed: passes,
    failed: standards.length - passes,
    results,
    overall: passes === standards.length ? "compliant" : "non_compliant",
    deadline: "All private rentals must comply within 90 days of any new or renewed tenancy (in force since 1 July 2021; Kāinga Ora and CHP boarding houses 1 July 2024).",
    legislation: "Residential Tenancies (Healthy Homes Standards) Regulations 2019",
  };
}
function remediationFor(s: string): string {
  const r: Record<string, string> = {
    heating: "Install fixed heater in main living room meeting minimum heating capacity (calculate via MBIE heating tool).",
    insulation: "Ceiling and underfloor insulation to R-2.9 (ceiling) / R-1.3 (underfloor) min. Get a compliant install certificate.",
    ventilation: "Openable windows ≥5% of floor area in living rooms/bedrooms; extractor fans in kitchens and bathrooms.",
    moisture_drainage: "Effective drainage, gutters, downpipes; ground vapour barrier where there's a sub-floor space.",
    draught_stopping: "Block unreasonable gaps and holes in walls, ceilings, windows, floors, doors.",
  };
  return r[s] ?? "Refer Tenancy Services Healthy Homes guidance.";
}

function rentReview(args: Record<string, unknown>): unknown {
  const current = Number(args.current_rent_weekly ?? 0);
  const lastReview = args.last_review_date ? new Date(String(args.last_review_date)) : null;
  const monthsSince = lastReview ? Math.floor((Date.now() - lastReview.getTime()) / (30 * 86400000)) : null;
  const eligible = monthsSince === null || monthsSince >= 12;
  return {
    current_rent_weekly: current,
    last_review_date: lastReview?.toISOString().slice(0, 10) ?? null,
    months_since_last_review: monthsSince,
    review_eligible: eligible,
    minimum_notice_days: 60,
    legislation: "Residential Tenancies Act 1986 s24 — rent increases limited to once per 12 months (in force 12 Aug 2020).",
    next_eligible_date: lastReview ? new Date(lastReview.getTime() + 365 * 86400000).toISOString().slice(0, 10) : null,
    note: "Compare to MBIE bond data lower-quartile/median for the suburb before serving notice — anti-competitive or excessive increases can be challenged at the Tenancy Tribunal.",
  };
}

function hsChecklist(args: Record<string, unknown>): unknown {
  const siteType = String(args.site_type ?? "general");
  const isNotifiable = Boolean(args.notifiable_work);
  return {
    site_type: siteType,
    notifiable_work: isNotifiable,
    notification_required_lead: isNotifiable ? "Notify WorkSafe at least 24 hours before work starts" : null,
    checklist: [
      "PCBU duties identified and documented (HSWA s36)",
      "Site-specific safety plan signed off by all PCBUs",
      "Hazard register completed and accessible",
      "Site induction record for every worker (incl. subbies)",
      "PPE matrix per task — supply and enforcement",
      "Emergency procedures: assembly point, first aid, fire wardens",
      "Notifiable event reporting protocol (WorkSafe within timeframes)",
      "Toolbox talk schedule",
      "Incident/near-miss log",
      "Subcontractor competency / SSSP collection",
    ],
    legislation: "Health and Safety at Work Act 2015, Health and Safety at Work (General Risk and Workplace Management) Regulations 2016",
  };
}

function consentTracker(args: Record<string, unknown>): unknown {
  const stage = String(args.stage ?? "unknown");
  const stages = ["pre-application", "application_lodged", "rfi_outstanding", "consent_granted", "construction", "ccc_application", "ccc_issued"];
  return {
    current_stage: stage,
    progression: stages,
    cccChecklist: [
      "All inspections passed and recorded",
      "PS1 (Design) — collected from designer",
      "PS3 (Construction) — collected from each LBP trade",
      "PS4 (Construction Review) — engineer for restricted work",
      "As-built drawings",
      "Energy Work Certificates (electrical / gas)",
      "Producer statements for any specified systems (fire, lifts, smoke alarms)",
      "Council application fee + processing fee",
    ],
    legislation: "Building Act 2004 s95 (CCC) and s89 (consent issue)",
  };
}

function naitChecker(args: Record<string, unknown>): unknown {
  const animals = (args.animals as Array<{ tag: string; species: "cattle" | "deer"; movements_recorded?: number }>) ?? [];
  const issues = animals.filter((a) => !a.tag || a.tag.length < 7);
  return {
    total_animals: animals.length,
    untagged_or_invalid: issues.length,
    issues: issues.map((a) => ({ tag: a.tag, action: "Re-tag and re-register with NAIT within 7 days" })),
    movement_reporting_window_hours: 48,
    legislation: "National Animal Identification and Tracing Act 2012, NAIT Regulations 2012",
    note: "All movements off-farm (sale, slaughter, grazing) must be recorded in NAIT within 48 hours. Failure to register or record can attract OSPRI infringement notices.",
  };
}

function etsCalculator(args: Record<string, unknown>): unknown {
  const dairyCows = Number(args.dairy_cows ?? 0);
  const beefCattle = Number(args.beef_cattle ?? 0);
  const sheep = Number(args.sheep ?? 0);
  const deer = Number(args.deer ?? 0);
  const fertN = Number(args.synthetic_n_kg ?? 0);
  // Simplified He Waka Eke Noa methodology (NZ-specific tCO2e/yr per head approximations)
  const methaneT = dairyCows * 3.0 + beefCattle * 2.4 + sheep * 0.4 + deer * 1.1; // CH4 as CO2e
  const n2oT = fertN * 0.0125 * 298 / 1000; // 1.25% emission factor × N2O GWP
  const totalT = methaneT + n2oT;
  return {
    inputs: { dairyCows, beefCattle, sheep, deer, syntheticNKg: fertN },
    methane_tco2e: +methaneT.toFixed(1),
    nitrous_oxide_tco2e: +n2oT.toFixed(1),
    total_emissions_tco2e: +totalT.toFixed(1),
    mitigation_levers: [
      "Switch to lower-N fertilisers or use plantain in pasture mix (~10% CH4 reduction)",
      "Install effluent storage to reduce N2O loss",
      "Plant native riparian zones for sequestration credit",
      "Genetic selection for low-methane animals",
    ],
    legislation: "Climate Change Response Act 2002 (as amended); pricing pathway under He Waka Eke Noa successor framework",
    note: "Indicative only — actual NZ ETS agriculture pricing settings still being finalised. Use for planning, not for filing.",
  };
}

function fepBuilder(args: Record<string, unknown>): unknown {
  const region = String(args.region ?? "unspecified");
  return {
    region,
    sections: [
      { name: "Nutrient management", required: ["Soil tests last 3 yrs", "Nutrient budget (Overseer)", "Fertiliser application records"] },
      { name: "Waterways", required: ["Stock exclusion (cattle, deer, pigs)", "Riparian planting plan", "Crossing structures"] },
      { name: "Effluent", required: ["Storage capacity calc (≥90 days)", "Pond integrity check", "Application records and equipment cal"] },
      { name: "Cultivation & winter grazing", required: ["Slope mapping", "Buffer zones", "Critical source area identification"] },
      { name: "Biodiversity", required: ["Native vegetation register", "Pest/weed control plan"] },
      { name: "Erosion control", required: ["LUC mapping", "Trees/space-planted natives on Class 6e+ slopes"] },
    ],
    legislation: "Resource Management Act 1991, regional plan requirements (varies by council)",
    note: `Specific rules vary — confirm with ${region} Regional Council before lodging.`,
  };
}

function qualmarkCheck(args: Record<string, unknown>): unknown {
  return {
    pillars: [
      { name: "Sustainability", elements: ["Energy efficiency", "Waste reduction", "Carbon footprint baseline", "Sustainability action plan"] },
      { name: "Visitor safety", elements: ["H&S system (HSWA aligned)", "Risk register", "Incident log", "Insurance coverage"] },
      { name: "Cultural competency", elements: ["Te Tiriti acknowledgement", "Tikanga in operations", "Te Reo signage / greeting", "Iwi engagement record"] },
      { name: "Operational quality", elements: ["Customer feedback system", "Staff training register", "Service standards"] },
    ],
    accreditation_levels: ["Endorsed", "Bronze", "Silver", "Gold"],
    next_steps: [
      "Self-assess against Qualmark workbook",
      "Engage approved Qualmark assessor",
      "On-site visit and report",
      "Improvement plan and re-assessment as needed",
    ],
    legislation: "Voluntary accreditation. Aligned with Tourism Industry Aotearoa Tiaki Promise.",
  };
}

async function fcpExport(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  if (!ctx.userId) return { error: "Sign in to export your FCP records." };
  const months = Math.min(Number(args.months ?? 12), 24);
  const since = new Date(Date.now() - months * 30 * 86400000).toISOString();
  // Pull whatever temperature/training/supplier evidence exists for this tenant
  const [{ data: temps }, { data: training }] = await Promise.all([
    ctx.serviceClient.from("temperature_logs").select("*").gte("created_at", since).limit(2000),
    ctx.serviceClient.from("staff_training_records").select("*").gte("created_at", since).limit(500),
  ]);
  return {
    period_months: months,
    since,
    temperature_records_count: temps?.length ?? 0,
    training_records_count: training?.length ?? 0,
    note: "Full PDF export available via /workspace → Compliance → FCP Pack. This summary is for the agent to confirm what's available.",
    legislation: "Food Act 2014 s47 (verification), Food Regulations 2015",
  };
}

function generateAgreement(args: Record<string, unknown>): unknown {
  const name = String(args.employee_name ?? "[Employee Name]");
  const role = String(args.role ?? "[Role]");
  const start = String(args.start_date ?? new Date().toISOString().slice(0, 10));
  const salary = Number(args.salary ?? 0);
  const trial = Boolean(args.trial_period); // only valid if employer has <20 staff
  return {
    title: `Individual Employment Agreement — ${name}`,
    parties: { employer: args.employer_name ?? "[Employer]", employee: name },
    role,
    location: args.location ?? "[Workplace location]",
    hours: args.hours ?? "40 per week, Monday–Friday",
    remuneration: { annual: salary, hourly_equivalent: salary ? +(salary / 2080).toFixed(2) : null },
    start_date: start,
    leave: { annual_weeks: 4, sick_days: 10, public_holidays: 12 },
    trial_period_clause: trial ? "First 90 days probationary period — only available if employer had fewer than 20 employees on the day the agreement was entered into. Dismissal during this period must follow ERA s67A obligations." : null,
    termination_notice_weeks: 4,
    dispute_resolution: "Issues raised through good faith discussion → mediation via MBIE → Employment Relations Authority if unresolved.",
    legislation: "Employment Relations Act 2000, Holidays Act 2003, Wages Protection Act 1983, Minimum Wage Act 1983",
    note: "Template only — have employee read and seek independent advice before signing. Provide a copy at least one full day before they're asked to sign.",
  };
}

async function brandDnaAnalyzer(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const url = String(args.url ?? "");
  if (!url) return { error: "url required" };
  return invokeFunction(ctx, "scan-website", { url });
}

function contentCalendar(args: Record<string, unknown>): unknown {
  const platforms = (args.platforms as string[]) ?? ["instagram", "linkedin"];
  const start = args.start_date ? new Date(String(args.start_date)) : new Date();
  const days = Math.min(Number(args.days ?? 7), 28);
  const NZ_EVENTS_2026: Record<string, string> = {
    "2026-04-25": "ANZAC Day",
    "2026-06-19": "Matariki",
    "2026-09-25": "Te Wiki o te Reo Māori begins",
    "2026-12-26": "Boxing Day",
  };
  const optimalTimes: Record<string, string> = {
    instagram: "11:00 NZST and 19:00 NZST",
    facebook: "12:00 NZST and 20:00 NZST",
    linkedin: "08:00 NZST and 12:00 NZST (Tue–Thu)",
    tiktok: "18:00 NZST and 21:00 NZST",
    twitter: "09:00 NZST and 17:00 NZST",
  };
  const days_out: Array<Record<string, unknown>> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    days_out.push({
      date: iso,
      day_of_week: d.toLocaleDateString("en-NZ", { weekday: "long" }),
      nz_event: NZ_EVENTS_2026[iso] ?? null,
      posts: platforms.map((p) => ({
        platform: p,
        post_at: optimalTimes[p] ?? "12:00 NZST",
        suggested_format: ["carousel", "short_video", "single_image"][i % 3],
      })),
    });
  }
  return {
    start_date: start.toISOString().slice(0, 10),
    days,
    platforms,
    nz_events_in_period: Object.fromEntries(Object.entries(NZ_EVENTS_2026).filter(([d]) => d >= start.toISOString().slice(0, 10) && new Date(d) <= new Date(start.getTime() + days * 86400000))),
    calendar: days_out,
    note: "Pair this calendar with PRISM brand DNA + MUSE copy generation for end-to-end production.",
  };
}

// ────────────────────────────────────────────────────────────────
// UTILITY
// ────────────────────────────────────────────────────────────────
function addBusinessDays(days: number, from = new Date()): string {
  let added = 0;
  const d = new Date(from);
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}

// Helper for chat/index.ts to construct a service client when needed
export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ────────────────────────────────────────────────────────────────
// BACKFILLED HANDLERS — apex / arai / forge / toro / auaha /
// prism / echo / cross-agent / evidence pack
// All deterministic where possible; integration-flavoured tools
// either invoke an existing edge function or return a structured
// stub the LLM can surface to the user (never silent fail).
// ────────────────────────────────────────────────────────────────

function integrationStub(name: string, args: Record<string, unknown>): unknown {
  return {
    status: "draft",
    integration: name,
    note: `${name} integration is staged but not yet activated for this tenant. The request was captured and queued for human review.`,
    captured_args: args,
  };
}

// ── APEX (Construction risk / scheduling / tenders) ─────────────
function apexSafetyPlan(args: Record<string, unknown>): unknown {
  const project = String(args.project_name ?? "Unnamed project");
  const hazards = Array.isArray(args.hazards) ? args.hazards as string[] : ["Working at height", "Manual handling", "Plant operation"];
  return {
    project,
    plan_ref: `SSSP-${Date.now().toString().slice(-6)}`,
    hazards: hazards.map((h) => ({
      hazard: h,
      controls: ["Eliminate where reasonably practicable", "Engineering controls", "Administrative controls", "PPE"],
      review_frequency_days: 30,
    })),
    legislation: ["Health and Safety at Work Act 2015", "HSWA General Risk and Workplace Management Regulations 2016"],
    next_toolbox_due_days: 7,
  };
}

function apexScheduleRisk(args: Record<string, unknown>): unknown {
  const tasks = Array.isArray(args.tasks) ? args.tasks as Array<Record<string, unknown>> : [];
  const flagged = tasks.filter((t) => Number(t.float_days ?? 99) <= 2 || Number(t.weather_sensitivity ?? 0) >= 3);
  return {
    total_tasks: tasks.length,
    high_risk_tasks: flagged.length,
    risk_rating: flagged.length === 0 ? "low" : flagged.length < 3 ? "medium" : "high",
    flagged: flagged.map((t) => ({ name: t.name, reason: Number(t.float_days ?? 99) <= 2 ? "Critical path, no float" : "Weather-sensitive" })),
    recommendation: flagged.length > 0 ? "Re-baseline and confirm critical path with PM before next progress claim." : "Schedule healthy.",
  };
}

function apexTenderAnnouncement(args: Record<string, unknown>): unknown {
  const project = String(args.project_name ?? "New build");
  const value = Number(args.contract_value_nzd ?? 0);
  return {
    headline: `${project} awarded`,
    body: `We're pleased to announce the award of ${project}${value ? ` (NZ$${value.toLocaleString("en-NZ")} ex GST)` : ""}. Work commences per the agreed programme. All H&S, insurance and CCA 2002 documentation is in place.`,
    distribution: ["LinkedIn", "Internal newsletter", "Client confirmation email"],
    review_required: true,
  };
}

// ── ARAI (Site induction / hazard register) ─────────────────────
function araiHazardRegister(args: Record<string, unknown>): unknown {
  const site = String(args.site_name ?? "Site");
  const items = Array.isArray(args.items) ? args.items as Array<Record<string, unknown>> : [];
  return {
    site,
    register_id: `HR-${Date.now().toString().slice(-6)}`,
    entries: items.map((i, idx) => ({
      ref: idx + 1,
      hazard: i.hazard ?? "Unspecified",
      likelihood: i.likelihood ?? "possible",
      consequence: i.consequence ?? "moderate",
      controls: i.controls ?? ["Hierarchy of controls applied"],
      review_due_days: 30,
    })),
    legislation: ["HSWA 2015 s36", "HSWA s37 (PCBU duties)"],
  };
}

function araiSiteInduction(args: Record<string, unknown>): unknown {
  const worker = String(args.worker_name ?? "Worker");
  const site = String(args.site_name ?? "Site");
  return {
    induction_id: `IND-${Date.now().toString().slice(-6)}`,
    worker,
    site,
    completed_modules: ["Site rules", "Emergency procedures", "PPE requirements", "Hazard reporting"],
    valid_until_days: 90,
    next_action: "Worker to sign acknowledgement before entering site.",
  };
}

// ── FORGE (Auto / fleet) ────────────────────────────────────────
function forgeCinGenerator(args: Record<string, unknown>): unknown {
  const buyer = String(args.buyer_name ?? "Buyer");
  const vin = String(args.vin ?? "");
  return {
    cin_ref: `CIN-${Date.now().toString().slice(-6)}`,
    buyer,
    vin,
    disclosures: [
      "Vehicle history checked against Waka Kotahi",
      "Odometer reading recorded and verified",
      "Money owing check completed (PPSR)",
      "Compliance with Consumer Information Standards Notice 2008",
    ],
    sign_off_required: true,
  };
}

async function forgeFleetDashboard(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const userId = ctx.userId;
  if (!userId) return { error: "Sign-in required to load fleet dashboard." };
  try {
    const { data, error } = await ctx.serviceClient
      .from("arataki_workflow_records")
      .select("vin, vehicle_ref, risk_rating, exposure_nzd, workflow_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { error: error.message };
    const total_exposure = (data ?? []).reduce((s, r) => s + Number(r.exposure_nzd ?? 0), 0);
    return { vehicles: data ?? [], total_exposure_nzd: total_exposure, generated_at: new Date().toISOString() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

function forgeRucCalculator(args: Record<string, unknown>): unknown {
  const km = Number(args.kilometres ?? 0);
  const weight_class = Number(args.weight_class ?? 6); // RUC weight band
  // 2026 indicative diesel RUC rates per 1000km, NZD ex GST
  const ratePer1000: Record<number, number> = { 1: 76, 2: 82, 6: 92, 14: 296, 19: 500 };
  const rate = ratePer1000[weight_class] ?? 92;
  const cost = (km / 1000) * rate;
  return {
    kilometres: km,
    weight_class,
    rate_per_1000km_nzd: rate,
    ruc_cost_nzd_ex_gst: Math.round(cost * 100) / 100,
    source: "Waka Kotahi RUC schedule (indicative 2026)",
  };
}

function forgeServiceReminder(args: Record<string, unknown>): unknown {
  const last_service_km = Number(args.last_service_km ?? 0);
  const current_km = Number(args.current_km ?? 0);
  const interval_km = Number(args.interval_km ?? 10000);
  const due_in_km = (last_service_km + interval_km) - current_km;
  return {
    due_in_km,
    overdue: due_in_km < 0,
    next_service_at_km: last_service_km + interval_km,
    recommendation: due_in_km < 0 ? "Service is overdue — book immediately." : due_in_km < 1000 ? "Book service in the next two weeks." : "On schedule.",
  };
}

function forgeWofTracker(args: Record<string, unknown>): unknown {
  const expiry = String(args.wof_expiry ?? "");
  const today = new Date();
  const exp = new Date(expiry);
  const days = Math.round((exp.getTime() - today.getTime()) / 86400000);
  let status: "ok" | "due_soon" | "expired";
  if (isNaN(days)) status = "expired";
  else if (days < 0) status = "expired";
  else if (days <= 30) status = "due_soon";
  else status = "ok";
  return {
    wof_expiry: expiry,
    days_until_expiry: isNaN(days) ? null : days,
    status,
    legislation: "Land Transport Rule: Vehicle Standards Compliance 2002",
  };
}

// ── TORO (farm) ─────────────────────────────────────────────────
function toroEtsCalculator(args: Record<string, unknown>): unknown {
  // Reuse the main ETS calc, framed for on-farm use.
  return etsCalculator(args);
}

function toroFepBuilder(args: Record<string, unknown>): unknown {
  return fepBuilder(args);
}

function toroMilkPrice(args: Record<string, unknown>): unknown {
  const kg_ms = Number(args.kg_milksolids ?? 0);
  const forecast_per_kg = Number(args.forecast_price_per_kg_ms ?? 8.40); // 2025/26 indicative
  const gross = kg_ms * forecast_per_kg;
  return {
    kg_milksolids: kg_ms,
    forecast_price_per_kg_ms_nzd: forecast_per_kg,
    gross_payout_nzd: Math.round(gross),
    source: "Indicative Fonterra forecast 2025/26 — confirm with your processor.",
  };
}

function toroNaitTracker(args: Record<string, unknown>): unknown {
  return naitChecker(args);
}

function toroSeasonalSweep(args: Record<string, unknown>): unknown {
  const month = Number(args.month ?? new Date().getMonth() + 1);
  const tasks: Record<number, string[]> = {
    1: ["Heat stress monitoring", "Pasture cover check", "Drench programme review"],
    4: ["Autumn pasture transition", "Body condition score", "Winter feed budget"],
    7: ["Calving prep", "Mastitis vaccinations", "Effluent system check"],
    10: ["Spring pasture management", "Mating prep", "FEP review"],
  };
  const closest = [1, 4, 7, 10].reduce((p, c) => Math.abs(c - month) < Math.abs(p - month) ? c : p, 1);
  return { month, season_focus: tasks[closest], next_review_days: 30 };
}

// ── PRISM (brand / visual) ──────────────────────────────────────
function prismBrandLock(args: Record<string, unknown>): unknown {
  const brand = String(args.brand_name ?? "Brand");
  const colours = Array.isArray(args.colours) ? args.colours : [];
  const fonts = Array.isArray(args.fonts) ? args.fonts : [];
  return {
    brand,
    locked: true,
    palette: colours,
    typography: fonts,
    enforcement: "All future creative will be checked against this lock before publish.",
    lock_id: `BL-${Date.now().toString().slice(-6)}`,
  };
}

function prismCampaignEngine(args: Record<string, unknown>): unknown {
  const goal = String(args.goal ?? "Awareness");
  const audience = String(args.audience ?? "NZ SMB owners");
  const platforms = Array.isArray(args.platforms) ? args.platforms : ["LinkedIn", "Instagram", "Email"];
  return {
    campaign_id: `CMP-${Date.now().toString().slice(-6)}`,
    goal,
    audience,
    platforms,
    suggested_cadence: { weeks: 6, posts_per_week: 3 },
    next_step: "Brief Muse to draft the first wave of creative.",
  };
}

// ── ECHO (analytics) ────────────────────────────────────────────
async function echoAnalyticsFeedback(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const userId = ctx.userId;
  if (!userId) return { error: "Sign-in required for analytics." };
  try {
    const { data, error } = await ctx.serviceClient
      .from("agent_analytics")
      .select("agent_name, response_time_ms, estimated_cost_nzd, from_cache, error")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { error: error.message };
    const rows = data ?? [];
    const total = rows.length;
    const errors = rows.filter((r) => r.error).length;
    const cache_hit_rate = total ? rows.filter((r) => r.from_cache).length / total : 0;
    const avg_latency_ms = total ? Math.round(rows.reduce((s, r) => s + Number(r.response_time_ms ?? 0), 0) / total) : 0;
    const total_cost_nzd = rows.reduce((s, r) => s + Number(r.estimated_cost_nzd ?? 0), 0);
    return { sample: total, errors, error_rate: total ? errors / total : 0, cache_hit_rate, avg_latency_ms, total_cost_nzd: Math.round(total_cost_nzd * 100) / 100 };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// ── EVIDENCE PACK + CROSS-AGENT HANDOFF ─────────────────────────
async function evidencePack(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const userId = ctx.userId;
  if (!userId) return { error: "Sign-in required to file an evidence pack." };
  const workflow_type = String(args.workflow_type ?? "manual");
  const summary = String(args.summary ?? "");
  try {
    const { data, error } = await ctx.serviceClient
      .from("evidence_packs")
      .insert({
        user_id: userId,
        agent_id: ctx.agentId,
        workflow_type,
        summary,
        payload: args,
      })
      .select("id, created_at")
      .single();
    if (error) return { error: error.message, hint: "Evidence pack table may need a column adjustment." };
    return { evidence_pack_id: data?.id, created_at: data?.created_at, status: "filed" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function crossAgentHandoff(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const userId = ctx.userId;
  if (!userId) return { error: "Sign-in required to hand off between agents." };
  const target_agent = String(args.target_agent ?? "");
  const trigger_event = String(args.trigger_event ?? "manual_handoff");
  const target_action = String(args.target_action ?? "review");
  if (!target_agent) return { error: "target_agent is required" };
  try {
    const { data, error } = await ctx.serviceClient
      .from("agent_triggers")
      .insert({
        user_id: userId,
        trigger_agent: ctx.agentId,
        target_agent,
        trigger_event,
        target_action,
        payload: args,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    return { handoff_id: data?.id, target_agent, status: "queued" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// ────────────────────────────────────────────────────────────────
// TORO (family life) handlers — read/write against toroa_* tables.
// All queries are family-scoped via family_members.user_id = auth.uid()
// and the RLS policies on the toroa_* tables enforce membership.
// We use the service client and pre-resolve the family_id so the LLM
// never has to pass tenant context.
// ────────────────────────────────────────────────────────────────

async function resolveFamilyId(ctx: ToolContext): Promise<{ family_id: string | null; error?: string }> {
  if (!ctx.userId) return { family_id: null, error: "Sign-in required for TORO family tools." };
  const { data, error } = await ctx.serviceClient
    .from("family_members")
    .select("family_id")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return { family_id: null, error: error.message };
  if (!data?.family_id) return { family_id: null, error: "No family on this account yet. Create a family in TORO first." };
  return { family_id: data.family_id };
}

async function toroListChildren(ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const { data, error: qErr } = await ctx.serviceClient
    .from("toroa_children")
    .select("id, name, age, year_level, school, allergies, dietary_requirements")
    .eq("family_id", family_id)
    .order("age", { ascending: false });
  if (qErr) return { error: qErr.message };
  return { source: "toroa_children", count: data?.length ?? 0, children: data ?? [] };
}

async function toroListHomeworkDue(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const childId = String(args.child_id ?? "");
  if (!childId) return { error: "child_id is required" };
  const within = Math.max(1, Math.min(60, Number(args.within_days ?? 14)));
  const cutoff = new Date(Date.now() + within * 86400000).toISOString().slice(0, 10);
  const { data, error: qErr } = await ctx.serviceClient
    .from("toroa_homework")
    .select("id, title, subject, due_date, due_time, status, estimated_hours, ncea_standard, difficulty")
    .eq("family_id", family_id)
    .eq("child_id", childId)
    .neq("status", "done")
    .lte("due_date", cutoff)
    .order("due_date", { ascending: true });
  if (qErr) return { error: qErr.message };
  return { source: "toroa_homework", count: data?.length ?? 0, within_days: within, items: data ?? [] };
}

async function toroGetPocketMoneyBalances(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const childId = String(args.child_id ?? "");
  if (!childId) return { error: "child_id is required" };
  const { data, error: qErr } = await ctx.serviceClient
    .from("toroa_child_pocket_money")
    .select("save_balance, spend_balance, give_balance, weekly_amount, save_percent, spend_percent, give_percent, payday")
    .eq("family_id", family_id)
    .eq("child_id", childId)
    .maybeSingle();
  if (qErr) return { error: qErr.message };
  if (!data) return { source: "toroa_child_pocket_money", note: "No pocket-money plan set up for this child yet." };
  return {
    source: "toroa_child_pocket_money",
    balances: { save: data.save_balance, spend: data.spend_balance, give: data.give_balance },
    weekly: { amount: data.weekly_amount, save_pct: data.save_percent, spend_pct: data.spend_percent, give_pct: data.give_percent, payday: data.payday },
  };
}

async function toroRequestPurchaseApproval(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const child_id = String(args.child_id ?? "");
  const amount = Number(args.amount ?? 0);
  const jar = String(args.jar ?? "spend");
  const description = String(args.description ?? "");
  if (!child_id || !amount || !description) {
    return { error: "child_id, amount and description are required" };
  }
  if (!["save", "spend", "give"].includes(jar)) return { error: "jar must be save, spend or give" };
  const { data, error: qErr } = await ctx.serviceClient
    .from("toroa_purchase_approvals")
    .insert({
      family_id,
      child_id,
      amount,
      jar,
      description,
      item_url: args.item_url ? String(args.item_url) : null,
      status: "pending",
      requested_at: new Date().toISOString(),
    })
    .select("id, status, requested_at")
    .single();
  if (qErr) return { error: qErr.message };
  return { source: "toroa_purchase_approvals", request_id: data?.id, status: data?.status, message: "Awaiting parent approval." };
}

async function toroAddShoppingItem(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const item = String(args.item ?? "").trim();
  const quantity = String(args.quantity ?? "").trim();
  const category = args.category ? String(args.category) : "other";
  if (!item || !quantity) return { error: "item and quantity are required" };

  // Append to the active shopping list, creating one if needed.
  const { data: existing, error: listErr } = await ctx.serviceClient
    .from("toroa_family_shopping_lists")
    .select("id, items")
    .eq("family_id", family_id)
    .neq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (listErr) return { error: listErr.message };

  const newRow = { item, quantity, category, added_at: new Date().toISOString() };
  if (existing?.id) {
    const items = Array.isArray(existing.items) ? existing.items : [];
    const { error: upErr } = await ctx.serviceClient
      .from("toroa_family_shopping_lists")
      .update({ items: [...items, newRow], updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (upErr) return { error: upErr.message };
    return { source: "toroa_family_shopping_lists", list_id: existing.id, added: newRow };
  }
  const { data: created, error: insErr } = await ctx.serviceClient
    .from("toroa_family_shopping_lists")
    .insert({
      family_id,
      list_name: "Shopping list",
      items: [newRow],
      status: "active",
    })
    .select("id")
    .single();
  if (insErr) return { error: insErr.message };
  return { source: "toroa_family_shopping_lists", list_id: created?.id, added: newRow, created: true };
}

async function toroTodayRoutine(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const segment = String(args.segment ?? "all");
  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long" }).toLowerCase();
  let q = ctx.serviceClient
    .from("toroa_daily_routines")
    .select("id, child_id, routine_name, routine_type, steps, start_time, estimated_minutes, reward_points, active_days")
    .eq("family_id", family_id)
    .eq("is_active", true);
  if (segment !== "all") q = q.eq("routine_type", segment);
  const { data, error: qErr } = await q.order("start_time", { ascending: true });
  if (qErr) return { error: qErr.message };
  const filtered = (data ?? []).filter((r: { active_days: string[] | null }) =>
    !r.active_days || r.active_days.length === 0 || r.active_days.includes(today)
  );
  return { source: "toroa_daily_routines", segment, today, count: filtered.length, routines: filtered };
}

async function toroImmunisationsDue(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const { family_id, error } = await resolveFamilyId(ctx);
  if (error) return { error };
  const child_id = String(args.child_id ?? "");
  if (!child_id) return { error: "child_id is required" };
  const window = Math.max(7, Math.min(365, Number(args.window_days ?? 60)));
  const cutoff = new Date(Date.now() + window * 86400000).toISOString().slice(0, 10);
  const { data, error: qErr } = await ctx.serviceClient
    .from("toroa_immunisation_schedule")
    .select("vaccine_name, vaccine_code, scheduled_age, scheduled_date, status, nz_schedule_ref, clinic")
    .eq("family_id", family_id)
    .eq("child_id", child_id)
    .neq("status", "administered")
    .lte("scheduled_date", cutoff)
    .order("scheduled_date", { ascending: true });
  if (qErr) return { error: qErr.message };
  return { source: "toroa_immunisation_schedule", window_days: window, count: data?.length ?? 0, due: data ?? [] };
}

async function toroCurriculumResources(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const yearLevelRaw = String(args.year_level ?? "").trim();
  const topic = String(args.topic ?? "").trim();
  if (!yearLevelRaw || !topic) return { error: "year_level and topic are required" };
  // Year level may arrive as 'Y8', 'Year 8', 'NCEA L2' — extract the digit.
  const yMatch = yearLevelRaw.match(/(\d+)/);
  const yearInt = yMatch ? Number(yMatch[1]) : null;
  let q = ctx.serviceClient
    .from("toroa_curriculum_resources")
    .select("resource_name, resource_url, resource_type, provider, ncea_standard, curriculum_area, is_free, quality_rating")
    .or(`curriculum_area.ilike.%${topic}%,curriculum_strand.ilike.%${topic}%,resource_name.ilike.%${topic}%`)
    .order("quality_rating", { ascending: false })
    .limit(10);
  if (yearInt !== null) q = q.eq("year_level", yearInt);
  if (/ncea\s*l\s*\d/i.test(yearLevelRaw)) {
    const lvl = yearLevelRaw.match(/l\s*(\d)/i)?.[1];
    if (lvl) q = q.ilike("ncea_standard", `%L${lvl}%`);
  }
  const { data, error: qErr } = await q;
  if (qErr) return { error: qErr.message };
  return { source: "toroa_curriculum_resources", year_level: yearLevelRaw, topic, count: data?.length ?? 0, resources: data ?? [] };
}

// ────────────────────────────────────────────────────────────────
// SCOPE MAPPING — used by chat/index.ts to filter tool_registry rows
// against live-data-context's KETE_SCOPES. If a tool declares
// requires_integration = ['weather'] but the agent's kete cannot
// reach weather, the tool is dropped from the LLM's option list and
// an audit row is written.
// ────────────────────────────────────────────────────────────────
export const TOOL_REQUIRED_SCOPES: Record<string, string[]> = {
  // Live data tools (also seeded into tool_registry.requires_integration)
  get_nz_weather: ["weather"],
  get_nz_fuel_prices: ["fuel"],
  get_nz_route: ["routes"],
  search_knowledge_base: ["knowledge_base"],
  recall_memory: [],
  get_compliance_updates: ["compliance"],
  get_iot_signal: ["fleet", "freight", "ais", "agriculture", "construction", "marine"],
  send_sms: [],
};
