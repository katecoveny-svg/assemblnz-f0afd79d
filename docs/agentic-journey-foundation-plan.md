# agentic journey foundation — implementation plan

_2026-07-24. Plan precedes code per the foundation brief. Lowercase assembl throughout._

## current architecture (inspected)

- **Framework**: Next.js 15 app router, TypeScript strict, React 19.
- **Styling**: Tailwind (Mārama Whenua tokens in `tailwind.config.ts`) + CSS modules; fonts via `app/layout.tsx` (`--font-body` Lato, `--font-mono` Space Mono, `--font-display` Cormorant [legacy]); Inter Tight loaded per-surface (`components/home-v3`).
- **Data layer**: Supabase (migrations + edge functions), but the established repo pattern is a **code-side typed registry mirroring the durable table** (see `lib/customers/tenant-registry.ts`, "reference_agent_prompts_live_in_code"). Journey v1 follows that pattern — typed repository + seed, swappable for Supabase later.
- **Agent runtime**: prompt/config-driven agents under `lib/agents`, `lib/testing/reference-agent.ts`; voice agents in `lib/voice`. No journey-shaped runtime exists yet.
- **Tests**: vitest, `lib/**/*.test.ts` + `app/**` + `components/**` + `packages/**`.

## reusable components found

- **Wait-state experience**: `app/assembling/**` (dash microsite) and `app/customers/everyday-rewards/dash/wait-states` — concept reused (progressive useful work, rewarded wait), implementation is bespoke to those surfaces; journey v1 re-implements the concept as a reusable `WaitState` component fed by typed `WaitStateModule` config.
- **Business Genome**: `lib/customers/auckland-dog-trainer/genome.ts` — fact-based genome with per-surface reads. The journey Genome follows this shape (typed facts + selector), generalised per-tenant.
- **Everyday Rewards demo**: `app/customers/everyday-rewards/**` — kept as-is (pilot surface); the new journey is tenant-configured, not a Woolworths mock. Seed genome is clearly illustrative.
- **Tenancy**: `lib/customers/tenant-registry.ts` — the journey repository keys by `tenantId` and enforces isolation at the repository boundary.
- **Evidence/receipts**: `lib/evidence/**`, Mana Receipt components — proof card follows their "operational certificate" tone; evidence records link by id.
- **Status/typography/tokens**: Tailwind tokens + module CSS patterns; journey palette per current visual direction (paper, pale grey, sea-glass, graphite, chrome; no canary yellow).

## missing foundations (to build)

1. Journey schema (`CustomerJourney`, `JourneyStage`, `JourneyRun`, `JourneyEvent`, `ProposedAction`, `JourneyProofSummary`, agent definitions, status treatment).
2. Stage-scoped Genome selector (`getJourneyGenomeContext`).
3. Deterministic journey runtime (intent → context → plan → basket → exceptions → proof) behind service interfaces, zod-validated, no model calls in components.
4. Reusable approval component + proposed-action lifecycle.
5. Reusable wait-state module driven by journey config.
6. Journey Proof Card.
7. Customer view / inside-the-journey toggle experience.
8. Seed data: grocery genome, mock catalogue, demonstration household.
9. Tests (12 specified behaviours).

## files to add

```
lib/journeys/types.ts          — full journey schema + status treatment types
lib/journeys/genome.ts         — JourneyGenome type, seed grocery genome, getJourneyGenomeContext
lib/journeys/catalogue.ts      — mock catalogue (illustrative, separate from UI)
lib/journeys/agents.ts         — seven specialist agent definitions
lib/journeys/intent.ts         — deterministic intent service (zod-validated boundary)
lib/journeys/context.ts        — context-question selection with reasons
lib/journeys/plan.ts           — meal/snack plan generation, assumptions
lib/journeys/basket.ts         — basket build, dedupe, budget, value swaps
lib/journeys/runtime.ts        — run reducer: events, stages, proposals, approvals, exceptions, proof
lib/journeys/repository.ts     — tenant-scoped repository (in-memory + seed, Supabase-swappable)
lib/journeys/seed.ts           — everyday, assembled journey definition + demo household
lib/journeys/journeys.test.ts  — required test coverage
components/journeys/*          — StatusChip, ApprovalCard, JourneyProofCard, WaitState,
                                 InsideJourney, JourneyExperience + module CSS
app/journeys/everyday-assembled/page.tsx — route (noindex while pre-launch)
docs/agentic-customer-journey.md — implementation documentation
```

## files to modify

- None of the live surfaces. (`components/site/site-header.tsx`/`site-footer.tsx` already carry a suppression list; the journey route keeps global chrome — it is a product surface, not a marketing splash.)

## migration risks

- **Palette drift**: journey surface uses the sea-glass/graphite direction while older kete surfaces use Mārama Whenua — contained via scoped module CSS, no global token changes.
- **Duplicate wait-state implementations**: acceptable short-term; consolidate `assembling` onto `WaitStateModule` config once the journey shape settles.
- **In-memory runs**: run state is per-session (client) in v1; repository interface is the seam where Supabase persistence lands later (documented in `agentic-customer-journey.md`).
- **Simulated vs real**: every actionable status is typed; nothing renders as "completed" unless the runtime executed a (simulated, labelled) action.

## proposed implementation order

1. types → genome + selector → catalogue → agents
2. services: intent → context → plan → basket
3. runtime (events, proposals, approvals, exceptions, proof)
4. repository + seed
5. tests (against pure runtime — no DOM needed)
6. UI: status → approval → proof card → wait state → experience + inside view → route
7. docs, verification, completion report

## addendum — owner guidance received mid-build (2026-07-24)

1. **One shared run** (hard acceptance condition): customer view and
   inside-the-journey view consume the same `JourneyRun` — same run id, event
   stream, scenario state, approvals and proof metrics. Changing a scenario
   input in either view updates both. Implemented by making the run a pure
   function of `(journey, genome, input)` recomputed on any input change, with
   approval decisions applied on top; both views render that single object.
2. **Change one thing**: first-class scenario controls (add guests, budget
   ceiling drop, gluten-free guest, item unavailable) that visibly reassemble
   plan → basket → approvals → proof.
3. **How this journey assembled**: cinematic event replay derived from the real
   event stream (not a synthetic trace panel).
4. **Agent negotiation**: budget exception renders as a decision table —
   basket best fit vs budget limit vs preference constraints → resolution.
5. **Before / with assembl**: manual-journey vs assembled-journey comparison in
   the proof view.
6. Deferred (documented as next steps, not built now): pilot simulator,
   cross-surface continuity, live signals, ask-this-journey-anything,
   per-organisation token gating for concept microsites. Journey route ships
   `noindex`, out of sitemap.
7. Demo surfaces must NOT be forced into identical card structures — the
   renderer shares runtime + types, not layout.
