# agentic customer journey — architecture

> assembl creates agentic customer journeys that understand what people need,
> complete the work around them, and prove the experience is improving.
> **Find the friction. Assemble the journey. Prove the result.**

This document describes the reusable journey foundation added in this build. The
first reference journey — **everyday, assembled** (grocery) — is one
*configuration* of it. Energy, airlines, trades, hospitality and professional
services reuse the same runtime, approvals, wait state and proof; only the
configuration changes.

## Architecture at a glance

```
business genome  →  journey definition  →  customer intent
   →  journey stages  →  specialist agent roles  →  tool proposals
   →  human approval  →  action or simulated action  →  wait-state experience
   →  evidence & trace  →  journey proof
```

Everything lives under `lib/journey/` (framework-free, deterministic, no
server-only imports — it runs in tests and in the browser) with the experience
under `app/journeys/` and `components/journey/`.

| Concern | Module |
| --- | --- |
| Types + zod schemas (the contract) | `lib/journey/types.ts` |
| Honest status vocabulary | `lib/journey/status.ts` |
| Specialist agent roles | `lib/journey/agents.ts` |
| Mock grocery catalogue | `lib/journey/catalogue.ts` |
| Grocery genome + business rules | `lib/journey/genome/grocery-genome.ts` |
| Stage-scoped genome selector | `lib/journey/genome-context.ts` |
| Deterministic services | `lib/journey/services/{intent,context,plan,resolution}.ts` |
| Runtime state engine | `lib/journey/runtime.ts` |
| Proof summariser | `lib/journey/proof.ts` |
| Tenant-scoped repository | `lib/journey/repository.ts` |
| Reference journey config | `lib/journey/journeys/everyday-assembled.ts` |
| Public barrel | `lib/journey/index.ts` |
| Experience UI | `app/journeys/[journeyId]/JourneyExperience.tsx` + `components/journey/*` |

## Schemas

The core object is `CustomerJourney` (definition) and `JourneyRun` (a live run).
Enumerations (`JourneyStatus`, `JourneyStageType`, `AuthorityLevel`,
`ExperienceSurface`, `StatusTreatment`, `RunStatus`, `JourneyEventType`,
`ProposedActionStatus`) are declared once as `zod` enums so the same value set
validates agent output at runtime and types the code at compile time.

Runtime records that cross an agent boundary — `ProposedAction`, `JourneyEvent`,
`EvidenceRecord` — have full zod schemas (`ProposedActionSchema`, etc.). The
grocery `GroceryIntent` is validated by `GroceryIntentSchema`; any service that
produces one (mock or live model) is gated by that schema and fails safe.

See `lib/journey/types.ts` for the full definitions.

## Runtime flow

`lib/journey/runtime.ts` is a set of deterministic, immutable transitions —
each takes a `JourneyRun` and returns a new one, appending to the event
timeline. The experience component drives them in order:

1. `startJourneyRun` — captures the stated intent (stage `entry`).
2. `processIntent` — the intent agent structures + validates it (stage `intent`).
3. `pendingQuestions` / `answerContext` / `completeContext` — the context agent
   asks only the highest-value gaps (stage `context`).
4. `processRecommendation` — the plan + value agents assemble meals and a basket,
   recording assumptions and dietary exclusions as evidence (stages
   `recommendation` → `commitment`).
5. `proposeBasket` — the basket agent creates the `assemble_basket`
   `ProposedAction`; the run enters `approval_required` (stage `action`).
6. `approveAction` / `rejectAction` — the human decides. Approve advances to the
   wait state; reject prepares nothing.
7. `completeWait` — after the wait-state module runs (stages `wait` →
   `fulfilment`).
8. `detectExceptions` + `runResolution` — the resolution agent proposes swaps /
   removals (approval-required) or escalates (stage `resolution`). Approved
   resolutions are persisted (`_appliedResolutions` in customer context) and
   `currentPlan` applies them, so the basket honestly reflects the decision.
9. `proposeSavePreferences` + `completeJourney` — continuation (stage
   `continuation`).

`currentPlan(run)` recomputes the plan deterministically from the structured
intent + captured budget + applied resolutions, so the basket is always a pure
function of the run state.

## How to create a new journey

1. Author a `CustomerJourney` object (see
   `lib/journey/journeys/everyday-assembled.ts` as the template): stages, entry
   points, context fields, agent assignments, tool permissions, wait-state
   module, handoff rules, metrics.
2. Add seed genome facts + typed business rules for the tenant (mirror
   `lib/journey/genome/grocery-genome.ts`).
3. Register it in the repository seed (`lib/journey/repository.ts`).
4. That is all — the runtime, approvals, wait state, proof and the entire
   `app/journeys/[journeyId]` experience are unchanged. The route renders any
   registered journey by id.

The genome-context selector (`genome-context.ts`) currently maps grocery fact
ids per stage; a new journey generalises this by supplying its own
`STAGE_FACT_IDS`-style mapping or fact set.

## How the Business Genome configures it

The journey reads the Genome through the repo's existing `GenomeFact` model
(flat facts per tenant, sectioned identity/services/…, each declaring which
surfaces read it). `getJourneyGenomeContext({ tenantId, journeyId, stageId,
stageType })` returns **only** the facts + rules a stage needs — never the whole
Genome. For the grocery tenant it resolves the static seed facts; a real tenant
resolves `getGenomeFactsFor(tenantId, fallback)` (server-only) and passes the
result into the pure `selectGenomeContext`.

## Replacing simulations with real connectors

- **Intent** *(now wired)*: `lib/journey/services/intent-live.ts`
  (`anthropicIntentService`) structures intent with a model via the repo's `ai`
  SDK (`generateObject` + `GroceryIntentSchema`), falling back to the
  deterministic parser when no `ANTHROPIC_API_KEY` is set or the model returns
  invalid data. The model call runs **server-side only** — the client calls the
  `structureIntentAction` server action, which returns a validated
  `IntentParseResult` that `runtime.applyIntentResult` applies deterministically.
- **Persistence** *(now wired)*: `SupabaseJourneyRepository`
  (`lib/journey/repository-supabase.ts`) implements `JourneyRepository` against
  the `journey_runs` table (migration `20260722000000_journey_runs.sql`, RLS
  deny-all, service-role only). It degrades to an in-process fallback when the DB
  or keys are absent, so the surface works with or without the migration applied.
  The client persists via `persistJourneyRunAction` (fire-and-forget on each
  timeline advance) and resumes a run via `/journeys/[id]?run=<runId>`
  (`loadJourneyRunAction`, tenant-scoped). `InMemoryJourneyRepository` remains for
  tests and the seed listing.
- **Catalogue**: replace `CATALOGUE` / `MEAL_IDEAS` in `catalogue.ts` with a real
  product feed behind the same shape.
- **Ordering**: the `connector_action` tool permission is `unavailable`. A real
  commerce connector would raise a high-risk `ProposedAction` (execution `live`),
  still gated by human approval.

## Authority & approvals

Authority uses the shared ladder (`AuthorityLevel`: observe → draft → recommend
→ act_with_approval → act_within_limits → autonomous_with_audit), mapped onto the
OS risk ladder (`lib/os/policy.ts`). `decideAuthority(actionType)` classifies the
risk and consults the tenant's approval rules; anything consequential
(`assemble_basket`, `apply_substitution`, `remove_item`,
`save_household_preferences`) requires a human yes. Nothing above
`act_with_approval` is exercised by any seed journey. Every `ProposedAction`
carries its `riskLevel`, `authorityRequired`, and an honest `execution`
treatment (`simulated` / `proposed` / … — never `completed` unless genuinely
done).

## How proof is calculated

`summariseJourney(run, journey)` (`proof.ts`) reads the run's timeline, proposed
actions and evidence:

- **stage completion** = distinct `stage_completed` events ÷ total stages.
- **actions / approvals / handoffs** counted from `proposedActions` + timeline.
- **policy checks passed** = dietary exclusions honoured + approval gates that
  held; **failed** = basket items violating the diet (the planner excludes these
  before they reach the basket, so this is 0 by construction).
- **estimated time saved** = a transparent formula over meals + basket lines,
  explicitly flagged as an estimate.
- **budget variance** = estimated total − budget ceiling (when set).
- **unresolved issues** = escalations + any unavailable/over-budget state still
  open.

`estimatedOnly` is `true` and every estimated/simulated figure is labelled in the
`JourneyProofCard`.

## Current limitations

- **Persistence is best-effort.** Runs persist to `journey_runs` via the
  service-role client when the migration is applied and keys are set; otherwise
  they fall back to an in-process map (not durable). No auth/ownership model yet
  beyond tenant scoping — the surface is a public concept demo.
- **Simulation only.** No live retailer data, pricing or ordering; every action
  is `simulated` / `proposed` and labelled. No order is placed.
- **Intent needs a key to be model-backed.** Without `ANTHROPIC_API_KEY` the
  intent service is the deterministic keyword parser (safe fallback).
- **Grocery-specific genome mapping.** The stage→fact mapping is authored for the
  grocery tenant; a second journey needs its own mapping/fact set.
- **Estimates, not measurements.** Time-saved and preference-adherence figures are
  estimated from the run, not measured against a control.

## Running it

```
pnpm install
pnpm --filter @assembl/canvas build   # once, for typecheck
pnpm test lib/journey/journey.test.ts  # the journey suite (21 tests)
pnpm dev                               # then visit /journeys/everyday-assembled
```

Verify against the production bundle (`pnpm build && pnpm start`) for the real
motion and status treatments.
