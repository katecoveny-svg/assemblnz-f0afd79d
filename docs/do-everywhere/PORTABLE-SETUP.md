# DO portable launch, Mac build and phone setup

Prepared 18 September 2026. Extends the existing DO surfaces and the goal in issue #1360; it is not a new agent runtime or proof that every DO-everywhere capability is complete.

## Verified starting state

The live `/api/do/live-token` status returned `enabled: true`, `configured: true`, `model: gemini-3.8-live`, a 300-second session limit and three sessions per day. No signed-in voice session was attempted. Key presence does not prove credential validity, billing, quota or audio quality.

The live `/api/do/meetings/transcribe` status returned `configured: false`. Its current server code uses `DEEPGRAM_API_KEY`, `nova-2`, `en-NZ`, diarisation and utterances. Recording/download is separate from transcription and notes preparation. The current transcription upload is bounded at 4 MB; this is not yet an unlimited long-meeting recording service.

The browser workspace already contains DoVision and DoGeminiLive; the Mac companion already contains the draggable native D, saved position, explicit selected-text capture and reviewed paste. This change connects and repairs the entry points rather than replacing those systems.

## What this change adds

### Browser extension 1.6.0

The default side panel becomes a compact launch page with four explicit choices: open the workspace, bring selected text, record a meeting, or open TypeSafe + DO. The existing advanced side panel remains available through its back link. The manifest's permissions and host scopes are unchanged.

Each action opens a movable first-party browser window. This uses the browser's normal Assembl session rather than transferring long-lived tokens through the extension or widening API CORS. A window being open is not a successful provider connection. A browser pop-out is not an always-on-top native panel.

Selection handoff is opt-in and only for ordinary selected page text. It excludes editable/form regions, strips source URL credentials/query/fragment, is bounded to 12,000 characters, and is bound to the newly opened widget tab. One pending handoff uses browser session memory, valid for 60 seconds; it is removed when consumed, the tab closes, a stale record is checked or the browser restarts. Failed/redirected handoffs are discarded, not redirected to another account page. Provider consent remains in the editor. The new handler accepts only exact extension-owned launch pages.

The existing advanced browser-seat code is retained unchanged. This work is not an audit or completion of all of that older preview code. It is not an authenticated cross-device job/records bridge.

### Website widget

Both the launcher and workspace can be moved. The workspace has its own drag handle and arrow-key movement; the launcher retains Alt + arrow movement. Both stay inside the viewport. Dragging cannot accidentally open the launcher. Escape closes the panel.

The new full-window link opens `/do/widget` for voice/sign-in and meeting tools. No microphone permission is added to arbitrary embedded iframes. The embed still only receives context explicitly supplied by its host integration. Context is not automatically copied to a newly opened full window.

### Mac source/build

Both dynamic and static ZIP generation now include `macos/resources/do-192.png` and `do-512.png`, fixing the missing-icon dependency in standalone source downloads. Resource blobs are byte-identical copies of the canonical public icons, kept inside the already-traced Mac source subtree so serverless downloads include them. The Mac build workflow checks this parity; refresh the copies when the canonical icons change. The build script accepts packaged resources or a full repository checkout, compiles the existing top-level entry as generated `main.swift`, and includes the microphone delegate extension.

The microphone usage description is present in the bundle. The delegate returns a prompt only for microphone use from the main frame on the exact trusted Assembl workspace/meeting pages. Other capture types/origins are denied. Nothing grants microphone, Accessibility, camera or screen-recording permission automatically.

A read-only GitHub Actions job builds arm64 and x86_64 development apps on macOS and uploads short-lived artifacts. A workflow file is not proof that compilation succeeded: inspect its completed jobs. Ad-hoc signatures are not Developer ID signatures or notarisation. No Gatekeeper disabling or quarantine removal is included.

### Phone PWA

The existing app keeps its `/do` identity, scope, canonical icons and `en-NZ` language. Its launch URL becomes `/do/widget` instead of the marketing page; a workspace shortcut is added. Existing meeting/Office/connection shortcuts remain. Top-level workspace links stay within the app/window; embedded workspace links open a full page for sign-in and media. TypeSafe is accessible from the same workspace navigation.

On iPhone use Safari → Share → Add to Home Screen; on supported Android browsers use Install app. This is a Home Screen web app, not an App Store binary or a floating overlay above other phone apps. Keep it open for the first voice/recording tests. Locked-screen/background capture has not been validated, and the current voice client deliberately ends capture when hidden.

## Activate and test

1. Use the deployment containing this commit. A preview code deployment has separate environment settings from production; static binary mirrors must be regenerated separately with `node scripts/package-do-downloads.mjs`.
2. In Vercel project `assemblnz-f0afd79d`, use the secure environment-variable settings. Do not paste keys into chat, source, screenshots or the browser extension. TypeSafe needs `TYPESAFE_API_KEY`, `TYPESAFE_ENABLED=true` and the authenticated Assembl UUID in `TYPESAFE_PILOT_USER_IDS`. The agent has not set any secrets.
3. Check the existing Gemini configuration before creating another key: `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`, plus `DO_GEMINI_LIVE_ENABLED=true`. This branch does not replace or expose that key.
4. To enable the existing meeting transcription path, enter the correct Deepgram key as `DEEPGRAM_API_KEY`, then redeploy the intended environment. A Deepgram account is not a Gemini or TypeSafe credential. Validate with a short authorised test recording before a real meeting.
5. Download the current extension from `/api/do/download?format=extension`, unzip and Load unpacked in Chrome/Edge. Reload after updates. Pin DO, select a harmless paragraph, open the toolbar panel and choose Bring selected text. Verify the exact editor content before approving any provider use.
6. From the full workspace, test Talk to DO with one short request, interruption, stop and microphone-off confirmation. Existing configuration requests natural New Zealand English, not a guaranteed accent. Test local names and Māori pronunciation with actual audio before making a quality claim.
7. Open Meeting DO. Confirm participants know about recording, test microphone or supported tab-audio capture, stop, play back and download locally. Only then separately approve transcription and draft notes. Confirm speaker labels, owners and dates against the recording. No follow-up is sent automatically.
8. For Mac source, unzip `/api/do/download?format=mac`, `cd macos`, then `bash build.sh ~/Desktop/do-mac-build`. Requires macOS and Xcode Command Line Tools. Open the built app and approve only the permissions you need. The uploaded Actions artifact, when its build is successful, is still development-only. A polished public installer remains a signing/notarisation task.
9. Install the PWA and confirm its icon opens the workspace. Test microphone stop, rotation, reload and foreground-only recording on the actual phone.

## Provider decision

Start with the existing Gemini 3.8 Live integration for conversational voice, with its standard/extended choices; do not introduce a second voice engine before proving the first. Google documents audio and visual inputs for this model. Keep meeting transcription on the existing Deepgram path; Nova-3 supports `en-NZ` and is a candidate to evaluate against the existing Nova-2 path, not a model upgrade silently made in this release. TypeSafe remains a focused text-decision/evidence layer, not the vision, speech or permissions engine.

## Proof and remaining gates

Executed in the isolated local source subset:
- 23 Node contract checks passed. Chrome APIs were mocked; no provider or account call.
- New JS and shell syntax checks; TypeScript transpilation checks passed. Not full-app typechecking.
- Chromium offline DOM fixtures at 1440px and 375px passed launcher clicks, panel/launcher drag, viewport bounds, keyboard movement and close controls. The iframe and Chrome APIs were fixtures. No installed-extension, native, authentication, provider, background-recording or cross-device proof is implied.

Full checkout pnpm typecheck/tests/lint/brand/macron/build, actual signed-in browser use, real microphone/audio/vision tests, completed macOS CI, Mac permissions and actual phone installation remain release gates until observed. Local browser URL navigation was blocked by the environment; offline fixture rendering is not equivalent to testing the deployed app.

Use existing DO preparation/approval/record primitives for subsequent work. Durable client/Assembl records, actual separately hosted Pursuit hub edits, cross-device identity, long-meeting recovery and approved sends/publications remain tracked in #1360. This release does not claim those actions.

## Primary references

- https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live
- https://developers.deepgram.com/docs/models-languages-overview
- https://developer.apple.com/documentation/webkit/wkuidelegate/webview(_:requestmediacapturepermissionfor:initiatedbyframe:type:decisionhandler:)
- Existing repo sources: `apps/do/shared/gemini-live.ts`, `app/api/do/live-token/route.ts`, `app/api/do/meetings/transcribe/route.ts`, `app/do/DoBuilder.tsx`, `apps/do/macos/DOCompanion.swift`, `apps/do/shared/distribution.ts`.
