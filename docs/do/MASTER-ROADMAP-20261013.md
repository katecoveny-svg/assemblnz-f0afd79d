# DO master product and build roadmap

Assembl · 13 October 2026 · Proposed execution sequence and evidence register

> Repository incorporation — 13 October 2026. Imported from the user-reviewed Library roadmap (version 0). Its capability register remains a dated source audit, not a rolling release claim. The bounded interface draft now exists on `codex/do-entry-chrome-draft`; see [entry integration evidence](../reviews/DO-ENTRY-INTEGRATION-20261013.md) for changed paths, tests and remaining gates. It has not shipped. Shared durable state, broader uploads and onboarding remain separate work. Provider setup and public discovery have other owners; verify their latest evidence before relying on this snapshot.

## 1. The decision

**Make DO dependable, then make it useful in a few complete journeys, then earn permission to expand.** DO for People and DO for Business share one foundation. People should see one simple place to write, talk or upload something. Businesses should buy one measurable customer or operational outcome, with their own branding, permissions and data boundaries.

The consumer ambition is broad: help organise everyday New Zealand life. The initial delivery is deliberately narrow: a reliable conversation, shared real state, a few trustworthy read-only tools, and a reviewed result someone can use. Reliability comes before consumer marketing. One paid business outcome comes before speculative integrations across several industries.

This roadmap consolidates the product direction, current capability gaps, source audits, household security, travel, partner options and the existing concept portfolio. Phases are acceptance gates, not promised dates. Workstream labels identify responsibility to assign; they do not imply staffing or delivery commitments.

**Build now:** reliability, one unified interface, tested read-only tools and the ownership/state contracts they need. **Gated later:** sensitive records, transactions, broad creative tooling, external messaging and international distribution. Roadmap requirements are proposed work unless the capability register explicitly identifies existing evidence.

### What happens next

1. Close the active reliability and source-truth work, with proof on the actual installed and browser surfaces.
2. Integrate the simple Write / Talk / Upload interface with one owner-scoped conversation and task state. Add only a small, permitted read-only tool set.
3. Complete the grocery, household and trip-preparation journeys before adding transactional promises.
4. Choose one business pilot when a buyer, access, permissions, measurable outcome and budget are established. Retailer discovery remains the strategic first route; appointment Fill is an alternative if its gates clear sooner.
5. Run a small, honest consumer beta after reliability, privacy and useful-completion gates pass. Creative production, broader messaging and agent distribution expand separately.

**No proven acquisition, retention, signed partnership, merchant checkout, repeatable revenue or market leadership is established by the current work.** Top-quality is a build standard to test, not a “world's best” or number-one claim.

### Read this as an execution contract

Every capability needs a named owner, current status, exact build/source evidence, test result, permitted provider access, next step and stopping condition. “Implemented”, “deployed”, “user-confirmed”, “independently verified” and “proposed” are different states. Never promote a configured API or attractive demo to a live product claim.

## 2. Current capability register

Snapshot: 13 October 2026. Repository audits pin main `6a09eb061d667bf61c3740b0145ab3fb8a197e87`. Release references identify specific earlier changes; the audited main may include those changes and later commits. Verify ancestry, current main and active work before editing rather than treating every SHA as a separate current deployment. [Repository](https://github.com/katecoveny-svg/assemblnz-f0afd79d)

### Identity and interfaces

- **Sign-in:** auth PR 1519, short commit `ba60ed6c`, is reported live. The user confirms retained sign-in. This is meaningful user evidence; session expiry, account switching, native/browser callback handling and every installed surface have not all been independently validated. Owner: Reliability. Next: run the actual-surface recovery matrix and retain evidence. [PR 1519](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1519)
- **Voice:** PR 1518 is reported live. The user confirms Gemini conversation works and the accent is good. This does not establish live knowledge tools, durable transcripts or a matching owned voice everywhere. Owner: Conversation. Next: parity tests for interruption, reconnect, source use and reviewed task handoff. [PR 1518](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1518)
- **Native companion:** Write and Talk are installed. The Chrome PWA is a separate surface; earlier icon-management policy restrictions remain a separate issue unless newly verified. Owner: Interface. Next: inventory and test each launch target, branding, account and route.
- **New UI:** local prototype `0ab13176` is not integrated. Treat its layout as a design candidate, not production capability. Owner: Interface. Next: compare it against current main and integrate in a bounded branch after state contracts are agreed.
- **Google and Apple sign-in:** Google OAuth client exists, but secure credential transfer to Supabase is pending user completion; Apple is unconfigured. Owner: Identity. Next: complete only the authorised provider setup, then test callbacks. Never put credentials in this roadmap or repository.
- **Shared memory:** durable cross-device conversation and memory are not proved. Browser drafts and session transcripts do not satisfy this requirement. Owner: State and Privacy. Next: isolated staging, ownership rules, migrations and cross-account tests before enabling persistence.

### Conversation, knowledge and daily work

- **Personal text:** no general tool interface in the audited reasoning call. Optional public-NZ preparation can inject at most two freshly checked Parliament Bills; that is not broad legal or current-news search. Owner: Knowledge. Next: a server-scoped read-tool registry with evidence envelopes.
- **Gemini live:** only `compile_do_agent` is declared. It prepares an inactive brief with `active:false` and `prepare-only`; it does not execute NZ news, weather, FX, school or legislation tools. Owner: Conversation and Knowledge. Next: expose a small approved read set consistently to text and voice.
- **NZ panels and gateway:** MET Norway, GeoNet and NZTA panels contain useful bounded-source patterns. The separate NZ Live gateway and legislation RAG have source-success/freshness defects. A catalogue entry is not proof that Personal DO can call it. Owner: Knowledge. Next: repair semantic failures before wiring tools.
- **School digest:** a separate Family DO path can use selected Gmail senders, bounded lookback, limited messages, explicit provider consent and quoted evidence. It is not a school portal, complete inbox scan or recurring briefing. Owner: Household. Next: validate actual provider access and retain coverage limits.
- **Meetings:** bounded transcription, notes and reviewed local follow-through exist in code. ICS download is not calendar insertion; a local task is not a cloud reminder; an operator-review email request is not delivery. Owner: Meetings. Next: connect reviewed candidates to durable owner-scoped tasks after State is ready.

### Journeys, commerce and creation

- **Shop:** planning/review, pantry quantities, packs, budgets, substitutions and sample baskets are reusable. No verified live retailer prices, stock, cart or checkout. Owner: Shop. Next: one complete, clearly labelled plan-to-list journey.
- **Travel:** `/do/travel` is a fictional/manual preparation path. A separate trip workspace has local save, packing and manually supplied links. Duffel code is deployed but access, entitlements and current credentials are unverified; family occupancy and evidence mapping need repair. Owner: Travel. Next: synthetic family-brief/comparison contract, without paid search.
- **Business concepts:** Woolworths and PowerPass combined demos are published; Contact private v3 has source/test evidence but its authenticated browser visual QA was blocked; Z remains unchanged. Real model chat/photo understanding in the Woolworths demo does not make its products, prices, rewards or checkout live. Owner: Commercial demonstrations. Next: preserve canonical versions and prove only the task being shown.
- **Fill, Reactivate and tradie booking:** concepts and research, not shipped booking integrations. Owner: Partner workflows. Next: choose a qualified buyer and permitted provider route before engineering a transaction.
- **Studio and owned voice:** the separate Studio blueprint remains the detailed creative plan. A CPU speech test produced 0.48 seconds of audio in 76.48 seconds; it is not conversational readiness. Own-voice cloning and new models are not established. Owner: Studio. Next: one editable founder reel and measured model experiments, behind rights and resource gates.
- **Sensitive household vault:** proposed, not built. Owner: Security and Privacy. Next: review the existing application and implement the ordinary-data permission model first.

## 3. One product interface and one real state model

### The small surface

The floating DO entry should offer **Write, Talk and Upload**, with clear listening, processing, interrupted, offline and retry states. It should expand without losing the current conversation. The user should not need to understand the internal product families to get a job done.

Optional expanded organisation is **Today, Household and Money**. These are proposed navigation groups, not separate new products. Today holds reviewed commitments and optional briefings. Household holds people, properties, zones, pets, vehicles and practical jobs. Money groups Shop, Save and Bills. Travel remains a distinct journey within the same account and conversation, not a duplicate identity system.

Keep the canonical glass D asset, Instrument Sans and IBM Plex Mono, the established plum/chalk palette, generous editorial space and accessible controls. Preserve the exact mark rather than redrawing it. Retain useful cinematic/nature material for explanation and demonstrations without hiding the main action. Client-facing concepts use client branding. Keyboard, reduced motion, screen-reader labels, mobile layout and visible focus are release requirements.

### Personalisation and onboarding

Let each person name their own DO and choose an available voice/style while the product brand remains DO. Audit existing preferences before adding duplicate settings. First run should be short and skippable: choose a priority → optional name/style → first useful task. Request permissions at the point of need, with a clear skip path; do not block returning users behind onboarding. Voice choices must reflect actual available models and permitted use, not a promised clone. Persist and sync these preferences only through the verified account/state contract.

The latest design brief explicitly calls for mymind-inspired rounded edges, colour and gradients while retaining simplicity, the glass DO mark and plum/rose identity. This is a user-directed reference, not permission to copy assets or a claim the final design is approved. The previous flat concept is not the accepted final direction. [Design reference](https://mymind.com/)

### The underlying objects

Use existing preparation/review contracts where possible. Define one versioned contract for conversation, task, evidence, proposed action, approval, receipt and user-approved preference. Link each to the authenticated owner and relevant household/property scope. Keep sensitive source content out of general logs and public repository fixtures.

- **Conversation:** owner, participants where permitted, message IDs, source references, retention and deletion rules. Text and voice share an explicit handoff; never imply an entire call was transferred if only a bounded excerpt was used.
- **Task:** user-confirmed goal, responsible person, due date/timezone, state and supporting evidence. A suggestion remains a suggestion until reviewed.
- **Action:** typed operation, provider, destination, data fields, consequences, cost limit, revision and expiry. Reading, preparing, approving and executing are separate operations.
- **Approval:** binds the exact revision and material terms. Edits, price changes, expiry or recipient changes invalidate it.
- **Receipt:** states prepared, pending, completed, failed or uncertain; records actual provider reference only when verified. A successful HTTP response is insufficient on its own.
- **Preference:** explicit scope and permission to remember; inspect, correct and delete it. Never infer perpetual consent from one task.

Cross-device proof must cover create/edit/reload, second device, concurrent edits, reconnect, retry, account switch, logout, revocation, export and deletion. Use an isolated staging database rather than testing migrations against a preview that shares production.

## 4. Phase 0: reliability and truth first

**Owners:** Reliability, Knowledge and Release. **Dependency:** current branch/worktree inventory and sole-writer coordination. **Output:** a trustworthy baseline, not a new broad interface.

1. Reproduce the actual user journeys on native Write/Talk, canonical web and installed PWA where access permits. Verify persistent sign-in, password/magic-link behaviour, cancellation, browser/native callback, audio start/stop, interruption, reconnect and recoverable errors. Record inaccessible surfaces as unverified.
2. Repair false source-success states: malformed HTTP 200, null/fallback weather, all-feeds-failed news and stale legislation must fail semantically, not display “live”. Separate empty valid results from unavailable, unauthorized, rate-limited, schema-changed and not configured.
3. Remove invented freshness. Preserve published/effective/observed/fetched timestamps separately from query time. Correct wind speed versus gusts, missing-region defaults, NZTA zoom-versus-limit use and weak fuel/employment constants before exposing them as current facts.
4. Legal answers require exact instrument, version, provision, operative date and coverage. Do not answer current statutory particulars from general model memory when retrieval fails. The Customs and Excise Act 2018 is distinct from the repealed 1996 principal Act; amendment Bills and assent are not substitutes for commencement evidence.
5. Create an evidence-backed inventory of active routes, tools, models, deployments, flags and data stores. Record which interface can actually invoke each capability. Add tests that forbid unsupported product claims.

**Exit:** targeted regressions, required aggregate checks, build/types/lint, 375px and desktop browser proof; actual-surface sign-in/voice evidence; no uncaught failure or false live status in the chosen paths; exact commit/deployment and rollback recorded. A pre-existing failing test must be reproduced and disclosed, not silently described as an all-green suite.

## 5. Phase 1: simple interface, durable state, a few reads

**Owners:** Interface, State and Knowledge. **Dependency:** Phase 0 contracts and isolated persistence staging. **Output:** one useful, reviewable task across text and voice.

Integrate the local UI only after comparing current branches. Start with the shared account/conversation/task contract and narrow non-sensitive records. Add a small read set chosen for actual permitted access: selected-city weather, bounded NZTA/GeoNet information and one lawful headline/source route. A dated FX reference and selected school-email digest can join only when access/terms and private-data scope are satisfied.

Each tool needs schema validation, allowed destinations, bounded bytes/time, explicit user scope, cost/rate limits, provider-specific errors, provenance, freshness and an honest no-result state. Tool output is untrusted evidence, never a new instruction. Text and voice must agree on what is currently available.

### NZ source acceptance

- **Law:** use PCO work → version → provision retrieval; preserve partial coverage and amendment/commencement warnings. Parliament website endpoints were observed working, but durable developer terms/rate limits are not established. Reuse the stricter verified-ID client.
- **News:** headline/link discovery and licensed full-text ingestion are separate. NewsAPI's Developer plan is development-only and delayed; RSS existence does not prove commercial reuse rights. Google Custom Search is closed to new customers and is not the new default route.
- **Weather and transport:** attribute the actual provider, use the selected geography, show forecast/observation time, retain warning expiry and cancellation. Never infer “all clear” from feed failure. MET Norway forecasts are not MetService forecasts.
- **FX:** distinguish daily reference rates, executable market quotes and Customs-period FX. Show base/quote direction and date. RBNZ automated retrieval needs a permitted route; do not schedule scraping based on an assumed free licence.
- **Schools:** Education Counts directory data is institutional information, not a child's school notices. Private sender selection, provider disclosure and bounded coverage remain explicit.

**Exit:** one task can be started by text, continued by voice, reviewed and reopened on another authorised device without data leakage or duplicate action. Unsupported reads abstain. Sources, timestamps and coverage are visible. Household invitations and sensitive vault records are not prerequisites for this first proof.

## 6. Phase 2: complete household journeys

**Owners:** Household, Shop, Travel and Meetings. **Dependency:** owner-scoped state and honest read tools. **Output:** a few complete practical jobs, using minimal data.

### Shop, Save and Bills

Shop should turn a week/budget/pantry brief into corrected ingredients, quantities/packs, an editable list and a prepared receipt. Keep sample prices labelled; do not invent live stock. Substitutions require review. Save begins with transparent public-offer comparisons; Bills begins with a provider label, due date, optional amount and responsible person. A reminder is not payment or supplier switching.

Opt-in money watches need topic, property/person, permitted inputs, threshold, schedule, channel and pause/delete. Loan, power and solar comparisons show coverage, assumptions, fees and eligibility. Exact bills, financial documents and personalised product recommendations trigger additional privacy and legal review; a disclaimer does not resolve the regulated-advice question.

### Household, properties, zones, pets and vehicles

Model person, household, property and zone separately. Add ordinary lists, chores, maintenance, bin days, pet appointments and vehicle service/WOF/registration dates with deliberate sharing. Use fictional examples in tests. A property link does not grant every household member access to all documents. A household administrator must not automatically inherit another adult's private records.

For a cleaner in Mangawhai, clarify the property area, job scope, frequency, timing and budget, then show source-backed candidates and prepare an enquiry. Do not invent availability, “vetted” status, insurance or a booking. Share exact address/photos/contact details only with the selected authorised recipient. The place is an example, not a private household record to seed into the product.

### Travel: family brief to reviewed handoff

Reuse `TravelWorkspace.tsx` and `lib/do/travel/preparation.ts`, keeping local/manual status explicit. Clarify actual party composition and ages at travel, origin, dates/year/duration/flexibility, budget currency/scope, rooms and baggage. No silent AKL/ROM defaults. Correct Duffel stays occupancy and the accommodation-suggestions contract before wiring any search.

Normalize whole-party flight price and whole-stay/room price, known extras, taxes, unknown fees, expiry, fare/cancellation terms and operating carrier. Never multiply a whole-party offer by passenger count again. Show “lowest comparable total” separately from “best fit”; neither means cheapest across the whole market. Test family/date/room mismatch, mixed currency, changed price, expiry and delayed old responses with synthetic fixtures.

For now produce a comparison receipt and a user-opened verified supplier page, labelled if it requires a fresh search. Live search requires account/mode/Flights/Stays entitlement, permitted data transmission and an approved bounded search cost. Duffel Links, payment, servicing and booking remain Phase 3.

### Events and Auckland transport

Reuse existing event displays, school recipes and the Auckland Transport vehicle adapter/gateway after checking their exact contracts. Their presence does not prove Personal DO can call them or that live AT access is available. Event management should first prepare an event brief, date/timezone, place, invitee list and source-backed travel options; ask before invitations or calendar writes. Test changed/cancelled events, duplicate imports, recurring dates, NZ daylight saving, missing transport data and owner visibility. Full calendar write/sync is not established.

For an AT commute pilot, join scheduled GTFS with fresh trip updates and relevant service alerts; moving vehicle positions alone are insufficient. Missing predictions mean “scheduled/live unavailable”, not “on time”. Confirm stops, direction, travel windows and notification consent; test cancellations, stale entity timestamps, missed transfers, quota exhaustion, pause and deduplication. Use a shared bounded collector rather than polling every user. Verify product access, exact feed licence and actual device alert receipt before claiming live commute assistance. AT data covers Auckland, not comprehensive NZ transport. [AT realtime guide](https://dev-portal.at.govt.nz/realtime-api), [GTFS data](https://at.govt.nz/about-us/at-data-sources/general-transit-feed-specification), [GTFS realtime semantics](https://gtfs.org/documentation/realtime/reference/).

### Meetings and briefings

Capture audio only with appropriate recording permission and disclosed transcription provider. Preserve uncertain speakers, exact evidence and ambiguous owner/dates. Review candidates before saving tasks or drafting follow-ups. Calendar download/import, email approval/provider acceptance/delivery and reminder activation must have separate states.

Daily and weekly briefings are separate opt-ins: choose topics, region, household scope, sources, schedule, channel, quiet hours and expiry/pause. Start with one bounded digest. Include partial-source failures; do not claim complete awareness of school, local or business news. No indefinite background inbox scan follows from one digest request.

**Exit:** each chosen journey passes clarification, edit, decline, failure, recovery, repeat-click, stale-evidence and receipt tests. Users can identify what happened, what is still prepared and what needs their action. Measure useful completion, corrections, latency, cost and support effort before expanding the journey count.

## 7. Phase 3: approved transaction partners

**Owners:** Commercial, Integrations and Security. **Dependency:** one named buyer and permitted access. **Output:** one narrow provider-confirmed outcome, rather than several speculative integrations.

### Choose one commercial route

**Retailer/loyalty:** Woolworths remains the strategic first conversation. The branded demonstration is a concept, not endorsement. A smaller NZ Shopify merchant or affiliate route is an alternative only when approved and the specific conversational placement is permitted. Merchant catalogue access, cart writing, checkout, rewards and commercial referral rights each need verification. Foodstuffs remains deferred by preference, not because of a legal finding.

**Appointment Fill:** an alternative first pilot when a practice has clearer access, need and willingness to pay. Flow: actual cancellation → consented eligible waitlist → limited offer → acceptance → availability recheck → verified booking/change → confirmation. Cliniko supports availability and appointment operations, but provider-native holds, idempotency and conflict guarantees remain unverified. Start with existing adult patients, one clinic/type and staff-confirmed booking. Staff determine clinical eligibility; DO does not triage or sell queue priority. Timely has native waitlists; its documented customer-data Zapier route is not proof of external appointment-write access.

Protect the existing booking. Do not cancel first, blindly retry ambiguous creates or infer success from a notification. Reconcile timeouts against the provider. Application locks alone cannot stop another booking channel taking the slot. Track incremental attended appointments and released-slot effects, not every reschedule as new revenue.

**Tradies:** begin with a qualified enquiry, selected photo/suburb, scope, availability and budget constraints. Confirm relevant worker licence where needed. A directory listing is not quality, insurance or availability proof. Booking must account for skills, travel, materials, site access and duration; no diagnosis of dangerous faults from an image.

### Transaction acceptance

A proposed action must show provider, recipient, service/items, total/currency, payment/recurrence, delivery/location, material terms and cancellation consequences. Approval binds that revision. Use idempotency where supported, recheck immediately before commit and distinguish pending from completed. Read back provider reference and critical terms. No automatic checkout, booking, supplier switch, outreach or sensitive-data transmission follows merely from a user's request to research.

Provider agreements, credentials, permissions and payment commitments need the appropriate explicit approval. New Google/Supabase credentials remain a secure handoff, never a document field. Travel seller/support responsibilities must be decided before Duffel Links; a deployed search function is not a travel agency operating model.

**Exit:** actual permitted access, signed/approved commercial scope where required, security/privacy review, safe retry/reconciliation, full failure recovery, verified receipt, support owner and tested rollback. One transaction path only before repeating the pattern elsewhere.

## 8. Phase 4: controlled beta and one paid outcome

**Owners:** Product and Commercial. **Dependency:** reliability, privacy and chosen journey gates. Consumer beta and the business pilot can learn alongside each other; neither requires pretending all proposed capabilities are ready.

Recruit a small adult cohort, for example 15–20 volunteers in one NZ area, with one practical task each. Personal document uploads must not be the price of joining. Use one consumer channel and one business channel as experiments, not an everywhere-at-once launch. Founder-led short demonstrations and permitted community posts are hypotheses to test.

Show a real completion, review step and recoverable failure with synthetic or expressly consented/redacted data. Label prototypes and human-assisted steps. No fabricated bookings, testimonials, savings, wait time or reward issuance. Paid acquisition waits for reliable completion, voluntary return, measurable conversion and support economics, then a separately approved experiment budget/stopping rule.

For the paid pilot, choose one buyer, baseline, measurable outcome and fixed scope. The earlier revenue plan's **NZ$3,000 + GST pilot and NZ$750 + GST monthly** are discussion hypotheses, not validated willingness to pay or vendor quotes. Messaging, model usage, support, privacy and integration costs may change them. Measure contribution after real costs and staff time. Do not promise retention or acquisition from attractive demonstrations.

White-label DO for Business should reuse the same action/evidence/receipt contracts with tenant isolation, brand tokens and scoped tools. Retail customer memory is not automatically business property. Disclose sponsored rankings and rewards; optional utility during a genuine wait must never manufacture delay or pressure participation.

**Exit:** measured useful completion, voluntary repeat tasks, known failure/support rate and unit cost; one business's verified outcome and explicit decision to continue/pay. Publish only the capabilities that passed, with a clear feedback and support route.

## 9. Vault, provider rights and permission gates

The household hub can begin with minimal ordinary records. Sensitive storage is a later release with a separate threat model, privacy impact assessment, role-specific legal review and independent testing. Managed Supabase building blocks do not certify the application. Supabase Vault is a secrets facility, not an off-the-shelf family permission system.

### Required architecture before sensitive records

Use deny-by-default row and storage policies, per-item grants, private buckets, authenticated download, short-lived URLs, protected uploads and scoped server tools. Enforce authority on every read, export, search, reminder and background job. Keep previews isolated. Test cross-household access, private adult records inside one household, revoked members, recovery, object-ID guessing and cache leakage.

Use reviewed encryption libraries and managed key architecture; sensitive application-layer encryption is still server-readable if the server can decrypt it. Do not market that as zero knowledge. A client-only locker is a different later trade-off: server OCR/search/AI cannot read its contents unless the user explicitly releases a task-sized excerpt. Back up object bytes and key recovery as well as the database; Supabase database backups do not include Storage objects.

Passwords, card details and recovery codes stay out of the initial vault. Use supported provider-hosted authorisation/payment flows. Banking/loyalty connections require specific eligibility, contract, scopes and revocation; no password collection workaround for missing APIs.

### Data and AI provider gates

- Adult-managed family organisation does not authorise unrestricted records about other adults or children. Minimise child data; assess guardian authority, access rights and indirect-collection notices. Do not seed actual private family, health or financial facts into tests or repo documents.
- Verify the exact AI API service, billing/data-processing tier, retention, training rules, regions and subprocessors. Consumer Gemini and paid Gemini API terms are different. The current Gemini API terms restrict under-18 client access and personal/sensitive data use with unpaid services; the actual deployment tier is unverified. Keep child-facing voice accounts and sensitive-profile sharing disabled pending review. [Gemini API terms](https://ai.google.dev/gemini-api/terms)
- Keep the authorisation gateway outside the model. Files, websites and transcripts are untrusted evidence; they cannot grant permission to reveal data or execute an action. Summaries, embeddings and extracted text inherit source permissions.
- Obtain distinct consent for provider disclosure, storage, household sharing, proactive reminders and external communication. Display what leaves DO and to whom. Revocation must stop new reads and queued actions.
- Define retention, deletion, export and recovery. Explain backup expiry and the limits of recalling downloaded copies. No permanent deletion of the existing product portfolio is authorised by this roadmap.

NZ privacy responsibilities include a privacy officer, meaningful notices and appropriate safeguards. IPP3A indirect-collection obligations have applied since 1 May 2026. Health-provider workflows need a role-specific Health Information Privacy Code assessment. Māori data governance needs substantive participation and authority, not an individual-consent checkbox. Exact legal applicability and launch evidence should be reviewed professionally; architecture recommendations are not a compliance certificate.

## 10. Keep, combine, archive and defer

The existing portfolio audit covers **38 Sites, 64 demo pages and 33 code families**. These counts describe the earlier audit scope, not a fresh runtime pass of every route. Preserve the full inventory, source versions, screenshots and existing shared links. The following are disposition categories grounded in that audit; the exact current route/branch/version manifest must be refreshed before edits.

### Keep and strengthen

- **DO core:** the simple People/Business proposition, exact identity assets, reusable preparation/review/receipt logic and useful existing account work. Reuse rather than create a second auth or task database.
- **Woolworths flagship:** keep the cinematic fridge/phone sequence, corrected photo understanding, editable plan and customer/operator continuity. Preserve simulation labels and client branding.
- **PowerPass:** keep project clarification, materials/substitution review, failure/retry and revision-bound receipt. It is a reusable domain proof, not a live Bunnings integration.
- **Contact:** retain source-plan calculations, approval conflicts and shared receipts; finish accessible visual QA before broader claims. Keep Z's original source while its consolidation remains outstanding.
- **Distinct Travel:** keep itinerary, packing, timezone/segment validation and reviewed preparation; combine state contracts rather than flatten its domain into grocery.

### Combine with a verified replacement

- **Acquisition tools:** Pursuit, Lead Hunter, Pipeline, Missing Agent, Agent Maker and Minute One should contribute to one opportunity-to-bounded-demo workflow, not competing public funnels. Preserve each useful capability.
- **Creative workbench:** Make with Assembl, Creative and Motion Studio feed one Studio project/export system. Do not rebuild separate broad creative shells.
- **Contractor proof:** VariationProof, LoadProof and Assembl'd contribute evidence/exception primitives beside task intake/LockedIn. ShiftLedger and ClearLedger retain specialised payroll/debt boundaries and are not silently enabled inside a retail journey.
- **Shared visual code:** the earlier audit found 19 identical copies of each of four visual modules and two major versions among 27 phone files. Extract one proven module family for two consumers with regression screenshots; do not mass-deduplicate the fleet before preserving variants.
- **NZ knowledge:** unify evidence contracts and source clients where justified, but do not merge incompatible embedding stores blindly. The `kb_*` and Tier A pipelines have different dimensions and authority semantics; migration requires coverage and read-back checks.

### Archive from active pitching only after approval

Trading Desk and The Eighth Gap are candidates to leave core DO sales navigation. Older competing design previews and superseded brand demos can become archive entries when a replacement preserves their strongest assets and passes functional/accessibility checks. Archive means recoverable source and clear historical status; redirects, unpublishing and deletion are separate decisions.

### Defer without losing the idea

Broad insurance/retirement/finance suites, full payroll/debt automation, unrestricted sensitive records, autonomous browser/email/text/food ordering, live loyalty redemption, simultaneous retailer and clinic integration, heavy avatar/video infrastructure and international distribution wait for their own buyer, rights, safety and economics gates. Household property organisation remains in scope; broad real-estate marketplace expansion does not.

### Manifest required for each actual item

Record exact URL/repository path; audience; current owner; branch/commit or saved Site version; live/access status; verified versus proposed capability; donor assets; selected replacement; data/permission dependencies; visual/runtime tests; historical-link migration; rollback. Use “not yet audited” for remaining routes rather than inventing a status. Never reset newer work to an old audit SHA.

## 11. Creative studio and later tools

The separate Voice/Avatar/Video Studio blueprint remains the detailed build specification. This roadmap sets its sequencing: one complete editable founder reel first, then useful reusable production features. Photo-to-social-short/post, script/storyboard, consented narration, captions, brand kit and editable timeline/export are the priority journey; a full CapCut-scale editor is not the first milestone.

Reuse existing project, media, generation and export code only after checking its actual state. Each likeness, voice sample, model, music track, font and editor asset needs independent rights clearance. No celebrity imitation, public-scraped voice dataset or assumed licence inheritance. Base voice cloning and VoiceDesign are different model capabilities. Genuine NZ English and te reo Māori require consented speakers, evaluation and Māori-governed development; do not claim to be the first NZ voice provider.

Measure intelligibility, accent credibility, pronunciation, consent revocation, lip sync, render quality, editability, latency, failure recovery and cost on the exact hardware/provider. The current CPU result is not a conversational target. An accepted Gemini interim voice does not prove owned synthesis or a real-time avatar.

Browser, email, text and food ordering become typed, narrowly scoped tools after read/preparation works. Selection and draft preparation come before sending, buying or booking. Each adds destination verification, explicit authority, budget, retries, provider terms and receipt evidence. Do not imply a general “do everything” tool exists.

## 12. Agent discovery and interoperability

The public production audit verified a read-only MCP at https://www.assembl.co.nz/api/knowledge/mcp with one product-search tool, and public documentation/metadata pages. It searches seven short Assembl product records, not all NZ services. The HTTP search separately adds bounded official evidence; the private enquiry MCP is another contract. Keep those scopes explicit.

**Immediate defect:** a DO query returns no product records because the tokenizer discards two-letter words. Fix exact product aliases and short-query policy without ranking every ordinary use of the verb “do” as the brand. Remove unrelated official-link fallback for unsupported short queries; align OpenAPI and MCP schemas. Add canonical URLs and sitemap entries for reviewed public connection docs. A scoped discovery repair is active, with no release yet established.

Keep the public evidence layer separate from customer data. Public records need canonical citations, issuer, geography, type, checked/published dates, expiry, coverage and unknowns. No private demo, inbox, vault or customer artifact goes into public search or crawler metadata. Robots/noindex are not access control; preserve existing gates.

For delegated private access, verify token resource/audience, client identity/policy, granular server permissions, tenant isolation, revocation, rate limits, audit and safe retry in staging. OAuth discovery metadata does not prove a successful private connection. The existing enquiry pilot can list enquiries, read evidence and prepare a reply; it is not a generic outbound cleaner-booking API.

Test actual remote MCP clients with synthetic data before directory submission. ChatGPT/OpenAI review, Claude connectors/directory and the MCP Registry are distinct routes. Registration does not imply ranking or endorsement. Meta Muse and Instinct third-party developer routes remain unverified; support a safe public browser journey without promising integration. Measure citation accuracy, branded retrieval, correct tool selection, connection success and authorised task completion. No llms.txt, schema or crawler setting guarantees “number one”.

[Public MCP documentation](https://www.assembl.co.nz/docs/mcp), [agent connection guide](https://www.assembl.co.nz/tools/agents), [MCP authorisation](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), [OpenAI review](https://developers.openai.com/plugins/deploy/app-review), [Claude connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [MCP Registry](https://modelcontextprotocol.io/registry/about), [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## 13. Benchmark the outcome, not the feature count

The October 2026 benchmark is based on official documentation, not hands-on comparative testing. Major agents already document memory, cloud tasks, connected tools, voice and scheduled work. DO's plausible advantage is NZ correctness, permissioned household/property context and reliable follow-through with transparent commercial incentives. That advantage remains a hypothesis until tested.

- **Unified assistance:** Claude documents convergence of chat and Cowork, shared context and scheduled work. Gemini Spark documents cloud/local workflows, with account, age and regional gates. A Gemini API connection does not confer consumer Spark features. [Claude convergence](https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude), [Spark eligibility](https://support.google.com/gemini/answer/17094507?hl=en)
- **Personal context:** Apple's dated NZ announcement describes Siri AI English beta rollout, not universal availability on every Apple device. Alexa+ is a strong household comparison, but NZ access and local integrations remain unverified. Do not confuse family subscriptions with shared AI seats or permission to read every member's information. [Apple NZ announcement](https://www.apple.com/nz/newsroom/2026/09/siri-ai-a-profoundly-more-capable-and-personal-assistant-is-here/), [Alexa international rollout](https://www.aboutamazon.com/news/devices/alexa-plus-international-launch)
- **Scheduling and meetings:** Outlook documents configurable calendar actions; Teams Facilitator has preview boundaries. Reclaim distinguishes configured scheduling rules from reviewed assistant changes. Granola, Motion, Otter and Mem demonstrate useful capture/memory/follow-through patterns, with different training, sharing and retention controls. Copy the permission clarity, not an assumption of equivalent performance. [Outlook instructions](https://support.microsoft.com/en-gb/outlook/calendar-instructions-in-outlook-and-copilot), [Reclaim review model](https://help.reclaim.ai/en/articles/15280604-reclaim-2-0-faq), [Granola security](https://www.granola.ai/security), [Mem](https://get.mem.ai/)
- **Agent execution:** ChatGPT Work, Perplexity, Manus, Lindy and other agents raise the baseline for finished outputs and visible execution. Meta Muse's documented US/Canada availability is not NZ support; Instinct's task examples are vendor claims rather than verified NZ fulfilment. Do not select discontinued Sora services for new video work. [Work browser](https://help.openai.com/en/articles/20001280-using-cloud-browser-in-chatgpt), [Meta availability](https://about.fb.com/news/2026/09/introducing-muse-small-business/), [Instinct](https://instinct.com/), [Sora discontinuation](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation)

### Shared acceptance scorecard

Test the same current NZ question in text and voice; one remembered preference with a private work boundary; one revised/cancelled reminder received on the actual device; one bounded daily brief; one disrupted commute; one reviewed meeting action; one complete shop or family-trip comparison. Use successful, failed, stale, ambiguous, malicious and revoked-permission cases.

Proposed release gates are zero unauthorised writes, cross-owner leaks or duplicate irreversible effects in the test suite; every claimed mutation has read-back evidence; every time-sensitive claim has provenance; injected outages remain recoverable. These are targets, not current measured results. Record p50/p95 completion time, cost per successful journey, support time, stale-source rate, retries, correction recurrence and voluntary repeat use. Set journey-specific numerical thresholds after a baseline, rather than inventing superior competitor scores. A PWA shortcut, native companion and OS widget are different surfaces and must be tested separately.

## 14. Delivery governance and decision log

### Autonomous build within a bounded scope

Proceed with reversible implementation, synthetic fixtures, source audits and tests in the approved workstream. Coordinate current branches before editing shared auth, conversation or UI. One integration owner reconciles dependent changes; each workstream supplies exact files, tests and evidence. A merge or deploy is not permission for a paid provider query, new credential, sensitive disclosure or partner outreach.

Use the design loop: reference image/design → real code → running preview → desktop/mobile screenshots → refinement → acceptance. Preserve originals and route ownership. Every release records commit, deployment, migration/flag state, source/provider changes, known limitations and rollback. Never claim final production visual proof from preview-only screenshots.

### Decisions recorded

- **Confirmed direction:** one DO interface, People and Business, reliability first, broad consumer ambition with narrow initial delivery.
- **Confirmed user observations:** Gemini voice works with a suitable accent; sign-in was retained. Wider surface/recovery proof remains a release task.
- **Proposed implementation:** shared durable state and a few read-only tools before complete household journeys and transactions.
- **Proposed commercial choice:** retailer first strategically; Fill may replace it as the first engineering pilot if buyer/access/value gates clear sooner. No simultaneous build promise.
- **Pending user/setup action:** secure Google OAuth credential transfer; Apple setup remains separate.
- **Pending evidence:** actual Gemini billing/data terms, isolated persistence/security readiness, provider rights, transaction access, source health and repeat-use economics.
- **Deferred by gate:** sensitive vault, owned conversational voice, high-end avatars/editor breadth, autonomous messaging/commerce and international agent distribution.

### Next implementation tickets

1. Reliability owner: close actual-surface auth/voice matrix and publish the exact current evidence baseline.
2. Knowledge owner: fix malformed-success, stale-law and unsupported-live claims; add fixed-time failure fixtures.
3. State owner: produce the owner/revision/consent schema and isolated migration plan; no production persistence toggle before review.
4. Interface owner: integrate one Write/Talk/Upload surface against those contracts without overwriting active branches.
5. Journey owners: select one Shop completion fixture and the synthetic family-Travel request/comparison contract; no live checkout/search by implication.
6. Commercial owner: qualify one retailer and, optionally, one clinic discovery route; keep existing outreach drafts unsent until authorised.
7. Security owner: review ordinary household scope and Gemini provider terms before private profiles or a beta cohort.
8. Release owner: maintain the live capability register and preserve/combine/archive manifest with evidence, rather than guessed dates.

## 15. Primary references

These links support provider capabilities, constraints and code reuse; they do not establish DO's own access or production readiness. Private repository links require the reader's own authorised access.

### Code and portfolio

- [Audited main source](https://github.com/katecoveny-svg/assemblnz-f0afd79d/tree/6a09eb061d667bf61c3740b0145ab3fb8a197e87)
- [Travel preparation](https://github.com/katecoveny-svg/assemblnz-f0afd79d/blob/6a09eb061d667bf61c3740b0145ab3fb8a197e87/lib/do/travel/preparation.ts)
- [Duffel adapter](https://github.com/katecoveny-svg/assemblnz-f0afd79d/blob/6a09eb061d667bf61c3740b0145ab3fb8a197e87/supabase/functions/live-travel/index.ts)
- [Preservation inventory at earlier audit](https://github.com/katecoveny-svg/assemblnz-f0afd79d/blob/707f529ca9a5b2712c951dde15458b0337afb890/docs/concept-visual-inventory.md)
- [Woolworths concept](https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards), [PowerPass concept](https://assembl-powerpass-get-back-to-job.katecoveny.chatgpt.site), [Contact private concept](https://contact-energy-assembled.katecoveny.chatgpt.site), [Z private concept](https://assembl-z-stop.katecoveny.chatgpt.site)

### NZ knowledge and rights

- [PCO developer API](https://www.legislation.govt.nz/developer-api), [API terms](https://www.legislation.govt.nz/learn-more/legislation-data/api-terms-of-use/), [Customs and Excise Act 2018](https://www.legislation.govt.nz/act/public/2018/4/en/latest/)
- [NewsAPI plan restrictions](https://newsapi.org/pricing), [Google Custom Search transition](https://developers.google.com/custom-search/v1/overview)
- [MET Norway terms](https://api.met.no/doc/TermsOfService), [Open-Meteo hosted API terms](https://open-meteo.com/en/terms), [MetService data access](https://about.metservice.com/our-data-access-policy)
- [RBNZ exchange-rate series](https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates/exchange-rates-and-the-trade-weighted-index), [RBNZ terms](https://www.rbnz.govt.nz/about-our-site/terms-of-use), [School directory API](https://www.educationcounts.govt.nz/directories/school-directory-api)

### Transactions and permissions

- [Duffel offers](https://duffel.com/docs/api/offers), [Stays workflow](https://duffel.com/docs/guides/getting-started-with-stays), [search pricing](https://duffel.com/pricing), [Links](https://duffel.com/docs/guides/duffel-links), [seller agreement](https://duffel.com/services-agreement)
- [Cliniko availability](https://docs.api.cliniko.com/openapi/available-time), [appointment operations](https://docs.api.cliniko.com/openapi/individual-appointment), [API permissions](https://docs.api.cliniko.com/)
- [Timely waitlists](https://help.gettimely.com/hc/en-gb/articles/1500002268262-Have-your-clients-add-themselves-to-your-waitlist), [Timely Zapier scope](https://help.gettimely.com/hc/en-gb/articles/1500002512181-How-to-connect-Zapier-with-Timely)
- [Electrical worker checks](https://www.ewrb.govt.nz/for-consumers/why-use-a-registered-electrical-worker/), [plumber/gasfitter/drainlayer checks](https://www.pgdb.co.nz/advice_for_consumers/), [LBP checks](https://www.lbp.govt.nz/for-homeowners/find-an-lbp/), [commercial-message consent](https://www.dia.govt.nz/Spam-Three-Steps)

### Security, privacy and AI

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access](https://supabase.com/docs/guides/storage/security/access-control), [Vault boundaries](https://supabase.com/docs/guides/database/vault), [backup scope](https://supabase.com/docs/guides/platform/backups)
- [OPC AI guidance](https://www.privacy.org.nz/resources-and-learning/a-z-topics/ai/), [privacy officers](https://www.privacy.org.nz/responsibilities/privacy-officers/), [IPP3A](https://www.privacy.org.nz/resources-and-learning/a-z-topics/ipp3a/), [HIPC](https://www.privacy.org.nz/privacy-principles/codes-of-practice/hipc2020/)
- [Māori data-sovereignty principles](https://www.temanararaunga.maori.nz/principles-of-maori-data-sovereignty), [OWASP prompt-injection controls](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html), [Gemini API terms](https://ai.google.dev/gemini-api/terms)
- [FMA digital-advice licensing](https://www.fma.govt.nz/library/guidance-library/who-will-need-a-licence-to-provide-financial-advice/), [MBIE open-banking guidance](https://www.mbie.govt.nz/business-and-employment/business/consumer-data-right/guidance-for-the-consumer-data-right/regulated-open-banking-guidance)
