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


---

## ADR-004 — Preserve the spatial DO companion beside the shared runtime
**Status:** accepted  
**Date:** 2026-09-16

**Decision**  
The owner confirmed the dimensional D + dot, plum/rose motion, floating launcher, saved visual canvas and Personal/Work specialists as the DO baseline. The assembl homepage stays the company front door. Restore the local canvas work from **Review shared ChatGPT conversation** and compose it with Builderdoo, Office and current connection/security work. The earlier text-only `DoHomeCurrent` requirement is superseded. See [DO visual baseline](../DO-VISUAL-BASELINE.md) for source commits and runtime boundaries.

Explicit visual sharing is an input channel: choose a screen still or upload an image, inspect it, grant processing consent, then review DO's observations. Moving the companion does not capture anything. Shared trial, origin and rate controls remain in force. The local OpenAI voice worker remains development-only; a richer UI does not grant production authority.

**Verification**  
Protect the routed front doors in production builds, verify desktop/375px/reduced-motion, and check the exact merged deployment. Local edits alone are not a release.

---

## ADR-005 — Agent-paid tools: key gate, sandbox prefix, honest upstreams
**Status:** accepted  
**Date:** 2026-09-16

**Context**  
Assembl needs a product shape for selling single-job HTTP tools to agents: URL + code + agent docs, with spend caps and receipts — starting with NZ registry lookups.

**Decision**  
Ship shared primitives under `lib/tools/` and first route `POST /api/tools/nz-who-runs-it`, wrapping the same NZBN + Companies Office gateways as `mcp-nzbn` / `mcp-companies-office`. Every call requires `Authorization: Bearer` or `X-Assembl-Tool-Key`. Keys starting with `test_` always run sandbox fixtures and never call live registers. Live calls require `NZBN_API_KEY` (optional `COMPANIES_OFFICE_API_KEY` for director enrichment) and return structured **503** when NZBN is unconfigured — never fabricate live register data. Director outputs are public-register name/role/appointment only with an explicit Privacy Act notice; residential addresses and DOB are never returned. Persist keys/spend/receipts in Supabase when service-role is available; otherwise process-memory for preview with the production path documented. `nz-trade-finder` is tool #2 (register-only v0, no email scrape week-1). Meeting enhance stays in the Meeting DO product line, not this paid-tools surface.

**Consequences**  
A second tool (nz-trade-finder) can plug into the same gate. DO Meeting / Household routes stay untouched. Agent docs live at `/tools/<slug>` with a skill draft under `docs/tools/`.

**Revisit when**  
Billing moves from daily cent caps to Stripe metered billing, or keys need org-scoped multi-tenant issuance UI.

## ADR-005a — meeting-enhance on the agent-paid tools line (extension)
**Status:** accepted  
**Date:** 2026-09-16

**Context**  
Kate’s agent-paid tools thesis: URL + key + cap + receipt for one useful job. Meeting enhance was previously scoped only to Meeting DO.

**Decision**  
Ship `POST /api/tools/meeting-enhance` on the same paid-tools gate as `nz-who-runs-it`, reusing DO meeting-notes preparation for live when configured. Sandbox `test_` keys stay deterministic and model-free. Drafts only — never claim send/assign. Meeting DO UI remains the capture surface; this endpoint is the agent HTTP complement.

**Consequences**  
Three tools share receipts/caps: `nz-trade-finder` (sandbox-first; live NZBN/Companies Office city+trade stubbed), `meeting-enhance`, `nz-compliance-ping` (NZBN status flags). Registry at `/tools` + `docs/tools/README.md`.


---

## ADR-006 — Public /do shelf off (explanation page, not pause notice)
**Status:** accepted  
**Date:** 2026-09-17

**Context**  
The public `/do` face presented Meeting DO + Household DO + a large Identity D theatre, and the homepage sold “Two small tools / Your DOs”. Kate asked that public face removed. A first “paused” holding page failed craft review — do not say paused.

**Decision**  
Public `/do` is a short on-brand explanation of DO (small agent where you already work; surface ≠ agent) with a scroll-linked daylight Auckland atelier stage (WorldScene + reliable `atelier-poster.png` fallback). Interactive craft stays: hover-slide cards, plum/rose proximity glow, scroll reveal. Cards use diagrams/UI chrome — not repeated atelier photos. Homepage and public CTAs must not link into Meeting/Household as the product offering. Meeting/Household code may remain in-repo as PREVIEW/internal. No “paused” / “coming soon” product copy on `/do`. No technique-narrating copy (“experiment”, “lab”, “craft demo”). `scripts/public-front-door-guard.mjs` enforces shelf-off + explanation + craft posture. Homepage WorldScene / atelier fly-through stays as the cinematic door.

**Why**  
Honest public surface without selling a two-tool shelf or sounding like an outage. Keep runtime code available without presenting it as the public product. Flat text-only /do failed Kate craft review (2026-09-17 evening) — restore scroll/hover/glow without cloning homepage theatre or narrating the technique.

**Consequences**  
Nav/footer may still mention DO → explanation page. Pursuit and Studio remain primary public try doors. Reopening a public DO try-it face requires an explicit new decision and guard update.

**Revisit when**  
Kate authorises a new public DO offering (possibly different tools or a different presentation) and the front-door guard is rewritten to match.
