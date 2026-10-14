# Personal DO: Astra + TypeSafe conversation

Status: implemented for review; live hosted authentication and provider proof are separate release gates.

## Scope and shared primitives

The primary **Ask DO** conversation on `/do/personal` uses GPT-6 Astra (`gpt-6-astra`) through OpenAI Responses, with `medium` reasoning effort, preceded by a real TypeSafe bounded request check. It produces an editable draft or a focused question. The user does not pick a category.

This **extends** the existing TypeSafe transport and choice validator, existing DO owner/origin/body/rate controls, and OpenAI provider setup. It does not create another action executor. The OpenAI Responses route is explicitly fixed to OpenAI so named-provider consent cannot silently route through an alternate base URL.

The exact scope matters:

- Ask DO: Astra-only generation + TypeSafe request classification. No fallback model or mock answer on provider failure.
- Local checklist examples: deterministic local processing, no model call.
- Existing checklist “Prepare draft” and saved responsibility/daily drafts: unchanged configured-provider preparation service. These are **not** claimed to run on Astra or TypeSafe.
- Photo: manual transcription is local; the optional consented `DoVision` reading route uses its existing configured OpenAI/Anthropic/Google vision provider, not the new Astra + TypeSafe conversation.
- Live calls: unchanged Google/Gemini voice runtime, with separate call consent. Astra does not provide the real-time voice backend in this change.

## Authority and data

The first primary action reveals named-provider consent; the second sends only after consent. Editing message, notes, saved-style selection or draft invalidates consent. Each request contains the current message, optional notes and at most the last user/assistant exchange. Saved style is optional and fetched for the verified owner server-side; it is shared only with OpenAI, not TypeSafe. Earlier assistant output and all source/style text are untrusted context, not instructions or permission.

The TypeSafe rubric uses the documented existing `model`, `state`, `questions` protocol and `choice` primitive, with `prepare`, `clarify`, `unsupported` choices. The existing confidence threshold forces a question when confidence is too low. Unsupported requests do not call OpenAI, and the response explicitly reports no generation. A confidence score is neither approval nor factual verification.

The OpenAI call has no tools, no fallback, no retries, bounded output, a timeout and cancellation. Responses storage is disabled (`store: false`); this is not a guarantee about all provider retention. Private reasoning summaries are not requested or returned. The result contains a short user-facing rationale, exact excerpts from user-supplied text, open questions and an editable draft. Code validates schema, exact source quotations, the next-step type and actual model provenance. A request for clarification cannot produce a draft.

The installed OpenAI SDK's model-capability table predates GPT-6. This integration explicitly sets its supported `forceReasoning` option; without it the SDK would silently discard reasoning effort. The wire-format test keeps the real SDK/router and intercepts only fetch, asserting `reasoning.effort: "medium"`, strict JSON output, developer instructions and the fixed OpenAI Responses URL. This proves request serialization, not live model access.

No sending, booking, purchasing, account changes, scheduling or background monitoring happens through this endpoint. The conversation is not saved to an Assembl account. Owner-keyed UI reset aborts in-flight work and removes prior-owner text. Guest draft export is composed with the existing leave guard. Provider and hosting retention policies still apply.

## Server boundary and availability

`GET /api/do/personal/assistant` makes no provider call. It returns `signedIn`, `ready`, `reason`, `message`, `model: "gpt-6-astra"` and `externalActions: false`. Anonymous callers get 401 and no configuration details. `ready` means configured, not live provider success.

`POST /api/do/personal/assistant` requires same origin, a verified non-anonymous owner, strict bounded JSON, explicit request consent, and the existing TypeSafe enabled/key/owner-allowlist gates. It uses a per-owner/IP six-per-minute backstop plus the existing shared chat rate limiter. The shared limiter is fail-open during storage faults, so this is not a durable spending guarantee; keep the TypeSafe pilot allowlist bounded.

Configuration reuses server-only `OPENAI_API_KEY`, `TYPESAFE_API_KEY`, `TYPESAFE_ENABLED`, `TYPESAFE_PILOT_USER_IDS`, optional `TYPESAFE_MODEL` (existing default `jev-1.13.0`) and `TYPESAFE_REVIEW_THRESHOLD` (existing default `0.75`). No credential was created, retrieved, printed, committed or changed for this implementation. No production database or user data is required by the tests.

## Proof and remaining gates

- Unit/HTTP tests cover consent, strict input, source quoting, clarification policy, actual model identity, provider failure redaction, missing configuration, owner/allowlist/origin/rate gates, saved-style scope and cancellation.
- `apps/do/personal/assistant-openai-wire.test.ts` proves actual installed-SDK serialization with a fictional intercepted response and no network call.
- Existing TypeSafe tests still exercise its original vendor/decision/route contract; the wrapper explicitly selects TAP for consistent modern Node output.
- The UI proof script uses fictional intercepted responses only. This verifies interaction, not provider intelligence or credentials.
- No usable OpenAI key was present locally; no live OpenAI or TypeSafe call was made here.

Before claiming the integration is live, use an authorised signed-in preview account to verify the harmless GET, then explicitly consent to a fictional bounded request. Check successful TypeSafe model provenance, actual Astra model ID, result/edit/cancel behaviour and redacted failure states. A screenshot or a configured GET alone is not provider proof.

Official contracts consulted:

- https://developers.openai.com/api/docs/models/gpt-6-astra
- https://ai-sdk.dev/providers/ai-sdk-providers/openai
- https://docs.typesafe.ai/api
- https://docs.typesafe.ai/primitives/choice

Rollback: remove the primary conversation mount or disable the existing TypeSafe pilot flag. No schema, stored user record or external action must be reversed.
