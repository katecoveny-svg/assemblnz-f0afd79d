// ═══════════════════════════════════════════════════════════════
// AAAIP — Public surface
// Aotearoa Agentic AI Platform: simulation-tested, policy-governed
// autonomous agents for the Assembl industry Kete.
//
// Canonical Kete names (from KeteConfig.ts and the live Assembl
// marketing site):
//   - Waihanga (construction)
//   - Manaaki  (hospitality & tourism)
//   - Pikau    (freight & customs)
//   - Auaha    (creative & media)
//   - Tōro     (whānau family navigator)
// Plus the four foundation / research pilots:
//   - Clinic scheduling
//   - Human-robot collaboration
//   - Drug screening
//   - Community portal moderation
// ═══════════════════════════════════════════════════════════════

// ── Core framework ───────────────────────────────────────────
export * from "./policy/types";
export * from "./policy/engine";
export * from "./policy/library";
export * from "./metrics/audit";
export * from "./runtime-base";
export * from "./api/export";
export * from "./api/researcher";
export * from "./audit/policy-coverage";

// ── Pilot 01 — Clinic scheduling ─────────────────────────────
export * from "./simulation/clinic";
export * from "./agent/clinic-agent";
export * from "./useAaaipRuntime";

// ── Pilot 02 — Human-robot collaboration ─────────────────────
export * from "./policy/human-robot";
export * from "./simulation/human-robot";
export * from "./agent/robot-agent";
export * from "./useRobotRuntime";

// ── Pilot 03 — Drug screening ────────────────────────────────
export * from "./policy/science";
export * from "./simulation/science";
export * from "./agent/science-agent";
export * from "./useScienceRuntime";

// ── Pilot 04 — Community portal moderation ───────────────────
export * from "./policy/community";
export * from "./simulation/community";
export * from "./agent/community-agent";
export * from "./useCommunityRuntime";

// ── Pilot 05 — Waihanga (construction) ───────────────────────
export * from "./policy/waihanga";
export * from "./simulation/waihanga";
export * from "./agent/waihanga-agent";
export * from "./useWaihangaRuntime";

// ── Pilot 06 — Pikau (freight & customs) ─────────────────────
export * from "./policy/pikau";
export * from "./simulation/pikau";
export * from "./agent/pikau-agent";
export * from "./usePikauRuntime";

// ── Pilot 07 — Manaaki (hospitality & tourism) ───────────────
export * from "./policy/manaaki";
export * from "./simulation/manaaki";
export * from "./agent/manaaki-agent";
export * from "./useManaakiRuntime";

// ── Pilot 08 — Auaha (creative & media) ──────────────────────
export * from "./policy/auaha";
export * from "./simulation/auaha";
export * from "./agent/auaha-agent";
export * from "./useAuahaRuntime";

// ── Pilot 09 — Tōro (whānau family navigator) ────────────────
export * from "./policy/toro";
export * from "./simulation/toro";
export * from "./agent/toro-agent";
export * from "./useToroRuntime";
