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

## Verification

See `VERIFICATION.md` for checks and captured evidence. Visual captures are snapshots of a time-varying engine, not a claim of deterministic pixel identity. No authenticated action or external work was submitted.

Rollback: restore the `AssemblTheWorkHome` import/render in `app/page.tsx`; retained product/auth implementation remains untouched.
