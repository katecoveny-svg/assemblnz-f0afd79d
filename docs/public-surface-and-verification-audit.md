# public surface & verification audit

_Audit before build, per the runtime-verification brief. Honest classification
of what genuinely runs vs. what is mock, decorative, or missing. A feature is
**not** "working" just because its interface renders._

Legend: **REAL** (real runtime data) · **MOCK** (works, mock data) · **PARTIAL** ·
**UI-ONLY** · **HARD-CODED** · **BROKEN** · **MISSING** · **UNSAFE-PUBLIC**.

## Journey runtime & data model

| Feature | Status | Evidence |
| --- | --- | --- |
| Journey type model + zod schemas | **REAL** | `lib/journey/types.ts` — enums are zod-backed; `ProposedActionSchema`/`JourneyEventSchema`/`EvidenceRecordSchema` validate at boundaries. |
| Runtime state machine | **REAL** (deterministic) | `lib/journey/runtime.ts` — immutable transitions, real event timeline, evidence, stage advance; exercised by 21 tests in `lib/journey/journey.test.ts`. |
| Intent structuring (deterministic) | **REAL** | `lib/journey/services/intent.ts` `parseGroceryIntent` + `GroceryIntentSchema`; test 1. |
| Intent structuring (model) | **PARTIAL / connected-if-keyed** | `lib/journey/services/intent-live.ts` `anthropicIntentService` uses `generateObject`; **falls back to deterministic when `ANTHROPIC_API_KEY` is absent** (the sandbox default). Never verified against a live key in CI. |
| Context gap detection | **REAL** | `lib/journey/services/context.ts`; tests 2–3. |
| Plan / basket assembly | **REAL logic over MOCK catalogue** | `lib/journey/services/plan.ts`; catalogue is illustrative (`lib/journey/catalogue.ts`). |
| Resolution (exceptions) | **REAL** | `lib/journey/services/resolution.ts`; approved swaps persist via `_appliedResolutions` and re-derive the basket (test "approved resolution clears the exception"). |
| Approval gating | **REAL** | `runtime.decideAuthority` + `proposeBasket`→`approval_required`; `approveAction`/`rejectAction`; tests 7–8. |
| Proof summary | **REAL calc / ESTIMATED metrics** | `lib/journey/proof.ts` computes from run events; time-saved etc. are explicitly `estimatedOnly`. |
| Tenant isolation | **REAL** | `lib/journey/repository.ts` + `repository-supabase.ts` throw `JourneyAccessError`; tests 10 + persistence suite. |
| Persistence | **PARTIAL** | `SupabaseJourneyRepository` implemented + `journey_runs` migration exists, **but the migration is not applied to a live DB** (Supabase preview-branch limit hit on PRs) and there are no Supabase keys in the sandbox → every run currently uses the **in-process fallback** (not durable). DB path unit-tested with a fake client only. |

## Business Genome

| Feature | Status | Evidence |
| --- | --- | --- |
| Genome fact model | **REAL** | reuses `GenomeFact` (`lib/customers/auckland-dog-trainer/genome.ts`). |
| Grocery genome facts | **MOCK / seed** | `lib/journey/genome/grocery-genome.ts` — fictional, labelled. |
| Stage-scoped context selector | **REAL** | `lib/journey/genome-context.ts` `selectGenomeContext`; test "genome context is stage-scoped". |
| Live genome DB read for grocery | **MISSING (by design)** | grocery tenant uses static facts; `getGenomeFactsFor` DB path exists for other tenants only. |

## Agents

| Feature | Status | Evidence |
| --- | --- | --- |
| Agent role definitions | **REAL (descriptive)** | `lib/journey/agents.ts` `JOURNEY_AGENT_ROLES` — role/purpose/contracts/authority/limitations as prose + version. |
| Machine-readable agent contracts (`AgentContract` w/ schema ids + success checks) | **MISSING** | no typed contract with `inputSchemaId`/`successChecks`; brief §4. |
| Per-invocation verification (`AgentVerificationResult`) | **MISSING** | no input/output validation-and-check record tied to invocations; brief §5. |
| Downstream blocking on failed verification | **MISSING** | runtime does not gate on a verification result. |

## Model & tool integrations

| Feature | Status | Evidence |
| --- | --- | --- |
| Model integration | **PARTIAL** | `intent-live.ts` (Anthropic via `ai` SDK), server-side, key-gated, safe fallback. |
| Tool: read_genome / search_knowledge | **SIMULATED / sandbox** | declared in `everydayAssembledJourney.toolPermissions` with honest status. |
| Tool: assemble_basket | **SIMULATED** | prepares a basket; `execution: 'simulated'`; no order placed. |
| Tool: connector_action (place order) | **UNAVAILABLE** | status `unavailable`; correctly not wired. |

## Public surface & routes

| Feature | Status | Evidence |
| --- | --- | --- |
| `/journeys` + `/journeys/[journeyId]` | **REAL** | server pages load journey via repo; `JourneyExperience` drives real run state; middleware splash-exempt. |
| `/experience` canonical public route | **MISSING** | brief §3 wants `/experience`; only `/journeys/...` exists. |
| Customer view / inside-the-journey toggle | **REAL** | `JourneyExperience` + `InsideTheJourney` (genome context, timeline, evidence, proposed actions). |
| Inside-the-journey: agent version + verification status + capability status | **PARTIAL / MISSING** | shows role/context/evidence but not agent contract version, verification result, or per-capability status. |
| Homepage positioning ("Customer journeys, assembled.") | **UI-ONLY / copy-locked** | `components/home/AgentAssemblyStudio.tsx` renders approved `COPY.md`-governed strings + the new 3D hero (`AssemblyHeroScene`, decorative/`aria-hidden`). **New marketing copy cannot be authored here** — `COPY.md` rules require Kate's sign-off. Flagged, not changed. |
| Trust/proof public surface | **PARTIAL** | `/trust` exists site-wide; no journey-specific verification explainer. |
| Central capability registry (`CapabilityStatus`) | **MISSING** | `lib/journey/status.ts` has `StatusTreatment` + `STATUS_META` but no registry mapping features→status+data-source+disclosure; brief §2. |

## Proof

| Feature | Status | Evidence |
| --- | --- | --- |
| Proof card | **REAL render / ESTIMATED data** | `components/journey/JourneyProofCard.tsx`; labels estimated metrics. |
| Proof-data lineage (`ProofMetric.sourceType`) | **MISSING** | metrics are not tagged measured/calculated/estimated/simulated with source event ids; brief §8. |

## Testing, eval, deployment, observability

| Feature | Status | Evidence |
| --- | --- | --- |
| Unit tests | **REAL** | 28 journey tests (`journey.test.ts` + `persistence.test.ts`); 401 repo-wide. |
| Journey scenario evaluation suite (30+, `eval:journeys`) | **MISSING** | `lib/testing/` is the marketplace-agent harness, not journeys; brief §7. |
| Deployment platform | **REAL** | Vercel (`vercel.json`, `framework: nextjs`); PR previews serve as staging/sandbox. |
| Env validation | **MISSING** | no central env schema; services degrade individually. |
| Error tracking / analytics | **MISSING** | no Sentry/PostHog/etc. in `package.json`. |
| Rate limiting on journey actions | **MISSING** | limiters exist elsewhere (`lib/agents/chat-rate-limit.ts`) but journey server actions are unthrottled. |
| Structured runtime logs w/ run/invocation ids | **PARTIAL** | run timeline has ids; no structured server logs for model/tool latency or validation failures. |
| Protected operational view | **MISSING** | brief §10. |
| CSP / security headers | **REAL** | `next.config.ts async headers()` sets CSP. |

## Security posture (public exposure)

- Internal/pilot routes gated by `middleware.ts` (basic-auth / signed invite) — **REAL**.
- Journey demo data is fictional (no real customer data) — **REAL**.
- Model calls server-side only (`intent-live.ts` behind `structureIntentAction`) — **REAL**.
- Secrets server-side (service-role client `import 'server-only'`) — **REAL**.
- No real action tools exposed (ordering `unavailable`) — **REAL**.
- **Gaps**: no rate limiting / input-size cap on journey server actions; no explicit prompt-injection handling in the model intent path; persistence path unverified against live RLS.

## Overall verdict

The **journey loop is genuinely functional and deterministic** (intent→context→plan→approval→wait→resolution→proof) with real state, real gating, real tenant isolation, and honest simulated/estimated labelling. What is **missing for verifiable, publicly-deployable operation**: machine-readable agent contracts + per-invocation verification with downstream blocking; a central capability registry; a 30+ scenario eval suite with one command; proof-data lineage; a canonical `/experience` route; a protected operational view; rate limiting; and a documented staged-deployment checklist. Persistence and model-intent are implemented but **unverified against live infrastructure** and default to fallback in the sandbox. **Not production-ready; safe to expose as a labelled sandbox.**
