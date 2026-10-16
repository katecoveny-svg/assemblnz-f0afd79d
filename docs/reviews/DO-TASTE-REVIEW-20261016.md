# Today and shared DO controls — local review

Kate approved a pinned project-local, text-only Taste redesign skill. Installed `SKILL.md`, MIT `LICENSE` and `UPSTREAM.md` under `.agents/skills/redesign-existing-projects/`; upstream SHA `f624f37a8c650b9cc550253104925efe4c8de246`. No upstream executable, hook, global installation or automatic update. Assembl canon overrides generic font, icon, scrolling and sample-data advice.

Review branch: `codex/do-today-taste-review`. Base is PR1613 `6a025728c389b7a74fbcaaed270304f4b8beabfe` merged with released main `e7c331f15f1633550d5a53cba0ad53e993181136`, local integration commit `fb29082458a0b0ff5a4c82583d054953dc44479a`. PR1613 remains unchanged and awaiting visual approval; PR1614's homepage is outside this change.

The empty Today sheet now says “Your list starts here” with one actual action, without ghost loading rows or an empty completion ring. Existing populated rows retain saved-checklist callbacks, owner boundaries, disabled state and accessible names. Long task titles wrap, small metadata is larger and higher contrast, and aggregate “handled” wording includes cancelled tasks honestly. The original paper sheet, glass identity and custom illustrations remain. Tan tile grounds use existing chalk/rose roles. Scenes rest still and play one gesture on interaction, with reduced motion retained. Personal and shared companion mode buttons have consistent solid plum selection and subtle press feedback; #1612's Talk ordering and mounted editors are unchanged.

## Verification

- 245 tests across 37 files: `vitest run apps/do/personal app/do/personal app/do/DoCompanionConversation.test.ts`.
- Typecheck, scoped ESLint, brand guard, public-front-door guard, macron check and production build passed.
- Context health: canonical context OK; 29 pre-existing legacy brand warnings outside this patch.
- Existing personal mobile suite: 86 assertions at 320/375/1440, both before and after. Tablet variant: 38 assertions at 768, both before and after. No API writes or browser errors.
- Existing companion-entry suite: 28 assertions, including draft/iframe identity, first-screen Talk, keyboard, optional capture disclosure and 320/375/768 widths. No microphone, speech, provider POST or foreign traffic.
- Saved-checklist suite: all 37 assertions passed with fictional signed-in fixtures, including explicit save/restore, second-browser restore, concurrent edit protection, conflict handling, consent invalidation and anonymous denial. Temporary wrapper used the already-running server; after writing the successful results it raised a cleanup-only `ReferenceError: log is not defined`. This was a harness adaptation error, not an application failure; do not describe the process as exit-zero.
- Eight additional motion/layout checks: empty ring absent; resting and focused scenes settle; populated layouts fit 375/768/1440; normal and reduced motion.
- Visually inspected phone/tablet/desktop empty states and populated phone state. Existing original imagery was reused; no new stock or generated imagery.

Local captures/results are under `output/playwright/taste-before`, `taste-before-tablet`, `taste-after`, `taste-after-tablet`, `taste-companion`, and `taste-saved`. Output is ignored by Git and supplied separately with the patch. The screenshots reflect the host-local date; sample checklist is explicitly fictional. These are local Chromium checks, not physical iPhone/Safari or installed Mac proof. No private sessions, credentials or provider actions used.

Not pushed, merged or deployed. Parent retains release/coordination ownership. Review the visuals before any publication. Reversal is limited to this follow-on patch; preserve the PR1613/main integration.
