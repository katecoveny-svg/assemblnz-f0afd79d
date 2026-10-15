# DO voice readiness — 15 October 2026 NZDT

The later local lease implementation and remaining release gates are recorded in [ongoing voice lease review](reviews/voice-lease/README.md); acoustic acceptance below remains failed.

## Verified status

Production Vercel `dpl_5iYGiq7yKkwsCEcyKM4jnyJCrH4Q` was READY at `20ee05f4aee57a155a5cc687f4521217e1d975e2`. Voice choices PR1533 merged as `d5eafa88d52d959660cc01e09544e96375f0846f`. Source uses Google Gemini `gemini-3.8-live` (optional extended-thinking model), saved Kore/Aoede/Puck/Charon, and server-constrained `do-nz-en-v2` instructions. Kore is default; the user's actual selected voice was not independently observed. PCM16k input and the reviewed call lifecycle remain unchanged by this patch.

The token constrains the voice and system instructions; the client forwards both in setup. The prompt explicitly requests consistent natural NZ accent, cadence and pronunciation across short replies, lists and tool results. It is not merely NZ vocabulary. Microphone capture already requests echoCancellation and noiseSuppression. These are browser requests, not a guarantee that speech from another assistant played on speakers is excluded.

**NZ acoustic acceptance: FAILED, user-reported.** In a manually started call the user heard mid-call switching between NZ and American delivery. Another assistant speaking from the same computer was heard by DO, contaminating the trial. No audio recording was supplied. We cannot determine whether interference caused the drift. Prompt presence and mocked lifecycle tests do not establish accent quality. Do not mark this fixed or add more prompt adjectives as purported proof.

## Smallest controlled listening test

User chooses/reviews one saved voice, records its name in a private test note, and personally starts a call. Other assistants remain silent; use headphones and one microphone. Do not record or upload audio automatically.

Ask: “Tell me in two sentences how you would help me plan tomorrow. Then read: six, seven, ten, twenty; Wellington, Hamilton, Auckland.” Follow with “Now make that a short list.” Do not remind DO to use an accent: the server instruction should suffice. Listen to the first answer and changed format for stable, natural NZ vowels, rhythm and voice identity. End manually. Any American drift fails this short acceptance test. Passing it is limited evidence, not an entire-call guarantee; the same voice still needs a longer turn-taking/interruptions/tool-summary trial. Do not spend the daily budget on repeated automatic trials.

If controlled tests still drift, native Gemini audio is unsuitable for a strict NZ identity requirement. Evaluate a separate speech path: streaming speech recognition → existing reasoning/tools → a single independently auditioned NZ TTS voice → interruptible audio queue. Keep one conversation and explicit provider consent; cancel queued speech on interruption and preserve owner/reset boundaries. Compare latency and whole-conversation NZ consistency before selecting a provider. No HeyGen switch, cloning, upload, new account grant or purchase is authorised by this document. A provider's voice description is not acoustic proof.

## Pilot limit origin and local preparation

Three daily five-minute calls were DO product/spend gates, not Google's provider limit. `voice-allowance.ts` reserves unique per-owner/day slots in the existing database; midnight uses Pacific/Auckland. `live-token` expires the constrained one-use token after 300 seconds; the client ends capture at that deadline.

This local patch replaces the hardcoded three with operator-only `DO_VOICE_DAILY_SECONDS`, using whole 300-second reservations. Default stays 900; no live environment changed. Invalid/zero/unlimited/partial-window values fail closed. Readiness reports `dailyReservedSecondsLimit` and `usageBasis: reserved_connection_seconds`, alongside the existing call count. Existing slots are retained across policy changes. A reduction with previously used higher slots closes admission for that day to avoid creating quota holes under concurrent requests. No schema or provider change. This is a configurable interim admission policy, **not continuous calling or a monetary usage meter**. A short ended call still reserves its full window; existing token-creation failures release only their own reservation.

The upper parser bound of 86400 seconds is a technical finite cap, not an approved allowance. Budget increases require a concrete operator spend decision. Time is only a conservative admission bound; Google billing is not proven proportional to those reserved seconds. For broader release choose who pays, per-account daily/monthly currency ceiling, warning/stop behaviour, and provider-level protection; do not label a client-reported counter an enforceable billing cap.

## Renewal contract for companion owner — proposal, not wired

Google documents context compression, session-resumption handles and GoAway. Without compression audio sessions last up to 15 minutes; connections around 10 minutes need resumption. These are distinct from DO's 300-second token. Current DO has no renewal or authoritative usage ledger.

Before automatic reconnect, introduce a server-owned logical-call lease binding authenticated owner, model, saved voice/profile revision and original consent, unique budget reservation, absolute paid deadline and revocation state. A resume must preserve frozen config and original deadline; never reserve/refund based on browser-reported usage or reset the clock. The next paid window needs new server admission and reviewed continuation until an expanded policy is approved. Handle one-use-token compatibility explicitly; do not assume a resumption handle can be supplied arbitrarily to today's constrained token endpoint.

Resume handles remain session-only, short-lived, never logged or stored in localStorage. Owner change, explicit End, minimise/hidden/offline revoke the lease and any pending resume. No microphone reacquisition after these events. Only one socket and capture pipeline may be active; late token/GoAway/results after cancellation are ignored. UI separates elapsed connection time, reserved allowance and provider-reported tokens (or unavailable); only a trusted server/provider ledger may authorize billing credits. Test expiration, stolen/old owner handle, replay, duplicate GoAway, failed renewal, deadline crossing, simultaneous tabs, and interruption before wiring live renewal.

Companion task owns DoGeminiLive.tsx, shared conversation and extension integration. This patch does not touch those files.

## Evidence and limits

40 repository tests pass; typecheck, scoped lint, brand guard and macron check pass (macron script invoked with node --import tsx after the CLI IPC launcher was blocked). Local tests exercise policy parsing, unchanged default, concurrent reservations, owner isolation, policy reduction, invalid configuration and token boundaries with fictional fixtures. No real microphone/provider invocation, environment change, database migration, publication or deployment performed. No new acoustic pass. Full app build and combined companion integration remain release gates.

Sources checked 15 October NZDT:
- https://ai.google.dev/gemini-api/docs/live-api/session-management
- https://ai.google.dev/gemini-api/docs/live-api/capabilities
- https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1533
