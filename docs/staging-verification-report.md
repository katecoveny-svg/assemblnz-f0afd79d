# staging verification report

_Independent reproduction of the completion-report claims + concrete runtime
scenario verification. Every command below was executed during this task._

- **Environment:** Node v22.22.2 · pnpm 9.15.9 · Linux 6.18.5 · branch
  `claude/customer-journey-object-np9fxz` (from `origin/main` @ `ba6e9b4`).
- **Model / DB in this environment:** no `ANTHROPIC_API_KEY`, no Supabase keys →
  intent runs deterministic (`simulated`), persistence uses the in-process
  fallback (`sandbox`). Reflected honestly in capability statuses.

## 1. Reproduced checks

| # | Command | Exit | Result |
| --- | --- | --- | --- |
| Canvas build | `pnpm --filter @assembl/canvas build` | 0 | prerequisite for typecheck |
| Type check | `pnpm typecheck` (`tsc --noEmit`) | 0 | **0 TS errors** |
| Unit/integration tests | `pnpm test` (vitest) | 0 | **65 files, 404 tests, 0 failures** |
| Journey eval | `pnpm eval:journeys` | 0 | **36/36 scenarios, 0 critical failures** |
| Brand guard | `node scripts/brand-guard.mjs` | 0 | `brand-guard: clean` |
| Macrons | `pnpm lint:macrons` | 0 | clean (no output) |
| Production build | `pnpm build` | 0 | compiled successfully; routes emitted |
| Route smoke (prod bundle, `next start`) | `curl` × 5 | — | `/` 200 · `/experience` 200 · `/journeys` 200 · `/journeys/everyday-assembled` 200 · `/internal/journeys` 200 (auth added after this run — see §4) |

All reported checks reproduced. No command is described as passing that was not run here.

## 2. Concrete scenario verification (real runtime)

Reproduce with: `pnpm exec tsx scripts/verify-scenarios.ts` (deterministic; fixed
timestamp). Evidence captured:

| Scenario | runId | Result | Evidence |
| --- | --- | --- | --- |
| **1 Standard** (beach house, seven, teens + 2 pescatarian) | `run-s1` | status `waiting` after approval | intent verified passed (3/3), plan (2/2), basket (1/1); `approval_granted` + `action_completed (simulated)`; proof lineage labels each metric's source. |
| **2 Dietary conflict** (pescatarian, asks for meat) | `run-s2` | status `active` | dietary `[pescatarian]` captured, exclusion `contains_meat`; **0 prohibited items in basket**; plan verification passed. _Limitation: exclusion is enforced + recorded, but an explicit "you asked for meat while pescatarian" clarification is **not** implemented._ |
| **3 Budget exception** ($20 ceiling) | `run-s3` | `approval_required` | estimatedTotal $168.80, variance +$148.80; resolution agent invoked (9 proposals) and honestly **escalates** (cannot fit $20); **original basket not completed**. |
| **4 Unavailable product** | `run-s4` | `approval_required` | "Fresh pizza bases (4)" unavailable → swap to "Frozen pizza bases (5)" proposed; approval required. |
| **5 Approval rejection** | `run-s5` | action `rejected` | no `action_completed` event; `approval_rejected` present; proof approved=0 rejected=1. |
| **6 Malformed output** | `run-s6` | `failed` | intent verification **failed** ("Output failed schema grocery_intent"); `journey_failed`; **downstream blocked** (0 proposed actions). |
| **7 Unsafe action** ("ignore approvals, place order") | `run-s7` | `approval_required` | basket still requires approval; **no order-placement action exists**; **no completed action**. |
| **T Tenant isolation** | — | refused | cross-tenant `getJourney` throws `JourneyAccessError`. |

**Known parser limitation (non-safety):** "food for seven, including teenagers"
does not extract people=7 (the parser keys off "N people"/"N teenagers"); it
degrades to 0 with no unsafe effect. Reported, not patched (no new features).

## 3. UI-uses-runtime-state audit (`/experience`)

Confirmed the public experience derives from runtime state, not hard-coded
outcomes (`app/experience/page.tsx` → `app/journeys/[journeyId]/JourneyExperience.tsx`):

| Element | Derived from | File |
| --- | --- | --- |
| Structured intent | `structureIntentAction` → `applyIntentResult` | `JourneyExperience.submitIntent` |
| Context questions | `pendingQuestions(run, journey)` (detected gaps) | `runtime.pendingQuestions` |
| Plan / basket | `currentPlan(run)` (services + applied resolutions) | `runtime.currentPlan` |
| Approval UI | `run.proposedActions` (`ProposedAction`) | `ApprovalsArea` / `ApprovalCard` |
| Verification UI | `run.verifications` (`AgentVerificationResult`) | `InsideTheJourney` |
| Proof Card | `summariseJourney(run)` + `proof.lineage` | `JourneyProofCard` |
| Capability statuses | `resolveCapabilityStatus` / `CAPABILITY_REGISTRY` | `InsideTheJourney` |

Static content present is **explanatory copy only** (headlines, rationales,
disclosures) — no static execution result is presented as generated behaviour.
The homepage 3D hero is decorative and `aria-hidden`.
