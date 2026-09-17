# Connected runtime verification checkpoint

Status: implementation in progress, not released.

## Verified production foundation

Repair PR 1333 merged. Production Vercel deployment `assemblnz-f0afd79d-kpe21rnil-katecoveny-svgs-projects.vercel.app` reported Ready. Live anonymous `/api/do/browser-runtime` returned 401 sign_in_required. Live hero and Studio/About/Contact/Task DO Maker/Office/Browser page checks passed desktop and 375px without page errors or horizontal overflow. Earlier local full suite: 1,189 passed, zero failures, two skipped.

## Authentication / authority

The user completed sign-in in their Chrome profile. Live `/api/do/runtime` in that browser reported signedIn=true and signed_in_unlimited. Connections UI reported Gmail and Google Calendar connected. No private task was executed; this is account-link evidence only. Permission to read up to ten primary-calendar events over seven days has been requested but not granted. No remote Gmail draft-write permission was requested or broadened. NZ$50 total paid-test/asset cap excludes recurring purchases.

## Local database integration

Created a disposable `assembl-do-contract-test` PostgreSQL 17-alpine container with `--network none` and no exposed ports. No existing database/container was changed.

`DO_TEST_RESTART=1 python3 scripts/test-do-connector-jobs.py` exited 0 with restart_verified=true. Actual independent PostgreSQL sessions checked: atomic preparation; identical retry; changed-content conflict; concurrent preparation; owner read isolation; service-only RPC grants; rejection of owner-forged job/permit state; explicit approval; one winner under concurrent claim; atomic finalization and receipt; repeat finalization/reopen; stale-review denial; decline preventing claim; proof mutation denial; persistence after container restart.

The additive migration is a local proposal only. It has not been applied to staging or production and needs independent review. The harness uses synthetic hashes; TypeScript canonical hashing and actual provider result validation are not yet integrated. This does not prove the full retained proof chain or provider execution. Failure/recovery paths, revocation/finalization races, broader schema consistency and service adapter/UI integration remain required.

## In flight

- Correct registry/auth props and provider-envelope/outcome validation.
- Strict per-operation inputs for audited connector pack.
- On-brand Connections UI with personal tools first and truthful account/capability states.

Each remains unverified until implementation has finished, focused/full checks and independent review are complete. Do not activate generic Action Cloud routes or claim all agents/connectors are complete.
