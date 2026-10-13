# DO readable navigation and shared capabilities — draft, 13 October 2026

## Screenshot and root cause

Inspected readable local pixels materialized from Library `libfile_432f770e0e6c81918be633eca45c3f63`, `image(6).png`. The browser's More panel is broken; the unrelated desktop pet and overlays are not DO UI. The screenshot includes the browser frame, so exact CSS viewport and zoom cannot be established from pixels alone.

Isolated Chrome reproduced the issue: the panel's client width was 288px and its contents 524px. `personal.module.css` used `.nav nav { display:flex; align-items:center; gap:24px }`, leaking the header row layout into nested More navigation. Existing tests checked link presence, not expanded geometry. Baseline measurements and screenshot are in `output/playwright/do-more-capabilities/before*`.

## Scope and reuse

Based on current main `a513dc1aa22dad6d0cef1358b2e81f38e8caa77d`. Main already includes contrast PR #1529 via merge `2600a7f`; that fix is preserved, not cherry-picked or duplicated. School and Studio work present on main is retained. The company homepage is untouched. This is a draft; no merge or production release is authorized.

- Scope header row styles to direct child navigation. More declares its own block layout and a rose container with full-width links, readable limits and bounded vertical scrolling.
- Extend entry disclosure behavior for More and Add: one overlay at a time, Escape restores the trigger, outside pointer/focus closes it, document scrolling follows the trigger and closes the panel when its trigger leaves view; resize recomputes geometry. Scrolling within a panel remains available. Editors remain mounted.
- Create a presentation-only `entry-capabilities.ts` catalog, shared `DoCapabilityIdeas` and `DoLocalInformation`. Reuse mounted personal and portable editors, existing tool routes, official care references and request-triggered local snapshots.
- First examples: school/household notices, day/week planning and bills. Further examples: shopping, travel, pets, car, property, writing/meetings. Choosing an idea appends it to the current draft and never submits it. Limits remain next to each outcome.
- Lower local information contains weather/public updates on request and official care/later-life guides. It does not claim health advice, care arrangements or monitoring.
- School briefing remains labelled fictional pilot. No real family data, school inbox, connected calendar, autonomous daily/weekly briefing, booking, purchase or verified saving is claimed.

## Cross-surface acceptance matrix

| Surface | Shared presentation/actions | Existing limits retained | Evidence target |
| --- | --- | --- | --- |
| `/do`, `/do/personal` | More catalog, nine draft ideas, local sources, same DO identity | Personal text provider requires its existing consent/access; checklist storage unchanged | Desktop 1488px; 1190/744px reflow; 375/320px phone widths |
| `/do/widget` full page | Same catalog, ideas, source disclosure and draft append | Portable editor retains its own preparation and permission flow | 1440px and 375px |
| Browser companion iframe | Same hosted widget components and capability labels | Tool links open a separate window; no automatic context or microphone access | 430px iframe |
| Mac companion | Existing WKWebView points to `/do/widget?nativeReview=1`, which reuses the same components | Native capture/paste permissions and voice lifecycle untouched; no native binary change | Hosted URL at 430px; native binary installation is not claimed |
| Phone web / installed PWA | Same responsive hosted routes | Browser installation is not a native home-screen widget; no background calendar/briefing promise | Phone browser viewport; actual installed-device test remains separate |

Source reuse is verified against `apps/do/macos/DOCompanion.swift`; equivalent hosted presentation does not mean identical native platform permissions or durable cross-device task coordination.

## Validation

Expanded-menu browser regression: `scripts/review-do-more-capabilities.cjs`. It checks full-width readable links, horizontal clipping, viewport bounds, scrolling, More/Add interaction, Escape/focus, outside click, preserved drafts, shared labels across routes/iframe, and absence of writes or microphone starts. The existing entry regression retains contrast, mode-switch draft, reduced-motion and legacy-route coverage. Both run in DO core CI.

Local preview results: **97 expanded-menu/capability checks, 37 entry/contrast checks, 32 settings/checklist/care/weather checks and 24 companion checks passed**, with fictional intercepted account/provider data. Scoped ESLint, macron guard and eight focused unit tests passed. Brand/public-route guards passed. Context health passed with 29 existing review warnings outside this scope. Final production build/typecheck and production-server replay are being verified before release readiness is claimed.

Evidence reports: `output/playwright/do-more-capabilities/report.json`, `do-more-entry-regression/report.json`, `do-more-settings-regression/results.json`, and `do-more-companion-regression/report.json`. Screenshots in the first directory show desktop, phone, expanded Add, capability examples, the hosted Mac URL and actual served companion iframe. The Library captures are fictional-data local-preview images, not a production release or physical-device test.

Library draft screenshots: [desktop More](https://chatgpt.com/api/library/files/libfile_ddefa7f06a348191bb51e0b8d3a22068/download), [phone More](https://chatgpt.com/api/library/files/libfile_f162fc6aaa348191b038299a4f924a58/download), [companion](https://chatgpt.com/api/library/files/libfile_400d8614cab48191ab1be6dc724fe5b1/download), [phone examples](https://chatgpt.com/api/library/files/libfile_276d2f8b30888191a252c54f253c47c3/download). Exact screenshot zoom is unknown; 1190/744px test widths cover desktop reflow constraints, not a claim to have recovered Kate's browser zoom.

## Review boundary

Review the broader capability copy and rose panel before merging. Connected calendar agendas, proactive briefings, real family integrations, cross-device task coordination and native widgets remain separate implementation. No auth/session/provider/voice/native lifecycle code is changed.

## Remote validation and recovery follow-up

The UI commit `18f38ba` passed the complete DO core CI workflow, including production build, typecheck, auth/voice regressions and browser proof. Its Vercel review preview is https://assemblnz-f0afd79d-8tmmg7vxx-katecoveny-svgs-projects.vercel.app. Portable validation exposed a CSS bundling assumption in the standalone native receiver test harness. Commit `2fffed0` fixes the fixture to include real CSS; portable continuity, both Mac build workflows, context health and synthetic SQL proof then passed. Core validation at that commit passed 1,534 tests but flagged two stale Mac source ZIP mirrors. This follow-up refreshes only `macos/tests/receiver-browser.mjs` inside those mirrors; all 11 download tests now pass locally. Final-head CI remains required before merge.

After Mac restart, free space was 17 GiB. The sole task-owned Next cache found was `do-entry-production/.next` (570 MB). No cache, source, dependencies or evidence was deleted. Heavy local builds remain paused; the interrupted local production build is not claimed as passing. No production deployment or merge was performed.

## Independent review corrections

Restored the weather/public-update child's workspace key inside `DoLocalInformation`. Changing the server-verified owner remounts that child, clearing city/snapshot state and running its existing abort cleanup. An isolated actual-component Chrome check passed: pending request aborted, city/busy state reset, late response ignored and no browser errors. The full Personal DO settings regression now exercises the same transition via a focus-triggered account refresh with a pending fictional response.

Updated the existing public specialist-route test to assert the shared catalog plus actual rendered menu links, retaining all legacy route coverage. All five tests pass locally; this previously omitted file is now explicitly in core CI. These corrections do not change the reviewed menu visuals. Hosted final-head verification is required for this review follow-up.
