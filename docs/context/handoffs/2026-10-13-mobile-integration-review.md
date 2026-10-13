# Homepage mobile recovery integration — review only

Merge current main `7cd08207cf280fc99808d8aa3835a90284ebfe09` into recovery head `b43e3125340d7bedd477ee1578bf255942be8e04`, preserving both histories. This supersedes the attempt to release the recovery against the earlier main; no integrated release is authorized before independent review.

## Conflict decisions

- Keep the mounted native video, real coastal poster, decoded-frame readiness, bounded startup/recovery, pause/visibility gate and buffered-stall handling. Do not revive detached preload-only video or a procedural sky without coastline when footage fails.
- Keep main's H.264/VP9 selection, React/static-markup composition, desktop word reveals and interrupted-kicker cleanup. Mobile reads in normal flow with no flock behind copy. Pause/reduced motion restore readable reveal text.
- Keep the premium dark-glass material with inset light edges and blur on phones; keep glyph opacity at one and a sufficiently dark tint under copy. This is an integration for review, not a claim of exact visual identity with the design export.
- Keep all four legal links, gradient glyph padding and existing product destinations. Real Write/Talk/Add links remain primary in `#try`; the inherited simulated walkthrough is explicitly labelled and optional beneath those links. It does not read accounts, record voice, upload, save or send. No authenticated product routes are changed.
- Retain qualified capability wording. Remove inherited universal approval/receipt guarantees and the unqualified IPP 3A sentence from the public homepage; this visual repair does not assert legal compliance.
- Cancel simulated voice timers on mouse/keyboard tab changes, new examples, reset and unmount. An interrupted Talk example must not overwrite newer typed text or force a different tab.

## Proof contract

Run focused lifecycle/reveal tests, navigation tests, full typecheck, relevant lint, macron/brand/front-door guards and production build. Run `scripts/direction-4c-mobile-proof.cjs` in Chrome and WebKit against the built app: 375/390/430 phones, desktop, reduced motion, denied/blocked/no-frame playback, codec fallback, pause across resize, buffered stalls and decoded recovery. Exercise Talk → Write → type and Talk → Add interruption, a fictional example's Not now path, real DO destinations and legal targets. Capture verified instant top/mid-scroll positions and media state beside screenshots. Hosted artifacts and the exact reviewed commit belong in PR #1547.
