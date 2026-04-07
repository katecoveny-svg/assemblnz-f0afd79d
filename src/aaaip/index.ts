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
export * from "./simulation/clinic";
export * from "./agent/clinic-agent";
export * from "./metrics/audit";
export * from "./useAaaipRuntime";
