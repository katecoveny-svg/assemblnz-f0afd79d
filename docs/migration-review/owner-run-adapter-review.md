# Owner run adapter — local review only

Files: `lib/client-hub-migration/owner-run-policy.ts`, `owner-run-store.ts`, `owner-run-store.test.ts`; separate `owner-run-schema-proposal.sql`; disposable SQL harness `scripts/migration-review/test-owner-runs.py`. Frozen owner draft SQL is unchanged. No UI/transport files changed.

## Builder contract

Import **types only** into shared/client orchestration. The trusted server constructs `Owner {userId,verified:true,anonymous:false}` solely from ownerSession. Never accept this object, policy or provider usage as authoritative request JSON.

`OwnerRunStore` exposes createRun, claimAction, **startAction**, recordOutcome and lookupRun. The exact source types are CreateRun/ClaimAction/RunPolicy/RunUsage in owner-run-policy.ts and Owner/Claim/RunReceipt/ClaimResult/StartAction/Outcome in owner-run-store.ts.

Claim returns `kind:'claimed'` with claimId only on a new atomic reservation; `kind:'existing'` never authorizes dispatch. **Await successful startAction and its persisted revision before network dispatch.** Start succeeds exactly once for a reserved claim. A crash after start keeps the claim started/reserved and recovery is lookup-only. No automatic retry, repair, fallback or re-dispatch. Any SDK retry setting must explicitly be zero in the provider adapter.

Policy binds ownerId, policy id, exact provider/accountRef/model/pricingVersion, expiry, maxRuns1, maximum calls/input/output tokens, integer maxUsdMicros and input/output USD micro-units per million tokens. Tools/cache are false, retries/repairs0. The operator-provisioned policy is copied into immutable run receipts. Unique owner/policy prevents multiplying approval through fresh run IDs. New approval requires a new operator policy, not browser changes.

Every claim reserves `ceil((maxInputTokens*inputRate + maxOutputTokens*outputRate)/1e6)` using exact integer arithmetic. Total retained reservations and claim count are authoritative. These input bounds cover **the entire provider request including system prompt, selected context, schema and message overhead**. Provider adapter must prove/enforce total input bound before dispatch. Server-approved rates must conservatively include all admitted billing classes/surcharges; tools/cache/hidden search cannot be admitted using this simple rate card. This adapter does not verify current provider pricing or account ownership itself.

Outcome status is `complete | failed | usage-unverified`; include actual input/output token counts, cacheTokens0/toolCalls0, provider request ID and providerEvidence `{provider,model,accountRef}`. Account evidence must come from verified server configuration/account association, not a claim that providers return account ownership. Complete also requires a validated output fingerprint. Missing evidence, over-bound usage or mismatched model/account produces usage-unverified. Reserve is **never refunded**, even on a fully evidenced success or validation failure. Actual cost is recorded separately using the frozen pricing version. This is conservative admission, not a billing reconciliation system.

RunReceipt has ownerId/runId/inputFingerprint, frozen policy, selected source receipts, revision, reservedUsdMicros and claims; remaining calls/USD can be displayed as policy maximum minus retained totals. Display calculations never authorize dispatch. Only explicitly selected source hashes/scopes/check times are retained; no implicit seller excerpts. Receipt does not store provider credentials or full prompts.

## Adapter status

`createLocalOwnerRunStore` is an explicitly labelled serialized memory **fake**, useful to builder unit tests. It has no provider/network connection and loses state on restart. Never use it as production fallback.

`createProductionOwnerRunStore(rpc, enabled=false)` is a fail-closed RPC adapter. Disabled by default; error never falls back to memory. Inject a trusted server-only service-role RPC client only after approved activation. This is not an independently authenticated route: orchestration must call ownerSession itself before constructing Owner, and must not expose arbitrary store commands or client-supplied usage/policy to service RPC.

The proposed RPC uses row locks and revision CAS; policy creation is operator-only, authenticated clients have enabled-owner read only, table mutations are revoked including from service_role, and only service_role receives the command execute grant. Independent review of this separate privilege/schema change is required before application. SQL validation schemas are generated from the same strict Zod types and parity tested.

## Verification and limits

15 Vitest tests pass; focused TypeScript and ESLint pass. SQL12 statements and one PL/pgSQL function parse successfully with pglast. Full checkout typecheck fails on existing missing tsup and unrelated Deno security-proposal files; no new-file error after focused config resolves node types.

Database runtime/concurrency/RLS proof is **pending**. Docker inspection and disposable run timed out. Cleanup attempt also timed out; status of uniquely named `assembl-owner-run-review-533e8989` is unconfirmed. Do not restart Docker or alter other containers to resolve it without coordination. The disposable harness is supplied but its database assertions are not passing evidence yet.

Root has canonical sign-in page open and has asked Kate to sign in with the intended account. UUID now awaits that user step. Supported URL: `https://www.assembl.co.nz/login?redirect=%2Fstudio%2Fworkspace`. Verify UUID/non-anonymous status through normal server auth.getUser; no tokens/cookies in evidence. Old Sites auth is separate. Legacy import separately awaits supported manual JSON export; UI screenshots are not backups.

Activation approval still needs verified UUID/project, both exact SQL hashes and independent review, exact operator policy/model/account/rates/expiry/numeric test limits, owner flags/quotas and bounded live-test actions. This local implementation grants none of that authority. No production SQL, grants, flags, imports, provider calls, sharing or publication occurred.

## Added isolated CI preparation

`.github/workflows/studio-owner-run-sql.yml` follows the existing isolated SQL-service workflow pattern; `scripts/test-studio-owner-run-sql.cjs` targets only hardcoded loopback port55440/database studio_run_proof with fictional fixture credentials. It uses the extension-bearing Supabase PostgreSQL17.6.1.111 image, applies the unchanged draft schema and separate run proposal to a dedicated empty database, then checks competing runs/claims/starts, actual RPC denial, table privilege denial, RLS, anonymity, retained uncertainty and disablement. Node syntax and lint pass; workflow and database execution are not run/proven. No CI push/dispatch was performed.

Latest exact-container read-only check also timed out; no verified existence/ownership metadata was obtained and no further cleanup mutation was attempted.

## Local coverage revision after independent review

CI harness now creates two enabled owners, each with distinct drafts and runs, and a separate disabled owner. It asserts reciprocal invisible reads, direct write denial, cross-owner draft save/delete returning no rows, authenticated run RPC denial, trusted RPC owner/run mismatch denial, and unchanged administrator snapshots. Trusted service RPC intentionally accepts an enabled owner supplied by the verified server; it is not bound to a client JWT.

Additional prepared database checks cover create/claim/start expiry crossed during policy/run locks; disable committing before waiting admission and disable waiting behind an admitted transaction; exact fractional micro-dollar ceiling; call limit with spare dollar capacity; correct cost evidence and wrong/missing/over-bound evidence without refunds; null/extra/invalid input denial. CI path filters now include frozen draft schema and synthetic payload fixture. These are test sources awaiting isolated execution, not passing SQL evidence.

## Bounded CI coverage completion

Added independent ACL inspection plus actual INSERT/UPDATE/DELETE/TRUNCATE denial attempts for authenticated owner A/B, anon and service across policies/runs/drafts. Added wrong-provider usage evidence, explicit evidenced failed outcome with retained reserve, actual distinct-action CAS concurrency, and changed-action/selected-source replay with unchanged receipt assertions. Adapter, policy and SQL are unchanged; these database tests remain prepared pending execution.

Lock-observation fixed sleeps were replaced with bounded three-second polling for actual PostgreSQL Lock wait state. Expiry tests separately poll the database wallclock against the locked row's exact expiry before releasing it. Polling intervals are20ms; timeouts fail the fixture test. No fixed sleep is used as evidence that a lock was acquired.

## First isolated execution diagnosis

Exact initial head f73537c8c8f9027de315257b61f6423d65ba8d1d, run36988552701, failed: the extension-bearing database image terminated the denied-RPC backend with signal11 and restarted the cluster. No database proof was claimed. The fixture now uses direct fictional role logins instead of superuser SET ROLE sessions, retaining actual denied RPC/table statements and ACL/RLS checks. Only disposable test-database role login settings change; no production identities or settings. Background connection errors are captured for diagnosis, and teardown settles every connection without hiding the failing query. Admission implementation and SQL remain unchanged.
