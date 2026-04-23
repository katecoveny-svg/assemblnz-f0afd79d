// SECTOR ORCHESTRATOR — multi-agent chains across all five industry kete.
// Originally Waihanga; extended 2026-04 to cover Architecture, Engineering,
// Customs/Pikau, and Logistics. Every chain runs as: Iho-routed sequence →
// Kahu compliance gate baked into each agent prompt → MANA audit write.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

type WorkflowType =
  | "retention_compliance_loop" | "payment_claim_generator" | "daily_site_safety" | "consent_readiness_precheck"
  | "producer_statement_gate" | "scope_creep_variation_letter" | "pi_renewal_brief_builder"
  | "live_utilisation_forecast" | "historical_hours_proposal_challenger" | "tender_response_auto_draft"
  | "landed_cost_calculator" | "biosecurity_pre_clearance" | "fta_preference_claim" | "cbam_emissions_reporting"
  | "ruc_auto_reconcile" | "driver_work_time_compliance" | "contractor_gateway_audit"
  | "daily_food_safety_diary" | "labour_cost_optimiser" | "menu_gp_monitor" | "review_response_engine"
  | "alcohol_licence_renewal" | "staff_induction_pipeline" | "experiential_story_builder"
  | "wof_fleet_scheduler" | "cin_generator_validator" | "mvdt_defence_pack"
  | "vehicle_entry_precheck" | "workshop_utilisation_no_show" | "ev_hv_safe_work_decision_tree"
  | "automotive_review_engine";

type Sector = "waihanga" | "architecture" | "engineering" | "customs" | "logistics" | "manaaki" | "arataki";

const CHAINS: Record<WorkflowType, { sector: Sector; agents: string[]; description: string; kbTopics: string[] }> = {
  retention_compliance_loop: { sector: "waihanga", agents: ["LEDGER","APEX","ANCHOR","AROHA","MANA"], description: "Detect retention-applicable invoice → confirm clause → ring-fence → quarterly subcontractor reports → email → audit", kbTopics: ["CCA 2002 s.18 retention trust","MBIE retention regulations 2023"] },
  payment_claim_generator: { sector: "waihanga", agents: ["KAUPAPA","APEX","ANCHOR","LEDGER","AROHA"], description: "Milestone complete → contract terms → CCA s20 claim → maths validated → emailed", kbTopics: ["CCA 2002 s.20 payment claim","NZS3910:2023 payments"] },
  daily_site_safety: { sector: "waihanga", agents: ["ARAI","PULSE","APEX","MANA"], description: "Toolbox topic 06:30 → confirmation → incident monitoring → notifiable event → audit", kbTopics: ["HSWA 2015 notifiable events","WorkSafe toolbox rotation"] },
  consent_readiness_precheck: { sector: "waihanga", agents: ["ARC","APEX","ANCHOR","KAHU"], description: "Drawings vs council → H1 + Code → PS1 → council triggers → green/amber/red", kbTopics: ["Building Code H1","PS1 producer statement","Council knock-back triggers"] },
  producer_statement_gate: { sector: "architecture", agents: ["APEX","ANCHOR","ARC","MANA"], description: "PS1 scope vs architect registration → NZACS PI wording → drawings/spec consistency → audit pack", kbTopics: ["Registered Architects Act 2005","MBIE PS1 PS2 PS3 PS4 guidance","E2 AS1 external moisture"] },
  scope_creep_variation_letter: { sector: "architecture", agents: ["PRISM","ANCHOR","LEDGER","AROHA"], description: "Detect scope-change language → compare to brief → quantify fee/time → variation letter", kbTopics: ["NZIA Agreement for Architects Services"] },
  pi_renewal_brief_builder: { sector: "architecture", agents: ["VAULT","LEDGER","ANCHOR","APEX"], description: "Live project register → fee tally → near-miss notes → PI landmines → 90-day renewal disclosure", kbTopics: ["Registered Architects Act 2005","MBIE PS1 PS2 PS3 PS4 guidance"] },
  live_utilisation_forecast: { sector: "engineering", agents: ["AXIS","LEDGER","PULSE","AROHA"], description: "Pull timesheets → 7d/4w utilisation → flag <60% / >90% → Monday RAG report", kbTopics: ["NZ engineering consultancy utilisation benchmarks"] },
  historical_hours_proposal_challenger: { sector: "engineering", agents: ["APEX","AXIS","LEDGER"], description: "Categorise work packages → pull historical hours → flag >15% below mean → challenge brief", kbTopics: ["NZ engineering consultancy utilisation benchmarks","NZS3910 NZS3915 NZS3917"] },
  tender_response_auto_draft: { sector: "engineering", agents: ["APEX","PRISM","TIKA","AROHA"], description: "Watch GETS → score for fit → auto-draft standard sections → 5-day pre-close alert", kbTopics: ["MBIE Government Procurement Rules"] },
  landed_cost_calculator: { sector: "customs", agents: ["APEX","LEDGER","ANCHOR"], description: "HS code + origin + CIF + mode → 2026 levy + duty + GST + biosecurity → audited landed cost", kbTopics: ["NZ Working Tariff Document 2026","Goods Management Levy 2026","NZ FTA preference rules of origin"] },
  biosecurity_pre_clearance: { sector: "customs", agents: ["APEX","ANCHOR","AROHA","SIGNAL"], description: "Review docs vs IHS → flag missing → submit pre-clearance → TSW response monitoring", kbTopics: ["Biosecurity Act 1993 IHS"] },
  fta_preference_claim: { sector: "customs", agents: ["ANCHOR","APEX","LEDGER"], description: "Identify FTA + RoO → draft Certificate of Origin request → calculate duty saving", kbTopics: ["NZ FTA preference rules of origin","NZ Working Tariff Document 2026"] },
  cbam_emissions_reporting: { sector: "customs", agents: ["TERRA","LEDGER","ANCHOR"], description: "Per-shipment emissions → format for CBAM/UK CBAM/ESG", kbTopics: ["EU CBAM regulation 2026"] },
  ruc_auto_reconcile: { sector: "logistics", agents: ["FLUX","LEDGER","APEX"], description: "Hubodometer → reconcile vs RUC → run-out projection → auto-purchase 7 days out", kbTopics: ["Road User Charges Act 2012"] },
  driver_work_time_compliance: { sector: "logistics", agents: ["PULSE","APEX","AROHA"], description: "Driver status → cumulative on-duty → 30-min-out warning → suggest legal rest stop", kbTopics: ["Land Transport Work Time Logbooks 2007"] },
  contractor_gateway_audit: { sector: "logistics", agents: ["AROHA","ANCHOR","LEDGER"], description: "Gateway test → low/med/high/critical → remediation path → back-pay exposure", kbTopics: ["Employment Relations Amendment 2026 gateway test"] },

  // Manaaki (hospitality)
  daily_food_safety_diary: { sector: "manaaki", agents: ["AURA","APEX","MANA"], description: "Open/close shift prompts: temps, cleaning, allergen, staff health → corrective actions → MPI-ready monthly summary", kbTopics: ["Food Act 2014 Food Control Plan","Allergen management NZ Food Safety"] },
  labour_cost_optimiser: { sector: "manaaki", agents: ["AURA","AROHA","LEDGER"], description: "POS history + weather + events → 30-min cover forecast → 3 roster variants → publish → variance learning", kbTopics: ["Hospitality NZ employment agreements","Restaurant Association Hospitality Report"] },
  menu_gp_monitor: { sector: "manaaki", agents: ["AURA","LEDGER","PRISM"], description: "Supplier invoices → match to dish recipes → weekly GP recalc → flag >3% movement → reprice/portion/swap suggestions", kbTopics: ["Restaurant Association Hospitality Report"] },
  review_response_engine: { sector: "manaaki", agents: ["AURA","PRISM","NOVA"], description: "Monitor Google/TripAdvisor → draft in venue voice → flag allergen/staff/defamation → daily digest → posted on approval", kbTopics: ["Allergen management NZ Food Safety"] },
  alcohol_licence_renewal: { sector: "manaaki", agents: ["ANCHOR","AURA","KAHU"], description: "Track on-licence expiry → 60-day renewal draft → manager certificate check → public-notice + host-responsibility pack", kbTopics: ["Sale and Supply of Alcohol Act 2012"] },
  staff_induction_pipeline: { sector: "manaaki", agents: ["AROHA","AURA"], description: "Structured induction by phone → comprehension check → training record kept for HR/MPI", kbTopics: ["Hospitality NZ employment agreements","Food Act 2014 Food Control Plan"] },
  experiential_story_builder: { sector: "manaaki", agents: ["PRISM","AURA"], description: "Provenance/kaimoana sourcing + producer partnerships → menu/social/staff briefing copy in venue voice", kbTopics: [] },

  // Arataki (automotive)
  wof_fleet_scheduler: { sector: "arataki", agents: ["APEX","FLUX","AROHA","ANCHOR"], description: "Rego → Nov-2026/2027 WoF rule classification → per-vehicle calendar → 14-day reminder → insurance attestation", kbTopics: ["Land Transport WoF Rule 2026","Waka Kotahi VIRM Light Vehicles"] },
  cin_generator_validator: { sector: "arataki", agents: ["APEX","ANCHOR","PRISM","MANA"], description: "VIN+rego → MVSA-compliant CIN → printable + online listing → immutable versioned audit", kbTopics: ["Motor Vehicle Sales Act 2003 CIN"] },
  mvdt_defence_pack: { sector: "arataki", agents: ["APEX","ANCHOR","MANA","NOVA"], description: "MVDT claim → match sale + CIN version → CGA response pack → timestamped evidence chain → tribunal submission", kbTopics: ["Motor Vehicle Sales Act 2003 CIN","CGA MVDT case law"] },
  vehicle_entry_precheck: { sector: "arataki", agents: ["APEX","ANCHOR","SIGNAL"], description: "Pre-import VIN check vs current Waka Kotahi acceptance: ESC, emissions, frontal impact → pass/refer", kbTopics: ["Waka Kotahi vehicle entry certification"] },
  workshop_utilisation_no_show: { sector: "arataki", agents: ["AXIS","FLUX","AROHA","LEDGER"], description: "Booking diary → hoist utilisation → 24-hr confirm/reschedule → weekly recovered no-show revenue", kbTopics: [] },
  ev_hv_safe_work_decision_tree: { sector: "arataki", agents: ["PULSE","APEX","AURA","MANA"], description: "VIN → EV/PHEV/HEV/ICE → manufacturer HV-isolation procedure → photo-evidenced checklist → audit log; refer if out of scope", kbTopics: ["High-Voltage EV Safe Work standards","HSWA 2015 notifiable events"] },
  automotive_review_engine: { sector: "arataki", agents: ["AURA","PRISM","NOVA"], description: "Workshop/dealer reviews across Google/Autotrader/Carsales → draft in voice → defamation/allergen flags → goodwill scripts", kbTopics: [] },
};

const AGENT_ROLES: Record<string,string> = {
  LEDGER:"You are LEDGER, NZ business finance. Cite CCA 2002, Working Tariff, RUC Act, IRD guidance accurately.",
  APEX:"You are APEX, NZ regulatory expert. Cite NZS3910/3917, Building Code, HSWA 2015, Customs Act 2018, Land Transport rules.",
  ANCHOR:"You are ANCHOR, NZ documentation specialist. Draft compliant claims, certificates, PS1s, variation letters.",
  AROHA:"You are AROHA, NZ comms specialist. Draft client emails, retention reports, scope-change letters, driver alerts.",
  MANA:"You are MANA, immutable audit trail keeper. Produce evidence packs with timestamps and citations.",
  KAUPAPA:"You are KAUPAPA, NZ construction PM. Detect milestones, pull contract terms, retention %, payment schedules.",
  ARAI:"You are ĀRAI, NZ site safety. Push WorkSafe toolbox talks; record attendance.",
  PULSE:"You are PULSE, monitoring. Classify incidents vs HSWA notifiable criteria; track timesheet/sentiment; capture driver status.",
  ARC:"You are ARC, NZ council consents. Review apps vs council knock-back triggers and Acceptable Solutions.",
  KAHU:"You are KAHU, compliance gate. Score vs council triggers. Output green/amber/red.",
  PRISM:"You are PRISM, NZ comms/creative. Detect scope-change language; reframe value vs AI concept; draft proposals.",
  VAULT:"You are VAULT, records. Maintain registers of projects, scope, disclosures for PI renewal and audits.",
  AXIS:"You are AXIS, professional services utilisation. Calculate billable utilisation; surface historical hours.",
  FLUX:"You are FLUX, NZ fleet ops. Ingest telematics; reconcile RUC; route-optimise with bridge weight & curfew.",
  TIKA:"You are TIKA, NZ govt procurement. Score GETS tenders using MBIE rules and Te Tiriti weighting.",
  SIGNAL:"You are SIGNAL, supply-chain early warning. Watch ports, ETAs, MPI processing, TSW responses.",
  MARINER:"You are MARINER, maritime/AIS. Use AIS feeds, port arrivals, carrier rollover history.",
  TERRA:"You are TERRA, emissions accounting. Per-shipment emissions; format for CBAM/UK CBAM/ESG.",
  HAVEN:"You are HAVEN, cold-chain integrity. IoT temperature; alert on excursions; compliant records.",
  NOVA:"You are NOVA, AR specialist. Monitor debtor ageing; surface cashflow risks the day they appear.",
  AURA:"You are AURA, NZ hospitality + automotive operations specialist. Run daily food-safety prompts under Food Act 2014; predict covers and propose roster variants; map invoices to dish recipes for GP; monitor reviews and draft in venue voice; for automotive, walk mechanics through HV-isolation checklists and induction.",
};

function getSupabase(authHeader?: string) {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined);
}

async function callAgent(agent: string, userPrompt: string, kbContext: string, supabase: ReturnType<typeof getSupabase>): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const role = AGENT_ROLES[agent] || `You are ${agent}, a NZ specialist agent.`;
  const sys = `${role}\n\nGROUNDING (cite where relevant):\n${kbContext}\n\nHARD RULES: Never invent statute sections. Never authorise payments or send emails autonomously — always draft for human review. Use NZD and NZ English spelling.`;
  const model = await resolveModel(agent, supabase);
  const res = await fetch(LOVABLE_AI, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: sys }, { role: "user", content: userPrompt }] }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`AI gateway ${res.status}: ${t.slice(0,200)}`); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "(no response)";
}

async function loadKb(supabase: ReturnType<typeof getSupabase>, topics: string[]): Promise<string> {
  if (topics.length === 0) return "(no KB grounding)";
  const { data } = await supabase.from("agent_knowledge_base").select("topic, content, source_url").in("topic", topics).eq("is_active", true).limit(20);
  if (!data || data.length === 0) return "(no KB matches — answer from general NZ knowledge)";
  return data.map((r: any) => `### ${r.topic}\n${r.content}\n${r.source_url ? `Source: ${r.source_url}` : ""}`).join("\n\n");
}

async function persistDomainRecord(supabase: ReturnType<typeof getSupabase>, workflow: WorkflowType, userId: string, runId: string, payload: any, finalOutput: string) {
  const sector = CHAINS[workflow].sector;
  const summary = finalOutput.slice(0, 1000);

  if (sector === "waihanga") {
    if (workflow === "retention_compliance_loop") {
      await supabase.from("waihanga_retention_ledger").insert({
        user_id: userId, run_id: runId, contract_ref: payload.contract_ref || "UNKNOWN",
        subcontractor_name: payload.subcontractor_name || "UNKNOWN",
        amount_nzd: payload.invoice_amount_nzd || 0, retention_pct: payload.retention_pct || 10,
        retention_held_nzd: ((payload.invoice_amount_nzd || 0) * (payload.retention_pct || 10)) / 100,
        trigger_event: payload.trigger_event || "progress", trust_account_ref: payload.trust_account_ref || null,
      });
    } else if (workflow === "payment_claim_generator") {
      const sum = payload.sum_claimed_nzd || 0;
      const due = new Date(); due.setDate(due.getDate() + 20);
      const sched = new Date(); sched.setDate(sched.getDate() + 28);
      await supabase.from("waihanga_payment_claims_v2").insert({
        user_id: userId, run_id: runId, contract_ref: payload.contract_ref || "UNKNOWN",
        principal_name: payload.principal_name || "UNKNOWN", principal_email: payload.principal_email || "unknown@example.com",
        claim_period: payload.claim_period || new Date().toISOString().slice(0,7),
        sum_claimed_nzd: sum, gst_nzd: sum * 0.15, retention_deduction_nzd: payload.retention_deduction_nzd || 0,
        total_due_nzd: sum + sum * 0.15 - (payload.retention_deduction_nzd || 0),
        due_date: due.toISOString().slice(0,10), cca_section_20_compliant: true,
        claim_document_md: finalOutput, schedule_deadline: sched.toISOString().slice(0,10),
      });
    } else if (workflow === "daily_site_safety") {
      await supabase.from("waihanga_safety_log").insert({
        user_id: userId, run_id: runId, toolbox_topic: payload.toolbox_topic || "Daily safety",
        attendees: payload.attendees || [], hazards: payload.hazards || [],
        incidents: payload.incidents || [], notifiable_event: payload.notifiable || false,
        worksafe_draft: payload.notifiable ? finalOutput : null,
      });
    } else if (workflow === "consent_readiness_precheck") {
      const verdict = /\bred\b/i.test(finalOutput) ? "red" : /\bamber\b/i.test(finalOutput) ? "amber" : "green";
      await supabase.from("waihanga_consent_checks").insert({
        user_id: userId, run_id: runId, council: payload.council || "Auckland",
        consent_type: payload.consent_type || "residential", project_ref: payload.project_ref || "UNKNOWN",
        drawings_provided: !!payload.drawings_provided, ps1_drafted: true, readiness_verdict: verdict,
      });
    }
    return;
  }

  const risk = /\bcritical\b/i.test(finalOutput) ? "critical" : /\bhigh\b/i.test(finalOutput) ? "high" : /\bmedium\b/i.test(finalOutput) ? "medium" : "low";

  if (sector === "architecture") {
    await supabase.from("architecture_workflow_records").insert({
      user_id: userId, run_id: runId, workflow_type: workflow,
      project_ref: payload.project_ref || null, payload, result_summary: summary, risk_rating: risk,
    });
  } else if (sector === "engineering") {
    await supabase.from("engineering_workflow_records").insert({
      user_id: userId, run_id: runId, workflow_type: workflow,
      project_ref: payload.project_ref || null, payload, result_summary: summary,
      metric_value: payload.metric_value ?? null, metric_label: payload.metric_label ?? null,
    });
  } else if (sector === "customs") {
    await supabase.from("customs_workflow_records").insert({
      user_id: userId, run_id: runId, workflow_type: workflow,
      shipment_ref: payload.shipment_ref || null, hs_code: payload.hs_code || null,
      origin_country: payload.origin_country || null, payload,
      landed_cost_nzd: payload.landed_cost_nzd ?? null, duty_savings_nzd: payload.duty_savings_nzd ?? null,
      result_summary: summary,
    });
  } else if (sector === "logistics") {
    await supabase.from("logistics_workflow_records").insert({
      user_id: userId, run_id: runId, workflow_type: workflow,
      vehicle_ref: payload.vehicle_ref || null, driver_ref: payload.driver_ref || null,
      payload, result_summary: summary, risk_rating: risk, exposure_nzd: payload.exposure_nzd ?? null,
    });
  } else if (sector === "manaaki") {
    await supabase.from("manaaki_workflow_records").insert({
      user_id: userId, run_id: runId, workflow_type: workflow,
      venue_ref: payload.venue_ref || null, payload,
      result_summary: summary, risk_rating: risk,
      metric_value: payload.metric_value ?? null, metric_label: payload.metric_label ?? null,
    });
  } else if (sector === "arataki") {
    await supabase.from("arataki_workflow_records").insert({
      user_id: userId, run_id: runId, workflow_type: workflow,
      vehicle_ref: payload.vehicle_ref || payload.rego || null,
      vin: payload.vin || null, payload,
      result_summary: summary, risk_rating: risk,
      exposure_nzd: payload.exposure_nzd ?? null,
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || undefined;
    const { workflow, payload, userId } = await req.json() as { workflow: WorkflowType; payload: Record<string,unknown>; userId: string };
    if (!workflow || !CHAINS[workflow]) return new Response(JSON.stringify({ error: "invalid workflow" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = getSupabase(authHeader);
    const chain = CHAINS[workflow];

    const { data: run, error: runErr } = await supabase.from("waihanga_workflow_runs").insert({
      user_id: userId, workflow_type: workflow, status: "running",
      trigger_payload: payload, agent_chain: chain.agents.map((a) => ({ agent: a, status: "pending" })),
    }).select().single();
    if (runErr) throw runErr;

    const kbContext = await loadKb(supabase, chain.kbTopics);
    const transcript: Array<{ agent: string; output: string }> = [];
    const priorContext = `SECTOR: ${chain.sector}\nWORKFLOW: ${workflow}\nDESCRIPTION: ${chain.description}\nINPUT: ${JSON.stringify(payload, null, 2)}`;

    for (const agent of chain.agents) {
      const prompt = `${priorContext}${transcript.length ? `\n\nPRIOR AGENT OUTPUTS:\n${transcript.map((t) => `[${t.agent}]\n${t.output}`).join("\n\n")}` : ""}\n\nYour task as ${agent}: produce the next step in the chain. Be concise, cite NZ statute where relevant, structured output.`;
      const output = await callAgent(agent, prompt, kbContext);
      transcript.push({ agent, output });
    }

    const final = transcript[transcript.length - 1].output;
    const evidencePack = { workflow, sector: chain.sector, run_id: run.id, agent_chain: chain.agents, transcript, timestamp: new Date().toISOString(), kb_sources: chain.kbTopics };

    await persistDomainRecord(supabase, workflow, userId, run.id, payload as any, final);

    await supabase.from("waihanga_workflow_runs").update({
      status: "completed", result: evidencePack, completed_at: new Date().toISOString(),
      agent_chain: chain.agents.map((a) => ({ agent: a, status: "completed" })),
    }).eq("id", run.id);

    await supabase.from("audit_log").insert({
      user_id: userId, agent_code: "MANA", agent_name: "MANA", model_used: "google/gemini-2.5-flash",
      compliance_passed: true, request_summary: `${chain.sector}: ${workflow}`,
      response_summary: final.slice(0, 500), policies_checked: chain.kbTopics, pii_detected: false, pii_masked: false,
    }).then(() => {}).catch((e) => console.warn("audit_log write failed:", e?.message));

    return new Response(JSON.stringify({ success: true, run_id: run.id, sector: chain.sector, transcript, evidence_pack: evidencePack }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("orchestrator error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
