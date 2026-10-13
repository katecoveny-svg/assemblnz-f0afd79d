# DO reliability review — 13 October 2026

Review candidate, not deployed. Base: current remote `main` `6a09eb061d667bf61c3740b0145ab3fb8a197e87`, independently checked through Git and GitHub on 13 October. Branch: `codex/do-persistence-reliability`.

Final resumed verification: fresh production build and all **38 call browser checks passed**, including recorder failure after socket setup. The run replaced earlier evidence; see `output/playwright/call-reliability/results.json` and `verification.json`. The interrupted handoff is resolved. Real microphone/device and hosted Auth checks remain separate release gates.

Kate reports that a real Gemini conversation worked, sounded Kiwi to her, and sign-in persisted on her tested device today. Preserve that evidence. It does not establish durable conversation history, all-device session continuity or live-source grounding. PR #1519's selective auth merge and PR #1518's voice work remain intact.

## Review scope

Extend the existing call resource lifecycle and `scripts/review-do-personal-call.cjs`. No competing entry/navigation design; that owner has a separate local prototype. No provider setup tabs were used. No model, voice, provider destination, microphone consent, profile sharing rule, production environment, database schema, authentication/security setting or persistent credential was changed. No production conversation bodies were read.

This patch:

- Releases capture before socket/audio cleanup, and continues releasing other resources if an individual close/stop fails. Disconnects microphone nodes and recorder ports; clears socket callbacks and queued speech.
- Bounds startup to 30 seconds **after microphone permission returns**, including audio initialization, token fetch and socket setup. Pending browser permission remains cancellable; a late grant after cancellation is immediately stopped.
- Ends on offline, page hide, visibility hide, unmount and existing socket/deadline errors. Online/pageshow only recheck availability; starting another call still needs consent and a user click.
- Stops interrupted playback and does not replay audio carried in an interrupted packet.
- Prevents later tools in the same provider message from starting after an earlier awaited tool outlives the call. Retains existing duplicate tool/start protection.
- Preserves the previous transcript/brief when restarting fails; replaces it only when the new session is established. Transcripts remain session-only, and a reviewed transfer is an unsaved editor handoff.

Rollback: revert this patch. There is no data migration or changed provider contract.

To publish a draft without deploying it, `vercel.json` disables automatic Git deployment only for `codex/do-persistence-reliability`, using the repository's existing branch-specific configuration pattern. No production project setting or deployment protection is changed. Root must approve any later deployment.

Operational limit: a token already issued can consume a call allowance even if connection later fails; this patch does not change quota accounting. Check the 30-second startup budget on the intended devices and connections before release.

## Current persistence truth

Read-only production checks were limited to catalog/table/RPC metadata. Vercel reads checked configuration metadata and the public Supabase URL, not credentials. The configured URL is shared across production, preview and development. Only production has the voice-enabled flag in the inspected project metadata; no personal-memory, provider-memory, responsibility-storage or related purge flag was listed. Absence means the current exact-`true` feature gates stay off, not a newly applied configuration change.

| Storage class | Current code and evidence | Limits / user control |
|---|---|---|
| Personal DO typed conversation | `PersonalDoAssistant.tsx` keeps message, last exchange, editable draft and context in React state. Only the last exchange and explicitly added notes accompany the next request. | No cloud conversation history or automatic save. Reload/reopen loses the exchange. New conversation clears state. This is not long-term memory. |
| Gemini transcript / reviewed brief | `DoGeminiLive.tsx` holds text in component state/ref; owner/profile-key changes unmount it. | Session-only. Review/edit/clear exists. Transfer copies reviewed notes to an unsaved responsibility; it does not create reminders or execute actions. A successful voice conversation does not establish durable recall. |
| Legacy writing drafts | `DoTextWorkspace.tsx` calls `readLocalDrafts(localStorage)` and `saveLocalDraft` without an account. `local-drafts.ts` uses `assembl:do:drafts:v1`. | **Device-wide, not account-isolated.** The prior `e3f1fddd3` account-scoping work was not part of selective PR #1519. A remount after account switching still reads the same key. Local storage is not a secure vault. No private drafts were opened for this audit. |
| Life Admin browser snapshots | Explicit save/open/remove with UUID-scoped `lifeAdminStorageKey` and validated `parseLifeAdminStore`. Guest work stays on page. | No automatic sync or autosave. Later edits need another Save. Restore preserves current edits. Not cross-device memory. |
| Cloud checklist snapshots | `do_personal_checklists` and `do_personal_save_checklists` exist; RLS is enabled. API verifies owner, checks `X-DO-Workspace`, validates content, and uses expected revision. | Explicit save/open/remove; empty revision tombstone blocks stale resurrection. No chat or reminders. Production fixture-account round trip has not been performed here. A failed save reports unconfirmed, not saved. |
| Profile/preferences | `do_personal_profiles` exists with RLS. Owner-filtered service reads/writes; view/edit/defaults/forget UI; explicit named provider consent. Voice checks saved profile revision. | Plain account data, not a sensitive vault. Upsert has no expected-revision CAS: concurrent settings saves can overwrite. Profile API has no workspace header precondition; add stale-tab/account-switch coverage before claiming complete account isolation. |
| Ongoing responsibilities / pending preparation | Existing responsibility/run/usage/worker tables have RLS. New storage-only save path is gated by `DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED` and `do_personal_storage_ready`. | Fresh catalog: readiness RPC absent; flag not listed. New storage writes therefore unavailable. Worker configuration returns false pending durable background grants. Existing rows/tables do not prove the new save flow works. Client preserves original request ID/fields for uncertain retry and requires a valid receipt; that is tested logic, not active cloud service. |
| Owner-approved long-term memory | Collection/revision/retention/tombstone proposal and inactive service/API exist. | Fresh catalog: `do_personal_memory`, maintenance table and `do_personal_memory_change` absent. Collection and purge flags unset. Separate privacy/cleanup/backup/restore gates in `docs/do-personal/ACTIVATION.md`. No active general memory UI/recall claim. |
| Provider memory | Separate `memory-use*` contracts/proposal. | `DO_PROVIDER_MEMORY_ENABLED` unset. No activation, tool wiring or automatic transcript promotion. Owner-review memory and provider use are separate consents. |

The prior local work is reusable reference, not proof of deployment. Keep legacy device-global drafts unclaimed: do not automatically migrate them to whichever person signs in next. A future account-scoping patch needs the existing server-verified identity endpoint work too; current `/api/do/session` implements POST/DELETE, not the earlier proposed GET. The current widget boundary also depends on optional `/api/do/personal` storage availability.

## Ranked launch blockers

1. **Account isolation before wider consumer use:** legacy browser drafts are device-global. Next safe persistence slice is the previously prepared account-scoped draft/identity change, rebased with fixture A→logout→B→A, delayed loads, failed identity lookup, denied storage and native transient-capture tests. Profile writes and inactive responsibility/memory routes also need explicit stale-owner preconditions before activation. Browser events alone cannot authorize an old form under a newly authenticated cookie owner.
2. **No durable conversation/reopen promise:** typed conversation and voice transcript are ephemeral. Decide the explicit save/retention/forget contract before adding history storage. Keep conversation history, approved memories, preferences and pending tasks separate. Do not repurpose a similarly named generic conversations table without owner/schema review.
3. **Durable memory/task activation is incomplete:** absent readiness/memory RPCs and memory/maintenance tables, flags off, no verified cleanup scheduler/restore canary. Apply no migrations or flags as part of this patch. Complete approved isolated proof, privacy/retention and monitoring gates first.
4. **Grounding/capability honesty:** real text and voice work does not imply live NZ facts. Text reasoning explicitly has no tools; optional server-verified Parliament bill excerpts are separate. Gemini declares only `compile_do_agent`, returns an inactive prepare-only brief and cannot invoke weather/news/FX/NZ search. The separately supplied source audit reports HTTP-200/error-body false positives, legislation XML truncation and lost provenance/freshness. Those need a separate truthfulness patch before live legal/data claims.
5. **Hosted and device acceptance:** preview shares production Supabase. Local PGlite and intercepted browser fixtures are not hosted Auth/PostgREST or real microphone/iPhone/PWA/native proof. Use an approved existing isolated environment or obtain scoped provisioning approval; never use production as disposable staging. Independent native cookie/callback continuity remains a separate gate.

## Verification and release acceptance

Local fixture results are recorded with the branch handoff. The repeatable browser script uses fictional API data, mocked media and a mocked Google socket; it never requests a real provider token or microphone. Screenshots are at `output/playwright/call-reliability/`. Existing unit and SQL harnesses are reused. PGlite runs are isolated embedded PostgreSQL-contract checks; they do not simulate a real hosted Auth service or prove production cleanup capacity.

Executed in the isolated checkout:

- `pnpm exec vitest run apps/do/personal app/api/do/personal apps/do/shared app/login app/auth lib/supabase apps/do/services/owner.test.ts app/do/personal`: 1,173 passed, two pre-existing skipped tests (95 files passed, one skipped). The owner path is a filter, not a newly added test file.
- Focused voice/resource/token suite: 24 passed across five files. This overlaps the broad suite; do not add the counts.
- Existing `test-do-personal-checklists-sql.cjs`, `test-do-memory-sql.cjs`, `test-do-personal-profile-sql.cjs` using the already available `/tmp/assembl-staging-proof` PGlite dependency: 12 + 31 + 24 checks passed. No production schema applied; memory remains a proposal.
- Scoped ESLint, brand/front-door guards, macron guard and `git diff --check` pass. Final production-build and browser results are retained with the review evidence.
- The final `pnpm build` passed, including full TypeScript and generation of 206 static pages. An earlier timer type mismatch in the new test/helper was corrected to support both browser numeric handles and Node timer handles. The separate duplicate standalone typecheck was stopped to reduce build contention; full build TypeScript is the final type evidence.

The browser harness is still registered in the existing DO core workflow; this patch adds its path trigger and scoped lifecycle lint. Hosted CI status belongs in the PR; local validation is not hosted proof.

Required before releasing the call patch:

- Exact-candidate typecheck, relevant auth/DO tests, scoped lint, production build and existing CI. Confirm no source/model/voice/profile-consent drift. Review 375px screenshot and failure messages.
- User-initiated real call on the previously successful device: start once, interrupt speech, mute/unmute, End, deny/cancel mic, network loss/reconnect, background/page exit and reopen. Observe OS microphone indicator turns off, queued audio stops, and no automatic retry/retransmission occurs. Retain Kiwi voice assessment as user evidence, not a measured accent guarantee.
- With authorized fixture accounts, A→logout→B must remove old transcript/draft/profile and release capture. Test expired/revoked auth through real Auth, not a bypass. A failed token request must not connect; a late response after cancellation must not revive the call. Existing Google token/session expiry bounds remain unchanged; immediate remote revocation during a live connection is not established by this patch.
- A failed restart retains the previous session's reviewable transcript. Successful new session replaces it as currently designed; it still does not survive reload. Long-term transcript/history save is a separate explicit decision.

Persistence acceptance for the next slice: explicit save→verified receipt→reload→new tab→reopen; A/B isolation; logout/expired sessions; offline before request; disconnect after server commit; same original ID retry; stale revision rejection; preserving newer edits; remove/forget followed by stale retry; denied local storage; two-device read; and truthful not-saved/unconfirmed/conflict states. No unlabelled local fallback for failed cloud saves. There is no autosave service to claim or test as deployed today.

Grounding acceptance: source URL, content/type validation, fetched time separated from source publication/version time, age/expiry, active/healthy source, minimum relevance, and explicit unavailable/stale/offline states. HTTP 200 alone is not success. Distinguish Acts/provisions and commencement from bills/debate; truncated Customs and Excise Act content must not be represented as complete coverage. Selected schools/regions/news preferences require user-selected sources and settings; no new personal-data ingestion.

The smallest future shared-tool slice is one reviewed read-only source adapter, exposed through the same strict registry to text and voice, with bounded schema, source provenance/freshness, timeout/error fixtures, exact selected inputs and explicit named provider disclosure. Start with public non-personal data. No provider/tool activation or new ingestion is included here. Legislation retrieval and corpus repair should remain a separate reviewed change, with no migration until approved.

Meeting/call recording or transcription must retain recording consent and reviewable proposed actions. Proposed household health/loyalty/banking/pet/vehicle vault work stays with the security architecture owner: no bank credentials/card storage, sensitive record ingestion or general model access has been introduced.

## Gemini eligibility gate

The [official Gemini API terms](https://ai.google.dev/gemini-api/terms), checked 13 October (page effective 23 March 2026), restrict API clients directed towards or likely accessed by under-18s. Unpaid services must not receive sensitive, confidential or personal information. Paid API treatment depends on an active billing account linked to the Cloud project; paid prompts/responses are not used for product improvement, but limited abuse-prevention retention still applies. API and consumer-app permissions are different. The terms also restrict medical-advice use.

Nonsecret Vercel configuration establishes voice configuration, not its Cloud project's billing/DPA/retention eligibility. No callable Google Cloud billing metadata tool was available, and provider-owned browser tabs were left untouched. **The current API billing tier remains unverified.** Before household sensitive memory or a child-facing mode, the owner must verify the exact API project/tier, processing terms, retention and age eligibility. Preserve the working adult voice pending scoped review; this patch does not expand profile sharing. Future child context requires separate review and adult-managed minimal data, not direct child-facing Gemini access.

## Approval boundary

Root reviews the exact candidate and evidence before merge or deployment. Any memory/responsibility schema application, cleanup scheduler, production flag, new source/provider transmission, security setting, isolated hosted-resource creation or sensitive-vault collection needs its own scoped approval. This call-only patch needs none of those changes.
