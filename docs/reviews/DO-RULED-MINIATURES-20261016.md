# DO ruled-paper miniatures — isolated revision

Kate's 16 October feedback supersedes the earlier card polish. The exact headline is “What would you like to do?” on Today and the companion. This local revision preserves the prior commits and does not change main, PR1613 or PR1614. Fresh remote check before edits: main e7c331f15f1633550d5a53cba0ad53e993181136, PR1613 branch 6a025728c389b7a74fbcaaed270304f4b8beabfe, PR1614 6d8ab0c0eb450c4d60b801f0694eaa1db8885e97.

## Composition and shared primitive

Creates `DoMiniatureList`, shared by personal Today and compact `DoFocusWorkspace`, using existing React Three Fiber/Three dependencies. A continuous taped, ruled-paper note replaces the six-card grid. Five clearly fictional starters use authored procedural 3D geometry: trolley, newsletter, plane, desk/envelopes and weights. They have lighting, material roughness, rounded edges, volume and cast shadows. No stock imagery, downloads or new dependency. The exact locked glass identity and Instrument Sans remain.

Each real button opens the existing writing flow with visible fictional context. No task, draft, owner state, consent or storage is mutated by a starter. Existing drafts remain mounted. Populated Today tasks and saved controls precede the fictional list; empty Today can foreground it. Companion keeps Write/Talk/Add and the admitted Talk panel. Its selected idea is separate context beside the unchanged draft.

Scene code loads lazily when rows are visible. Canvases use DPR 1, 256px shadows and demand rendering; gestures end after three seconds. Offscreen/hidden rows release their canvas; document hiding pauses by unmounting. Reduced motion renders a settled pose. Text and navigation do not depend on WebGL. This is geometric animation, not generated footage or evidence of completed work.

## Independent review

A separate reviewer inspected source and 375/768/1440 captures: genuine depth is visible and the card grid is gone. It identified saved-task priority and visible-label/accessibility issues. Both were fixed and rechecked by the reviewer, with no remaining findings. Review did not independently execute the browser or watch the WebM.

## Proof and limits

- 245 focused tests / 37 files pass; typecheck and scoped ESLint pass.
- Brand/public-front-door/macron guards and production build pass.
- Revised browser proof covers five usable rows, no grid/overflow, same editor/draft and fictional intent at 320/375/768/1440; motion pixel change, reduced-motion stillness, hidden canvas release, no runtime errors/API writes.
- Compact starter proof preserves same editor/draft and shows selected intent without writes.
- 28 companion checks pass, including Talk readiness, first-fold Call, preserved editor/iframe and no mic/provider action. Initial test used 127.0.0.1, conflicting with widget's localhost iframe; corrected the harness origin and reran cleanly.
- 37 saved-task checks pass, including explicit save/restore, separate browser, conflict, unfinished edit, consent invalidation and anonymous denial.
- Synthetic-only phone/desktop/tablet stills and an eight-second MP4 preview are in `output/playwright/miniatures/`; no private browser data.
- Chromium desktop/mobile viewports only: physical Safari/iPhone, installed Mac and real authenticated owner sessions remain unverified. No provider execution, publication, merge or push.

The installed pinned Taste redesign guidance informed composition, but explicit user direction and Assembl canon override generic fonts, scrolling, colour and fake-data advice. Reversal is a revert of this revision; preserve previous design/integration commits.
