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


## Kate's assembl task refinement

The subsequent direction replaces the main question with “What would make life easier?”; the existing composer retains “What would you like to do?”. Seven starters now read: assembl my day; assembl my trip; assembl a dinner date; assembl dinner at home; assembl clothes and gifts; assembl my shopping basket; assembl my appointments. Calendar is covered by day/appointments rather than a duplicate category. These are navigation starters, not fictional owner tasks or completed work.

Desk/mail, plane, dinner table, cooking pot, gift boxes, trolley and calendar use real procedural geometry. Plate placement, a lifting lid, gift lid/ribbon and calendar leaf extend the finite gesture renderer. Status hints stay modest; selected intent explains the useful next step and exact unavailable capability. Mail, travel and shopping offer existing workspace links after intent selection; no live reservation, stock, checkout or cart execution is implied.

Fresh proof: 245 tests, typecheck, scoped lint and production build pass; 32 responsive/motion/intent checks plus three compact-companion checks pass. Every one of the seven intents preserves the draft; no API writes or runtime errors. Earlier saved/companion protection proofs remain relevant; their implementation did not change. Independent source/screenshot review found no new blocking issues and confirms visible depth, coherent ruled paper, truthful limits and preserved owner/draft priority. Reviewer could not complete an additional terminal check after its transport disconnected; the primary browser/build runs completed cleanly.

Updated synthetic captures and nine-second motion preview are under `output/playwright/assembl-starters/`. Still local, pending Kate's visual approval; no merge, push or deployment.

## Playful motion pass

Kate requested more expressive motion and scroll depth after the seven-task refinement. `DoQuestion` gives both surfaces the same immediately readable, once-only staged text entrance and complete accessible heading. Visible row titles reveal briefly; paper tape and pressed rows respond tactually. A passive, requestAnimationFrame-coalesced scroll listener moves only decorative scene layers by at most 8px/2 degrees. It does not move the row targets or control scrolling. Scene gestures now bank the plane, turn the calendar page, open gift/pot lids, place table settings and assemble the desk envelopes more visibly. Pointer-down and keyboard focus trigger gestures without delaying task navigation.

Reduced motion disables text, parallax and press transitions and renders settled 3D poses. Scenes still unmount offscreen and when hidden; WebGL uses demand rendering and gestures end after three seconds. No inline video was added: a second autoplay layer would duplicate the interactive scenes and add decoding load. The delivered MP4 is an actual browser recording, not CSS described as video. It shows text, scrolling and scene gestures with synthetic data only; no paid generation or third-party footage.

Fresh proof: 245 focused tests, typecheck, scoped lint, macron/brand/front-door guards and production build pass. 34 responsive/motion/interaction assertions and three companion-starter assertions pass. This includes 320/375/768/1440, parallax change, reduced-motion stillness, hidden canvas release, all seven intent paths and preserved editor/draft, no API writes or runtime errors. Independent reviewer inspected source, captures and 11 extracted MP4 frames: no actionable regression; genuine object movement remains coherent and restrained. Review is frame-based, not independent real-time playback or physical-device proof.

Evidence: `output/playwright/motion-pass/`; review images and short MP4 update the existing Library deliverables. Local review only, with earlier commits retained and publication still awaiting Kate's approval.
