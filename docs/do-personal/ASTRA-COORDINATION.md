# DO text preparation boundary — 2 October 2026 NZ

This review branch extends existing DO preparation and consumer admission. It does not activate consumer access, create prices, configure credentials, apply SQL or prove a live provider/device session.

## Shared contract

`apps/do/shared/reasoning-server.ts` exports `runDoTextReasoning(input, authenticatedOwnerId, signal?, requestId?, generationStyle?)`. Input uses the existing strict Personal DO message/context/history contract. Server routes supply owner identity; posted owner/model/tool fields cannot grant authority. Request consent, configured providers, enabled verified plan and durable owner entitlement/concurrency/day/month/global cost admission precede TypeSafe and OpenAI transmission. Missing configuration/storage/budget fails closed. Retries are zero for Astra; TypeSafe's existing bounded transport retry is covered by the configured envelope. The actual Astra ID and complete structured output must validate; no model ladder/fallback exists. Results are inert drafts/questions requiring review; no tools or execution.

The original explicitly allowlisted Personal DO path is retained as `runPrivatePersonalDoReasoning`, guarded by the existing allowlist. It is not general signed-in access, scheduled admission or a consumer budget/invoice cap. This exception preserves the already verified own-account path; wider rollout still needs a reviewed durable budget and access configuration. The old signed-in `reserveDoTrial` unlimited bypass is removed. Remaining legacy search/vision adapters retain their checked network allowance pending their separate provider/cost migration.

## Migrated entrypoints

- `/api/do/prepare`: authenticated model preparation with `do-openai-typesafe-v1` consent; exact extraction is model-free and reserves no provider usage. Original source stays in the editor if a reviewed excerpt exceeds the bounded envelope.
- Life Admin preparation: named renewed one-request consent, server-owned profile/style and authenticated scope; consented saved style goes separately to Astra only, never TypeSafe classifier context; deterministic checklists remain local/model-free.
- Meeting notes: reviewed transcript plus named OpenAI/TypeSafe permission; recording/transcription remain separate adapters.
- Family digest: explicitly selected Gmail senders/range and named permission; bounded email context, exact per-source quote validation, actual model/TypeSafe provenance. No replies/payments/calendar actions. Gmail connection/auth remains its existing separate path.
- Decision preparation: both original TypeSafe consent and renewed generation-provider version; durable admission before the original claim/request check, then independent bounded generation admission. These conservatively count two reservations when generation follows; do not advertise them as one flat-price request. The claim check is not verification of generated work.
- Public Ask Assembl: the hardcoded FAQ/simulated typing is replaced with canonical DO identity and the existing real Personal DO drafting controls. Public company pages show Ask DO; customer/private/product/auth/admin isolation is retained. No current page text, client record, inbox or navigation context is sent. Only explicitly typed text goes after confirmation. Conversation state resets across account and public route changes; token refresh alone does not reset it. Stop/review/copy and unavailable/sign-in states use the existing shared control.

## Old background permissions

The current responsibility schema has no durable named-provider grant version. Previous disclosure explicitly excluded TypeSafe. Background preparation is therefore unavailable, old runs are skipped before claiming/reading/transmitting, new saves cannot grant background permission, and existing pause/delete/review remain unchanged. Cron explicitly skips disabled Personal preparation, reports that disabled state, and preserves independent enquiry follow-ups and heartbeat. Active cards show permission renewal needed. No migration was proposed or applied here. The independent provider-memory stage must supply a reviewed durable consent adapter/revision/expiry/revocation contract before background work can resume; never infer renewal from active status, a still-valid old expiry, or client-posted markers.

## Explicit follow-ups

Not unified by this branch: live/voice conversation (`live-runner`, live session transports), voice models, transcription, image generation/vision, Bills search/bill reading and older AgentSpec runtime refinement. They need adapter-specific consent, model/API compatibility, entitlement and cost proof; this branch does not silently change their model strings or claim they now use Astra/TypeSafe. Retired routes stay retired; unrelated fleet routing remains unchanged. Availability/continuity/coordination deterministic modules and scoped memory proposals do not automatically gain provider or external-action authority.

## Release gates

No sale price, FX or public consumer activation is approved by this change. Shared generation remains unavailable until the explicit verified plan, entitlement and usage store are configured through a separately reviewed release. No database/provider/paid live calls were made. Full Next build/browser CI and exact preview are required before merge. Isolated component fixtures are useful interaction proof, not live auth, production font or private hub proof. Hub variants remain owned by the hub task.

## NZ voice release requirement

Kate requires NZ voice to be included. Text answers preserve natural NZ English, local terms and Māori macrons now. Speech transport remains separate from Astra/TypeSafe text reasoning. Before releasing an audio choice, identify the actual available NZ-accent voices from supported providers and evaluate pronunciation with NZ speakers: NZ place names, personal names supplied for testing, te reo Māori/macrons, everyday local phrasing and numbers/dates. Include a verified NZ option in the released experience and label its actual provider/voice accurately. Current voices have not been proved NZ-specific; do not imply the text locale establishes the audio accent. No voice replacement, new keys, microphone test, real speech-provider call or automatic background audio is part of this branch.
