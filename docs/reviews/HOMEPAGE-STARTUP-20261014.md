# Homepage startup sequencing — unpublished local review

## Live reproduction

Investigated public www and apex on 13 October 2026 after the 21:45 UTC report. Production deployment `dpl_AmEaTgcZ9oWTi2394m9Ujd9k6TYj` was READY at main `57b174df287d5d8adbbc56b38fce9b05cbd6fd69`. Both aliases point to this deployment. Compared with reviewed homepage merge `bd6c32091`, its changes are outside the homepage. Public apex redirects to www. Repeated HTML hashes match across both entry URLs; repeated engine hashes also match. No domain/cache split was reproduced.

Actual first ten seconds were recorded locally in Chromium and WebKit at 390×844 and 1440×844: fresh plus two warm normal loads, video delayed, video blocked. Normal runs used no Playwright routes, preserving browser caching. Capture targets and actual elapsed times are recorded; GPU/screenshot overhead means a target is not an exact timing guarantee. Test-only WebGL instrumentation reads the actual tPlate sampler and preserves the drawing buffer. This is browser evidence, not a physical iPhone claim.

The three scenes are real:

1. HTML white assembl wordmark over the sunset/rocks still.
2. A different aerial coastline plays as a full-screen HTML video when `data-video-ready` arrives.
3. `data-ready` abruptly hides the HTML wordmark and exposes the opaque, graded, masked wordmark/flock canvas.

Chromium's first 390px load recorded video readiness at 1468 ms and composed canvas readiness at 1895 ms; WebKit recorded 1803 ms and 2070 ms. A frame extracted from the Chromium recording shows the raw aerial coastline and white HTML wordmark between them. Warm loads varied in ordering/duration. This is independent asset readiness, not three deployments.

A fourth transient can occur: Chromium's delayed phone load exposed a ready canvas with no coastal sampler at 1102 ms, then sampled the poster at 1242 ms. Source confirms a second detached Image was created without waiting for decode. The shader used procedural dusk meanwhile. Later footage replaces the poster in one frame. Existing entrance text also scrambles/fades on its own clock; no copy redesign is included here.

## Draft decision

Extend the existing renderer and fallback, with no new storage or service:

- The HTML video remains texture-only; never expose a standalone raw-video scene.
- Decode the intrinsic-size poster before allocating/exposing the composed renderer. A bounded three-second decode deadline retains the intentional procedural/flock fallback if both media sources fail; optional media never disables the renderer.
- Fade the HTML fallback wordmark out over 160 ms, then crossfade the background and composed canvas over 450 ms. The differently sized wordmarks never overlap.
- Blend late footage from the poster inside the same graded composition over 600 ms. Failed footage is discarded immediately, retaining existing safety behavior. Paused rendering does not advance the blend.
- Preserve the chosen flock, artwork, poster, copy, arrows, DO targets, scroll readability and pause/reduced-motion behavior.

The poster is visibly a different coastal view from the footage. A matching still from the selected footage/composition could improve continuity further, but that is a visual asset decision pending the user's reference. This draft does not silently replace it.

## Evidence and validation

Local evidence is under `output/playwright/startup/` (live recordings, screenshots, sampler timelines, `domain-cache.json`, `live-three-scenes.png`). `startup-gated/` repeats WebKit delayed recovery with a shared four-second gate; the first diagnostic delayed every range request and therefore also exercised video timeout.

Candidate evidence and final check results are recorded below. The reviewed runtime is now in draft PR1559. Release requires independent visual review and passing CI; reproduced evidence is sufficient and an additional user recording is not required.

### Candidate verification

- Production build, typecheck, scoped ESLint, JavaScript syntax checks, brand guard and macron guard passed. The first sandboxed macron attempt was blocked by local IPC permissions; rerun passed with that permission. Production build also ran with local process permissions.
- 23 relevant Vitest tests passed.
- `startup-candidate/`: 20 startup loads and 180 screenshots across Chromium/WebKit, 390/1440px, three normal loads per width and delayed/blocked footage. All assertions passed: no exposed raw-video scene, no ready canvas without coastal pixels in these cases, delayed media blend observed in both engines at both widths.
- `startup-regression/`: all six 375/390/430px normal/blocked cases plus three real DO destinations per engine passed. This includes intermediate hero progress, pause/visibility/stall/failure, crossing 900px while paused, 48px actions, sample interruption and the no-save/reload disclosure.
- Both engines passed initial Pause before engine initialization with stable painted pixels. Both passed reduced-motion, failed renderer and both-media-failed usability checks.
- The final production metadata check still showed the same READY deployment/SHA. No deployment was initiated.
- Ten-second local MP4s are in `output/playwright/startup/{live,draft}-{390,1440}-first-10s.mp4`. These compare sequence, not network performance: live and localhost have different delivery latency.

Hosted CI is running on draft PR1559. The workflow includes startup proof. Full repository lint reproduced exactly the previously recorded baseline: 1173 errors and 243 warnings, with zero added/removed findings after normalizing checkout paths. See `output/playwright/startup/lint-comparison.json`. It is not a clean repository-wide check.

### Poster timeout/failure coverage

Independent review requested explicit coverage beyond the three-second poster decode deadline. The startup suite now includes `poster-slow` and `poster-failed`, with video blocked in both. Slow-poster coverage withholds the image until after the renderer has exposed its deliberate procedural fallback, then releases it to verify recovery; failed-poster coverage verifies the fallback remains painted without disabling the flock. The proof asserts actual nonzero canvas pixels, source selection and optional-media behavior.

All eight local cases passed: Chromium/WebKit × 390/1440px × slow/failed poster. Evidence is in `output/playwright/startup-poster/`. Visually, the procedural pastel/plum wordmark and flock remain coherent and readable at both sizes, close to the supplied reference's lighter treatment. A late poster still changes the sampled background after the deadline: this is a deliberate degradation/recovery path, not a universal no-flash guarantee. No runtime or composition change was made for this coverage addition.

### Hosted timing correction

The first hosted run on `98f4a08` completed in about 34 minutes. Build, typecheck, lint, 23 tests and all existing mobile/painted-canvas cases passed. One new startup assertion failed on 1440px Chromium: deliberately delayed video remained unavailable, so the real six-second media deadline correctly retained the poster instead of producing a blend. The test had incorrectly required successful recovery in every delayed case. The corrected proof requires blending when video recovers, or a painted poster plus a stopped/discarded video when it does not. It does not change the production deadline or renderer. The workflow budget is 50 minutes to accommodate the measured software-rendering cost and added poster cases.

### Single-wordmark correction

Direct review of the original draft recordings at 700 ms found two differently sized wordmarks overlapping during the simultaneous crossfade. This was a visual acceptance blocker despite the earlier source and media checks passing. The prior head `ddd5e852a1828739c4deb98e9ed0683920bc8e52` subsequently passed hosted run 38479552929, including both browser suites; that result does not cover this correction.

The bounded correction changes only CSS transition sequencing: the existing HTML wordmark fades out for 160 ms before the composed canvas/background crossfade starts. The final artwork, geometry, renderer, poster and video behavior are unchanged. Initial canvas opacity has no transition until readiness, and removing readiness restores the fallback immediately. Pause still completes transitions atomically. There is a brief dim handoff rather than an overlapping wordmark; this is not a claim that the two existing wordmark treatments have identical geometry.

Proof now records both computed opacities and rejects simultaneous visible wordmarks. Local before evidence remains in `output/playwright/startup/{phone,desktop}-crossfade-700ms.png`; after recordings, transition strips, actual painted screenshots and timelines are in `output/playwright/startup-single-wordmark/`. Fresh production build/typecheck, scoped lint, 23 tests, syntax/diff checks passed. Mobile scroll, blocked media, paused breakpoint, real DO destinations and sample interruption checks passed at 375/390/430px in both browser engines. Early-pause and reduced-motion/failed-renderer/both-media-failed checks passed. One redundant fallback invocation lacked the WebKit browser path; the correctly configured invocation passed all six fallback cases.

Independent visual acceptance and terminal hosted CI on the correction's exact head remain the release gate. No merge or deployment was performed.
