# Portable continuity verification

Verified 2026-10-01 in an isolated Mac checkout. Production activation remains false.

## Automated evidence

- Full `pnpm build`: passed; serial build slot released to root.
- TypeScript `tsc --noEmit`: passed before build and on the final repeat.
- Final focused continuity/API/share/portable/native-entry suite: 34 tests across five files passed. Earlier continuity/API/share/portable/receive regression selection: 41 tests passed.
- Scoped ESLint for all new runtime files and SQL harness: passed. Brand and front-door guards passed in the full build.
- Isolated PostgreSQL 17 harness: 23 checks passed. Auth identities are fictional Supabase stubs; no live database was used. Exact frozen SQL SHA-256: `130b100a88d4adc5807ba0e7912c43d651c793805b4ade8efbe7853736398ceb`. Machine evidence: `sql-results.json`.
- SQL checks cover ACL inheritance/service-role denial, owner/scope isolation, save idempotency, separate-session reopen, concurrent preparation CAS, edits, maximum Unicode boundaries, count/byte/lifetime quotas, consent expiry after owner/row locks, gate expiry including existing-ID retry lock waits, revocation, direct-table denial and content purge/late retry rejection.
- `git diff --check`: passed.

Whole-repository `pnpm lint:all` remains blocked by existing unrelated errors: 1,412 findings (1,172 errors, 240 warnings). New files pass scoped lint; no unrelated cleanup was made.

## Browser evidence

Playwright CLI on local `/do/continue`, Chrome at 375×812 and 1440×1000:

- Deliberate fictional paste, explicit notes selection and consent → one stable task ID → waiting → deterministic worksheet → edited result at revision 3.
- Fresh reload and a separate tab reopen preserved the same ID and exact edited result. These are same-browser fixtures, not phone-to-desktop account persistence.
- Personal → Work switch cleared request, notes and consent and hid the other scope's task.
- Cancellation cleared selected context/result; separately verified revocation cleared the previous fixture's context/result.
- Simulated 25-hour browser clock advancement removed selected context and preparation controls on reopen.
- Offline online-mode submission refused work; reconnect preserved the unsaved request and truthful “No new save confirmed” retry state. Guest/inactive storage did not report a save.
- Forced local-storage `QuotaExceededError`: request remained editable, task ID was absent from the URL and no saved state appeared.
- Phone `innerWidth=375`, document width 375; no horizontal overflow. Instrument Sans loaded; final heading colour `rgb(36,11,33)`.
- Fixture flow produced no application console errors. Two inherited sandbox-widget warnings were present; guest API denial during live-mode testing produced expected network errors.

Screenshots show explicitly fictional data. Desktop-width rendering is responsive evidence only. Real authenticated phone/session A → desktop/session B persistence is **not proven**.

## Remaining approval gates

Root review of the frozen proposal; actual isolated Supabase Auth/cookie/RPC and advisor checks; explicit authenticated execute grants plus individually reviewed expiring owner/scope enrolment; physical retention maintenance; approval of the 2,048 lifetime-ID cap and content-free metadata retained until account deletion. No schema/grants/enrolment or provider activation was performed. Astra 6 + TypeSafe remains the provider owner's separate consent/admission integration.

Visual review report: `portable-do-review.html`, confirmed Library ID `libfile_15aabea4bd988191a4a3c85995d2074f` (file `file_00000000585881fbbe09fa427d2b8a35`). Local report carries the returned Library extended attributes.
