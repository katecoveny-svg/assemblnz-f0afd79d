// ═══════════════════════════════════════════════════════════════
// AAAIP — Policy coverage matrix
// Static registry of every Assembl Kete / pilot and the AAAIP
// policy families that govern it. The researcher admin view
// displays this directly under the "Pilot coverage" tab.
//
// Wiring an existing pilot to the AAAIP runtime means:
//   1. Add a Policy library file under src/aaaip/policy/
//   2. Add a Simulator under src/aaaip/simulation/
//   3. Add an Agent under src/aaaip/agent/
//   4. Add a runtime hook
//   5. Re-export everything from src/aaaip/index.ts
// ═══════════════════════════════════════════════════════════════

export type PolicyFamily =
  | "consent"
  | "data_residency"
  | "data_sovereignty"
  | "fairness"
  | "safety"
  | "human_in_loop"
  | "provenance"
  | "intent_confirmation"
  | "force_speed_limits"
  | "sensor_health"
  | "reproducibility"
  | "ethics_irb"
  | "moderation"
  | "financial_harm"
  | "children"
  | "wellbeing"
  | "te_reo"
  | "copyright"
  | "biosecurity"
  | "customs";

export type CoverageStatus = "wired" | "ready" | "planned";

export interface PilotCoverageEntry {
  id: string;
  name: string;
  module: string;
  domain: string;
  status: CoverageStatus;
  policies: PolicyFamily[];
  note: string;
}

export const PILOT_COVERAGE: PilotCoverageEntry[] = [
  // ── Foundation pilots (research / demonstration) ──────────
  {
    id: "clinic",
    name: "Clinic scheduling (Pilot 01)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "clinic_scheduling",
    status: "wired",
    policies: ["consent", "data_residency", "fairness", "safety", "human_in_loop"],
    note: "6 policies. NZ Privacy Act, Pae Ora Act, Australasian Triage Scale. Live at /aaaip → Clinic.",
  },
  {
    id: "robot",
    name: "Human-robot collaboration (Pilot 02)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "human_robot_collab",
    status: "wired",
    policies: ["safety", "human_in_loop", "intent_confirmation", "force_speed_limits", "sensor_health"],
    note: "7 policies aligned with ISO/TS 15066 + ISO 10218-2. Live at /aaaip → Human-robot.",
  },
  {
    id: "science",
    name: "Drug screening (Pilot 03)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "scientific_discovery",
    status: "wired",
    policies: ["provenance", "ethics_irb", "reproducibility", "safety", "human_in_loop"],
    note: "7 policies. FAIR, GxP ALCOA+, ICH M7, ICH Q2, WHO/HDEC. Live at /aaaip → Drug screening.",
  },
  {
    id: "community",
    name: "Community portal moderation (Pilot 04)",
    module: "src/aaaip + src/pages/AaaipDashboard.tsx",
    domain: "community_portal",
    status: "wired",
    policies: ["moderation", "data_sovereignty", "consent", "human_in_loop", "te_reo"],
    note: "6 policies. NZ HDCA 2015, Te Mana Raraunga, Privacy Act IPP 11, IFCN. Live at /aaaip → Community.",
  },

  // ── Assembl industry Kete ─────────────────────────────────
  {
    id: "waihanga",
    name: "Waihanga — Construction (Pilot 05)",
    module: "src/aaaip/**/waihanga + src/components/hanga/**",
    domain: "construction",
    status: "wired",
    policies: ["safety", "consent", "human_in_loop"],
    note: "6 policies. NZ Health & Safety at Work Act, WorkSafe PPE, ISO 45001, Privacy Act IPP 1 & 3, CCLA 2017.",
  },
  {
    id: "pikau",
    name: "Pikau — Freight & Customs (Pilot 06)",
    module: "src/aaaip/**/pikau + src/components/hangarau/**",
    domain: "freight_customs",
    status: "wired",
    policies: ["safety", "data_residency", "customs", "biosecurity", "human_in_loop"],
    note: "6 policies. NZTA Work Time rules, ANZFA cold chain, IEC 61496 sensor safety, NZ Privacy Act IPP 12, Biosecurity Act.",
  },
  {
    id: "manaaki",
    name: "Manaaki — Hospitality & Tourism (Pilot 07)",
    module: "src/aaaip/**/manaaki + src/components/aura/**",
    domain: "hospitality",
    status: "wired",
    policies: ["safety", "consent", "data_residency", "fairness"],
    note: "6 policies. NZ Food Act 2014, MPI allergens, Privacy Act, Human Rights Act 1993 (accessibility), CGA 1993.",
  },
  {
    id: "auaha",
    name: "Auaha — Creative & Media (Pilot 08)",
    module: "src/aaaip/**/auaha + src/components/auaha/**",
    domain: "creative",
    status: "wired",
    policies: ["copyright", "consent", "moderation", "te_reo", "human_in_loop"],
    note: "6 policies. NZ Copyright Act 1994, ASA Code, Te Taura Whiri, Te Mana Raraunga, IFCN.",
  },
  {
    id: "toro",
    name: "Tōro — Whānau Family Navigator (Pilot 09)",
    module: "src/aaaip/**/toro + src/components/toroa/**",
    domain: "whanau_navigator",
    status: "wired",
    policies: ["consent", "children", "financial_harm", "wellbeing", "te_reo", "data_sovereignty"],
    note: "7 policies. UNCRC Art 16, Privacy Act, Classification Office, CCCFA 2003, Mental Health Act 1992, Te Mana Raraunga.",
  },

  // ── Planned pilots (existing Kete awaiting AAAIP wiring) ──
  {
    id: "pakihi",
    name: "Pākihi — Business & Commerce",
    module: "src/components/pakihi",
    domain: "smb",
    status: "planned",
    policies: ["data_residency", "consent"],
    note: "11 agents for accounting, insurance, retail, trade, real estate. Needs AAAIP policy file + sim.",
  },
  {
    id: "waka",
    name: "Waka — Transport & Vehicles",
    module: "(planned)",
    domain: "transport",
    status: "planned",
    policies: ["safety", "consent", "data_residency"],
    note: "Automotive, maritime, trucking, logistics. Overlaps with Pikau but adds vehicle-specific rules.",
  },
  {
    id: "hauora",
    name: "Hauora — Health, Wellbeing, Sport",
    module: "(planned)",
    domain: "wellbeing",
    status: "planned",
    policies: ["consent", "wellbeing", "human_in_loop"],
    note: "Sport, health, beauty, nutrition — clinical-adjacent but not clinical. Needs fresh policy set.",
  },
  {
    id: "hangarau",
    name: "Hangarau — Technology",
    module: "src/components/hangarau",
    domain: "technology",
    status: "planned",
    policies: ["data_residency", "safety"],
    note: "In-house tech team (DevOps, security, IP). Lower risk profile — mostly human_in_loop oversight.",
  },
  {
    id: "te-kahui-reo",
    name: "Te Kāhui Reo — Māori BI",
    module: "src/components/te-kahui-reo",
    domain: "language",
    status: "planned",
    policies: ["data_sovereignty", "te_reo", "consent"],
    note: "Whānau governance, iwi reporting, kaupapa Māori. Needs kaitiaki-led policy drafting.",
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
