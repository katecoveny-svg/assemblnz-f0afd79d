# DO always-on wake-ups — review candidate, 13 October 2026

Branch `feat/do-always-on` on main. Personal DO responsibilities gain wake-ups: an owner chooses when DO wakes up for a saved responsibility, DO prepares a worksheet from the saved notes alone, and the result lands in "Needs you" for review. This is the third slice of the portable-DO work (after cross-device core and the shop journey).

## What a wake-up is

Four reasons DO wakes up, each recorded on the run (`do_personal_runs.trigger`, with the note for a message):

| Trigger | How it starts | Dots equivalent |
|---|---|---|
| `scheduled` | Cadence `daily`, `weekdays` or `weekly` at a local hour in the owner's time zone | recurring |
| `once` | Cadence `once` at a moment the owner picks, inside the permission window; fires once, then no further wake-up | self-scheduled |
| `manual` | "Wake DO now" on the responsibility | call |
| `message` | "Wake DO with a note" (≤ 500 characters); the worksheet pulls the matching lines to the top | message |

Not built: event-driven wake-ups (a save elsewhere waking a responsibility). The trigger column leaves room for it; nothing claims it exists.

## Authority

- **Saving notes never turns wake-ups on.** `do_personal_save_paused` still saves with `active=false`; the new `do_personal_schedule` RPC is a separate consent of up to seven days, never longer than the stored body's retention, checked against the reopened revision without bumping it (the notes are unchanged, so earlier drafts are not marked stale).
- **Editing notes, pausing, or the seven days ending turns wake-ups off** (proved in the database harness). A once wake-up must fall inside the window.
- **Visible and pausable.** Every responsibility shows one honest line: the rule, the next wake-up and when permission ends; `Pause` stops it.
- **No model.** The only executor is the worksheet (`apps/do/personal/worksheet.ts`): it sorts the saved notes into overdue / today / this week / later / waiting on someone / questions / everything else / already done, reading ISO, NZ day/month, "16 Oct", weekday, "tomorrow" and "next week" dates in the owner's zone, and never writes a line that is not in the notes, the goal or fixed copy. Each run's evidence says `method: worksheet, model: null, provider: none, externalAction: none`. Model preparation still needs renewed OpenAI and TypeSafe grants and is not reachable from any flag.
- **Quotas unchanged:** one wake-up per responsibility per hour, five per owner per day across every trigger; ten-minute interrupted-run recovery.

## Activation (all off by default)

| Env | Effect |
|---|---|
| `DO_PERSONAL_WAKEUPS_ENABLED=true` | Reads the new columns and shows the wake-up controls. Requires `20261013093000_do_personal_wakeups.sql` applied. Off: the page reads and behaves exactly as before. |
| `DO_PERSONAL_WORKER_MODE=worksheet` | With the flag above, `personalWorkerConfigured()` becomes true: the cron (`/api/do/personal/cron`, up to three claims per call) and "Wake DO now" prepare worksheets. Any other value keeps `runPersonal` throwing before any storage read. |

Nothing was applied to the shared production database and no flag was set.

## Evidence

| Check | Result |
|---|---|
| `scripts/test-do-wakeups-sql.cjs` (PGlite, responsibilities migration + storage-only proposal + wake-ups migration) | 41 checks: next-wake across every cadence incl. NZ daylight saving; save leaves wake-ups off; schedule is owner-scoped, revision-checked, bounded by body retention, rejects bad shapes and out-of-window once; RLS read, no client RPC or forged `next_run_at`; scheduled claims only when due, targeted claims carry a reason, manual does not move the schedule, scheduled claims advance by cadence, once fires once; pause / edit / expired body stop wake-ups; daily quota counts every trigger. |
| `scripts/test-do-personal-sql.cjs` | 19 checks still pass with the new claim signature. |
| `vitest apps/do/personal app/api/do/personal app/do/personal` | 254 tests: worksheet parsing and sections (20), schedule contract and summaries (7), service worksheet mode (claims with reason, finishes with worksheet evidence, no provider/profile/service reads, owner-mismatch fails the run, declined finish not reported as a draft, schedule RPC and conflicts; off-mode still throws before storage), routes (note passthrough, schedule boundary, cron mode). |
| `tsc --noEmit`, scoped ESLint | clean |
| `scripts/review-do-always-on.cjs` | 32 browser checks at 1440px and 375px against fictional intercepted fixtures: wake-ups start off and "Wake DO now" is disabled; weekly asks for a day; the schedule needs its own consent and is sent with the reopened revision and no notes; next wake-up and permission end shown; waking now sends only the id; the draft says why DO woke up and that no model was called; sharing blocked until review; a note is attached; once asks for a local moment and sends it as an instant in the owner's zone; pause turns wake-ups off; no overflow; no page errors. Screenshots in `evidence/do-always-on-20261013/`. |

**Not established:** a real signed-in wake-up against a hosted database (the fixture returns a fictional worksheet; the real executor is unit-tested), the cron running on a schedule, Safari/iOS, production build.

## Rollback

Revert the PR. The migration is additive apart from replacing `do_personal_claim(uuid,uuid)` with the four-argument form; with both flags unset no code path calls it.
