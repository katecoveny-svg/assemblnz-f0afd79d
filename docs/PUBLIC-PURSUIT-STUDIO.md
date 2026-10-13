# Public Pursuit → Studio film editor

Review implementation, 13 October 2026. This document does not claim deployment.

## Scope and authority

Public `/pursuit/studio` extends the existing Pursuit fictional examples and the browser-local Studio motion renderer. It gives an anonymous visitor a complete bounded path: choose a fictional signal, edit the brief/concept, copy those into a four-scene storyboard, edit scene text, choose a frame/duration, optionally add local media, preview, record and download a playable film. Links from the Pursuit and Studio product pages make it discoverable. The homepage is unchanged.

The draft is deterministic template assembly, not live research or model-generated film. Existing public research remains linked separately. No private saved project is read or published; no new provider call, upload, database, grant, worker route or dependency is added. Original private Studio imports the same renderer through a compatibility re-export; its owner gate is unchanged. No ElevenLabs, voice cloning or talking-avatar path is introduced. Future project tools should preserve this single-project context without advertising absent functionality.

Canonical context used: `START_HERE.md`, `AGENTS.md`, the context manifest/router/current-state index, company context, brand system, `DESIGN.md`, copy standard, Factory model and primitive registry. The existing visual system is extended, not redesigned. The local Impeccable context launcher was unavailable; existing product/design context was read directly.

## Reusable boundaries

- `lib/studio/public-project.ts`: strict version-1 JSON contract, 32 KiB input cap, four scenes, three frame ratios, 4/6/8 seconds per scene. Rejects unknown keys including nested media, arbitrary URLs, prototype keys, invalid enums and control characters. Strings remain inert React/canvas text.
- Project export contains only the brief, concept, text, selected fictional example, frame and timing. It never serialises image/audio/video bytes, blob URLs, private IDs or approval state. Reopening clears current media. No automatic local or cloud save. Closing/refreshing loses unsaved state; original media must be reselected.
- Images: local PNG/JPEG/WebP, nonempty, ≤5 MiB, decoded pixel count ≤16 million. One image spans the four scenes. Unsupported/undecodable input leaves the previous media intact.
- Narration: local WAV/MP3/M4A/Ogg/WebM, nonempty, ≤10 MiB, finite duration ≤120 seconds. Starts at zero; clipped at film end, or silence after a shorter clip. No transcription or speech alignment.
- `lib/studio/motion-video.ts`: browser-only shared canvas renderer and MediaRecorder lifecycle. Encoder choice is capability-based MP4/WebM. Explicit progress, cancellation, hidden-tab abort, timeout, empty-output/encoding errors, stream/context/URL cleanup. No network/storage imports.
- Scene VTT escapes cue text and uses scene boundary timing. It is labelled scene copy, not speech captions. Text also stays available outside the canvas.
- Middleware exempts only the exact public editor from session refresh. Existing public splash prefix already admits Pursuit. Private demo, owner, image and voice API boundaries are unchanged.

## Proof

`lib/studio/public-project.test.ts` and `motion-video.test.ts` cover contract rejection, captions, encoding failures, cancellation, narration ordering and cleanup. Existing auth/session/voice/image suites are run alongside them.

`scripts/public-studio-browser.cjs` exercises a production server with synthetic local fixtures: brief handoff, formats, upload bounds, bad files, project roundtrip, malicious imports, cancellation/retry, actual video playback, scene captions, 375px, reduced motion, keyboard and unavailable encoder. It asserts no POST submissions from the workflow, and existing anonymous private-demo denial. `.github/workflows/public-studio-review.yml` repeats types, scoped lint, tests, macrons, production build and browser proof, uploading screenshots and the generated sample film.

Local full-repository lint was attempted and found existing errors throughout unrelated code and generated assets. Changed-file lint is the relevant clean gate; this feature does not repair the unrelated backlog. Production-build and CI status must be checked on the final PR SHA.

## Review and release

Draft PR first; parent independently reviews exact head, CI and screenshots. Do not merge/deploy before that checkpoint. Production outcome remains authorised for coordinated release after review. Revert the PR to remove public discovery/editor and restore the previous renderer location; no schema or data migration is involved.

Remaining proof limits: automated browser is Chromium; physical iOS/Safari/Firefox and human listening review are not claimed. Synthetic tone verifies audio transport/timing, not narration quality. Auth tests verify existing mocked owner/session boundaries, not a real user's sign-in journey. Private worker runtime and personal/cloud saves remain separate work.

### Local verification record

- 69 focused tests passed, including existing auth/session/voice/image route tests.
- Typecheck, changed-file ESLint, brand guard, macron guard and production build passed.
- Production-server Chromium run: 1440px and 375px; zero page errors and zero POST submissions; private demo/journey responses remain 401.
- Real MP4 with H.264 video and Opus audio: 1280×720, 16.08 seconds; both tracks begin at 0. Synthetic narration is clipped to the film. Browser playback advanced and downloads reopened successfully.
- Screenshots: `output/playwright/studio-desktop-brief.png`, `studio-desktop-storyboard.png`, `studio-desktop-export.png`, `studio-mobile-storyboard.png`, `studio-mobile-export.png`, `studio-unsupported.png`. Machine report: `studio-report.json`. CI retains the generated film, project JSON and VTT as artifacts.
- Full-repository lint: 1,411 findings (1,169 errors / 242 warnings) across unrelated application/legacy/generated files. No changed-file lint findings remain. This is a recorded repository limitation, not a passed global gate.
