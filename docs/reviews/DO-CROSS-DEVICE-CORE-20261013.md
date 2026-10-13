# DO cross-device core — review candidate, 13 October 2026

Branch `feat/do-cross-device-core` on main `e7ed4a3f9`. **Nothing here is deployed, and no migration has been applied to any hosted database.** All three feature flags stay off until an isolated staging database exists and the owner approves activation.

## What this slice does

One signed-in DO whose state lives on the account, not the device, with the owner in control of every stored thing.

| Capability | Code | Storage | Owner control |
|---|---|---|---|
| Memory notes DO keeps about you | `/do/memory` (`app/do/memory`), existing `/api/do/personal/memory` + `memory-service.ts` | `do_personal_memory` (migration `20261013090000`) | View every note; edit, pause, resume, mark still true, delete. 7/30/90-day retention. |
| Cross-device tasks | `/do/continue` (`PortableDo.tsx`), `/api/do/continuity`, new `/api/do/continuity/access` | `do_continuity_private.tasks` + `owner_access` (migration `20261013091000`) | Per-scope **Sync on/off** switch; on = fresh consent for 90 days; off stops every read and write at once. |
| Kept conversations | `PersonalDoAssistant.tsx` + `useKeptConversations.ts`, `/api/do/personal/conversations`, `conversation-service.ts` | `do_personal_conversations` (migration `20261013092000`) | Opt-in per conversation at the consent step; "pick up where you left off" list; Forget. 30-day rolling retention. |

Design rules shared by all three: the server verifies the owner on every call and is the clock; every write is revision-checked (a stale device is refused, never silently overwrites); deletions leave content-free tombstones so delayed retries cannot resurrect anything; expired content is withheld on read and purged in bounded batches; the `X-DO-Workspace` header is an expectation that catches an account switch, never authority. A kept conversation **only grows**, so a stale device cannot drop turns another device added. Keeping a conversation changes nothing a provider sees: the next request still carries only the last exchange.

Compared with the "always-on agent" products this competes with, every stored item is visible and individually editable or deletable; there is no "delete the whole agent to forget one thing".

## Deliberate differences from the reviewed proposals

- Continuity: the proposal left owner enrolment to an administrator. This branch adds `do_continuity_access(scope, enable)` so owners enrol themselves with explicit consent and a 90-day expiry, and grants RPC EXECUTE to `authenticated`, which the proposal reserved for "approval stage". `isolated-tests.sql` still asserts the pre-grant proposal and is unchanged; the installed migration is proved by `scripts/test-do-continuity-pglite.cjs`.
- Continuity activation is now an environment flag (`DO_CONTINUITY_DURABLE_ENABLED`) rather than a source constant, so it can be turned on per deployment without a code change. The flag alone stores nothing: an owner still has to turn sync on.
- Memory: the proposal SQL is installed verbatim as a migration. The purge scheduler and backup/restore canary the activation doc asks for are still not built; `/api/do/personal/memory` purges per-owner on each read in the meantime.
- Conversations are new. They are a separate table from memory and tasks on purpose (reliability review, blocker 2).

## Evidence

| Check | Result |
|---|---|
| `scripts/test-do-memory-sql.cjs` (now against the migration file) | 31 PGlite checks pass |
| `scripts/test-do-continuity-pglite.cjs` | 31 PGlite checks pass (ACL closure, no enrolment by migration, self-enrolment and scope isolation, owner isolation, same-ID replay, CAS, expiry/revocation, quota, prune, day-100 replay) |
| `scripts/test-do-conversations-sql.cjs` | 17 PGlite checks pass |
| `vitest` for `apps/do/personal`, `app/do/personal`, `apps/do/continuity`, `app/api/do/continuity`, `app/api/do/personal/memory`, `app/api/do/personal/conversations` | all pass (178 + 27 + 10 + 50) |
| `tsc --noEmit`, scoped ESLint, brand guard, public front-door guard | clean |
| `scripts/review-do-cross-device.cjs` | 13 browser checks pass: a 1440px desktop and a 375px phone context share a **fictional in-memory API fixture**; desktop saves a note, phone reads and edits it, desktop's stale edit is refused and reloads, pause and delete propagate; desktop turns sync on, saves and prepares a task, phone reopens and edits it, desktop reopens the edit, phone turns sync off and desktop sees it. No uncaught page errors. Screenshots in `evidence/do-cross-device-20261013/`. |

**Not established:** hosted Supabase Auth or PostgREST behaviour, real two-device sessions, the kept-conversation UI in a signed-in browser (the `/do` page gates on real auth, so only its contract and server logic are tested), Safari/iOS, production build. The dev server in this review points at the shared production Supabase, so no signed-in browser proof was run against it on purpose.

## Activation steps, in order

1. Create an isolated staging database (Supabase branch or separate project). Never use production as staging.
2. Apply the three migrations there and run the three PGlite scripts' equivalents against it (`DO_PROOF_POSTGRES=true` for memory).
3. Set, per environment and only after step 2: `DO_PERSONAL_MEMORY_ENABLED=true`, `DO_CONTINUITY_DURABLE_ENABLED=true`, `DO_PERSONAL_CONVERSATIONS_ENABLED=true`.
4. Real two-account proof: A saves on desktop, reopens on phone; A→logout→B sees nothing of A's; expired session; offline before request; disconnect after server commit; same-ID retry; stale revision refused; forget followed by stale retry.
5. Only then production, with the memory purge scheduler and a restore canary in place.

## Rollback

Revert the branch. Migrations, if applied to staging, are additive and can be dropped there; none touch existing tables.
