# Unified assembl → DO · review implementation

## Goal and authority

Make one recognisable journey from assembl into the working DO. Retain Pursuit and Studio, existing features, owner boundaries, source consent and separate external-action approvals. This is an isolated review branch and draft preview, not authorisation to merge, deploy production, change a schema or enrol any user.

Base: `ce99584feeb46b493d82ecf4036a70d0041a7342` (main, PR #1425). Canon loaded: root instructions, context manifest/router/current state, brand, design, copy, factory/primitives and relevant design/no-slop/spatial skills.

## What changed

- `/do` is the existing working PersonalDo implementation. `/do/personal` remains a compatible PWA/share route. There is no new account, backend, storage layer or model flow.
- Homepage: one invitation, shared sculptural D and Open DO. Pursuit/Studio remain visible; existing atelier and product film are optional. The homepage does not collect or transmit a note.
- Working entry: the same identity, daylight canvas, tactile controls, progressive context and optional fictional examples. Guest checklists remain local; conversational/provider availability and consent remain explicit.
- Real optional 3D: extruded/bevelled D, lilac tile and petal disc, lighting, pointer response and demand rendering. Capped DPR, complete static fallback, reduced-motion handling and cleaned-up context-loss listeners. No new GLB/video dependency.
- Shared writing/meeting frame, install flow and icons: DO by assembl. The seeded development task board is no longer labelled user “Saved tasks” in consumer navigation. Its route/data remain intact.
- Existing selected-task links such as `/do?task=plan` go to the exact `/do/widget?task=plan` receiver. `/do?open=1` now opens the working app directly. Widget `tool=look/talk`, capture message validation and source review are unchanged.
- Sign-in returns retain only known task/tool/phone selectors. No note, token or arbitrary external return is copied. Generic site sign-in returns to DO instead of Meeting DO.
- Phone setup comes first. Chrome manual setup and Mac source remain explicitly secondary/developer options; `#chrome/#mac/#keyboard` bookmarks expand their section.
- Mac **source** starts at `/do`; explicit reviewed capture still targets `/do/widget`. Native microphone remains HTTPS/exact host/main-frame/microphone-only with `.prompt`, including `/do` and `/do/personal`. No installed binary or actual microphone is verified by these source changes.
- Canonical visual guide and brand routing remove conflicting July instructions from active root/skill entry points, preserving them as labelled archive. The company letter mark is lowercase `a`; DO retains its uppercase D.

## Route and link findings

The live baseline audit found rendered destinations rather than widespread 404s. Main issues were extra chooser hops, inconsistent chrome, generic sign-in returning to Meeting DO, discarded tool/task query selectors, inert legacy open/task links and seeded developer “Saved tasks”. The external private Pursuit/Studio workspace origins are preserved and were not authenticated or revalidated.

Unchanged limitation: the historical `home-handoff.ts` helper is dormant. Neither the prior active homepage nor this button-only homepage writes a draft through it; no repaired handoff is claimed. Current reviewed PWA/share intake remains the existing implementation.

## Verification checkpoint before draft publication

- Passed: canvas build; clean pre-build application typecheck (including final 3D lifecycle changes); changed-component lint; brand guard; front-door guard; macron check
- Passed: 106 test files / 1,293 tests; 1 file and 2 tests intentionally skipped, plus the added native-entry and ZIP parity pass (13 tests)
- Independent read-only review: fixed Canvas teardown listener and native microphone path compatibility; no remaining code blocker in that bounded review
- Full-repository lint reports 1,419 existing findings (1,173 errors / 246 warnings), including historical/client/generated surfaces. This change does not mass-fix them
- Local production compilation succeeded under Turbopack, but the TypeScript worker was memory-killed. Webpack retry was blocked by Google font fetching and memory; its generated route checks also expose four unchanged legacy route typing/export errors. These are not reported as a green production build
- Local Chromium cannot start because this workspace denies its required Unix socket; approved escalation did not alter that limit. The cloud browser rejects localhost. No local rendered screenshot is claimed

## Required preview/CI proof

`scripts/review-do-unified.cjs` runs against the actual built pages. It records desktop/375px screenshots, anonymous real HTTP route checks, a local fictional example, guest leave/cancel, query returns, developer-setup anchors, 3D/reduced-motion/WebGL fallback and offscreen remount. It performs no provider submission or external action. Existing fictional account/call/storage/capture regressions continue separately and remain labelled fixtures.

Before calling this ready: verify exact preview commit, CI build and browser artifacts, then inspect the actual screenshots. Native Mac compilation/device audio, physical phone install and real signed-in provider quality remain separate gates.

## Reversal

Revert this branch’s presentation/routing commit. Existing APIs, tables, owner checks, capture endpoints, installed-app ID and stable `/do/personal` and `/do/widget` routes are retained.
