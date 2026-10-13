# One DO entry integration — 13 October 2026

**Status: draft for root/user review; no merge or release authorised.** Initial audited base: `6a09eb061d667bf61c3740b0145ab3fb8a197e87`. Rebased on main `2063e00` after PRs #1522–#1524; their public-discovery, Gemini lifecycle and reliability changes are retained unchanged. Branch: `codex/do-entry-chrome-draft`. The [master roadmap](../do/MASTER-ROADMAP-20261013.md) supplies the programme sequence; the [earlier route/reuse audit](DO-ONE-ENTRY-20261013.md) preserves source findings and historical prototype evidence. This review supersedes that audit's “prototype only” status only for the changes listed here.

## Entry and copy

- Heading: **What would you like done?** Supporting line: “Bring a question, a plan or the thing on your mind.” A saved assistant nickname is described as the user's assistant, never mistaken for the user's name.
- Primary actions: **Write**, **Talk**, **Add**. Add opens existing image or note/checklist capture. It explicitly says PDF and other file uploads are unavailable here.
- Three outcome shortcuts: **Shop — Plan this week’s shop**, **Travel — Organise a weekend away**, **Save — Review my bills**. They append an editable prompt; no submission occurs. They are not separate agents or integrations.
- Actual existing checklist state remains the only task projection. Empty state says how to prepare a checklist. Assistant conversations, responsibilities and reviewed call notes retain their current separate state contracts; this does not claim a unified durable conversation/task store.
- **More → Tools & examples** preserves specialist routes and labels samples. Meeting notes retain the sign-in label. Install, privacy and existing account controls remain accessible.
- Official NZ reference selection is under **Notes & references**; its scope/disclosure and consent-reset handler remain intact.

The portable wrapper has a collapsed **Page tools** disclosure. It retains point/selection/screen capture plus secondary writing/full-window conversation handlers; these no longer compete with the editor’s primary Write/Talk controls. Escape closes the disclosure and returns focus before a further Escape minimises the workspace. No automatic capture or submission is added.

The visual revision uses the canonical glass D, existing Instrument Sans/IBM Plex Mono, rounded controls and plum/rose/lilac gradients. The public mymind homepage was inspected for broad visual direction; no third-party artwork, copy or layout assets were copied.

## Reuse and boundaries

| Surface | Reused now | Remaining separate |
|---|---|---|
| `/do`, `/do/personal`, installed Chrome PWA | Existing PersonalDo/LifeAdmin/assistant, workspace owner key, task arrays, preference settings and call launcher; one shared secondary menu | Actual installed-PWA verification; no new session or memory promise |
| `/do/widget` | DoProductFrame, mounted DoTextWorkspace, existing readiness/profile checks, image handling and builder | Existing mode/call lifecycle remains unchanged; no new cross-window draft transfer |
| Portable website/extension launcher | Same shared distribution source; compact 430×550 maximum desktop shell, explicit expand/compact, original iframe, selection review and minimise | Full-window voice permission boundary remains; real device keyboard proof remains a release gate |
| Native companion | Existing web route/shared shell consumes these UI changes; native sources and auth callbacks untouched | Native binary, installation and real microphone tests belong to reliability owner |
| Shop, Travel, Save | Prompt shortcuts and preserved existing planning/tools routes | Current prompts do not invoke merchant/travel APIs, purchase, book or validate savings. Earlier Save foundation owner/commit still needs reconciliation before new backend work |
| Naming and onboarding | Existing `displayName`, `voiceName`, `tone`, `responseLength`, `preferences`, `onboardingCompleted` in `apps/do/personal/profile.ts` | Short skippable priority → optional name/style → useful-task flow is a separate UI slice; no duplicate schema or returning-user gate added |

No auth/session, Gemini lifecycle, token/consent internals, persistence schema, public knowledge tokenizer, canonical URLs or sitemap files changed. Source/response controls still hold provider authority. Menu disclosure and shortcuts cannot start media, submit requests or grant permissions. Existing account-scoped remounts remain deliberate.

## Evidence

Screenshots use fictional or empty account fixtures; no private account, browser history or unrelated desktop overlay appears.

- [Working entry, desktop](../../output/playwright/do-entry-chrome/do-desktop.png)
- [Working entry, phone](../../output/playwright/do-entry-chrome/do-mobile.png)
- [Portable launcher, desktop](../../output/playwright/companion-entry/embedded-1440.png)
- [Portable launcher, phone](../../output/playwright/companion-entry/embedded-375.png)
- [Optional page tools expanded](../../output/playwright/companion-entry/embedded-tools-375.png)
- [Entry checks](../../output/playwright/do-entry-chrome/report.json)
- [Companion checks](../../output/playwright/companion-entry/report.json)
- [Simulated call checks](../../output/playwright/do-entry-call/results.json)

The separate static concept remains in `prototypes/do-one` on branch `codex/do-unified-entry-preview`, served locally on port 8764. Its rounded visual revision and compact expandable task section passed 21 interaction checks. Its fixture task rows are **not** imported into application code. Concept screenshots are version 1 of the existing Library items; working-entry screenshots are separate Library items.

### Verification scope

- `pnpm build`: passed (production compilation and 206 static pages).
- `pnpm typecheck`: passed.
- Brand guard, front-door guard and macron check: passed. Front-door guard now checks the shared menu and still requires the Meeting sign-in label.
- Targeted DO tests: 181 personal/companion/voice checks passed; 40 package/navigation/launcher checks passed after regenerating the extension mirror.
- `review-do-entry-chrome.cjs`: 17 checks passed, including draft append/continuity, no implicit submission/media, 320/375/768/1440 widths, keyboard and reduced motion.
- `review-do-companion-entry.cjs`: 24 checks passed, including collapsed/expanded page tools, keyboard Escape/focus, 320/375/768px tool overflow, readiness, reviewed profile, original editor/iframe, explicit expansion, minimise/reopen and phone resize.
- `review-do-personal-call.cjs`: 39 simulated checks passed, including active call retained through entry/menu/resize, no duplicate token, consent invalidation, cancellation, mute, stale events and explicit end. Real Google audio/microphone were not used.
- Portable capture/drag regression: 23 checks passed. Existing photo-notes v1/v2 and owner-change privacy browser suites passed after updating navigation selectors; all original consent, cancellation and ownership assertions retained. Saved-checklist refinement passed 30 checks, including created and restored result layouts at 320/375/430/600px; assistant-draft passed 22 checks. The mobile result-state selector explicitly resets heading padding to zero when artwork is hidden. [Created checklist](../../output/playwright/do-entry-mobile-result/checklist-created-375.png), [restored checklist](../../output/playwright/do-entry-mobile-result/checklist-restored-375.png), [measured layout report](../../output/playwright/do-entry-mobile-result/results.json).
- Changed-source ESLint passed. Repository-wide lint is not clean: 1,169 errors and 242 warnings in the aggregate run, including untouched admin, research/vendor and email-template files. Representative admin ref-render errors were reproduced on the unchanged base checkout. No broad lint cleanup is part of this draft.
- Final aggregate tests: **3,236 passed, 2 failed, 3 skipped**. The remaining failures are unchanged-base `lib/deployment/vercel-redeploy.test.ts` (documentation-only skip expectation) and `lib/design/franklin-scene.test.ts` (stale headline expectation). Both reproduced on exact PR base `2063e007cc0afbae62af2185b52989ffb74b641d` in a clean detached worktree (5 passed, 2 failed). [Reproduction and identical-file hashes](../../output/playwright/do-entry-baseline.json). The redeploy fixture uses `docs/note.md`, outside the explicit skip allowlist, so the script returns 1 (build) while the test expects 0. The Franklin test expects “the work.” while the unchanged homepage renders “Agentic AI solutions, assembled for your business.” Initial five NZ transport failures were build prerequisites and passed after generating local plugin candidates; generated plugin artifacts are not part of this PR.
- Existing settings/checklist regression: **32 checks passed**, including nickname/preferences reload, separate consent, save failure recovery, guest navigation protection and real checklist state. Measured headline contrast against rendered gradient pixels: **10.72:1 desktop, 9.66:1 phone**.
- Existing header/paint regression passed at 320/375/1440px: no overlaps, 44px targets, keyboard menu, and painted source/submit controls. [Settings report](../../output/playwright/do-entry-settings/results.json), [header report](../../output/playwright/do-entry-header/results.json).

Live Kiwi voice and retained sign-in remain the user's confirmed baseline. These synthetic checks do not certify all installed surfaces, cross-device memory, live provider behaviour or a new deployed version.

## Review decisions

Approve or revise the warmer rounded direction and the compact launcher before release. Keep this PR draft for root/user review; merged reliability work is already retained in the rebased source. A later shared-state slice must decide how conversations and reviewed candidates become owner-scoped tasks; the UI must not imply that this already exists. Onboarding should reuse profile storage with the existing explicit consent and only ask for connections at the point of need.
