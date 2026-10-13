# DO live call voice choice — review implementation, 13 October 2026

## Existing configuration verified

The current Gemini Live model is `gemini-3.8-live`, with `gemini-3.8-live-extended-thinking` as the optional extended mode. Kore remains the default. The existing code and `20260930031622_do_personal_profiles.sql` already allow Kore, Aoede, Puck and Charon. Account preferences already live in `do_personal_profiles.voice_name`; no migration, new table or local preference store is introduced.

Google's current [Live API guide](https://ai.google.dev/gemini-api/docs/live-api/capabilities#change-voice-and-language) supports the prebuilt TTS voices. Its [voice descriptions](https://ai.google.dev/gemini-api/docs/speech-generation#voice-options) are Kore: firm, Aoede: breezy, Puck: upbeat, Charon: informative. Google's [voice catalogue](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts#voice_options) labels Kore and Aoede female, Puck and Charon male. These labels describe the provider's voices, not verified NZ accent or te reo Māori fluency. No paid audition was run.

## Change and authority

Extends the existing personal profile and Gemini call primitives. One shared curated allowlist feeds the existing strict profile and token schemas. The call panel has a small “Choose call voice” dialog using the existing profile persistence and storage consent. The normal settings screen uses the same descriptions. The token server reads the authenticated owner's saved voice for every call, including calls which do not share the rest of the profile. Unknown IDs/configuration are rejected, missing storage fails closed, and a confirmed absent profile uses Kore.

GET readiness includes the selected voice and an opaque review fingerprint of the owner, profile revision and voice. POST re-authenticates, reloads the preference, and rejects a stale fingerprint or voice before reserving quota. The fingerprint is not a credential. Full profile style is still shared only under existing explicit profile consent and revision checks. An old open client must refresh before it can call after this API change.

A call snapshots its reviewed configuration. Reads during an active call do not replace its voice; ending and restarting reloads the latest saved preference and needs fresh microphone consent. Personal DO no longer remounts an active call for ordinary profile edits; verified owner changes still remount/clean up, and explicitly forgetting preferences still ends their active call.

Unchanged: NZ style instructions, PCM16 at 16 kHz input, model defaults, five-minute/three-daily limits, server-constrained one-use tokens, tools, auth, origin checks, provider grants and media lifecycle. This is not Voice Studio, voice cloning, avatar work or dictation navigation.

## Integration with desktop UI owner

No broad navigation, widget shell, Mac Swift or companion-entry hook changes. The integration is inside `DoGeminiLive`, the reused `PersonalDoSettings` dialog, and the single Personal DO call key. Mac `DOCompanion.swift` loads `/do/widget?nativeReview=1`; that shared hosted call component uses the same server preference. Browser parity is verified; installed native-device behavior is not claimed.

## Proof and review limits

- Focused server/profile/audio contracts: 50 passing tests.
- Wider affected shared/personal/API tests: 1,124 passing, two existing skips.
- Typecheck and changed-file lint pass; brand and macron guards pass.
- Browser fixture proof: account saving, consent, persistence, default and male labels, active-call stability, next-call restart, widget and Personal DO parity, 1440/375 px overflow and screenshots. `scripts/review-do-voice-choice.cjs`; evidence in `output/playwright/voice-choice/`.
- Existing mocked lifecycle browser suite passes, including cancellation, timeouts, denied media, restart and account-switch cleanup. Evidence in `output/playwright/voice-lifecycle/`.
- All browser accounts, media, storage writes and provider sockets are fictional. No real microphone, paid generation, provider grant, deployment or merge.
- Full repository lint reports 1,411 issues (1,169 errors, 242 warnings) outside the changed code. It is not green.
- Production build and exact-head CI results are recorded in the PR. An initial local build failed with ENOSPC before application compilation; this is not a product failure or a passing build.

Rollback: revert this PR. There is no schema/data migration. Existing saved voice values are unchanged and compatible with the previous allowlist.
