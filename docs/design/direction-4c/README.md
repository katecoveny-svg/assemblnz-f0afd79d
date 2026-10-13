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

## Verification

See `VERIFICATION.md` for checks and captured evidence. Visual captures are snapshots of a time-varying engine, not a claim of deterministic pixel identity. No authenticated action or external work was submitted.

Rollback: restore the `AssemblTheWorkHome` import/render in `app/page.tsx`; retained product/auth implementation remains untouched.
