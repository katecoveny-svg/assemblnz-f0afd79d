# Account rollout hardening — review only

Requested audience: **all signed-in users**, not a single-owner pilot. This bounded code change fixes four data/consent defects; it does not make every DO feature available to that audience.

Base: `57b174df287d5d8adbbc56b38fce9b05cbd6fd69` (fresh main, including #1555 and #1557).

## Changes and limits

- A conversation stops before an exchange would exceed the existing 40-message limit. The existing explicit new-conversation action leaves saved conversations intact. The server rejects replacement of previously saved message content, including a same-length rolling window, and preserves stored timestamps. Existing 48,000-byte, 50-live-conversation and 30-day bounds remain; storage is not unlimited. A byte-limit save can still fail explicitly before 40 messages, leaving the earlier saved record intact.
- Memory GET returns the server-verified workspace; every mutation must echo that expectation. Missing or mismatched expectations fail before storage access. Auth events, focus and visibility revalidate; old records/editors are hidden during uncertainty, changed accounts clear drafts and consent, and aborted/superseded reads or writes cannot restore the previous owner's data. Old browser bundles without the new header must reload before saving.
- Memory edit/resume uses the Auckland calendar day, including morning timestamps capped to the current instant. Winter, summer and both DST transition dates have round-trip tests.
- Wake-up consent resets for source identity/revision/content, schedule/permission state, expiry-derived availability and worker readiness. Existing expected-revision submission remains mandatory.

No flags, secrets, SQL migrations, policies, enrollment records, production data, providers or cleanup were changed or invoked. The server-owned identity, per-owner storage binding and responsibility readiness checks remain intact. Browser proof intercepts every API request and every external origin; it proves UI behavior, not hosted authentication/storage.

## All-user deployment prerequisites (separate review)

1. **Review and release the code before activation.** Deploy API and browser changes together. This PR requires no schema activation. Existing SQL still only checks conversation length, so the stronger prefix check is at the authenticated application service boundary; direct privileged RPC callers must preserve the same append-only contract. A database-level equivalent, if wanted, requires separate reviewed SQL.
2. **Memory and kept conversations:** verify their deployed schemas/RLS/service-only writes, collection configuration (`DO_PERSONAL_MEMORY_ENABLED`, `DO_PERSONAL_CONVERSATIONS_ENABLED`) and approved retention/expiry operation. Neither collection path contains an owner allowlist. Loading them invokes owner-scoped expiry purge; even read-oriented live verification therefore requires the appropriate deletion authority. The parent rollout review reports no recorded memory-maintenance attempt; this task did not run it. Do not treat a collection flag as proof of operational retention.
3. **Responsibilities are still single-owner.** `20261013094000_do_personal_storage_only.sql` defines `do_personal_storage_enrolment.singleton` with both `UNIQUE` and `CHECK(singleton)`. The feature flag alone cannot enroll all users. Minimum separate reviewed change: replace singleton enrollment with per-owner enrollment; add a server-authenticated, same-origin, expected-workspace-bound opt-in/renewal flow recording versioned storage/retention consent; preserve non-anonymous owner checks, bounded enrollment expiry, per-owner quotas, CAS/replay protections and readiness/cleanup health. Prove two concurrent owners, cross-owner denial, expiry/revocation, delayed retries and bounded cleanup before activation. Do not bulk-enroll accounts or remove readiness/retention checks as a shortcut. Review the existing global lock, 30-create identity cap and 300-record cleanup batch against the wider audience. Obtain action-time security and permanent-deletion approval before deploying/activating the separate schema or maintenance changes.
4. **Wake-ups:** saving a responsibility and granting scheduled preparation remain separate consents. Keep `DO_PERSONAL_WAKEUPS_ENABLED`, worksheet worker configuration, operational health and per-responsibility seven-day permission checks. This PR changes consent invalidation only.
5. **Assistant replies are not available to every signed-in owner yet.** `assistant-server.ts` uses `TYPESAFE_PILOT_USER_IDS` on the private path; the consumer path requires `PERSONAL_DO_CONSUMER_ENABLED`, a configured plan and a current owner entitlement, plus provider configuration and durable admission. All-user access needs a separately reviewed access/entitlement decision and bounded capacity/cost controls. Do not remove provider consent or admission limits. This hardening PR does not activate live models or widen billing access.

## Synthetic proof

- Focused personal suite: 40 files / 278 tests passed.
- All DO suites (`apps/do`, `app/api/do`, `app/do`): 156 passed files, one skipped; 1,771 passed tests, two skipped.
- `scripts/review-do-account-hardening.cjs`: 25 browser checks passed. Two owners; cross-tab Supabase auth broadcast; focus revalidation; delayed GET/POST; stale expected owner; 38→40 and reopened 40-message boundary; no provider submission beyond the limit; source and schedule consent changes; 375px geometry; no page errors. Local dev must use the synthetic Supabase URL/key documented in the script command below.
- Existing `scripts/review-do-cross-device.cjs`: 13 browser checks passed, with workspace-bound memory fixtures updated to match the API contract.
- Typecheck and changed-source ESLint passed. Macron guard passed via `node --import tsx scripts/lint-macrons.ts` (the pnpm/tsx CLI hit the sandbox IPC restriction).
- Full Vitest run: 3,505 passed, three skipped, eight failures in four unrelated files. The exact eight failures also reproduce in an untouched worktree of the base: deployment docs-only skip (1), Franklin headline expectation (1), loyalty Arial craft guard (1), portable stdio candidates unavailable (5).
- Whole-repository ESLint is not green (1,174 errors and 244 warnings on the initial pass, including one subsequently fixed warning in this change). The changed TypeScript/TSX files pass separately. No broad lint cleanup is included.

Browser reproduction (installed Playwright and Chrome paths are machine-specific):

```sh
NEXT_PUBLIC_SUPABASE_URL=https://synthetic.supabase.test NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=synthetic-test-key pnpm dev --hostname 127.0.0.1 --port 3159
ASSEMBL_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/review-do-account-hardening.cjs
```

Artifacts are local under `output/playwright/do-account-hardening/` and `output/playwright/do-cross-device/`. Review screenshots and `results.json` together. This is synthetic desktop/mobile-browser proof, not installed native-client or production two-device proof.

Rollback is a normal code revert, but reverting the memory API binding reopens the cross-account draft risk; prefer fixing forward. No database rollback is part of this change.
