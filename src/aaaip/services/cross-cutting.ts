// ═══════════════════════════════════════════════════════════════
// AAAIP — Cross-cutting shared services
// Five reusable modules every sector pack can import. Each service
// returns deterministic, audit-ready output. These are the
// patterns identified across all 7 sector packs:
//
//   1. cashflowCompliance  — LEDGER+Xero ruleset overlay
//   2. complianceWatcher   — KAHU change-detection pipeline
//   3. immutableAuditTrail — MANA append-only log
//   4. labourGovernance    — AROHA+AXIS+LEDGER labour unit
//   5. reputationLoop      — PRISM+SOCIAL+NOVA monitor/respond/improve
// ═══════════════════════════════════════════════════════════════

export type Sector = "waihanga" | "architecture" | "engineering" | "customs" | "logistics" | "manaaki" | "arataki";

// ── 1. CASHFLOW COMPLIANCE ─────────────────────────────────────
export interface CashflowRule {
  id: string;
  sector: Sector;
  metric: "retention_pct" | "fee_recovery_pct" | "utilisation_pct" | "landed_cost_var_pct" | "labour_pct" | "debtor_days";
  threshold: number;
  operator: "lt" | "gt" | "between";
  upperBound?: number;
  message: string;
}

export const CASHFLOW_RULES: CashflowRule[] = [
  { id: "wai_retention", sector: "waihanga", metric: "retention_pct", threshold: 10, operator: "gt", message: "Retention > 10% of contract — CCA s.18B trust account required" },
  { id: "arch_fee_recovery", sector: "architecture", metric: "fee_recovery_pct", threshold: 80, operator: "lt", message: "Fee recovery < 80% — scope creep likely; trigger variation letter" },
  { id: "eng_util_low", sector: "engineering", metric: "utilisation_pct", threshold: 60, operator: "lt", message: "Utilisation < 60% — firm losing money on this engineer" },
  { id: "eng_util_high", sector: "engineering", metric: "utilisation_pct", threshold: 90, operator: "gt", message: "Utilisation > 90% — burnout + quality slip risk" },
  { id: "cus_landed_var", sector: "customs", metric: "landed_cost_var_pct", threshold: 5, operator: "gt", message: "Landed cost > 5% over quote — fuel/levy/FX shock; reprice" },
  { id: "man_labour", sector: "manaaki", metric: "labour_pct", threshold: 35, operator: "gt", message: "Labour > 35% of revenue — over-rostered or under-trading" },
  { id: "log_debtor", sector: "logistics", metric: "debtor_days", threshold: 60, operator: "gt", message: "Debtor > 60 days — own cashflow at risk" },
];

export function evaluateCashflow(sector: Sector, metric: CashflowRule["metric"], value: number) {
  const matches = CASHFLOW_RULES.filter((r) => r.sector === sector && r.metric === metric);
  return matches
    .filter((r) => (r.operator === "lt" ? value < r.threshold : r.operator === "gt" ? value > r.threshold : value > r.threshold && value < (r.upperBound ?? Infinity)))
    .map((r) => ({ ruleId: r.id, message: r.message, severity: "warn" as const }));
}

// ── 2. COMPLIANCE WATCHER (KAHU) ───────────────────────────────
export interface LegislationChange {
  id: string;
  source: string;
  effectiveDate: string;
  affectedSectors: Sector[];
  affectedWorkflows: string[];
  summary: string;
}

export const KNOWN_CHANGES: LegislationChange[] = [
  { id: "cca_retention_oct23", source: "CCA 2002 s.18B", effectiveDate: "2023-10-05", affectedSectors: ["waihanga","architecture","engineering"], affectedWorkflows: ["retention_compliance_loop","payment_claim_generator"], summary: "Retention money trust-account requirement" },
  { id: "ipp3a_may26", source: "Privacy Act 2020 IPP 3A", effectiveDate: "2026-05-01", affectedSectors: ["waihanga","architecture","engineering","customs","logistics","manaaki","arataki"], affectedWorkflows: ["all"], summary: "Indirect-collection notice obligations" },
  { id: "gml_apr26", source: "Goods Management Levy 2026", effectiveDate: "2026-04-01", affectedSectors: ["customs"], affectedWorkflows: ["landed_cost_calculator"], summary: "Per-consignment levy, separate air/sea rates" },
  { id: "era_gateway_2026", source: "ERA 2000 Amendment 2026", effectiveDate: "2026-01-01", affectedSectors: ["logistics","waihanga","manaaki","arataki"], affectedWorkflows: ["contractor_gateway_audit"], summary: "Contractor gateway test reclassification" },
  { id: "wof_nov26", source: "Land Transport WoF Rule", effectiveDate: "2026-11-01", affectedSectors: ["arataki","logistics"], affectedWorkflows: ["wof_fleet_scheduler"], summary: "Light vehicles 4–14yr → biennial" },
];

export function workflowsAffectedByChanges(workflowIds: string[]) {
  return KNOWN_CHANGES.filter((c) => c.affectedWorkflows.includes("all") || c.affectedWorkflows.some((w) => workflowIds.includes(w)));
}

// ── 3. IMMUTABLE AUDIT TRAIL (MANA) ────────────────────────────
export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  hash: string;
  previousHash: string | null;
  payload: Record<string, unknown>;
}

async function sha256(text: string) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `nohash:${text.length}`;
}

export async function appendAudit(prev: AuditEntry | null, actor: string, action: string, payload: Record<string, unknown>): Promise<AuditEntry> {
  const ts = new Date().toISOString();
  const previousHash = prev?.hash ?? null;
  const hash = await sha256(JSON.stringify({ ts, actor, action, payload, previousHash }));
  return { ts, actor, action, hash, previousHash, payload };
}

// ── 4. LABOUR GOVERNANCE (AROHA + AXIS + LEDGER) ───────────────
export interface LabourSnapshot {
  sector: Sector;
  hoursWorked: number;
  hoursBillable: number;
  costNzd: number;
  revenueNzd: number;
  driverFatigueMinutesRemaining?: number;
}

export function labourGovernance(snap: LabourSnapshot) {
  const utilisation = snap.hoursWorked ? (snap.hoursBillable / snap.hoursWorked) * 100 : 0;
  const labourPct = snap.revenueNzd ? (snap.costNzd / snap.revenueNzd) * 100 : 0;
  const flags: string[] = [];
  if (snap.sector === "engineering" && utilisation < 60) flags.push("util_below_breakeven");
  if (snap.sector === "engineering" && utilisation > 90) flags.push("burnout_risk");
  if (snap.sector === "manaaki" && labourPct > 35) flags.push("labour_over_target");
  if (snap.driverFatigueMinutesRemaining !== undefined && snap.driverFatigueMinutesRemaining < 30) flags.push("fatigue_imminent");
  return { utilisation: round(utilisation, 1), labourPct: round(labourPct, 1), flags };
}

// ── 5. REPUTATION LOOP (PRISM + SOCIAL + NOVA) ─────────────────
export interface ReviewSignal {
  platform: "google" | "tripadvisor" | "facebook" | "autotrader" | "carsales" | "nocowboys";
  rating: number;
  text: string;
  postedAt: string;
}

export interface ReputationDecision {
  draftReply: string;
  flags: string[];
  escalate: boolean;
}

const ESCALATION_PATTERNS = [
  { pattern: /allerg|gluten|dairy|nut|peanut|sesame/i, flag: "allergen" },
  { pattern: /food poison|sick|vomit|hospital/i, flag: "food_safety" },
  { pattern: /sue|lawyer|defamation|tribunal|mvdt/i, flag: "legal" },
  { pattern: /racis|sex|harass|discriminat/i, flag: "staff_complaint" },
  { pattern: /injur|hurt|accident|worksafe/i, flag: "safety" },
];

export function reputationLoop(signal: ReviewSignal, voice: string): ReputationDecision {
  const flags = ESCALATION_PATTERNS.filter((p) => p.pattern.test(signal.text)).map((p) => p.flag);
  const escalate = flags.length > 0 || signal.rating <= 2;
  const draftReply = escalate
    ? `Kia ora — thank you for raising this. We take ${flags.join(", ") || "this feedback"} extremely seriously and our manager will be in touch directly today. Voice: ${voice}.`
    : `Thank you for the ${signal.rating}-star review. We appreciate the feedback and look forward to seeing you again. Voice: ${voice}.`;
  return { draftReply, flags, escalate };
}

function round(n: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
