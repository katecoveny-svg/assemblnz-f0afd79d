# agentic customer journey foundation — implementation plan

_Locked before app code, per the build brief. assembl creates agentic
customer journeys that understand what people need, complete the work around
them, and prove the experience is improving._

The first reference journey is **everyday, assembled** — an agentic grocery
journey that turns a customer's natural-language intent into a personalised,
approval-ready shop. It is built as a **reusable journey system**, not a
Woolworths mock-up: the same runtime, types, agents, approvals, wait state and
proof carry over to energy, airlines, trades, hospitality and professional
services by changing configuration only.

## Current architecture (what already exists)

- **Framework**: Next.js 16 App Router, React 19, TypeScript (strict), Tailwind
  3, zod 4, zustand 5, vitest 4. Server pages by default; interactive pieces
  are co-located client components (`*Demo.tsx`, `*Player.tsx`).
- **Business Genome**: a flat list of `GenomeFact` rows per tenant
  (`lib/customers/auckland-dog-trainer/genome.ts`), sectioned
  `identity | services | team | knowledge | proof | operations`, each fact
  declaring which surfaces read it (`readBy`). Reads go through
  `getGenomeFactsFor(tenant, fallback)` (`…/genome-store.ts`) — service-role
  Supabase with a static code fallback. Table `living_site_genome` is RLS
  deny-all.
- **Agent OS**: `lib/os/agents.ts` (`OsAgent` runtime roles),
  `lib/os/agent-registry.ts` (content-hashed `AgentDefinition` releases),
  `lib/os/capabilities.ts` (capability registry), `lib/os/policy.ts` — the
  authority model already exists as a **risk ladder**: `RiskLevel`
  (`low|medium|high`), `classifyActionRisk`, `requiresApproval`, plus a task
  state machine (`proposed → awaiting_approval → ready → running → completed`…).
- **Wait state**: `components/dash/` (`DashLoader`, `DashWaitState`) — the
  "assembling" progressive loader (dachshund fill; brand-scoped, `role=status`,
  respects `prefers-reduced-motion`). The _concept_ is reusable; the dog chrome
  is not on-palette for a customer journey, so the journey ships its own
  progressive-reveal module in the same spirit.
- **Proof / evidence**: `components/evidence/*` (`EvidencePackRender`,
  `MilestoneCertificate`, `VerifierBadge`) and `components/ops/fred/WorkProofTab`.
  Establishes the "premium operational certificate" language `JourneyProofCard`
  mirrors.
- **Existing grocery surface**: `app/customers/everyday-rewards/*` is a
  loyalty/wait-moment _advertising_ concept (Everyday Rewards brand, gated). It
  is **not** the customer shopping journey and is left untouched; "everyday,
  assembled" is a new, on-palette, reusable surface.
- **Design tokens**: Pearl canon — paper white, ink `#252d31/#313c42`, one
  restrained accent Ming teal `#3f7373`, gold `#b8964f` for hairlines/rims,
  mist `#e8ecea`; `--a-*` token layer in `app/globals.css`; sea-glass
  `--st-sea-glass #c8deda`. `MicroLabel` from `@assembl/canvas`.
- **Tests**: vitest, node env, `lib/**/*.test.ts` co-located; `@/` alias;
  `server-only` stubbed.
- **Invariant**: `middleware.ts` splash gate rewrites every non-exempt path to
  `/` on the live host — new public routes MUST be added to
  `SPLASH_EXEMPT_PREFIXES`.

## Reusable components found (reuse, don't rebuild)

| Need | Reuse |
| --- | --- |
| Genome facts + sections + reader | `GenomeFact`, `getGenomeFactsFor` |
| Authority / approval gating | `lib/os/policy.ts` risk ladder + `requiresApproval` |
| Capabilities catalogue | `lib/os/capabilities.ts` |
| Wait-state concept | `components/dash` progressive-reveal pattern |
| Proof visual language | `components/evidence/*`, `MilestoneCertificate` |
| Design tokens / labels | `--a-*` tokens, `MicroLabel`, `cta-primary`/`btn-ghost` |
| Test harness shape | `lib/testing` `AgentUnderTest`; vitest conventions |

## Missing foundations (what this build adds)

1. A **reusable journey data model** (`CustomerJourney`, `JourneyStage`,
   `JourneyRun`, `JourneyEvent`, `ProposedAction`, wait-state / handoff /
   metric / evaluation types) — none exists today.
2. A **typed journey repository** (seed-backed, tenant-scoped, DB-swappable) —
   persistence is not yet safe to add (RLS-heavy Supabase), so runs are held in
   a typed store with seed data.
3. A **journey genome-context selector** — returns only the genome slice a
   stage needs (never the whole genome).
4. **Specialist agent role definitions** for the journey (intent, context,
   plan, basket, value, resolution, wait-state) with input/output contracts,
   authority, escalation and limitations, mapped onto the existing risk ladder.
5. **Deterministic services** behind clean interfaces (intent parsing, context
   gap detection, planning, resolution) — no model calls inside components; zod
   validation at every boundary with safe fallback.
6. A **grocery genome + mock catalogue** (illustrative, clearly not live
   Woolworths data/pricing).
7. The **everyday, assembled** journey definition (10 stages) + a seed
   household run.
8. A **journey experience UI**: one continuous customer experience with a
   `customer view / inside the journey` toggle, five connected areas
   (journey · context · basket · approvals · proof) reading shared state.
9. A reusable **`JourneyProofCard`** and honest **status treatment**
   (live/connected/sandbox/simulated/proposed/approval-required/completed/
   unavailable).

## Files to add / modify

**Core (`lib/journey/`)**
- `types.ts` — all journey types + authority/status enums + zod schemas.
- `catalogue.ts` — mock grocery catalogue (breakfasts/lunches/dinners/snacks/
  drinks/staples, premium & value, an unavailable item).
- `genome/grocery-genome.ts` — seed `GenomeFact[]` + business/approval/
  escalation rules for the grocery tenant (fictional, labelled).
- `genome-context.ts` — `getJourneyGenomeContext({tenantId, journeyId, stageId,
  customerContext})` → stage-scoped slice only.
- `agents.ts` — the seven specialist `JourneyAgentRole` definitions.
- `services/intent.ts` — deterministic NL→structured intent (interface +
  mock impl); `services/context.ts` — missing-context detection & question
  ranking; `services/plan.ts` — meal+basket plan honouring dietary exclusions &
  budget; `services/resolution.ts` — unavailable-item & budget-excess handling.
- `runtime.ts` — `JourneyRunEngine`: advance stages, emit events, create/resolve
  `ProposedAction`s, enforce authority.
- `proof.ts` — `summariseJourney(run)` → `JourneyProofSummary`.
- `repository.ts` — in-memory tenant-scoped repository (journeys + runs) with a
  DB-swap seam; throws on cross-tenant access.
- `journeys/everyday-assembled.ts` — the reference journey + seed household +
  seed run factory.
- `index.ts` — public surface.
- `*.test.ts` — the 12 required cases.

**UI**
- `app/journeys/[journeyId]/page.tsx` — server page (loads journey via repo).
- `app/journeys/[journeyId]/JourneyExperience.tsx` — client orchestrator (state
  machine, view toggle, five areas).
- `app/journeys/page.tsx` — small index listing seed journeys.
- `components/journey/` — `IntentEntry`, `ContextQuestions`, `BasketView`,
  `ApprovalCard`, `WaitState`, `JourneyProofCard`, `InsideTheJourney`,
  `StatusChip`, `ShellChrome`.

**Wiring**
- `middleware.ts` — add `/journeys` to `SPLASH_EXEMPT_PREFIXES`.

**Docs**
- `docs/agentic-customer-journey.md` — architecture reference.

## Migration risks

- **No DB migration this pass.** Runs live in the typed repository with seed
  data. `repository.ts` is written so a Supabase-backed implementation can drop
  in behind the same interface later. Documented as a limitation.
- **Middleware exemption** must land or the route serves the splash on the live
  host. Added and noted.
- **Copy rules**: no banned words; NZ English + macrons; no inline copy that
  belongs in `COPY.md`. Journey UI strings are functional/operational
  (product-surface labels), not marketing copy, and avoid the banned list.
- **Do not overstate capability**: everything is `simulated`/`proposed` and
  labelled; no live retailer data, no order is "placed".
- **Brand guard** (`scripts/brand-guard.mjs`) runs on build — avoid canary/old
  gold hexes; use the teal/gold Pearl tokens.

## Proposed implementation order

1. Plan doc (this file). ✅
2. `lib/journey/types.ts` — lock the contracts (zod + TS).
3. Mock catalogue + grocery genome + genome-context selector.
4. Deterministic services (intent → context → plan → resolution).
5. Agent role definitions + runtime engine + proof.
6. Repository + everyday-assembled journey + seed run.
7. Tests (12 cases) — prove the loop before UI.
8. UI: shell, intent entry, context, wait state, basket, approvals, proof,
   inside-the-journey, view toggle; middleware exemption.
9. `docs/agentic-customer-journey.md`.
10. `pnpm typecheck` + `pnpm test` + build; commit; push; PR.

The milestone is the **end-to-end loop**: intent → structured understanding →
relevant context → recommendation → approval-ready action → useful wait state →
exception handling → evidence → proof — for one credible journey, reusable for
the next.
