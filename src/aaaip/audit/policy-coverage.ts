// ═══════════════════════════════════════════════════════════════
// AAAIP — Policy coverage matrix
// Static registry mapping every Assembl production pilot to the
// AAAIP policy families that should govern it. Used by the
// researcher admin view to show coverage gaps and by AAAIP
// partners to see which agents are policy-gated.
//
// Wiring an existing pilot to the AAAIP runtime means:
//   1. Construct a ComplianceEngine with the matching policies
//   2. Run agent actions through engine.evaluate() before applying
//   3. Push the resulting decision into an AuditLog
//   4. Submit periodically via the aaaip-audit-export edge function
// ═══════════════════════════════════════════════════════════════

export type PolicyFamily =
  | "consent"
  | "data_residency"
  | "fairness"
  | "safety"
  | "human_in_loop"
  | "provenance"
  | "intent_confirmation"
  | "force_speed_limits"
  | "sensor_health"
  | "reproducibility"
  | "ethics_irb"
  | "moderation";

export type CoverageStatus = "wired" | "ready" | "planned";

export interface PilotCoverageEntry {
  /** Stable id used for the researcher admin view. */
  id: string;
  /** Display name shown in the UI. */
  name: string;
  /** Module folder under src/components/<id> or page path. */
  module: string;
  /** Domain bucket for AAAIP reporting. */
  domain:
    | "clinic_scheduling"
    | "human_robot_collab"
    | "scientific_discovery"
    | "community_portal"
    | "construction"
    | "logistics"
    | "hospitality"
    | "freight_iot"
    | "wellbeing"
    | "smb"
    | "language";
  /** Status of AAAIP integration. */
  status: CoverageStatus;
  /** Which policy families are required by this pilot. */
  policies: PolicyFamily[];
  /** Plain-English note shown in the audit report. */
  note: string;
}

export const PILOT_COVERAGE: PilotCoverageEntry[] = [
  // ── Wired (live in the AAAIP runtime) ─────────────────────
  {
    id: "clinic",
    name: "Clinic scheduling (Pilot 01)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "clinic_scheduling",
    status: "wired",
    policies: ["consent", "data_residency", "fairness", "safety", "human_in_loop"],
    note: "Fully governed by ComplianceEngine + AuditLog with 6 policies and a /aaaip dashboard.",
  },
  {
    id: "robot",
    name: "Human-robot collaboration (Pilot 02)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "human_robot_collab",
    status: "wired",
    policies: [
      "safety",
      "human_in_loop",
      "intent_confirmation",
      "force_speed_limits",
      "sensor_health",
    ],
    note: "ISO/TS 15066-aligned policies. Demo at /aaaip → Human-robot.",
  },
  {
    id: "science",
    name: "Drug screening (Pilot 03)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "scientific_discovery",
    status: "wired",
    policies: ["provenance", "ethics_irb", "reproducibility", "safety", "human_in_loop"],
    note: "FAIR + GxP ALCOA+ + ICH M7 / ICH Q2 compliant. Demo at /aaaip → Drug screening.",
  },
  {
    id: "community",
    name: "Community portal moderation (Pilot 04)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "community_portal",
    status: "wired",
    policies: ["moderation", "data_residency", "consent", "human_in_loop"],
    note: "Moderation queue with te reo respect, data sovereignty and harm-flag gating.",
  },

  // ── Ready: production pilots that have an obvious AAAIP hook ─
  {
    id: "hanga",
    name: "Hanga (construction)",
    module: "src/components/hanga",
    domain: "construction",
    status: "ready",
    policies: ["safety", "consent", "data_residency", "human_in_loop"],
    note: "Site check-in, photo docs and tender writer touch worker PII. Wire AAAIP policy gate before any AI action that modifies a tender or shares site photos.",
  },
  {
    id: "toroa",
    name: "Toroa (shipping / logistics)",
    module: "src/components/toroa + src/pages/Toroa*.tsx",
    domain: "logistics",
    status: "ready",
    policies: ["safety", "consent", "data_residency"],
    note: "Toroa SMS / dashboard agents send vessel + crew data. Add data-residency + consent gating before any cross-border share.",
  },
  {
    id: "hangarau",
    name: "Hangarau (freight IoT)",
    module: "src/components/hangarau",
    domain: "freight_iot",
    status: "ready",
    policies: ["safety", "sensor_health", "data_residency"],
    note: "IoT ingest from vehicle / vessel / agri sensors. Apply the sensor-health gate before any automated re-routing decision.",
  },
  {
    id: "aura",
    name: "Aura (hospitality)",
    module: "src/components/aura",
    domain: "hospitality",
    status: "ready",
    policies: ["consent", "data_residency", "fairness"],
    note: "Guest memory + reservations store dietary, accessibility and PII data. Wire consent + residency gating before any guest profile is shared with a marketing agent.",
  },

  // ── Planned: pilots that are clear AAAIP candidates ───────
  {
    id: "manaaki",
    name: "Manaaki (wellbeing)",
    module: "src/components/manaaki",
    domain: "wellbeing",
    status: "planned",
    policies: ["consent", "fairness", "human_in_loop", "data_residency"],
    note: "Wellbeing recommendations need explicit consent + clinical oversight. Build a Manaaki AAAIP policy file and wire the dashboard.",
  },
  {
    id: "pakihi",
    name: "Pākihi (small business)",
    module: "src/components/pakihi",
    domain: "smb",
    status: "planned",
    policies: ["data_residency", "consent"],
    note: "SMB agent has access to financial records. Add data-residency policy before any AI summary leaves the workspace.",
  },
  {
    id: "te-kahui-reo",
    name: "Te Kāhui Reo (te reo)",
    module: "src/components/te-kahui-reo",
    domain: "language",
    status: "planned",
    policies: ["consent", "data_residency", "moderation"],
    note: "Te reo content + speaker recordings need data sovereignty + community moderation policies.",
  },
];

/** Aggregate counts for the dashboard KPI row. */
export function coverageSummary() {
  const counts = { wired: 0, ready: 0, planned: 0 };
  for (const p of PILOT_COVERAGE) counts[p.status] += 1;
  return {
    total: PILOT_COVERAGE.length,
    ...counts,
    coverageRate: counts.wired / PILOT_COVERAGE.length,
  };
}
