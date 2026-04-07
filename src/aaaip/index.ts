// ═══════════════════════════════════════════════════════════════
// AAAIP — Public surface
// Aotearoa Agentic AI Platform: simulation-tested, policy-governed
// autonomous agents.
//
// To plug a new domain in:
//   1. Add a Policy library file under src/aaaip/policy/
//   2. Add a Simulator under src/aaaip/simulation/
//   3. Add an Agent under src/aaaip/agent/
//   4. Re-export here.
// ═══════════════════════════════════════════════════════════════

export * from "./policy/types";
export * from "./policy/library";
export * from "./policy/engine";
export * from "./policy/human-robot";
export * from "./policy/science";
export * from "./simulation/clinic";
export * from "./simulation/human-robot";
export * from "./simulation/science";
export * from "./agent/clinic-agent";
export * from "./agent/robot-agent";
export * from "./agent/science-agent";
export * from "./metrics/audit";
export * from "./runtime-base";
export * from "./api/export";
export * from "./useAaaipRuntime";
export * from "./useRobotRuntime";
export * from "./useScienceRuntime";
