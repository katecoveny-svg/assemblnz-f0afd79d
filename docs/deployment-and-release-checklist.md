# deployment & release checklist — agentic journeys

Controlled, staged rollout. **Do not deploy the journey surface straight to
production.** Progress through the stages; each gate must pass before the next.

```
local → staging → public sandbox → controlled pilot → production
```

## Shared release completion gate — code, database, configuration and persistence

For any relevant product release, including DO, **a merged GitHub PR alone is not a completed release**. Keep one dated evidence record for the target environment and requested audience. Mark every item **passed**, **blocked**, **not run** or **not applicable**, with evidence and an owner; do not turn missing proof into a success claim.

- [ ] Record repository/PR, exact reviewed commit, exact-head CI results (including failures/skips), target Vercel project/environment, deployment ID/URL and the commit actually serving production. Verify routing/health after deployment; preview readiness does not prove production release.
- [ ] Record the exact required Supabase migration versions and each version's applied/unapplied state on the intended project, verified at a stated UTC time. Verify relevant schema, RLS and RPC permissions separately; a migration file or ledger entry alone does not prove safe runtime behavior.
- [ ] Inventory relevant Vercel flags and their environment-specific state. Record required secrets as **present**, **absent** or **unverified**, never their values. Confirm that the serving deployment contains the reviewed configuration; saved environment changes alone do not update an existing deployment.
- [ ] Separate all-user availability from each owner's authority/consent. Record remaining allowlists, subscription/entitlement requirements, enrollment limits, worker health and retention-readiness gates. Do not remove owner isolation or consent to widen the audience.
- [ ] Where authorized, prove a synthetic owner's **save → reload → new session/device reopen** against the actual deployed persistence path. Verify a second owner's isolation, account-switch invalidation, stale revision/request rejection and failure recovery. Record whether this is mocked, isolated staging or production proof. A successful request, in-memory fixture or local browser draft is not durable-save proof.
- [ ] Record code/configuration/schema rollback steps and consequences for stored content, consent, retention, expiry cleanup, tombstones and restores. Disabling collection must not silently abandon required retention. Identify irreversible operations and uncertain outcomes explicitly.
- [ ] Confirm action-time authority before migrations, production configuration/deployment, access expansion, secret creation, or permanent deletion/cleanup. This checklist grants none. Even a GET may purge expired content; inspect the implementation before live verification. Leave blocked operations marked blocked and report the exact missing approval or dependency.

The journey-specific guidance below remains scoped to journey surfaces. For the dated DO all-user rollout blockers and evidence, see [account rollout hardening](do-personal/ACCOUNT-ROLLOUT-HARDENING.md).

## Platform

- **Hosting**: Vercel (`vercel.json`, `framework: nextjs`). Package manager: **pnpm**.
- **Staging / public sandbox**: Vercel **preview deployments** — every PR builds a
  preview URL (posted by the Vercel bot on the PR). That preview *is* the staging
  and public-sandbox surface for the journey routes (`/experience`, `/journeys`).
- **Production**: `main` → the apex domain. The live host runs the `middleware.ts`
  splash gate; new public routes must be splash-exempted (`/experience`,
  `/journeys` already are). `/internal/*` is **not** exempt — it is hidden on the
  live host by the splash gate (boundary-based, not auth; see Security).

## Per-release gate (run before promoting a stage)

### Build & correctness
- [ ] `pnpm install` clean; lockfile unchanged unexpectedly.
- [ ] `pnpm --filter @assembl/canvas build` (needed once for typecheck).
- [ ] `pnpm typecheck` → 0 errors.
- [ ] `pnpm test` → all pass.
- [ ] `pnpm eval:journeys` → **0 critical failures** (exit 0). This is a release
      gate — the command exits non-zero when any critical scenario check fails.
- [ ] `node scripts/brand-guard.mjs` + `pnpm lint:macrons` clean.
- [ ] `pnpm build` succeeds (runs brand-guard + canvas + next build).

### Environment variables
- [ ] `ANTHROPIC_API_KEY` — optional. Absent → intent uses the deterministic
      parser (capability `intent_structuring` = `simulated`). Present → `connected`.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — optional. Absent →
      runs use the in-process fallback (capability `run_persistence` = `sandbox`,
      **not durable**). Present → `connected`.
- [ ] Confirm no secret is exposed to the client bundle (service client is
      `import 'server-only'`; model calls run only in `structureIntentAction`).

### Migrations
- [ ] `supabase/migrations/20260722000000_journey_runs.sql` applied to the target
      project **before** enabling persistence. Until applied, persistence stays
      on the in-process fallback (safe, non-durable).
- [ ] Confirm `journey_runs` RLS is enabled (deny-all) and only the service role
      can read/write.

### Route smoke tests (against the deployed preview)
- [ ] `GET /experience` → 200; intent entry renders.
- [ ] Complete a run: intent → context → plan → approve → wait → basket →
      resolution → proof. Customer-view states change only on real events.
- [ ] Toggle **inside the journey**: agent versions, verification results,
      capability statuses, genome context, evidence and timeline render.
- [ ] Reject an approval → nothing is prepared.
- [ ] `GET /journeys` index → 200.
- [ ] `GET /internal/journeys` → on the **live** host must NOT be publicly
      reachable (splash-gated). On staging it renders the ops view.

### Security & isolation
- [ ] Tenant isolation holds (`repository` throws on cross-tenant; covered by
      tests + eval `tenant-01`).
- [ ] No real customer data in demo/genome/catalogue (all fictional, labelled).
- [ ] Consequential actions require approval (eval `approval_required_for_basket`).
- [ ] No order can be placed (`place_order` = `unavailable`).
- [ ] Prompt-injection / unsafe-purchase scenarios do not bypass approval
      (eval `inject-*`, `unsafe-*`).
- [ ] **Known gap**: journey server actions are not yet rate-limited or
      input-size-capped — add before a public, un-gated sandbox with a live model
      key (see Unresolved risks).

### Experience quality
- [ ] Mobile viewport (≤760px): experience is usable; panels reflow.
- [ ] Browsers: Chromium + WebKit + Firefox render the hero (WebGL) and fall back
      gracefully where WebGL is unavailable.
- [ ] Reduced-motion: hero + wait state render static; no essential info is
      motion-only.
- [ ] Capability-status disclosures visible (the "what's real, what's simulated"
      panel) — not buried.

### Observability
- [ ] Deployment version recorded (Vercel commit SHA).
- [ ] **Known gap**: no error tracker (Sentry/PostHog) is wired. Add before a
      controlled pilot; until then rely on Vercel runtime logs + the
      `/internal/journeys` ops view.

## Rollback
- Vercel: **Instant Rollback** to the previous production deployment from the
  Vercel dashboard (Deployments → previous → Promote). No code change needed.
- If a migration must be reverted, take `journey_runs` offline by removing the
  Supabase env vars (the app falls back to in-process automatically) rather than
  dropping the table under load.
- Git: revert the offending PR on `main`; the next deploy restores the prior state.

## Stage-specific notes

- **Local**: `pnpm dev`; visit `/experience`.
- **Staging (PR preview)**: automatic on PR; run the route smoke tests there.
- **Public sandbox**: the same preview, shared read-only. Keep model + DB keys
  **off** unless the rate-limit / input-cap gaps above are closed.
- **Controlled pilot**: enable persistence (apply migration + keys) for a named
  tenant; add error tracking + rate limiting first.
- **Production**: only after a pilot with real usage evidence. Do not describe as
  production-ready until the Unresolved risks are closed.

## Status of earlier gaps (updated after the verify/harden pass)
- ✅ **Rate limiting** — added to `structureIntentAction` (`lib/journey/guards.ts`,
  env-configurable, tested). *Caveat: in-process/per-instance, not distributed.*
- ✅ **Input-size limits + validation** — intent length, run-payload bytes, run-id
  format enforced server-side before any model/tool call (tested).
- ✅ **Internal auth** — `/internal/journeys` gated by `ensureAdmin()`, fails
  closed to `/admin/login` (verified `307`).
- ✅ **Error monitoring (code)** — `lib/observability/journey-report.ts` with
  redaction, wired into server actions. *Provider DSN still pending.*

## Unresolved risks (must close before a genuine customer pilot)
1. **Distributed rate limiting** — replace the in-process window with a
   Supabase/Upstash-backed counter for real serverless enforcement.
2. **Error-tracking provider** — connect a DSN (Sentry/etc.); code + redaction
   are ready.
3. **Live-infra verification** — run persistence (apply `journey_runs` migration
   + keys) and model-intent (with `ANTHROPIC_API_KEY`) against real staging infra.
4. **Client-runtime failure reporting** — forward verification/journey failures
   from the browser runtime to monitoring (currently trace-only until runs
   persist server-side).
