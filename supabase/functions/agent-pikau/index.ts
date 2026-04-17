import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface PerceptionInput {
  requestType: "customs_declaration" | "tariff_classification" | "biosecurity_clearance" | "freight_quote" | "dangerous_goods_check" | "importer_sar";
  shipmentId: string;
  importerId: string;
  userId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface MemoryState {
  shipmentHistory: Record<string, unknown>;
  tariffDatabase: Record<string, unknown>;
  mpiStandards: Record<string, unknown>;
  hsnoClassifications: Record<string, unknown>;
  importerSAR: Record<string, unknown>;
}

interface ReasoningOutput {
  decision: "approved" | "conditional_approval" | "rejected";
  rationale: string;
  complianceChecks: {
    customsCompliance: boolean;
    biosecurityCompliance: boolean;
    dangerousGoodsCompliance: boolean;
    tariffAccuracy: boolean;
    privacyCompliance: boolean;
  };
  riskScore: number;
  estimatedDuties: number;
}

interface ActionResult {
  type: string;
  status: "approved" | "conditional" | "rejected";
  resultId: string;
  timestamp: string;
}

interface ExplanationObject {
  id: string;
  action: string;
  reasoning: string;
  privacyImpact: string;
  complianceGates: string[];
  materialAction: boolean;
  timestamp: string;
}

interface EvidencePack {
  requestId: string;
  perception: PerceptionInput;
  memory: MemoryState;
  reasoning: ReasoningOutput;
  action: ActionResult;
  explanation: ExplanationObject;
  simulation: {
    outcomeIfApproved: string;
    outcomeIfRejected: string;
    alternativeApproaches: string[];
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Customs Declaration Validation (NZ Customs and Excise Act 2018)
function validateCustomsDeclaration(payload: Record<string, unknown>): { compliant: boolean; missingFields: string[] } {
  const requiredFields = ["item_description", "hs_code", "value_nzd", "origin_country", "importer_id", "consignee_details"];
  const missingFields: string[] = [];
  for (const field of requiredFields) {
    if (!payload[field]) missingFields.push(field);
  }
  return { compliant: missingFields.length === 0, missingFields };
}

// HS Code Tariff Classification
function classifyTariff(hsCode: string, valueNzd: number): { hsCodeValid: boolean; tariffRate: number; dualUseAlert: boolean; estimatedDuties: number } {
  const isValid = /^\d{6,10}$/.test(hsCode || "");
  
  // Standard tariff rate lookup (simplified)
  const chapter = parseInt((hsCode || "").substring(0, 2), 10);
  let tariffRate = 5; // default 5%
  if (chapter >= 1 && chapter <= 5) tariffRate = 0; // live animals
  if (chapter >= 84 && chapter <= 85) tariffRate = 0; // machinery
  if (chapter >= 61 && chapter <= 63) tariffRate = 10; // textiles
  if (chapter >= 22 && chapter <= 24) tariffRate = 15; // beverages/tobacco
  
  const dualUseAlert = chapter === 84 || chapter === 85 || chapter === 90; // tech items
  const estimatedDuties = isValid ? (valueNzd * tariffRate) / 100 : 0;

  return { hsCodeValid: isValid, tariffRate, dualUseAlert, estimatedDuties };
}

// MPI Biosecurity Check (Biosecurity Act 1993)
function checkBiosecurity(itemDescription: string, originCountry: string): { requiresClearance: boolean; mpiStandards: string[]; prohibitedItem: boolean; estimatedClearanceTime: number } {
  const desc = (itemDescription || "").toLowerCase();
  const prohibitedTerms = ["live animal", "untreated timber", "raw meat", "soil sample", "live plant"];
  const clearanceTerms = ["food", "fruit", "vegetable", "dairy", "honey", "seed", "wood", "leather"];
  
  const prohibited = prohibitedTerms.some(t => desc.includes(t));
  const requiresClearance = clearanceTerms.some(t => desc.includes(t)) || prohibited;
  
  const mpiStandards: string[] = [];
  if (desc.includes("food") || desc.includes("fruit")) mpiStandards.push("IHS_Food_Safety");
  if (desc.includes("wood") || desc.includes("timber")) mpiStandards.push("IHS_Timber_ISPM15");
  if (desc.includes("dairy")) mpiStandards.push("IHS_Dairy_Import");
  if (originCountry && ["CN", "IN", "TH", "VN"].includes(originCountry.toUpperCase())) mpiStandards.push("Enhanced_Inspection");

  return { requiresClearance, mpiStandards, prohibitedItem: prohibited, estimatedClearanceTime: requiresClearance ? 5 : 0 };
}

// HSNO Dangerous Goods Classification
function classifyDangerousGoods(payload: Record<string, unknown>): { isDangerousGoods: boolean; hsnoClass: string; hazardCategory: string; requiresSpecialHandling: boolean } {
  const desc = ((payload.item_description as string) || "").toLowerCase();
  const dangerousTerms: Record<string, { hsnoClass: string; category: string }> = {
    "flammable": { hsnoClass: "3.1", category: "Flammable Liquid" },
    "explosive": { hsnoClass: "1.1", category: "Explosive" },
    "corrosive": { hsnoClass: "8.1", category: "Corrosive" },
    "toxic": { hsnoClass: "6.1", category: "Toxic" },
    "radioactive": { hsnoClass: "7", category: "Radioactive" },
    "oxidising": { hsnoClass: "5.1", category: "Oxidising Agent" },
    "compressed gas": { hsnoClass: "2.1", category: "Compressed Gas" },
    "lithium batter": { hsnoClass: "9", category: "Miscellaneous DG" },
  };

  for (const [term, info] of Object.entries(dangerousTerms)) {
    if (desc.includes(term)) {
      return { isDangerousGoods: true, hsnoClass: info.hsnoClass, hazardCategory: info.category, requiresSpecialHandling: true };
    }
  }
  return { isDangerousGoods: false, hsnoClass: "safe", hazardCategory: "non-hazardous", requiresSpecialHandling: false };
}

// Policy Gate Enforcement
function applyPolicyGates(action: string, context: Record<string, unknown>): ReasoningOutput {
  const customsCompliant = context.customsCompliant === true;
  const biosecurityCompliant = context.biosecurityCompliant === true;
  const dangerousGoodsHandled = context.dangerousGoodsHandled === true;
  const tariffAccurate = context.tariffAccurate === true;

  let decision: "approved" | "conditional_approval" | "rejected" = "approved";
  let rationale = "All compliance checks passed. Shipment cleared for processing.";
  let riskScore = 10;

  if (context.prohibitedItem === true) {
    decision = "rejected";
    rationale = "Item prohibited under Biosecurity Act 1993. Importation not permitted.";
    riskScore = 99;
  } else if (context.isDangerousGoods === true && !dangerousGoodsHandled) {
    decision = "rejected";
    rationale = "Dangerous goods not declared. HSNO Act violation.";
    riskScore = 98;
  } else if (!customsCompliant) {
    decision = "rejected";
    rationale = "Incomplete customs declaration. Required fields missing per Customs and Excise Act 2018.";
    riskScore = 92;
  } else if (context.requiresClearance === true) {
    decision = "conditional_approval";
    rationale = "MPI clearance required. Shipment held pending biosecurity inspection.";
    riskScore = 45;
  } else if (context.requiresSpecialHandling === true) {
    decision = "conditional_approval";
    rationale = "Special handling procedures required per HSNO Act.";
    riskScore = 60;
  } else if (context.dualUseAlert === true) {
    decision = "conditional_approval";
    rationale = "Dual-use item detected. Requires additional export control verification.";
    riskScore = 55;
  }

  return {
    decision,
    rationale,
    complianceChecks: {
      customsCompliance: customsCompliant,
      biosecurityCompliance: biosecurityCompliant,
      dangerousGoodsCompliance: dangerousGoodsHandled || !(context.isDangerousGoods as boolean),
      tariffAccuracy: tariffAccurate,
      privacyCompliance: true,
    },
    riskScore,
    estimatedDuties: (context.estimatedDuties as number) || 0,
  };
}

// Simulation Layer
function simulateOutcomes(action: string): { outcomeIfApproved: string; outcomeIfRejected: string; alternativeApproaches: string[] } {
  const scenarios: Record<string, { outcomeIfApproved: string; outcomeIfRejected: string; alternativeApproaches: string[] }> = {
    customs_declaration: {
      outcomeIfApproved: "Declaration accepted. Shipment enters Customs processing. Duty assessment confirmed. Goods released upon payment.",
      outcomeIfRejected: "Declaration rejected. Shipment held. Importer notified. Correction or withdrawal options provided.",
      alternativeApproaches: ["Correct and resubmit declaration", "Request tariff reclassification review", "Appeal duty assessment"],
    },
    tariff_classification: {
      outcomeIfApproved: "HS code validated. Tariff rate applied. Duty calculation finalized.",
      outcomeIfRejected: "HS code rejected. Importer must provide additional documentation.",
      alternativeApproaches: ["Submit technical specs for reclassification", "Appeal to Tariff Valuation Authority", "Request Customs ruling"],
    },
    biosecurity_clearance: {
      outcomeIfApproved: "Biosecurity clearance granted. MPI inspection completed. Goods released for entry.",
      outcomeIfRejected: "Biosecurity clearance denied. Goods must be treated, exported, or destroyed per MPI directive.",
      alternativeApproaches: ["Request re-inspection", "Supply treatment certificate", "Apply for exemption"],
    },
    dangerous_goods_check: {
      outcomeIfApproved: "Dangerous goods compliance confirmed. Special handling activated.",
      outcomeIfRejected: "Non-compliance detected. Shipment rejected or diverted to hazmat facility.",
      alternativeApproaches: ["Repackage with proper hazmat labeling", "Reclassify via HSNO authority", "Return to origin"],
    },
  };

  return scenarios[action] || {
    outcomeIfApproved: "Goods approved for entry.",
    outcomeIfRejected: "Goods rejected. Resolution required.",
    alternativeApproaches: ["Contact Customs", "Request review", "Consult trade consultant"],
  };
}

// Main Handler
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const raw = await req.json().catch(() => ({}));
    const input: PerceptionInput = {
      requestType: raw.requestType ?? "customs_declaration",
      shipmentId: raw.shipmentId ?? "",
      importerId: raw.importerId ?? "",
      userId: raw.userId ?? "anonymous",
      payload: raw.payload ?? {},
      timestamp: raw.timestamp ?? new Date().toISOString(),
    };
    const requestId = `pikau_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Layer 1: Perception
    const perception = input;

    // Layer 2: Memory (lightweight — no domain tables yet)
    const memory: MemoryState = {
      shipmentHistory: {},
      tariffDatabase: {},
      mpiStandards: {},
      hsnoClassifications: {},
      importerSAR: {},
    };

    // Layer 3: Reasoning
    const customsValidation = validateCustomsDeclaration(perception.payload);
    const tariffResult = classifyTariff(
      (perception.payload.hs_code as string) || "",
      (perception.payload.value_nzd as number) || 0
    );
    const biosecurityCheck = checkBiosecurity(
      (perception.payload.item_description as string) || "",
      (perception.payload.origin_country as string) || ""
    );
    const dgCheck = classifyDangerousGoods(perception.payload);

    const context = {
      customsCompliant: customsValidation.compliant,
      biosecurityCompliant: !biosecurityCheck.prohibitedItem,
      dangerousGoodsHandled: perception.payload.hsno_class ? true : false,
      tariffAccurate: tariffResult.hsCodeValid,
      prohibitedItem: biosecurityCheck.prohibitedItem,
      requiresClearance: biosecurityCheck.requiresClearance,
      isDangerousGoods: dgCheck.isDangerousGoods,
      requiresSpecialHandling: dgCheck.requiresSpecialHandling,
      dualUseAlert: tariffResult.dualUseAlert,
      estimatedDuties: tariffResult.estimatedDuties,
    };

    const reasoning = applyPolicyGates(perception.requestType, context);

    // Layer 4: Action
    const actionResult: ActionResult = {
      type: perception.requestType,
      status: reasoning.decision === "approved" ? "approved" : reasoning.decision === "conditional_approval" ? "conditional" : "rejected",
      resultId: requestId,
      timestamp: new Date().toISOString(),
    };

    // Layer 5: Explanation
    const explanation: ExplanationObject = {
      id: `exp_${Date.now()}`,
      action: perception.requestType,
      reasoning: reasoning.rationale,
      privacyImpact: perception.requestType === "importer_sar" ? "Importer data subject to Privacy Act 2020 IPP6 access rights" : "Trade data retention per Customs Act 2018",
      complianceGates: Object.entries(reasoning.complianceChecks).filter(([, v]) => !v).map(([k]) => k),
      materialAction: reasoning.decision === "approved",
      timestamp: new Date().toISOString(),
    };

    // Layer 6: Simulation
    const simulation = simulateOutcomes(perception.requestType);

    // Audit log
    await supabase.from("pipeline_audit_logs").insert({
      request_id: requestId,
      kete: "pikau",
      stage: "complete",
      result: {
        decision: reasoning.decision,
        action: perception.requestType,
        riskScore: reasoning.riskScore,
        estimatedDuties: reasoning.estimatedDuties,
        biosecurity: { requiresClearance: biosecurityCheck.requiresClearance, prohibited: biosecurityCheck.prohibitedItem, mpiStandards: biosecurityCheck.mpiStandards },
        dangerousGoods: { isDG: dgCheck.isDangerousGoods, hsnoClass: dgCheck.hsnoClass },
      },
      created_at: new Date().toISOString(),
    });

    if (actionResult.status === "conditional") {
      await supabase.from("approval_queue").insert({
        request_id: requestId,
        action_type: perception.requestType,
        kete: "pikau",
        context: { reasoning, explanation, shipmentId: perception.shipmentId, importerId: perception.importerId },
        status: "pending",
        requested_by: perception.userId,
      });
    }

    const evidencePack: EvidencePack = {
      requestId,
      perception,
      memory,
      reasoning,
      action: actionResult,
      explanation,
      simulation,
    };

    return new Response(JSON.stringify(evidencePack, null, 2), {
      status: actionResult.status === "rejected" ? 403 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
