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

## Independent-review corrections — local round 2

Supersedes the first candidate's visual layout and pending entry-test-adaptation note. Independent visual acceptance of `a274e877` was held; this revision is submitted for repeat review, not declared accepted.

- Today is immediately after compact Write/Talk/Add; examples, Pet routines and secondary utilities follow the primary task area. Editing temporarily reveals the same mounted editors; returning to Today retains drafts.
- Six compact cards use two columns at 320/375px and three on desktop. Original geometric paper-object artwork replaces the generic line-icon tiles. Artwork sits above labels, avoiding the previous fixed icon/chevron column squeezing text. Expanded details span the grid width.
- Back to Today focuses its heading. Review my tasks focuses the existing board summary. Newly revealed entry focus is applied in the React commit, avoiding delayed focus stealing during rapid keyboard navigation.
- Dinner/service/general shopping retain a distinct selected intent, visible in a separate contextual panel beside the existing draft. Clearing intent leaves the draft untouched and returns focus. No selected intent is silently sent as provider input; no draft is overwritten/submitted. The verified-owner remount clears this state.
- Only the private TodayTasks-to-LifeAdmin callback changed. No DoFocusWorkspace, DoGeminiLive, PersonalDoAssistant, PersonalDo.tsx, floating.js, auth or gateway edit.

Validation at the corrected source:

- 75 synthetic mobile checks, zero API writes and zero browser errors, including 320/375/1440 layout, keyboard disclosure/action, Back to Today and review focus, three distinct task intents, clear-without-overwrite, two-owner reset, route/voice/checklist continuity.
- Existing entry regression: 37 checks passed. Existing capability/menu/companion regression: 97 passed. Existing assistant/draft/portable-focus regression: 22 passed. These use synthetic APIs; no live provider/real microphone access.
- 36 existing engine/example/Pet unit tests passed. Full TypeScript, scoped ESLint, brand/macron guards and diff check passed; updated browser scripts parse.
- Existing scripts now explicitly use Write/Add via `scripts/personal-entry-helpers.cjs`. Updated entry assumptions in unified/refinement/account-hardening/browser-connection/mail-voice/shopper-voice proofs as well. Those entire broader workflows were not rerun here; no full hosted/core/build pass claimed.
- Loopback test setup initially mismatched 127.0.0.1 versus the development server's emitted localhost launcher origin. Assistant and capability regressions passed using the matching localhost origin; no production origin or authority rule was changed.

Fresh local evidence: `output/personal-mobile-r2/today-{320,375,1440}.png` are untouched initial viewport captures; `home-*.png` are full-page captures; `intent-*.png` show preserved draft plus selected task; `returned-focus-*.png` and `review-desktop.png` show return/review states. Actual initial 320/375/desktop and selected-intent pixels were inspected. Results are in `output/personal-mobile-r2/results.json`; legacy results under `output/mobile-{entry,capabilities,assistant}-regression/`. No artifact is claimed to prove native iPhone operation or live connected services.

Coordination message to selected-tab owner `01a13be4-d7dd-7447-b412-6860301760e2` was rejected by automatic approval review for lack of recognised trusted outbound-message authorization. It was not retried. Parent should relay the private-callback scope above; no shared-runtime conflict exists in this candidate. No push/publication/permission/provider changes. Independent visual review, full intended release checks and physical iPhone acceptance remain pending.

## Visible-editor Clear task correction

Independent review cleared the original visual, focus and intent findings at `29f34157`, then identified one remaining sequence: select a task → Add → Note or checklist → Clear task focused the hidden Write input. The handler now selects `life-admin-source` when the local editor is open (or no assistant exists), otherwise the visible Write input. No callback contract, shared runtime, provider or persistence changes.

The synthetic mobile proof now executes this sequence with keyboard activation at 320/375/1440px, asserts visible-editor focus, preserved checklist text, removed task context and no focus on the hidden Write input. Synthetic fixture text is then cleared explicitly before the existing example checks. Evidence is kept separately under `output/mobile-clear-focus/`.

Validation: all 84 synthetic mobile checks passed with zero API writes and zero browser errors; full TypeScript, scoped ESLint, script syntax and diff checks passed. No publication.
