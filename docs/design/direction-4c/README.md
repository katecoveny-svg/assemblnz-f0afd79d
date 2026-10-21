# Direction 4c Clear — implementation review

User-authorized homepage implementation, based on remote main `7a8c40305062fa102a46ff0b47fbedf05dd8623c`. No merge or production deployment authorized.

## Provenance and scope

Source project: https://claude.ai/design/p/9f22d4d4-067f-48dd-b031-a9b21e7da40e?file=Direction+4c+Clear.dc.html

Supplied ZIP SHA256: `932a5f70217addac0dd7127910dc07f4de566f9197e43471dff8090f86c2d5d3` (handoff record). The original HTML and `support.js` are preserved here unchanged. The untouched source directory remains outside this checkout. Assets, optimized 24-second 720p coastal clip, Three.js and tide engine are under `public/direction-4c/`. Three's embedded MIT notice is retained. `THREE-LICENSE.txt` supplies the complete license from the installed Three distribution.

The static design template is adapted into server-rendered markup in `components/site/direction-4c/markup.ts`. It is trusted build-time content, not a user-input HTML sink. The React controller mounts/disposes the existing animation engine. `support.js` and its dynamic template interpreter are reference-only, never executed by the app. Engine adaptations resolve Next's actual Instrument Sans font family and apply the pause/reduced-motion boundary to scroll parallax, pointer input and queued frames, with style/listener cleanup.

This is an intentionally homepage-specific composition. It reuses the supplied engine and existing product routes; it introduces no auth, provider, private route, database or execution primitives. Existing homepage components stay in-tree for rollback. The front-door guard accepts the authorized new homepage without removing its checks on DO or the retained atelier.

## Deliberate differences requiring review

Revised 13 October 2026 after user review of the first implementation (Claude Code session):

- **Try DO is restored** as the design's interactive, explicitly simulated job (`TryDo.tsx`): Write/Talk/Add, example jobs, More and Customise, six-step progress, Approve / Not now, receipt and the engine light/pulse. Every simulated surface keeps its label ("try DO · simulated", "voice is simulated on this page", "simulated · nothing is uploaded on this page", "Try a fictional example", "· simulated" on the receipt action). Nothing is read, uploaded, sent or stored. "Open the full DO" goes to the real `/do?tool=write`; DO has no prefill parameter, so the typed job is not carried across.
- **Word-by-word headline reveals and mono kicker decoding are restored** (skipped under reduced motion).
- **Copy follows the design**, by user decision, with one change: "Every receipt is sealed." is now "Every job leaves a receipt." The hero line, evidence list and footer note use the design wording.
- **Footage failure no longer drops the page to static.** Only a lost WebGL renderer does; the flock keeps flying without the plate. A VP9 `bay-of-islands.webm` (same 8-frame keyframe spacing for scrubbing) serves browsers without H.264.
- Paused or reduced motion no longer freezes entrance fades at opacity 0.
- A stray absolutely positioned glow (DOM residue at `top:-708px`) after Contact is removed.
- Retained from the first pass: product links to `/pursuit`, `/creative-studio`, `/do`; mobile primary navigation in a second row; scoped CSS and Next font variables; legal links in the footer; review-only theme/clip controls omitted.

## Second pass, 14 October 2026

Kate's live capture of 14 October read as near-black with a sketchy flock. PR #1590 fixed what could be fixed in code (plum grade floor on the film tone, time-based kicker decode) and left a brief for a design pass, which Kate ran through Claude Design: canvas https://claude.ai/artifact/UX3oPAksD2zRt371NatU8t, zip SHA-256 `5189f5997c37253782915c3c495b5b1be0e68d74abba7eacb117a4411155a106`. The updated design file and its change table are preserved unchanged in `second-pass/`.

Ported, with the design's own values:

- **Footage.** `coast-gen-c` (generated sea glide toward a low sun, 10 s, 1280 × 720, keyframe every 8 frames, darkest frame luma 121 of 255) replaces `bay-of-islands` (darkest frame 46). The poster is the clip's own first frame, so the startup crossfade runs between two copies of the same image. Generated footage is never captioned as a real place; the only "Bay of Islands" left on the page is the Talk example in Try DO, which is about a trip, not the picture.
- **Field.** `uField` is deep plum `#240B21` (was about `#1B0818`, which read as black under the vignette). `opts.field` overrides.
- **Flock at rest.** `arrive` starts at 0.5 (half the flock already in the cloud) and the scroll mapping is `a0 + (1 − a0) × smooth((p − 0.48) / 0.34)`, same window as before. The design's "Scatter, small" alternative (a0 0.22 with waiting birds at 45%) is available through `waitScale` / `api.setWait` but not used.
- **Birds on retina.** Wing chord 1.25 (front edge forward, back edge aft, span unchanged; gliders stay 1.0; `opts.wingChord`). Pixel ratio cap 2 on desktops reporting 8 or more logical cores, else 1.5, 1.25 under 900 px; `opts.dprCap` overrides.
- **Kept from PR #1590.** The film grade (exp 1.1, con 1.08, duo 0.26, vig 0.38, th 0.8, bloom 0.28, glow 0.05) and the 520 ms decode.

Left out on purpose: the review-only `filmv1` tone, and the design's scroll-scrub start time, which has no counterpart because the site plays the clip on a loop instead of scrubbing it with scroll.

Open before this is called finished: the pixel-ratio-2 path costs about 1.8 times the scene-pass pixels and needs a frame-time check on a mid-range retina laptop. The cloud build runs software GL and cannot stand in for that.

## Hero edge, pre-ready composition and footage resolution, 14 October 2026

Kate's capture of the live second pass showed three things: a soft, stepped edge on the wordmark cut-out during the fly-through, the footage landing full-frame before the plum field arrived, and the footage itself reading soft.

- **Crisp edge at every zoom.** The knockout mask was a coverage bitmap drawn at a 640 px font and magnified up to 28 times during the fly-through, so its edge blurred and stepped. It is now a signed distance field (exact Euclidean distance transform, Felzenszwalb and Huttenlocher) rendered at the largest size the GPU accepts (up to 4096 px wide, 2048 on narrow screens), and the shader covers one screen pixel either side of the edge whatever the zoom (`uKAa`). The glass bevel and module tint still come from the coverage bitmap at quarter size, as before.
- **Footage only ever through the letters.** Before the engine is ready the page showed the raw poster full-frame with a white HTML wordmark on top; with a bright clip that read as the video landing first. The pre-ready layer is now the plum field with its halo, and the HTML wordmark shows the poster's horizon through the letters (`background-clip: text`), so the handoff to the composed canvas is plum to plum. The static and reduced-motion fallbacks share the same look.
- **Footage resolution is a source limit.** `coast-gen-c` is a 1280 × 720 generation at about 2.4 Mbit/s, drawn at up to 2880 × 1800 on a retina laptop. No shader change adds detail. The honest fix is a higher-resolution source: an AI upscale of the clip (the connected Higgsfield account had 0.8 credits when checked, below any upscale's cost), or a fresh generation at 1920 × 1080 or above. Both need Kate's say and spend.
- **One mask, not two (follow-up the same day).** Kate's capture showed the pre-ready wordmark and the engine's wordmark as two different masks: the HTML one about 15 per cent smaller, higher, flat and unlit, so the handoff read as one mask fading into another. The pre-ready wordmark now uses the engine's own geometry, measured in the browser from the same canvas text metrics: the engine draws the word `min(0.9 × width, 0.4 × height × aspect)` wide with its padded box centred 42 per cent down, which in Instrument Sans 600 is `font-size: min(24.4vw, 44.45svh)`, text origin at `50% − 1.8008em`, top at `42svh − 0.5008em`. The poster is mapped through the letters exactly as the engine's `plateUv` maps it (centred cover at zoom 1.05). The letter tone is an sRGB colour matrix fitted by least squares from pre-ready to engine pixels at 1440 × 900 and 390 × 844 (mean error per channel from about 50 levels to about 9), and three drop shadows stand in for the engine's rim and bloom. The kicker and subline use the engine's `onLayout` rule (`±0.375em` of the word, −50 px and +26 px), so nothing moves at the handoff. These constants follow the engine's layout rule and the font; change either and re-measure.
- **Footage upscaled (follow-up the same day).** With Kate's authority, `coast-gen-c` went through Topaz Video 2x at fal.ai (2560 × 1440, HEVC, 34.6 Mbit/s, 43,320,367 bytes). Re-encoded for the web with the original spacing (keyframe every 8 frames, no audio, H.264 High with faststart; VP9 for browsers without H.264): `coast-gen-c-1440.mp4` 8.1 MB and `.webm` 6.1 MB for screens that draw the hero wider than 1600 device pixels (`coastalFootage` in `video-readiness.ts`), and `coast-gen-c.mp4` 3.5 MB and `.webm` 2.9 MB at 1280 × 720 from the upscale for phones, 1× laptops and Save-Data. SSIM of the 1440 encode against the upscale is 0.985; frame-average colour is within 1 level of the old clip, darkest frame luma is still 121 and the wordmark band stays at 145 or above. The poster is the upscale's first frame (49.7 KB). The desktop tier costs about 5 MB more than before. A 1080p tier (6.7 MB) was also encoded and looked nearly identical in 900 × 500 crops; 1440 was kept because retina laptops draw the hero up to 2880 px wide, and a real-screen comparison could still justify stepping down to 1080.

## No mask: the flock spells the wordmark, 21 October 2026

Kate asked for the knockout mask to go completely and for a different landing effect. Earlier passes are recorded above as history; this replaces them on the live hero.

- **Footage full bleed.** The engine mounts with `knock: false`, so there is no plum field, no letter cut-out and no fly-through zoom. Before the scene is ready the page shows the footage poster under a soft plum vignette (the plum pre-ready panel is gone), and the canvas fades in over it.
- **The flock is the wordmark.** The first formation slot is `word`. The engine starts with every bird waiting above the frame (`arrive: 0`). Once the scene is ready the page raises `arrive` to 1 over 2.6 s, so the flock streams down and assembles "assembl". Density sets legibility: 2,600 birds at `birdScale .55` read as letters, while 900 at 1.2 read as scribble.
- **Scroll.** The word holds through the first part of the hero. `arrive` falls to 0 between 46 and 62 per cent of the hero scroll, so the flock lifts out before "useful work." appears. It returns only once Pursuit's section is near the top of the screen, by which point the formation has changed to `signal`, so the word never sits behind the headline.
- **Type placement.** Without a mask, `onLayout` reports the first formation's bounds projected through the resting camera. The kicker sits 0.75 × word height + 44 px above the word's centre, and the line 0.6 × height + 22 px below it.
- **Legibility over bright sky.** The kicker and the line are paper (#FFFDFB) with a soft deep-plum text shadow, replacing the lilac gradient fill.
- **Static and reduced motion.** A plain Instrument Sans 600 wordmark in paper with a plum shadow. It is hidden whenever motion runs, because the flock draws the word.

## Verification

See `VERIFICATION.md` for checks and captured evidence. Visual captures are snapshots of a time-varying engine, not a claim of deterministic pixel identity. No authenticated action or external work was submitted.

Rollback: restore the `AssemblTheWorkHome` import/render in `app/page.tsx`; retained product/auth implementation remains untouched.
