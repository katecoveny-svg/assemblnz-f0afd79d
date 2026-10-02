# DO New Zealand voice options — audit 2 October 2026 NZ

## Smallest useful no-provider change

Read-aloud now lists only browser-reported local English voices, shows the actual name/locale, and exposes en-NZ choices when the device supplies them. A locale tag is not an accent or pronunciation certification. The UI says NZ locale is unverified; it never relabels AU/UK/US as NZ. Explicit selection must still be available at playback: disappearance fails closed instead of substituting another accent. Automatic English remains an explicit default and may use a non-NZ local voice.

The selected voice URI alone is saved in this browser's localStorage, shared by read-aloud controls; no text, audio, owner identity or model permission is saved. This is a device preference, not the account's Gemini call voice. Storage failure leaves the choice usable in the current control. Reload/other-device persistence requires that device to report the same installed voice. Voices load asynchronously via voiceschanged. Playback/preview requires an explicit click. No microphone, remote synthesis, transcription or speech recognition starts. Ask DO's edited draft and existing Personal DO output reuse the control; no visual brand/style changes.

## Current surfaces and boundaries

- Read-aloud: SpeechSynthesis, localService true only. Selected voice and its locale are used explicitly; no remote default. Availability is device/browser-specific. Mac `say -v '?'` inventory in this audit reported no en_NZ voice; this is not a browser inventory or listening test.
- Dictation: existing shared Web Speech microphone components request en-NZ recognition. Recognition locale affects input transcription, not the reply's accent. DO meeting recording/transcription is a separate existing adapter. No microphone test performed.
- Gemini two-way call: DoGeminiLive/live-token, Kore/Aoede/Puck/Charon; existing profile voice_name persists that provider voice. Existing model prompt requests natural NZ English but expressly does not guarantee accent. Existing provider keys/feature gates/owner session limits remain unchanged. Read-only production /api/do/live-token GET reported enabled=true, configured=true, signedIn=false, dailyLimit=3, sessionSeconds=300 and model=gemini-3.8-live. These flags do not prove a supported model, working audio, accent or licence/billing entitlement. No token issuance or live call performed.
- Local OpenAI realtime: /api/do/live remains development/loopback only; microphone/SDP/provider transport is separate from Astra text drafting. No production enablement or model substitution.
- ElevenLabs platform/phone voices: separate existing shared platform/telephony infrastructure and configurable/default voice IDs. Repo comments about NZ English are not evidence of a licensed, heard NZ-accent voice. Not used or changed here; no phone call, grant or subscription.
- Azure: official catalog lists en-NZ-MollyNeural and en-NZ-MitchellNeural. No Azure DO adapter/configuration/licence established in this audit. Adding it requires cost/terms/data-path consent, approved configuration and bounded usage controls; not included.
- OpenAI TTS: official docs support prompting accent with gpt-4o-mini-tts, but the named built-in voice catalog is not NZ-locale certification. Gemini native audio also allows voice selection. Neither a prompt nor a catalog name constitutes hearing proof.

## Pronunciation acceptance, still pending

Preview uses the requested fixed fictional text: “Kia ora, your appointment in Whangārei is at half past two. Take the Northern Motorway from Auckland.” Supplemental listener evaluation should include Wellington, Taupō, Ōtaki, Tauranga, Māori, whānau, dates and times. Code preserves macrons; test doubles verify text/voice selection only, not sound. No synthesis/listening was performed. Before labeling any option a verified NZ accent, a NZ listener must hear it; Māori pronunciation needs an appropriate competent reviewer, not a generic model score. Record device/browser or provider/model/voice ID, sample/version, reviewer/date, natural NZ vowels/cadence, place names, macron vowels, numbers and intelligibility. Failures remain visible; do not silently respell names or remove macrons. Avoid sacred forms, personal names without permission, and cloned identifiable voices.

## Official references checked 2 October 2026 NZ

- Microsoft Azure catalog, en-NZ Molly/Mitchell: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts
- OpenAI TTS accent controls/catalog/disclosure: https://developers.openai.com/api/docs/guides/text-to-speech
- Gemini native audio voice selection: https://ai.google.dev/gemini-api/docs/live-api/capabilities
- Browser local/remote service metadata: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService

No new voice licence is implied by the code. Device voices remain subject to existing OS/browser terms. Cloud commercial/licensing/configuration proof and paid evaluation require a separate approved step. No credentials/settings/grants/SQL/consumer flags changed; no live or paid provider call.

## Follow-up inventory and Gemini evidence

Installed Google Chrome was queried in an isolated profile without accessing user tabs, permissions or audio. Headless inventory is reported separately from an actual interactive user session; empty inventory does not prove the user's Chrome cannot enumerate voices. System `say` inventory and browser inventory are preserved in the review bundle. No en-NZ option may be labelled a heard NZ accent without listening evidence.

Google's current Live guide documents gemini-3.8-live, prebuilt voice configuration and language steering via system instructions; native audio does not accept an explicit language code. The TTS guide now documents the extended Voice Library with language_code, region_code and accent filters, but no authenticated list query or provider call was made here. A possible en-NZ filter is not evidence that an NZ voice exists or works in Live; TTS and Live voice compatibility differ. Before changing call options, resolve an actual supported voice, verify the exact Live contract and bounded cost/consent path, then obtain hearing proof. No voice design/replication or Azure integration is proposed.

Official pages: https://ai.google.dev/gemini-api/docs/live-api/capabilities and https://ai.google.dev/gemini-api/docs/speech-generation .
