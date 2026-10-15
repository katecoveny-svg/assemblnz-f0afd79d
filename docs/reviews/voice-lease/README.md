# Ongoing voice lease — local review, 15 October 2026 NZDT

This extends the local bounded policy commit93b384c29. It is default-off, not deployed, and does not repair the failed NZ acoustic acceptance.

## Implemented local contract

`POST /api/do/live-lease`, strict body in `apps/do/shared/voice-lease.ts`:

- `quote`: requestedSeconds300/600/900 + voiceRevision. Returns a 60-second owner-bound quote naming Google/model/voice, included funding, plan revision, reserved allowance and zero additional charge. No silent paid top-up. Quote contains no system prompt. New path shares voice only; no optional personal profile style.
- `start`: quoteId + unique requestId + consent:true. Durable CAS admission reserves the whole duration and freezes configuration before one provider token request. One active/issuing call per owner. Duplicate requests/quotes do not mint again. Returns leaseId, one-use token, model/voice/config, expiry in epoch milliseconds and sessionSeconds.
- `resume`: leaseId. Authenticates owner, active lease, funding revision and original expiry; returns reuseExistingToken:true. It never mints or extends a token and never accepts a browser-provided resumption handle.
- `revoke`: leaseId. Marks the logical lease revoked, including when admission flags are off or rate allowance is exhausted. Existing reservation is retained.

GET `/api/do/live-token` reports `leaseEnabled`. When true, `allowance` is the new account allowance or null if unavailable; no legacy fallback. Legacy token POST refuses admission in lease mode so two ledgers cannot double the allowance. `allowance` separates remainingSeconds/dailyReservedSecondsLimit and usageBasis from measuredCost:null.

`DO_VOICE_LEASE_ENABLED` defaults OFF. Enabling also requires existing provider enablement/key, the proposed service-only durable ledger, and explicit `DO_VOICE_LEASE_ACCOUNTS_JSON` allocations. Example shape only (not live configuration): `{"fictional-owner-uuid":{"enabled":true,"revision":"approved-plan-v1","dailySeconds":900}}`. Account limits are bounded by the global policy and by900 seconds; malformed allocation fails closed. This pilot adapter does not imply a paid subscription entitlement. A future consumer adapter must derive limits/revision from the authenticated owner's verified subscription and reviewed plan terms, not a client price or ChatGPT login.

`ledger-proposal.sql` is review SQL, not an applied migration. RLS has no browser policies; only service_role can read/write and invoke CAS. Four bounded CAS retries arbitrate concurrent server instances. No memory fallback. Callback is pure; token creation happens once outside CAS. Failed/ambiguous issuance retains its reservation pending reconciliation. Do not activate a fresh ledger mid-day on accounts with legacy usage: cut over at a New Zealand day boundary or migrate current reservations atomically. Table storage is bounded by a1MB row check and fails closed if exceeded; retention/compaction and production SQL verification are still release gates.

## Same-token renewal evidence and limitations

Google's official ephemeral-token docs explicitly permit session resumption within expireTime using the same token even with uses:1. Config includes sessionResumption:{} and contextWindowCompression slidingWindow. Client must forward these fields, preserve the token/handle only in memory, keep one socket and original absolute deadline, require server resume approval, and never replay sent turns or reacquire microphone after cancellation. Quote/longer duration must be visible in consent. The companion owner owns those UI/lifecycle changes.

This is logical revocation: a direct-browser Google token already issued cannot be remotely killed by this application ledger. A cooperating client stops immediately; an extracted token may remain usable until its original short expiry. Reserved allowance is never refunded on revoke, so this cannot issue free extra time. If enforceable immediate provider cut-off or trustworthy realtime currency limits are required, add a server-controlled provider relay or provider-supported revocation; do not claim today's direct connection enforces them.

Offline tests establish application constraints, not Google accepting the actual reconnect setup or audible continuity. A user-authorised provider test remains necessary before enabling.

## Trusted accounting interface

`usage.ts` accepts a TrustedUsageSource adapter that independently verifies provider export receipts or observes its own server/provider socket. Receipt IDs are idempotent; conflicting duplicates fail. Browser usageMetadata has no accounting endpoint and earns no refund. No trusted source adapter is configured yet for the browser-direct connection. Token counts and reserved seconds remain distinct; no dollars are inferred. A trusted ingestion adapter, rate-versioned modality breakdown, invoice reconciliation, owner/month/global currency controls and persistent retention are required before selling metered voice. The interface is implemented/tested; production metering is not.

## Commercial/BYO inspection

`apps/do/shared/runtime.ts` implements DO_RUNTIME=byo with a deployment OPENAI_API_KEY/AI_GATEWAY_API_KEY. This is not a per-person ChatGPT sign-in. Searched DO/API/billing code has no SIWC registration, OAuth grant flow or Responses-scope integration; external registration eligibility has not been verified.

`lib/billing/personal-do-plan.ts` and personal-do-access.ts already define a dedicated optional consumer plan, Stripe price, owner entitlement, NZD tax treatment, request limits and reserved provider-cost ceilings; no inherited business price defaults. Consumer text path requires server OpenAI and TypeSafe configuration. These are distinct from current Gemini voice admission. Source presence is not proof that consumer billing is enabled live.

OpenAI's current SIWC docs allow eligible plan-funded requests for participating apps/clients. Identity login alone is not inference authorisation; DO needs eligibility, registration and appropriate Responses scopes. Ordinary API-key billing remains separate. Neither route makes Google or HeyGen usage free. Do not market BYO ChatGPT until the actual DO integration is verified.

## Reviewable pricing illustrations — NOT activated prices

Google's current Gemini3.8 Live standard rates: audio input USD0.005 per audio minute, output USD0.018 per audio minute; text input USD0.75/million and output USD4.50/million tokens. For an illustrative connection carrying input for100% of its time and generated output for50%, audio-only cost is USD0.014 per connected minute. At100% output it is USD0.023. These are scenarios, not a maximum bill or measured cost; text/context/tool traffic and other services are extra.

| Illustrative personal package | Included voice/month | Audio scenario50% /100% output | Possible DO monthly price for discussion |
| --- | --- | --- | --- |
| Light | 60 min | USD0.84 /1.38 | NZD19 |
| Regular | 300 min | USD4.20 /6.90 | NZD39 |

Recommendation: one simple included plan first, with a clearly chosen allowance and hard stop; optional user-reviewed top-ups only after trusted metering exists. Keep the900-second daily technical cap during the pilot. A monthly voice budget needs an additional durable monthly counter; the present code only enforces daily reservations. Do not publish the illustrative prices until text/TypeSafe costs, hosting, support, payment fees, GST treatment and margin are costed. No FX assumption is embedded in code; use an approved current rate plus buffer in the eventual cost policy. ChatGPT-funded text can later be a separately explained option if DO qualifies; voice costs remain explicit.

Sources checked15 October2026 NZDT:
- https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens
- https://ai.google.dev/gemini-api/docs/live-api/session-management
- https://ai.google.dev/gemini-api/docs/pricing
- https://developers.openai.com/siwc/quickstart
- https://learn.chatgpt.com/docs/sign-in-with-chatgpt

## Verification at local handoff

57 focused tests across eight files pass; typecheck, scoped lint, brand and macron checks pass. Tests cover service-owned quote/start/resume/revoke, frozen one-use token constraints, account isolation, ambiguous issuance, cancellation, usage deduplication, CAS contention and legacy-route exclusion. All provider/database actions are mocked. Full combined app build/browser lifecycle verification, SQL proposal execution/permission tests, durable-store provisioning/retention and a user-authorised real Google resumption trial remain required before release. No push, schema application, account allocation, production enablement or paid call was performed.
