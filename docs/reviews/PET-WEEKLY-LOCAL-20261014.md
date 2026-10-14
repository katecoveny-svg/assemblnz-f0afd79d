# Pet weekly routine — local review slice

Base: `f62bf077ab399a9797fbefa276afc3e3ad20332b` (fresh `origin/main`). Branch: `codex/pet-weekly-local`.

This extends the existing Personal DO LifeAdmin host. The dedicated Pet composer takes a nickname, literal routine wording and explicit weekdays. A Monday–Sunday board shows supplied activities and empty days. It reuses plan IDs, review, user-recorded completion and text export, plus the original `DoTaskScene` pets artwork. It creates no separate chat or runtime agent/provider invocation.

## Contract and implementation

- `PetWeekly.tsx` / CSS: session-only composer and weekly view, per-day edits, source disclosure, review, explicit completion, unfinished-editor navigation guard.
- `LifeAdmin.tsx` / CSS: inline entry, existing plan collection and account-keyed lifecycle, full-width weekly board, export and mixed-save explanation.
- `templates.ts` / `engine.ts`: explicit day order, literal wording, stable task IDs, no inferred times/responsibility, local review invalidation. Unchanged historical user-recorded completions remain; changing a day's wording clears that day's completion. Blank days have no tasks. Empty or ambiguous day input fails.
- `persistentLifeAdminPlanSchema` rejects Pet plans for browser save/read and cloud save/read. `lifeAdminPreparationSchema` and the brief function reject Pet provider drafts. The existing server routes/services use these schemas, so restrictions apply to direct calls too.
- Mixed saves explicitly exclude Pet routines and retain them in the open session, with a dedicated export button. An all-Pet collection cannot overwrite a saved collection with an empty snapshot through the UI.
- Account switching/sign-out remount the existing owner-keyed LifeAdmin workspace, clearing plans, composer and unfinished editors. No `do-tasks.ts` fallback, dog-training notes transform, alphassembl chat, SQL, flags or permissions changes.

This is a weekly organiser, not medical, feeding, training or appointment advice. There are no recommendations, background schedules, appointments or automated actions. Supplied text is not clinically interpreted or verified. Times and responsibility stay unknown unless supplied within the person's wording. The seven slots represent a week without guessed calendar dates. Each day contains one editable text block; multiple activities may be written in that block. Leaving/reloading clears unsaved routines; export is the only retention path.

## Evidence

- 76 tests across 11 files passed: LifeAdmin engine/cloud, new Pet engine/UI, preparation/checklist routes, LifeAdmin UI, PersonalDo storage/interruption.
- Full `pnpm typecheck` passed, including after the final mixed-save count-label correction.
- Scoped ESLint passed with zero warnings across changed TS/TSX and browser test script.
- `pnpm build` passed, including brand/front-door guards, canvas, TypeScript and 207 static pages. The initial sandboxed build stalled at compilation and was stopped; the permitted unsandboxed build succeeded. Final mixed-save singular/plural and unfinished-edit navigation guard fixes were made afterward and verified by typecheck/lint/browser acceptance. No duplicate production rebuild was run after that fix because host free space had fallen to approximately 1.7 GiB.
- `scripts/review-pet-weekly.cjs` passed at 1440px and 320px using synthetic owners and toy-only wording. It intercepts all API traffic, blocks external origins and tests empty days, all seven labels, keyboard selection/save, review versus completion, edit invalidation, interrupted edit protection, export content, mixed browser and mocked cloud saves, account switch and sign-out clearing. No page errors or horizontal overflow.
- Screenshots visually inspected: `output/playwright/pet-weekly/desktop.png`, `mobile-320.png` (initial pass); `final-1440.png`, `final-320.png` (confirmation after reducing inherited mobile padding). Final evidence also includes `report.json` and two downloaded text exports. Output files are local/ignored, not shipped fixtures.

Reproduce browser proof with a local dev server using synthetic account configuration, then `PLAYWRIGHT_MODULE=/path/to/playwright node scripts/review-pet-weekly.cjs`. `DO_REVIEW_BASE` defaults to `http://127.0.0.1:3099`. The test never writes to real cloud storage. Expected mocked 401/503 resource responses are not application exceptions. Real hosted auth/provider/storage and native-device testing are outside this local slice.

No push, PR, merge or deployment was performed. The existing working checkout was untouched; this worktree belongs to its own local clone.
