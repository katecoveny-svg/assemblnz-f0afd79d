# DO product focus / 18 September 2026

## User goal
Simplify Meeting DO and the actual portable DO workspace. Remove distracting to-do/status panels from the primary flow; make the product visually composed, useful and alive. This is not a redesign of the public Assembl, Pursuit or DO marketing pages.

## Implemented experience
- Meeting: a single responsive recorder; explicit recording consent; separate audio-to-transcript and transcript-to-notes permission; readable notes, transcript and source/receipt views. Install and saved tasks live under More. No duplicate phone recorder or empty status columns.
- Workspace: compact task selector and source editor; Write / Talk / Look / Meet entry points. Existing voice, vision, text preparation and custom builder reused. Original task and receipt data is not deleted. Advanced builder remains accessible deliberately, not the first thing everyone sees.
- Shared product frame: warm paper, plum, rose, Instrument Sans and IBM Plex Mono evidence labels. Canonical DO mark. Recording activity ring, actual elapsed time, small state transitions and preparation movement; no invented sound-level waveform, completion percentage or forced waiting. Reduced motion disables movement.

## Authority and data
No API keys, provider models, OAuth settings, quota rules or backend routes are changed. Opening a tool does not start it. Sharing permissions remain separate. Source edits invalidate prepared notes; output edits invalidate review. Downloads are local copies, not client-record saves. Saved task boards remain reachable in More.

The existing 10-minute recording/4 MB upload limits remain visible and unchanged. This work does not solve hour-long recovery, phone background capture or universal device identity.

## Review
The guarded apply/finish scripts change only inspected source, then the review workflow commits those generated files to the isolated feature branch. The scripts fail rather than overwrite unrecognised concurrent edits. Runtime tests use the actual Next/React UI, a fake Chromium microphone and substituted authentication/transcription/preparation responses. They are not a live Deepgram or model evaluation.

The new shared presentation creates a reusable product frame and uses existing recording, parsing, preparation, vision, voice, local drafts and handoff capabilities. No second agent runtime is introduced.

## Release gates
Run full typecheck, focused lint, production build and actual-component browser tests at 375px and desktop. Review screenshots. Then test recording, playback, live transcription and signing in on the user's actual devices. Branch/preview changes are not a production release until merged and deployed. Revert the focused UI commit to restore the previous presentation; there is no data migration.
