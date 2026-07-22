# public-sandbox security review

_Scope: the agentic journey sandbox (`/experience`, `/journeys`,
`/internal/journeys`, journey server actions). Reviewed on branch
`claude/customer-journey-object-np9fxz`. Honest residual risks listed at the end._

## Findings

| Control | Status | Evidence |
| --- | --- | --- |
| **Tenant isolation** (repository + server action) | **PASS** | `repository.ts` / `repository-supabase.ts` throw `JourneyAccessError` on cross-tenant `getJourney`/`getRun`/`saveRun`; server action `loadJourneyRunAction(tenantId, runId)` scopes by tenant. Covered by `journey.test.ts` (10), `persistence.test.ts`, eval `tenant-01`, and the scenario harness. |
| **Internal route authentication** | **PASS (staging-appropriate)** | `/internal/journeys` calls `ensureAdmin()` (Supabase auth + admin allowlist, server-side). When the auth backend is unconfigured it **fails closed** with a 307 redirect to `/admin/login` (verified: `GET /internal/journeys → 307`). No operational data is computed before the gate. |
| **Least-privilege tools** | **PASS** | Capabilities declare `requiredAuthority`; `place_order` is `unavailable` and has no execution path. Agents request capabilities, not vendors. |
| **Server-only secrets** | **PASS** | Service-role client `import 'server-only'`; model calls only in `structureIntentAction` (server action) via `resolveIntentService`; no key read client-side. |
| **No secrets in client bundle** | **PASS** | `capabilities.ts` `resolveCapabilityStatus` reads `process.env` but only non-public keys' *presence*; on the client those are `undefined` so it returns declared defaults — no value is shipped. Grep of the client chunks shows no `SERVICE_ROLE`/`ANTHROPIC` values. |
| **No unsafe HTML rendering** | **PASS** | No `dangerouslySetInnerHTML` in journey components; all text rendered as React children. |
| **Untrusted content not treated as instructions** | **PASS** | Intent is parsed into a typed schema (deterministic, or model-`generateObject` validated); the parser extracts grocery fields only. Prompt-injection scenarios (`inject-01..03`) and unsafe-purchase (`unsafe-01..02`) cannot change control flow — verified in the eval suite and the scenario harness (basket still requires approval; no order action exists). |
| **Approval cannot be overridden by customer input** | **PASS** | Authority is decided by `decideAuthority` from the journey's approval rules, not from input text. `runResolution`/`proposeBasket` always create approval-required actions; scenario 7 confirms "ignore approvals" input still yields `approval_required` with no completed action. |
| **Unavailable capabilities cannot be invoked** | **PASS** | No code path executes `place_order`/`connector_action`; execution status is `unavailable`; scenario harness confirms no order-placement action is ever created. |
| **Rate limiting (public actions)** | **PASS (per-instance)** | `structureIntentAction` is rate-limited per salted-IP-hash (`guards.ts`, env-configurable). Tests: `guards.test.ts` allow-then-deny. **Limitation:** in-process window is per serverless instance, not distributed. |
| **Input-size limits + validation** | **PASS** | Intent length capped (`INTENT_MAX_CHARS`), run payloads byte-capped, run ids regex-validated — all server-side, before any model/tool call; malformed intent fails schema verification and blocks downstream (scenario 6). Tests in `guards.test.ts`. |
| **Logs / monitoring redaction** | **PASS** | `lib/observability/journey-report.ts` redacts prompt/intent/context/email/token/key/secret/name/payload keys and truncates long strings; only categories, ids and counts are emitted. Rate-limit logs carry a hashed IP only. |
| **Errors don't leak internals** | **PASS** | Server actions return calm messages (`"You're going a little fast…"`, `"We couldn't read that just now…"`); no stack traces surfaced to the client. |

## Regression tests added
- `lib/journey/guards.test.ts` — rate-limit allow/deny + bucket/IP isolation; intent empty/oversized/valid; run-id allow/deny; payload byte cap.
- Existing: tenant isolation, approval gating, malformed-intent safe-fail, injection/unsafe scenarios in `journey.test.ts` + `lib/journey/eval/*`.

## Unresolved / residual risks
1. **Rate limiting is per-instance** (in-memory). Under serverless fan-out the effective limit is higher than configured. Move to Supabase/Upstash-backed counting before a high-traffic public sandbox.
2. **Persistence + model-intent unverified against live infra.** Both paths are implemented with safe fallbacks but have not run against a real Supabase/RLS or a live model key in staging (none configured here).
3. **Error monitoring has no provider wired** (no DSN). Code + redaction are in place (`journey-report.ts`); a provider (e.g. Sentry) must be connected — env setup pending.
4. **Verification/journey-failure events from the client runtime** are recorded in the run trace but only reach server-side monitoring once runs are persisted/executed server-side; today the server boundary reports model/tool/input/rate failures.
5. **`/internal/journeys` depends on Supabase auth being configured.** In the sandbox it fails closed (redirect); in production, confirm the admin allowlist is correct before exposing it anywhere reachable.
