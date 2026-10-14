# Direction 4c hero, second pass: changed values (14 Oct 2026)

Proposed design work only. Nothing here is merged or deployed. In the canvas, Main.dc.html is the updated Direction 4c Clear file. It has two new tweaks: `flockRest` (Gathering, Scatter small) and `variant` (Proposed, Live today).

| Setting | Current | Proposed |
|---|---|---|
| Clip | bay-of-islands.mp4, 24.0 s, 4.4 MB, darkest frame luma 46/255 | coast-gen-c.mp4 (chosen 14 Oct): generated sea glide toward a low sun, 10.0 s, 1280 × 720, mp4 3.0 MB / webm 2.1 MB, keyframe every 8 frames, no audio, darkest luma 121/255, wordmark band 138+. Generated footage: never caption it as a real place. |
| Poster | a different coastal view, not from the clip | coast-gen-c-poster.jpg, the clip's first frame, passed to the engine as `poster` |
| Scrub start T0 | min(6 s, 25% of clip) | 0 (the clip opens on the horizon) |
| TONES.film | exp 1.02, con 1.1, duo 0, vig 0.42, th 0.85, bloom 0.2, glow 0 | exp 1.1, con 1.08, duo 0.26, vig 0.38, th 0.8, bloom 0.28, glow 0.05 (PR #1590) |
| TONES.filmv1 | none | the old film values, for review only; leave it out when porting |
| uField | 0.105, 0.032, 0.095 (about #1B0818) | 0.141, 0.043, 0.129 (#240B21); `opts.field` overrides |
| Arrival at rest | 0.22; scroll 0.22 + 0.78 × smooth((p − 0.48)/0.34) | Gathering a0 = 0.5, Scatter small a0 = 0.22; scroll a0 + (1 − a0) × smooth((p − 0.48)/0.34) |
| Waiting bird size | full | Gathering 1; Scatter small 0.45, growing to full as each bird arrives (`uWait`, `opts.waitScale`, `api.setWait`) |
| Pixel ratio cap | 1.5 desktop, 1.25 under 900 px | 2 on desktops with 8 or more logical cores, else 1.5; 1.25 under 900 px; `opts.dprCap` overrides |
| Wing chord | 1.0 | 1.25 (front edge +0.0096, back edge −0.0096, span unchanged; gliders stay 1.0; `opts.wingChord`) |
| Kicker decode | 16 ticks of 34 ms, unbounded under load | 520 ms of elapsed time |

Unchanged: 900 birds, bird scale 1.2, the slots, outline 0.7, hero zoom, the halo, all copy, the nav, the "try DO · simulated" label, pause and reduced-motion behaviour.

Still to check before merge: frame time at pixel ratio 2 on a mid-range laptop.
