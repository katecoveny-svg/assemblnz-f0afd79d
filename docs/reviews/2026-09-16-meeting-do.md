# Meeting DO and Gmail — first implementation

## Implemented in source

- `/do/meetings`: local microphone or explicitly shared meeting-audio recording after participant-permission acknowledgement, explicit Stop, playback/download, automatic 10-minute / approximately 3.5 MB stop, track release on navigation/unmount and late-permission cancellation.
- Separate sharing consent. Transcription requires a signed-in DO owner and configured `DEEPGRAM_API_KEY`, reusing the provider/API pattern of existing Hui transcription. No database audio write. Provider retention is governed by its account terms; do not claim that a provider retains nothing.
- Audio uploads are bounded at 4 MB, including chunked requests, before multipart parsing. Same-origin, owner and rate checks precede provider invocation. No provider response body or credentials are logged.
- Reviewed text goes through existing DO preparation with source/model receipt. Task owners/deadlines must come from source; proposed specialist assignments remain drafts.
- Reviewed handoff opens existing DO via same-tab session storage with an opaque URL identifier. It does not send emails, assign tasks to humans or start unattended workers.
- Existing browser extension links to Meeting DO; it already works alongside Gmail on explicit toolbar/selection interaction.
- `apps/do/gmail-addon`: Apps Script homepage card launcher and manifest for private developer installation. No Gmail message-reading/sending scopes. Not installed or Marketplace-published.

- Production page rendered in the in-app browser; permission and preparation controls start disabled. Mobile layout was inspected after settling. No microphone/system recording was activated by the agent.

## Important unfinished requirements

- The microphone mode hears microphone input. Shared-audio mode mixes a browser-approved audio stream with the microphone and refuses to start if no shared audio track is provided. It does not record video. Native Mac system-audio capture and full meeting length need a separate durable chunk/transcription implementation.
- No real participant audio was recorded, uploaded or transcribed during development. Provider credentials/billing have not been verified by this change.
- Task extraction is a model-prepared editable brief, not yet a structured persistent task board. Bulk approve/delegate, durable receipts and real Office state must use the shared job repository when wired.
- Notes/audio are session-local; download before closing. No false cross-device memory promise.
- Gmail native installation requires Apps Script project access, test installation and user authorisation. Public availability needs applicable Google review. Customer Gmail connector setup remains separate.
- The wider updated goal (UX audit, native companion installation, active voice tools and real Gmail access) remains open.

## Validation

- Typecheck and changed-source ESLint pass.
- Ten focused tests pass across transcription boundary and existing handoff expiration/size logic. Provider response is synthetic; no live provider test claimed.
- Production build passes for initial implementation; the final bounded-upload and shared-audio changes also pass the production build.

References: https://developers.google.com/workspace/add-ons/gmail ; https://developers.google.com/workspace/add-ons/how-tos/testing-workspace-addons
