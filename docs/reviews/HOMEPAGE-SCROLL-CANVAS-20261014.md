# Homepage scroll and canvas regression repair

Review-only bounded repair based on fresh `origin/main` at `1339da25e42ffe479063ec2ddf3cc1aaa688ffe2` (after PRs 1547, 1552 and 1553). No production merge/deployment authority. Extends the existing Direction 4c homepage, tide renderer and browser proof workflow; creates no new runtime primitive.

## Decisions

- At phone widths up to 900px, useful-work copy/actions reveal at full opacity at hero progress 0.64. Desktop keeps its existing scroll fade. At 0.70 the old formula stranded reading at approximately 0.259 opacity; the repaired block is 1.
- Keep the flock, design, SVG arrows and 48px real DO links. Pause, reduced-motion, visibility, startup timeout and buffered-stall controls remain.
- Do not rebuild the scene on a breakpoint change while playback is disallowed. Repaint resized drawing buffers while paused without advancing the animation. Paint before reporting renderer readiness.
- Select the canvas video texture only when the page's decoded-frame gate permits it; otherwise sample the existing coastal poster. Re-evaluate selection on every paint, including a paused backdrop change. Dispose the added poster texture with the scene.
- Use a detached poster image so intrinsic dimensions control texture allocation. The first implementation using the CSS-sized DOM image produced a WebGL upload error; actual canvas proof caught and corrected it.
- The parked sample now says: “Nothing was changed. This sample is not saved and will be lost on reload.” No storage added.

## Runtime evidence

The baseline local Chromium probe found an unpainted canvas (all-zero pixel readback) after paused 390→1000→390px crossings despite `data-ready`; the failed-video case retained painted stale video above the HTML poster. The resulting intermediate message opacity was 0.26. These were runtime observations, not conclusions from HTML video opacity alone.

Repeatable final proof: `scripts/homepage-scroll-canvas-proof.cjs`, served by the real local production build. Chromium and WebKit at 375/390/430px, normal and blocked footage; hero progress 0, 0.5, 0.65, 0.70, 0.76, 0.82 and 0.95; paused 1000/390/430px crossings and stable frozen pixels; buffered stall, waiting recovery and failure after playback; synthetic visibility events; interrupted Talk→Write/Add; parked disclosure and reload loss; 48px DO targets and actual navigation to `/do?tool=write`, `/do?tool=talk`, `/do`.

The script seeds incidental randomness, uses instant verified scroll positions, records canvas pixels and the actual `tPlate` GPU sampler source, and captures each state. It enables `preserveDrawingBuffer` only in the test browser for pixel readback; production renderer options remain unchanged. These are desktop browser-engine runs, not physical iPhone or native Safari claims. Existing decoded-frame/reduced-motion tests and broader mobile proof remain in CI.

Local evidence directory (ignored, not uploaded): `output/playwright/homepage-regression/`. `chromium-results.json` and `webkit-results.json` are the state/paint manifests; images include `*-375-normal-p70.png`, `*-375-blocked-p70.png`, `*-390-normal-paused-390.png`, `*-390-normal-failed-after-playing.png`, sample and destination captures. Baseline captures are prefixed `before-`.

## Checks and limits

- Passed: canvas package build, `pnpm typecheck`, 23 direction-4c/navigation tests, scoped ESLint, JavaScript syntax checks, brand guard, macron guard, and `pnpm build`.
- Passed: both browser matrices (six width/media cases plus three real destinations each), 112 candidate screenshots total.
- `pnpm lint:all` reports 1,416 findings (1,173 errors / 243 warnings) outside changed files. This repair does not expand into unrelated cleanup.
- CI extends `.github/workflows/direction-4c-review.yml` with the new Chromium/WebKit matrix and artifacts. Exact commit status must be checked on the draft PR before release.
- No auth, storage, security, private-data activation or provider submission changes. No Library upload.

Rollback: revert this repair commit. Follow-up: physical-device review remains a release-owner decision; no such verification is claimed here.
