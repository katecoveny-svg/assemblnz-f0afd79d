# DO reference journeys: source audit and reliability candidate

19 October 2026. Audited main: `7ab6a4353c5b90bc885ebb7a7f221fe7958e15dd`.
Branch: `codex/do-grounded-travel-retrieval`, isolated clone. PR1615's checkout was not used.
This is supporting evidence for the existing [master roadmap](../do/MASTER-ROADMAP-20261013.md), not another product canon.

## Scope and authority

The Instinct anecdote is a reference journey, not verified competitor capability or permission to access another person's data. Kate's clarification prioritises making existing paths dependable over adding integrations. This candidate extends existing mail review, travel preparation and source-selection primitives. No OAuth grant, credential, database, production environment, booking, payment, external message or agent pairing changes are included. No merge/deploy authority. Studio account access is separate.

Loaded root AGENTS/START_HERE, context manifest/router, CURRENT, assembl-context, master roadmap and Factory/PRIMITIVES. The two `.agents/skills` entries are frontend design workflows; this is a source/contract reliability change, not a visual redesign. Objective: preserve source provenance and reject mismatched/stale review results. Done means tested contracts, an explicit gap register and a draft PR, not live journey completion.

## Capability matrix

“Implemented” means source exists at the audited SHA; it does not mean activated or live-verified. No private account/provider/device verification was performed in this audit.

| Reference journey | Current source evidence | Available / mocked / blocked |
|---|---|---|
| Voice-note request and text request | `app/do/DoGeminiLive.tsx`, `apps/do/shared/gemini-live.ts`, `apps/do/mail/voice-handoff.ts`, `app/do/personal/PersonalDo.tsx`, `app/do/mail/MailWorkspace.tsx` | Live-call UI and reviewed voice→mail handoff implemented. Voice stops and clears consent before opening the same mail review used by typed/dictated search. This is not arbitrary audio-message ingestion or private-mail tool parity inside the models. Synthetic audio tests mock the provider. |
| Retrieve flight email | `apps/do/mail/{contract,server,capability,review}.ts`, `app/api/do/mail/route.ts` | Bounded Gmail literal search (7/14/30 days, at most 10 previews, at most 3 full messages), explicit account/consent, owner/grant rechecks and source keys implemented. Default-off activation; live grants/access unverified. Outlook deliberately unavailable. No attachment reads or automatic itinerary extraction. A matching email is not proof of current flight status. |
| Store-credit or accommodation entry codes | Same mail paths; `apps/do/services/owner.ts` | **Sensitive retrieval blocked as a release claim.** Ordinary mail previews may contain secrets in headers/snippets/body; no verified recent step-up, safe-display/reveal or per-secret policy exists. Do not activate/code-enable this journey or feed source text to either model. General consent and keyword detection cannot substitute for step-up. This candidate removes automatic header/body copying into task drafts; it is not universal secret detection. |
| Same authorized tools for voice and text | `apps/do/shared/reasoning-server.ts`, `apps/do/shared/gemini-live.ts`, `app/do/DoGeminiLive.tsx` | Text reasoning explicitly has no arbitrary tools; voice declares `compile_do_agent` and `read_public_nz_evidence`. Shared mail-review destination exists, but neither conversational model has a private inbox/trip retrieval tool. The old roadmap's “only compile” voice description is dated: bounded public-NZ evidence is now present. No private tool was added to bypass consent. |
| Return flights versus two one-ways plus stay | `lib/do/travel/{planner,provider-contract,provider-selection}.ts`, `app/do/travel/TravelPlanner.tsx` | Manual whole-party return-flight + accommodation comparison exists; user observations expire after 30 minutes. Current flight search input requires depart and return dates. No complete two-one-way comparison contract, disruption/protection comparison or live all-in price claim. Provider-shaped fixtures are not purchased inventory. |
| Live flight/accommodation providers | `app/api/do/travel/search/route.ts`, `lib/do/travel/booking-preparation.ts`, `supabase/functions/live-travel/` | Web POST always refuses with `owner_search_authority_unverified`; GET metadata is not search entitlement. Duffel adapter code is not live permission. Booking.com plan is explicitly an internal shape, with `canSearch:false`, `canBook:false`. No Wise, Uber booking or airline integration invented. |
| Book after explicit payment approval | Same travel paths; `apps/do/shared/policy.ts` | **Blocked:** no verified owner-specific atomic entitlement/spend authority, current reprice→exact approval→idempotent payment/booking→receipt/service chain. Search selection is not a quote or booking. Test-mode offers remain labelled test-mode. |
| Retain confirmed itinerary and receipts | `apps/do/shared/travel.ts`, `lib/do/travel/{preparation,manual-input}.ts`, `apps/do/personal/{conversation,memory,memory-use}.ts` | Manual/synthetic trip projection, revision review and preparation receipts exist; raw/private itinerary fields are dropped by allowlist. Kept conversations and memory are separate consent/retention systems, not a confirmed itinerary vault. No durable provider-confirmed trip, cancellation feed or original receipt attachment retrieval proved. |
| Airport departure suggestion | `lib/do/travel/preparation.ts`, `lib/do/travel/manual-input.ts` | Explicit local time/offset/IANA validation, DST/date-line timeline implemented. No verified airport-arrival policy + live route/travel-time + buffer calculation in these paths. Do not infer leave-by time from a flight timestamp alone. |
| Schedule airport transport | `lib/do/travel/preparation.ts:uberHandoff` | Only user-directed `https://m.uber.com/looking` handoff, with `locationShared:false`, `booking:disabled`, `externalAction:none`. No ride scheduling or confirmation. |
| Trusted-person agent coordination | `apps/do/coordination/protocol.ts`, `apps/do/coordination/durable/{contract,service}.ts`, `app/api/do/coordination/route.ts` | Synthetic exact-window/revision/digest review, expiry/revocation and idempotency exist. Authenticated route has closed pairing gate. No verified external peer, transport or authority to share personal details. |
| Browser assistance | `apps/do/browser/capability.ts`, `apps/do/browser/selected-tab/`, `apps/do/browser/connection/` | Selected-tab evidence/connection source exists; shopping capability is unavailable/unpaired, no checkout. Content is untrusted; browser text cannot grant tool authority. Synthetic tests do not prove a paired installed browser or live retailer action. |

## Candidate changes

- Mail response schema enforces review-only state, no model/storage claim, source/account/message identity, distinct bounded sources and preview size. Both the server and existing shared review destination validate it.
- The review session snapshots the entire permitted request. Wrong account/search/window/operation/selection, duplicate result, cancelled/over-60-second result and reused request ID cannot publish. A response body cast is no longer accepted as evidence. Per-workspace admission is bounded to 256 requests; reopen mail review after that limit.
- A generated correspondence task contains the opaque source key and review instruction only. Sender, subject, account label and body are not copied; these fields may contain codes or hostile instructions. User-entered content remains user-entered; this is not a guarantee against manual secret entry into other surfaces.
- Applying an acknowledged travel draft requires evidence still fresh at application time. The resulting trip remains labelled synthetic/user-entered, status unknown, nothing booked. This helper is not yet a confirmed-provider itinerary store.
- Travel offer selection requires a unique exact offer from its result batch. Changed price/terms or ambiguous identity require review again. Search receipts detach the offer and input snapshot so later mutation cannot rewrite recorded evidence. No payment authority is created.

## Executable acceptance cases

All data must remain synthetic. No actual door code, voucher, receipt, access token or user mailbox is needed.

| Failure / acceptance case | Executable evidence | Expected boundary |
|---|---|---|
| Expired/revoked grant, changed grant revision, activation off, wrong/duplicate account, changed owner, provider failure | `pnpm exec vitest run apps/do/mail app/api/do/mail` | No mailbox dispatch before failed admission; late evidence discarded; no private error echo. |
| Wrong or ambiguous source match, mismatched account/search/time window/operation, selected message omitted/substituted | `apps/do/mail/review.test.ts`, `server.test.ts` in command above | Reject rather than pick a plausible flight. Search membership is not semantic trip identity; traveler/date/cancellation reconciliation remains blocked. |
| Sensitive synthetic strings in headers/body and hostile email instructions | `apps/do/mail/review.test.ts`, `server.test.ts`; `node scripts/review-do-mail.cjs` | Inert source rendering; only source key enters generated task. No model, send, save or scheduling claim. This does not enable sensitive-code retrieval. |
| Voice end/interruption, owner switch, handoff replay, reconnect | `pnpm exec vitest run apps/do/shared/voice-resumption.test.ts apps/do/shared/voice-session-resources.test.ts apps/do/services/voice-lease apps/do/mail`; `node scripts/review-do-mail-voice.cjs` | Cancel resources/pending tools, clear consent, reject foreign or repeated handoff; no retained authority from voice. Browser fixtures mock microphone/socket. |
| Expired itinerary, DST fold/gap, offset disagreement, duplicate codeshare, revision conflict | `pnpm exec vitest run lib/do/travel` | Require current evidence at apply time; explicit offset/zone; no flight-status claim. Cancelled flight reconciliation needs a provider status adapter and is not implemented. |
| Changed offer prices/terms, unknown occupancy/party/cabin, test/live mix, duplicate offer ID | Same travel suite | Re-review or refuse selection; immutable search-stage receipt, never booked. |
| Repeated request or changed source | Mail review + travel preparation/selection suites | No repeated publication; cancelled IDs not reusable; repeated read requests may still incur provider reads because no durable replay cache is claimed. External booking idempotency remains blocked. |
| Browser prompt injection, stale tab/document, owner change | `pnpm exec vitest run apps/do/browser/selected-tab apps/do/browser/connection` | Selected evidence/authority lifetime enforced; source text does not authorize actions. |
| Cross-user memory and trusted-person disclosure/replay | `pnpm exec vitest run apps/do/personal/memory.test.ts apps/do/personal/memory-use.test.ts apps/do/personal/conversation.test.ts apps/do/coordination` | Explicit owner/consent/revision and disclosure limits. No pairing or production-memory rollout established. |
| Paid search denied despite configuration | `pnpm exec vitest run app/api/do/travel` | Authenticated POST still returns unavailable; no provider search invoked. |

## Verification record and next gates

Results for this candidate are appended below. Source audit, mocked tests, local browser proof, CI, and live verification must stay separate. No absolute-security or end-to-end-live claim follows from synthetic tests.

Next owner gates: design and prove recent step-up with revocation for sensitive retrieval (including previews); source-selection/semantic ambiguity and cancelled-itinerary handling; explicit model-data consent if a shared private read-tool registry is introduced; secure confirmed-itinerary/receipt storage; supported provider entitlement and exact transactional approval/idempotency. Each needs isolated authorized proof. No credentials or production settings were inspected or changed here.

### Local results (19 October)

- 228 tests passed in 32 files across mail/API, travel/API, Gemini declarations/wire, voice lifetime/lease, selected-tab/connection, coordination, memory/conversation and policy. This is a targeted suite, not the whole repository suite.
- Canvas package build, `pnpm typecheck`, changed TypeScript scoped ESLint, `git diff --check` and browser-script syntax check passed.
- Existing real-component browser scripts passed against local Next development mode: **19 mail checks** and **11 reviewed voice→mail checks**, with all external requests blocked, synthetic accounts, mocked APIs/microphone/socket. Desktop/375px screenshots inspected; no overflow or uncaught runtime errors. Local artifacts: `output/playwright/do-mail/` and `output/playwright/do-mail-voice/`. This is not a production build or real microphone/provider/device proof.
- `pnpm context:check`: canonical context OK, 29 existing brand-review warnings in untouched paths.
- `pnpm lint:all` failed with 1,410 findings (1,169 errors, 241 warnings) across the repository, including unrelated Supabase email templates. No broad cleanup was attempted; a clean-base full-lint comparison was not run. Scoped changed TypeScript lint passed.
- Default Turbopack production build did not progress beyond “Creating an optimized production build” during the bounded local attempt and was interrupted. It is not a passing build. An alternate webpack check and CI status are reported in the PR.
- Network-permitted webpack production check completed **failed**: unchanged `components/brand/SplineScene.tsx` imports the unexported package-root path of locked `@splinetool/react-spline`, via `MotionAssetView.tsx`. No application-wide build fix was folded into this scoped reliability PR. These source/dependency paths were not changed; failure has not been reproduced in a separate clean-base build.
- Additional connector/grant/ownership/connection regression results are recorded in the PR. Draft PR: [#1620](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1620). Initial code-head CI started context health, DO core validation and Personal DO mail review; running is not passing. Consult the PR for current exact-head status.
