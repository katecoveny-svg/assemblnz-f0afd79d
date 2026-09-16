# Durable Builder/Office jobs foundation — 16 September 2026

## What landed

First code slice for roadmap item 2 from `docs/reviews/2026-09-16-do-roadmap-reconciliation.md`: owner-scoped durable Builder jobs + honest acceptance receipts, reusing the existing Office `do_*` schema.

### Investigation (verified)

- Builder UI queue was `localStorage` (`assembl-builderdoo-jobs-v1`); planning API did not persist.
- Office board still projected demo `listAgents()` JSON/memory store.
- Supabase Office tables already existed: `do_workspaces`, `do_agents`, `do_handoffs`, `do_receipts` (migration `20260916090000`) with owner RLS — **no prior app consumers**.
- Parallel durable ledgers (`os_tasks` / `os_evidence` / `model_calls`) remain available for execution evidence later; this slice does not invent a second job database.

### Built here

- Migration `20260916120000_do_job_events_and_receipt_kinds.sql`: `build` primitive, receipt `kind` + `idempotency_key`, `do_job_events` with unique `(owner_id, event_id)`.
- Shared contract + memory repository: `apps/do/shared/office-jobs.ts`.
- Authenticated server repository: `apps/do/services/office-jobs.ts` (user-scoped Supabase + RLS; memory fail-soft when tables/env absent).
- APIs: `GET/POST /api/do/builder/jobs`, `GET /api/do/builder/jobs/[id]`.
- Builder UI: signed-in save/list/reopen against durable API; device-local fallback when signed out; shows `job_accepted` receipt copy.
- Office page: signed-in Builder jobs project into personal counts + a Builder jobs column.
- Tests: ownership isolation, refresh, idempotent replay, refusal of fabricated success receipts on planned jobs.

### Receipt honesty

Saving a planned job records **`job_accepted` only**. Evidence includes `executionClaimed: false`. Application code refuses `build_succeeded` / `proved` receipts for planned/ready jobs without explicit execution evidence.

## Still open

1. Apply/verify the new migration on the live Supabase project (Needs-You if agent cannot run migrations).
2. Prove one full authenticated journey across two devices against live DB (roadmap item 1 still primary).
3. Structured handoffs UI + real `do_handoffs` writes between specialist DOs.
4. Execution harness → status transitions → outcome receipts linked to `os_evidence` / `model_calls`.
5. Connector lifecycle (mailbox), usage rail/budgets, CLI/protocol/MCP, Creative/3D — unchanged later order.
6. Gmail OAuth app config, Brevo sign-in delivery, Mac notarisation — external credential blockers; not faked here.

## Needs-You

- Confirm `20260916090000` + `20260916120000` are applied on the Assembl Supabase project.
- Sign-in email delivery (Brevo) if cross-device proof is blocked.
- Do not widen OAuth scopes or invent billing entitlements in follow-ups without a dedicated brief.

## Verify

```bash
pnpm exec vitest run apps/do/shared/office-jobs.test.ts app/api/do/builder/jobs/route.test.ts apps/do/shared/builder.test.ts app/api/do/builder/plan/route.test.ts
pnpm typecheck
```

Manual (signed in, after migration):

1. Open `/do/builder` → plan a job → **save to office**.
2. Confirm status shows acceptance receipt text (not “build succeeded”).
3. Open `/do/office` and see the job under builder jobs.
4. Reopen the job from the Builder queue (or another browser session while signed in).
