# agentic customer journeys — implementation documentation

_2026-07-24. First production-quality foundation for assembl's agentic customer
journey direction. Reference implementation: **everyday, assembled.** at
`/journeys/everyday-assembled` (noindex, out of sitemap). Lowercase assembl throughout._

## architecture

```
business genome (lib/journeys/genome.ts — per-tenant, stage-scoped selector)
→ journey definition (lib/journeys/seed.ts — CustomerJourney config)
→ customer intent (lib/journeys/intent.ts — service interface, zod boundary)
→ journey stages (types.ts — 10 stage types, authority per stage)
→ specialist agent roles (agents.ts — 7 contracts)
→ tool proposals + human approval (runtime.ts — ProposedAction lifecycle)
→ action or simulated action (always labelled; no live connectors in v1)
→ wait-state experience (WaitState component ← WaitStateModule config)
→ evidence and trace (EvidenceRecord + JourneyEvent stream)
→ journey proof (computeProofSummary → JourneyProofCard)
```

The five product areas (journey, customer context, agent team, approvals,
proof) are renderings of **one shared `JourneyRun`**, not separate demo pages.
`assembleRun(journey, input)` is a pure function — same input, same run, same
event stream. The customer view and the inside-the-journey view consume the
same run id (`run-demo-001`), and "change one thing" scenario controls
recompute both consistently. Approval decisions apply on top via
`applyDecisions` (immutably — rejected actions never execute).

## schemas

All types live in `lib/journeys/types.ts`: `CustomerJourney`, `JourneyStage`,
`JourneyRun`, `JourneyEvent`, `ProposedAction`, `JourneyProofSummary`,
`AgentDefinition`, `SystemStatus` (the truthful status treatment:
live / connected / sandbox / simulated / proposed / approval_required /
completed / unavailable), `ScenarioInput`, plus typed errors
(`TenantAccessError`, `InvalidAgentOutputError`).

Intent output is validated at the service boundary with zod
(`StructuredIntentSchema` in `intent.ts`) — schema-invalid or throwing services
fail safely and nothing invalid renders.

## runtime flow

1. `parseIntentSafely(service, text)` — natural language → `StructuredIntent`.
2. `applyScenario` — "change one thing" inputs mutate a copy of the intent.
3. `selectContextQuestions` — highest-value missing questions only (max two per
   round, each with a visible why; answered/intent-stated fields never re-asked).
4. `buildPlan` — meals + snacks from the mock catalogue, genome rules applied,
   assumptions surfaced.
5. `buildBasket` — deduplicated quantities, category grouping, estimate range,
   budget variance, value opportunities, negotiation tables for budget and
   availability exceptions.
6. Proposals — basket approval (always), budget swaps (on breach), unavailable
   substitution (on scenario), save-preferences (always, permissioned memory).
7. `applyDecisions` — approvals execute in simulation with `(simulated)`
   labels; rejections never produce `action_completed`.
8. `computeProofSummary` — proof derived from the actual event stream.

## how to create a new journey

1. Add a `JourneyGenome` for the tenant in `genome.ts` (with a disclosure).
2. Define a `CustomerJourney` (stages, agents, tools, wait modules, handoff
   rules, metrics) — see `BILL_EXPLAINED` in `seed.ts` for the second-sector
   example (demo-energy).
3. Register it in `InMemoryJourneyRepository`.
4. Sector-specific services (the grocery `plan.ts`/`basket.ts`) sit behind the
   same runtime; UI components (`StatusChip`, `ApprovalCard`, `WaitState`,
   `JourneyProofCard`, `InsideJourney`) are journey-agnostic. Demo surfaces are
   NOT forced into identical layouts — the renderer shares runtime + types,
   not card structures.

## how the Business Genome configures it

`getJourneyGenomeContext({tenantId, journeyId, stageType})` returns only the
stage-relevant slice (STAGE_READS mapping). The full genome is never passed to
an agent call. The inside view shows the selected slice per stage.

## how to replace simulations with real connectors

- Intent: implement `IntentService` with a model call; keep `parseIntentSafely`.
- Catalogue: replace `MOCK_CATALOGUE` reads with a retailer API behind the same
  `MockProduct` shape; flip `JourneyToolPermission.mode` from `simulated` to
  `connected`/`live` ONLY when genuinely wired — the status treatment renders
  whatever the config declares.
- Persistence: implement `JourneyRepository` against Supabase (interface in
  `repository.ts` is the seam); `tenant_customers`-style registry precedent.
- Execution: `ProposedAction.execution` moves from `simulated` to `live` per
  action, never globally.

## how authority and approvals work

Authority is declared per agent and per stage (`AuthorityLevel`). Every
consequential action in v1 is `act_with_approval`: created as `proposed`,
requiring an explicit customer decision. Approve → `completed` with a
simulated-execution event; reject → `rejected`, no execution event, journey
continues. The run is `approval_required` until every proposal is resolved.

## how proof is calculated

`computeProofSummary(run)` counts from the event stream and action states —
stage completion, context questions, proposals/approvals, human decisions,
policy checks (genome-rule evidence), unresolved issues. Time-saved figures are
**estimated** (labelled), derived from basket size heuristics. Limitations are
part of the proof, always rendered.

## current limitations

- No persistence — run state is per-session client state; repository is in-memory.
- Deterministic intent parser — nuance outside its patterns lands in
  `uncertainties` rather than being understood.
- Illustrative catalogue and pricing; no live retailer, loyalty or commerce
  connectors; `connect retailer` renders `unavailable`.
- Wait state narrates deterministic work (the runtime is synchronous).
- Single-round context questioning in the UI (the selector supports rounds).
- Human handoff is defined (rules, packaging) but has no live target — a
  rejection loop does not yet route to a staffed console.

## next build step (recommended)

Private concept platform (per `docs/agentic-journey-foundation-plan.md`
addendum): shared private renderer with per-organisation access tokens →
Woolworths golden journey on this runtime → Air New Zealand disruption journey
→ Contact service journey. Then: Supabase persistence behind
`JourneyRepository`, and a model-backed `IntentService`.
