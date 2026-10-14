# Personal DO mobile shell — local review candidate

Base: `bf47303b5b4a3fb6a502687bd33de6849a70714b`. Branch: `codex/personal-mobile-shell`. Local only: no push, PR, deployment, provider calls, private records, permissions or persistence changes.

## What changed

Personal DO opens to Today and six visual task cards, keeping the existing glass identity, plum/paper palette and shared workspace. Write and Add reveal the existing mounted editors; Back to Today preserves unfinished text. Talk still opens the existing consented voice surface. Existing checklist shortcuts and incoming-note/focus handoffs reveal their editor. Today counts derive from actual local checklist lanes; handled/cancelled tasks are not described as independently verified external completion.

Cards cover inbox/day, travel, restaurants, appointments/services, general shopping/clothes, and meals. They disclose capability before offering an action: existing mail, Travel and Shopper routes or the shared writing composer. No inferred connection from sign-in, no fabricated activity, inventory, reservations, purchases or receipts. No automatic text replacement or submission. Local checklist reviews and evidence remain the existing implementation.

## Owned paths

- `app/do/personal/LifeAdmin.tsx`
- `app/do/personal/entry.module.css`
- New `app/do/personal/TodayTasks.tsx` and `TodayTasks.module.css`
- New `scripts/review-personal-mobile.cjs`
- This review record

No PersonalDo/auth/API/worker/manifest/global stylesheet/Travel file changes. Separate Travel branches preserved.

## Validation

- 36 existing engine/example/Pet tests passed across three files.
- Full `tsc --noEmit` passed using existing root and canvas dependency symlinks; initial missing canvas `tsup` was an isolated-worktree dependency link issue, corrected without installation or dependency changes.
- Scoped ESLint, brand guard, macron lint and diff check passed.
- 43 local Chromium checks passed at 320, 375 and 1440px. All API calls mocked; external requests blocked; zero API writes and zero page errors.
- Checks cover no overflow, truthful card states, preserved typed draft, shared editor focus, exclusive expanded detail, unchanged route destinations, Add/checklist entry, real task count and existing review board, two synthetic owners, owner-switch draft/card reset, Talk entry and no mutations.
- Desktop and phone screenshots visually inspected. Existing canonical glass asset retained; controls and task cards remain legible without clipping. Output is local under `output/personal-mobile/`: `home-320.png`, `home-375.png`, `home-1440.png`, `today-*.png`, `review-desktop.png`, `results.json`.

## Limits before publication

This is a bounded local product candidate, not a release-ready all-services activation. No full production build or hosted CI run. The older broad browser scripts assume the initial guest composer is visible and sometimes above the fold; their entry assertions must be explicitly updated to use Write/Add and revalidated for this intentional Today-first change before publication. They were not silently weakened or claimed green. Full native iPhone/VoiceOver/microphone/sign-in persistence proof remains pending.

Card status is shipped capability copy, not a live connection monitor; actual verification remains inside the existing tool. Current task cards cannot activate mail providers, calendar briefings, live Travel, restaurants, appointments, clothes shopping or purchasing. Structured Airpoints storage remains separate. No new architecture, provider, model, grant, schema or secret is introduced. Ordinary providers and irreversible actions retain their existing separate gates.
