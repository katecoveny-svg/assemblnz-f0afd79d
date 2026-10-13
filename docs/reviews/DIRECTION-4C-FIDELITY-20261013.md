# Direction 4c homepage — design fidelity restored, 13 October 2026

Branch `fix/home-design-fidelity` on main. After PR #1545 brought the homepage to the Claude Design, PRs #1547 and #1552 (mobile recovery) changed three things the design and the product owner had decided: the flock and tide scene were removed on phones, the interactive Try DO card was collapsed behind a disclosure and replaced by a link card, and the copy was rewritten. This PR keeps the genuine iPhone fixes from those PRs and puts the design back.

## Kept from #1547 / #1552

- Coastal poster and in-document `<video>` so footage pixels exist before JavaScript, autoplay permission or GPU readiness; `playVideoWhenAllowed` / decoded-frame readiness; `data-video-ready`; recovery from `waiting` and `stalled`; pause preserved across breakpoint changes and page visibility.
- Paused copy is finished to opacity 1 and frozen while scrolling (desktop and phone alike).
- "Play motion" restarts a static scene; SVG arrows instead of emoji glyphs; the Try DO voice-timer and mode-switch fixes; `video-readiness.test.ts`; the Chromium + WebKit mobile proof workflow.

## Restored to the design

- **Flock on phones.** The tide engine runs at every width (it already scales for narrow screens). The phone-only CSS that hid the canvas and turned the hero into stacked cards is removed; the phone message keeps its soft plum ground.
- **Footage is a backdrop, not a dependency.** A denied, blocked or never-decoding video drops the footage and the flock flies over the plum sky; only a lost renderer goes static. (#1547 sent the whole page static when the video failed.)
- **Try DO is the `#try` section again**, open, with the design's copy and statuses (`READING … WAITING FOR YOUR YES … DOING · SIMULATED … DONE · RECEIPT`, kicker "try DO · simulated"). The three real DO entry links stay as a quiet row under the card (`Write in DO`, `Talk in DO`, `Add something in DO`) so the proof's touch-target checks and the product's entry remain.
- **Copy verbatim** from the design: "Nothing leaves without your yes."; the evidence list (Privacy Act 2020 IPP 3A · named person · "Every job leaves a receipt."); the Try DO sub-line and lock note; "Approve"; "Start". The mic button keeps an honest accessible name and the talk line says the microphone is not used.

## Evidence

| Check | Result |
|---|---|
| `tsc --noEmit`, `eslint components/site/direction-4c app/page.tsx scripts/direction-4c-mobile-proof.cjs`, `lint:macrons` | clean |
| `vitest lib/do/navigation.test.ts components/site/direction-4c` | 22 pass (two controller tests re-pointed: footage failure keeps the scene; the retry control is tested against a renderer failure) |
| `scripts/direction-4c-mobile-proof.cjs` (Chromium, local dev server) | see the PR checks for the Chromium + WebKit run on the production build; phone modes now assert the canvas renders, the message is fully visible at the end of the hero, and a blocked/denied/undecoded video leaves the scene running without footage |
| Screenshots | `evidence/direction-4c-fidelity-20261013/` — phone hero, phone word knock with footage through the letters, phone Try DO card, desktop hero, desktop Try DO |

**Not established:** a real iPhone (WebKit emulation runs in CI; Codex's hosted-WebKit note still applies), production build locally.
