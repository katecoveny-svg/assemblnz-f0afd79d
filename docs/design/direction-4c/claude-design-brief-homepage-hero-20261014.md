# Claude Design brief: the assembl homepage hero, second pass

Prepared 14 October 2026 for Kate to paste into Claude Design, with the evidence that produced it. Companion to the Direction 4c implementation review in this folder. This brief proposes design work; it authorises no merge or deployment.

## What is actually on the live site

Kate's capture of www.assembl.co.nz on 14 October was compared against the Claude Design file (`Direction 4c Clear.dc.html`), its engine (`assembl-tide.js`), the approved reference capture (`evidence/reference-desktop.jpg`) and a local render of main at the same viewport (1237 by 780 CSS pixels at 2x).

- The live page runs the Claude Design engine unchanged in the parts that matter: the same `film` grade, the same plum field, the same flock settings (900 birds, bird scale 1.2, arrival 0.22, the same slot shapes) and the same scroll-driven arrival formula. These values were diffed against the design file; none differ.
- The local render at Kate's viewport matches her capture pixel for pixel in colour: field about rgb(28, 13, 27) in both, the flock in the same spread.
- The reference capture that everyone remembers as "the design" was taken at 1440 by 823 with the footage on a bright sunset frame. Kate's capture landed on a dark stretch of the 24-second clip. Inside the wordmark that frame is about rgb(108, 83, 110) against rgb(145, 112, 139) on a bright frame, and with no bright pixels there is no bloom around the letters, so the whole hero reads as black.
- The kicker was caught mid-decode. The decode was counted in animation ticks, which a busy graphics thread starves; it has been made time-based in code (560 ms).

So the implementation is faithful. The perceptual gap is in the design's own materials and settings: a clip with a dark stretch, a grade that lets dark frames go black, and a flock that at rest shows most birds scattered high across the page because arrival starts at 0.22.

## What was changed in code, pending Kate's eye

1. **Plum grade floor.** The `film` tone now pulls every footage frame 26% toward the plum-to-paper duotone, with slightly higher exposure and bloom. A dark frame still reads as plum. The bright frames keep their sunset. Before and after captures are in the session's proof folder and attached to the PR.
2. **Time-based kicker decode.** 560 ms from first paint, however busy the GPU is.

Nothing else was touched: no flock, no field, no copy, no motion timings.

## The brief for Claude Design

> Rework the assembl homepage hero so it reads as assembl plum at every second of the loop and on a retina laptop at 1237 by 780, not only on the one sunset frame in the reference capture. Keep the Direction 4c composition: cut-out wordmark over coastal footage, the flock above, the kicker, the one-line subtitle, the glass nav. Deliver the same engine and settings format so it drops into the existing implementation.

Specifically:

- **Footage.** Either trim the clip to the bright sea-and-sky stretch so it loops without the dark aerial section, or grade the whole clip toward plum so no frame falls below the field. Supply the poster frame from the same clip. The current poster is a different coastal view from the footage, which shows during the startup crossfade.
- **Grade.** Give the `film` tone a floor: a plum duotone mix in the 0.2 to 0.3 range, exposure 1.1, bloom around 0.3, so the letters glow on every frame. A starting point is in the code change above.
- **Flock at rest.** Decide what the flock looks like before anyone scrolls. Today arrival starts at 0.22, so most of the 900 birds sit scattered across the top band and read as noise on a short viewport. Options: start arrival nearer 0.5 so the cloud is already gathering, or keep the scatter but shrink the unarrived birds. Show both at 1440 by 900 and 1237 by 780.
- **Bird rendering on retina.** The terns are thin line geometry. On a 2x display with the pixel ratio capped at 1.5 they look sketchy. Either raise the cap to 2 on capable desktops, thicken the wing strokes slightly, or soften the silhouette. Show one at 2x.
- **Kicker.** Keep the decode but specify it in time: 500 to 600 ms, never tick-counted.
- **Colour.** Field is deep plum `#240B21` with the existing halo; wordmark fill is the graded footage; text is paper `#FFFDFB`; mono labels in IBM Plex Mono. No gold, teal, canary or cobalt.
- **Honesty.** Try DO stays labelled simulated. Nothing in the hero implies live work.

Deliver: the updated `.dc.html` with engine and assets, a note of every changed value against the current file, and captures at 1440 by 900 and 1237 by 780 at 2x, taken at 2, 8 and 20 seconds into the loop and with Pause motion on.

## Acceptance

Kate reviews the captures first. Then Claude Code ports the changed values and assets into `public/direction-4c/` and `components/site/direction-4c/`, keeps the existing startup, pause and reduced-motion behaviour, runs the Direction 4c proof scripts and CI, and merges only on Kate's word.
