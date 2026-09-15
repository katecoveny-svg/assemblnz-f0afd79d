# DO × Gemini 3.8 Live

This branch adds an opt-in Gemini 3.8 Live Extended Thinking voice layer inside the DO workspace.

## What it does

- starts a browser microphone session using a short-lived Gemini Live token;
- uses `gemini-3.8-live-extended-thinking` by default;
- tracks `IN_PROGRESS` / `IDLE` interaction state so DO can say it is working while background work continues;
- declares DO preparation as a `NON_BLOCKING` tool;
- lets Gemini call the existing `/api/do/agents/compile` preparation endpoint using the current page context;
- plays Gemini's 24 kHz PCM audio back in the browser;
- leaves all consequential actions outside the live session.

## Safety boundary

Live DO is preparation-only in this first release. It may read page context and compile a DO agent/spec. It must not send, publish, purchase, submit, change accounts, spend money, or claim those actions happened. Any future consequential action must use the existing Assembl approval layer.

## Enablement

Set these server-side environment values:

```bash
DO_GEMINI_LIVE_ENABLED=true
GEMINI_API_KEY=<server-only Gemini API key>
```

`GOOGLE_GENERATIVE_AI_API_KEY` is accepted as a fallback key name.

With the feature flag absent or false, `/api/do/live-token` returns 503 and normal text DO continues to work.

## Smoke test

1. Open `/do` and open the DO workspace.
2. Select **Talk to DO** and allow microphone access.
3. Ask: “Make me a DO agent that turns this page into a concise pursuit brief.”
4. Confirm DO speaks a progress update while `interactionStatus` is `IN_PROGRESS`.
5. Confirm the `compile_do_agent` tool calls `/api/do/agents/compile` and returns preparation only.
6. Interrupt the model while it is speaking and confirm normal barge-in behaviour.
7. End the voice session and confirm microphone tracks and audio contexts are released.
8. Disable `DO_GEMINI_LIVE_ENABLED` and confirm text DO still works with no regression.

## Before production enablement

- verify the ephemeral-token endpoint against the production Gemini project;
- test NZ accents, addresses, company names and te reo Maori terms;
- add usage/cost telemetry and session-rate limits;
- add explicit UI disclosure/consent for microphone/audio handling;
- keep consequential tools out of this Live toolset until they are routed through Assembl approval/evidence controls.

Reference implementation follows Google's Gemini Live guidance for Extended Thinking: `interactionStatus` for lifecycle and `NON_BLOCKING` function declarations for asynchronous tools.
