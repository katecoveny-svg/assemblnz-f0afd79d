# assembl durable decisions

Use this file for decisions that future agents should not repeatedly reopen or reinterpret.

Do not use it as a diary. Record only decisions with ongoing architectural, product, brand, safety or operating consequences.

## Template

### ADR-000 — title
**Status:** proposed | accepted | superseded  
**Date:** YYYY-MM-DD

**Context**  
What decision was required?

**Decision**  
What is the canonical choice?

**Why**  
Evidence, constraints and trade-offs.

**Consequences**  
What becomes easier/harder?

**Revisit when**  
What evidence would justify changing it?

---

## ADR-001 — routed context instead of one giant prompt
**Status:** accepted  
**Date:** 2026-09-16

**Context**  
The repository contains multiple strategy, agent-memory, brand, research and historical files. Different coding agents can load different subsets and drift. Loading everything also wastes model context/credits.

**Decision**  
Use `START_HERE.md` + root `AGENTS.md` + `docs/context/README.md` as the universal entry path. Load only task-specific canonical documents after that. Harness-specific memory files such as `CLAUDE.md` are supplementary and cannot override higher-precedence canonical sources.

**Why**  
A small stable context spine reduces contradictions, repeated rediscovery and unnecessary token usage while keeping detailed knowledge available on demand.

**Consequences**  
Canonical docs must be kept current. Historical/reference files can remain in the repo without automatically influencing every agent.

**Revisit when**  
A reliable automated context retrieval layer makes manual routing unnecessary without increasing drift.

---

## ADR-002 — Pursuit, Studio and DO share one factory
**Status:** accepted  
**Date:** 2026-09-16

**Context**  
Pursuit, Studio and DO can otherwise evolve as disconnected products with duplicated capabilities and context.

**Decision**  
Treat them as connected surfaces over one shared software factory. Pursuit finds valuable work; Studio proves and communicates it; DO executes it; the Factory owns reusable context, primitives, agents, connectors, tests, evals and learning.

**Why**  
Shared primitives and learning create compounding leverage and reduce bespoke rebuilding.

**Consequences**  
New product work should explicitly state what shared primitives it uses, extends or creates.

**Revisit when**  
A product requires materially different security, deployment or ownership boundaries that justify a separate system.

---

## ADR-003 — DO Companion and DO Office share one AgentSpec runtime
**Status:** accepted  
**Date:** 2026-09-16

**Context**  
DO is expanding across browser, native Mac, mobile, voice and multi-agent coordination. Building a separate agent model for each surface would create duplicated permissions, context, identities and state, while invisible free-form agent-to-agent chat would make work difficult to inspect.

**Decision**  
Treat the portable `AgentSpec` runtime and its policy/evidence boundary as the shared DO core.

Use two primary product surfaces over that runtime:
- **DO Companion** — “do this here, now”; the spatial/browser/native surface close to the user's current work.
- **DO Office** — “show me my DO team and what is happening”; a visual coordination projection for Personal / Work / Client DOs, work state, structured handoffs, approvals, identities and evidence.

Voice is an interaction channel into the same runtime, not a privileged parallel agent system. Agent-to-agent coordination should use structured handoffs with minimal context, requested action and evidence references rather than an unauditable hidden group chat.

A mailbox/address is displayed as live only after it is genuinely provisioned through the existing agent-email infrastructure.

**Why**  
One runtime lets permissions, context selection, evidence, approvals and agent definitions compound across every launch surface. Structured coordination gives the “office” feel while retaining observability and user control.

**Consequences**  
New DO surfaces should resolve to existing AgentSpec/policy/evidence primitives before inventing new orchestration. DO Office persistence may add owner-scoped workspace/coordination records, but should not duplicate the marketplace catalogue or agent-email transport.

**Revisit when**  
A surface has materially different security/runtime requirements that cannot safely share the common DO contract, or evidence shows the AgentSpec model cannot represent a required class of work.
