# Portable DO Calendar implementation plan

> **For Hermes:** Implement vertical RED→GREEN slices and independent review. No production migration in this stage.

**Goal:** An owner-bound portable Calendar brief can be prepared, explicitly approved, claimed once, stored with proof, and reopened from the shared hosted widget.

**Architecture:** Extend `do_agents`/Office and `do_action_runs`/permits/receipts. Narrow server-only transactions, not the unowned demo lifecycle. Only `list_calendar_events` is executable in this first cut. Private read consent remains pending; all tests are synthetic in a network-isolated PostgreSQL container.

**Tech stack:** PostgreSQL 17, PL/pgSQL, existing Supabase server/service client, TypeScript/Zod, Vitest, current AgentSpec and canonical Action Contract hashes.

## Acceptance boundary

No live reads until the user approves the exact window. No writes to external accounts. No production DB migration, no generic action-dispatch flag, no new public auth bypass. Memory mocks alone do not prove durable behaviour.

## Task 1: Atomic prepare and retry conflict

Create `supabase/migrations/20260917130000_do_connector_jobs.sql`; tests in `scripts/test-do-connector-jobs.py` + `scripts/do-connector-test-bootstrap.sql` against only an isolated local container. Use the existing three DO schema migrations.

- RED: call `prepare_owner_connector_job(owner, key, request_hash, snapshot)` as service_role; function absent fails.
- GREEN: derive server IDs, owner workspace with transaction advisory lock, create AgentSpec job and immutable run/pending permit. Snapshot has strict server-validated calendar data, selected owner account, portable definition and hashes. Same key/content returns the same records. Same key/different content returns conflict. No provider call.
- Add missing linked columns/indexes/FKs scoped to connector runs; preserve Builder rows. Prepared data and outcomes are service-only, owner SELECT only. An owner cannot forge an executed receipt, alter namespace/kind to evade restrictions or adopt another owner's job.

## Task 2: Explicit decision and once-only claim

- RED: missing/wrong owner/hash/prep/permit/current generation rejects before mutation. Decline prevents claim. Expired pending permit cannot execute.
- GREEN: `decide_owner_connector_job` locks run/permit and persists exact decision; `claim_owner_connector_action` consumes an approved single-use permit and sets running/claim ID before provider access.
- Race independent PostgreSQL sessions: one claim winner, other in-progress. No permit or snapshot imported from client authority. No re-review of running jobs in this first cut; changed input prepares a new job, not overwrite.

## Task 3: Atomic outcome, receipt and reopen

- RED: finalization without matching owner/claim or malformed outcome cannot produce proof; repeated exact finalize returns same proof, changed outcome conflicts.
- GREEN: store validated read output/draft, args/output hashes and verification in the existing action receipt; mirror a pointer into Office receipt and mark job done atomically. Failed/indeterminate state is explicit, no auto-retry. Reopen from a different connection and after container restart to prove persistence.
- RLS/direct-role tests must deny forged proof/state even by rightful owner; cross-owner read denies. `service_role` only execute grants on RPC functions, fixed search_path, explicit owner/parent checks.

## Task 4: Shared portable input/output + repository adapter

Create `apps/do/shared/connector-jobs.ts` + tests, `apps/do/services/connector-jobs.ts` + tests. Extend shared AgentSpec with optional versioned executable task definition; immutable snapshot excludes prior permit/evidence/status claims on import. Use `argsHash` and `resultDigest`.

- RED/green pure calendar job normalization and recipe projection; deterministic brief is labelled as such.
- Service validates signed-in owner, exact account selection and registered schema. Prepare/decide/execute call narrow RPCs, execute only after won durable claim, provider result verifies before finalise. Unknown database schema is 503, never hidden memory fallback. Verify truthful failure if finalise fails after read.
- Account data via existing `listConnectedAccounts`, expose filtered opaque account IDs only to their owner. No tokens/client-controlled external owner. Do not blindly choose another account after prepare.

## Task 5: Reachable hosted UI and routes

Create `/api/do/jobs` and `/api/do/jobs/[id]` handlers, strict bounded JSON/same-origin/doOwner/no-store. New shared `DoConnectorJobPanel` mounted in DoBuilder and an owner job projection in Office. Display account/window/fields/read-only boundary, explicit approval, status, returned deterministic brief and source receipt. Reopen via `/do/widget?job=id`; IDs are locators not credentials. Native/extension auth is not claimed by hosted proof.

## Gates

Actual PostgreSQL atomicity + RLS + restart checks; Vitest denial/failure matrices; browser375/keyboard; build/typecheck/lint; spec then independent security review. Only then request staging schema application and bounded live test authority. Do not call the first vertical 'all agents complete'.
