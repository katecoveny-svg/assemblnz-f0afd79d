# DO visual and product baseline

Confirmed by the product owner on 16 September 2026 in the recovery task. This decision supersedes the text-only front door introduced in PRs #1282, #1287 and #1288. It does not supersede runtime, authentication, approval or data-isolation controls.

## The product hierarchy

- `assembl` remains the company homepage at `/`. Pursuit finds work; DO prepares it; Studio makes it visible.
- The product is **DO**, never DOO. **Builderdoo** is the named software-building specialist, not a product rename.
- `/do` is the dimensional, personal, portable companion experience. `/do/builder`, `/do/office` and `/do/connections` are connected destinations.

## Preserve this experience

Deep plum and rose glow; Instrument Sans; a dimensional **D with a central dot**; a draggable floating launcher; visual specialist identities; Personal and Work choices; a rearrangeable Context / Skill / Review canvas; saved names, appearances and layouts. The Pet DO appearance is optional; the D remains the default.

The headline is “assembl your DO”. The website companion opens the actual preparation workspace. Moving it shares nothing. Position persists in this browser. The Mac companion independently preserves position/visibility and offers opt-in start at login. Browser side-panel and Mac selected-text bridges remain explicit actions.

Motion is part of the requested identity: the opening D reveal, scroll parallax and plum film. The removed bird/ocean/nature montage is not approved for the homepage. Pause controls, reduced-motion and phone layouts are required. The film is a motion study, not evidence of runtime activity.

The Office is an imagined Blender-authored harbour studio with an editable source and compressed browser model. Its rooms and board use the same counts. Furniture does not represent live agents. Empty state must remain empty. Studio viewpoints are camera destinations; the task links lead to the real board.

## Where the missing work was

The Codex task **Review shared ChatGPT conversation** contained local uncommitted work after `6ea5cc65b`: the canvas, appearances, templates, editable memory, travel workspace and connected local conversation. Those features had not reached `main`. Recovery selectively ports those sources; it does not overwrite newer runtime or security changes.

Displacement evidence:

| Commit | Effect |
| --- | --- |
| `95f7707df` | Removed homepage film and also the floating launcher and visual DO story. |
| `f7e9fdae4`, `93fc1b062`, `ba38b170b` | Added/applied static brand-rescue styling and suppressed the glowing launcher identity. |
| `93374420d` | Replaced the prior DO home composition. |
| `e2b230fac`, `9b5ff0033`, `5d31fb5ef` | Added the text-led `DoHomeCurrent` and switched `/do` to it. |
| `51759a892` / PR #1288 | Isolated the text-led homepage and added a guard requiring `DoHomeCurrent`. The recovery replaces that guard with this accepted baseline. |

Retained: model routing and evidence policy, prompt-injection authority checks, connector broker, Builderdoo build contracts, improvement workflow, Gmail pilot, Gemini Live, Mac start-at-login and browser side-panel support.

## Runtime truth

- Text/image preparation uses the existing service, consent and network trial limits. Configuration is not proof of a successful task.
- Exact detail extraction is deterministic, but the hosted route still enforces the trial allowance.
- Gmail is the existing school-admin pilot and requires account connection and message selection. The Office is currently a demo/local runtime, not a durable authenticated team store.
- Saved recipes and memory are device-local, not accounts or secure separation between people sharing a browser. Source documents are not saved in recipes. Memory is used only when explicitly added to the draft.
- The recovered OpenAI conversation and voice transport is **development + localhost + same-origin only**. Production rejects it. `/do/live` and `/do/travel` route hosted users to supported preparation. The in-memory session worker must not be relabelled production-ready.
- The existing hosted Gemini voice path is retained. Microphone permission is separate; it does not grant email, Mac or booking authority.
- Schedules, app control, automatic email sending and purchases are not added by this recovery.

## Release path

Local work must be committed to a branch, checked, included in a PR, merged to `main`, and verified at the exact production deployment. Vercel Git integration automatically publishes runtime changes on `main`. Local edits alone do not update the live site. DO CI now runs on PRs and `main`; the public-front-door guard runs in production builds. These automations do not authorize arbitrary future merges or expand DO action permissions.

## Vision added at the owner's request

“Show DO” accepts a user-selected tab/window still or an uploaded screenshot/photo. Browser sharing stops immediately after one frame. The image remains a local preview until a separate explicit consent and Ask DO action. The server enforces origin, byte/pixel limits, real image decoding, provider availability, rate limits and the existing trial allowance. Only vision-capable models use the shared router. The image is re-encoded without metadata; a receipt names the model and image/output fingerprints. Observations remain editable and enter the task only after the user chooses Add reviewed observation.

Dragging the widget never activates vision. No background recording, implicit current-page access, remote-image URL fetching, clicking or app control is introduced. Phone and embedded-app availability depends on browser APIs; screenshot/photo upload remains the fallback. The Mac helper can use image upload; a native macOS window-capture bridge is not part of this release.
