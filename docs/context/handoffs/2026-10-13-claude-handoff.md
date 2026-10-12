# Assembl product design and engineering handoff

For Claude Design and Claude coding • 13 October 2026 • New Zealand daylight time • Snapshot through 10:18

Continue Assembl’s existing product, design and engineering work. Build a credible, distinctive DO experience on one dependable foundation, led by grocery. Preserve its best scenes and interactions; improve a complete customer journey before adding demos or rewriting the platform.

Assembl is a New Zealand business at https://assembl.co.nz. Help people and teams prepare and complete useful work with explicit approvals, understandable evidence and a record of what happened.

This is a dated delivery baseline. Checks below describe a specific release or local branch, not a fresh production audit. Reported Vercel failures are under investigation. Recheck the live deployment, branch and active changes before editing or declaring production healthy.

### Product map

| Product | Purpose | Relationship to DO |
| --- | --- | --- |
| DO | Consumer and work execution | Primary outcome and approval experience |
| Pursuit | Signals, opportunities, tenders and reactivation | Helps identify worthwhile work |
| Studio | Visual demonstrations and campaigns | Makes proposed experiences tangible |
| Connect | Normalized callable capabilities through APIs and MCP | Intended capability layer across agents |

These are product directions; the table does not imply every capability is live. Fill, a cancellation and waitlist concept, and Reactivate remain promising concepts rather than shipped products.

### The five commercial programmes

1. Grocery and agentic loyalty: DO Shop plus the Woolworths and Everyday Rewards flagship.
2. Project to pickup: Bunnings and PowerPass, with narrowly scoped contractor evidence patterns.
3. Household energy: Contact explanations, choices and a shared customer record.
4. Charging stop utility and loyalty: Z Stop.
5. Travel: a distinct customer experience, sequenced after Shop on shared foundations.

Grocery comes first. These are five programme directions, not five concurrent production launches. Woolworths is the first grocery partnership target. Foodstuffs is deferred by preference; do not present that as a legal restriction. A New Zealand Shopify retailer is a possible fallback only if approved. Partner outreach drafts have not been sent. Client-branded concepts do not imply retailer endorsement or a commercial partnership.

<!--page-->

## 2 Design direction to preserve

The visual ambition is premium, editorial and unmistakably Assembl: generous whitespace, clear language, nature assembling into useful outcomes, New Zealand aerial photography, dimensional objects and purposeful motion. Use scroll and 3D only when they help people understand the task. Avoid reducing the experience to a generic dashboard of interchangeable cards.

### Brand foundation

| Element | Canonical direction |
| --- | --- |
| Main typeface | Instrument Sans |
| Evidence and technical detail | IBM Plex Mono |
| Plum and deep plum | #492B3E and #240B21 |
| Muted tone and rose | #654A4E and #916A70 |
| Chalk and paper | #F5F1F2 and #FFFDFB |

Use the existing glass D with its interior dot. The known implementation is GlassIdentity using `/brand/do-glass-D-transparent.png?v=cutout1`. Reuse the actual asset. Do not replace it with an approximate SVG or redraw that loses the glass character or interior dot.

Client demonstrations keep the client’s visual identity. Woolworths shopper/app surfaces use green; Everyday Rewards loyalty surfaces use orange. Assembl’s plum palette must not flatten these into an Assembl-branded retailer app.

### Interaction and copy

- Make the next useful action obvious. Explain what will change before approval and what remains only prepared afterward.
- Keep Shop and Travel distinct in language, layout and task flow, while reusing identity, constraints, approval, preparation and receipts.
- Keep source evidence and uncertainty close to the claim they qualify. Use readable plain language rather than invented operational metrics.
- Design loading, incomplete input, provider failure, decline, cancellation, edits after approval and recovery with the same care as the happy path.
- Respect keyboard navigation, visible focus, reduced motion and small screens. A beautiful first viewport is insufficient if the primary action or receipt becomes inaccessible.
- Useful wait-state activity is optional. Never manufacture a delay to serve an offer, award fake credit, or measure success by making the user wait longer.

### Working with Claude Design

Start with the strongest existing experience and actual assets. Iterate from image or design reference to real code, then a running preview, desktop and mobile screenshots, and refinement. A static image is design direction, not proof of a working journey.

For each design iteration, return the best preview URL; the repository, branch and exact commit when code exists; desktop and mobile screenshots; and an export ZIP when available. Label any unavailable handoff component. Do not imply the preview updates another host automatically.

<!--page-->

## 3 DO release baseline and product boundaries

Canonical repository: https://github.com/katecoveny-svg/assemblnz-f0afd79d

Shop and Travel were released through PR 1513: https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1513

Merged main commit: `b66c203cbe2d7764f83c893a511e8692f0aa197b`.

Recorded deployment: `dpl_5vw6hWfnYRi4tgZGLS6KjV5fPXVE`, READY at that release. Production may have changed since. Current Vercel failures remain under investigation; this is not an all-green statement.

| Surface | Released scope | Boundary |
| --- | --- | --- |
| /do/shop | Pantry, quantities, packs, budget, substitutions and sample basket | Planning and review only |
| /do/travel | Manual itinerary, version and provenance, review, decline and prepared receipt | Planning and review only |
| Demo rewards | Optional and idempotent sample reward behavior | No verified real reward issuance |

Known release checks passed: 78 tests, 36 evaluations, build, type checking, lint and desktop plus 375px mobile checks. These results belong to the release baseline, not to all later code or all other hosted demos.

### Shop acceptance model

The user can describe a need, inspect the pantry and quantity assumptions, adjust packs or budget, review substitutions and see a prepared basket. Changes must propagate into the same current plan and receipt. A sample basket must remain clearly identifiable as sample data.

No live retailer prices, stock, cart, checkout or authorized retailer feed has been verified. Do not add “buy now,” “ordered” or “in stock” language unless a real authorized integration supports that exact state and its failure paths are tested.

### Travel acceptance model

The user can prepare and edit a manual itinerary, inspect provenance, review or decline the current version and obtain a prepared receipt. The experience can be useful before paid search or booking is connected, provided its boundary is explicit.

Do not make a manually prepared itinerary look like a confirmed reservation. Live offers, expiry, fare rules, passenger data, payment and ticketing require a separate authorized integration and acceptance process.

### Shared behavior to retain

An edit that changes consequential inputs invalidates prior approval. Customer and operator views should read the same revision rather than independent copies. A receipt records an actual state transition and its evidence; it must not imply completion of an external action that never occurred. Declining or skipping an optional reward preserves the ordinary task journey.

<!--page-->

## 4 Client demonstration status

The catalogue audit covered 38 Sites, 64 demo pages and 33 code families. Original sources and historical references remain preserved. The current combined destinations below supersede older audit status labels; they do not mean the whole portfolio has been rebuilt.

### Woolworths and Everyday Rewards

Best current partner-facing preview: https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards

Public version 13 is the stated published baseline. Its sequence combines a cinematic fridge, phone and produce scene with meal and list preparation, an optional reward and an operator view. Real OpenAI `gpt-6-astra` chat and a consented stock-fridge-photo path passed. Uncertain detections remain reviewable.

Products, prices, rewards and checkout remain simulated. Basic rate limiting exists, but a durable spending cap is not established. The Anthropic adapter is prepared and inactive. There is no silent provider fallback. Keys must remain securely stored and must never enter source, exports, screenshots or this handoff. A small quieter-chapter fix is saved as version 14 but is not deployed.

### PowerPass

Best current preview: https://assembl-powerpass-get-back-to-job.katecoveny.chatgpt.site

Public version 5 is the stated published baseline. Tested paths include planter and materials clarification, substitution, review, failure and retry, receipt, and invalidation after edits. Desktop and a 485px viewport were checked. That mobile-width result does not replace a fresh 375px acceptance check.

Keep the concrete job-to-materials-to-handoff story. A prepared collection record is not proof of real inventory, a supplier order or a payment. Preserve the distinction between consumer project help and trade language.

### Contact Energy

Private preview: https://contact-energy-assembled.katecoveny.chatgpt.site

Private version 3 is published. The model covers source plan and energy-window calculations, approval conflicts and shared receipts. Six deterministic tests span 24 combinations; the build passed. Changed page and model scoped type checks passed; the earlier whole-project check reported existing Cloudflare binding and module typing issues outside the changed files.

Desktop browser access reached the private sign-in gate, so visual and interactive acceptance remains unverified. Do not change access or bypass authentication to obtain screenshots. Keyboard, reduced-motion, mobile overflow and live interactive checks remain open. Use an authorized authenticated browser for those checks.

### Z Stop

Private preview: https://assembl-z-stop.katecoveny.chatgpt.site

The private destination remains unchanged. Z consolidation is still outstanding. Preserve its strong charging situation, photography and yellow/purple client identity; do not claim the proposed combined journey has shipped.

<!--page-->

## 5 Reuse the strongest existing work

The aim is one coherent journey per programme. Reuse valuable modules without copying outdated claims, spawning competing flagships or overwriting the original source.

### Grocery donor map

- `research/assembling-everyday-rewards/index.html`: fridge-to-basket staging and editable phone journey.
- `research/assembling-everyday-rewards/demo-fridge.jpg`: bundled demonstration image; keep it distinct from a user upload.
- `research/assembling-everyday-rewards/functions/api/agent.js` and `fridge.js`: existing model integration candidates to inspect before writing a second backend.
- `research/assembling-woolworths-rewards/`: phone, motion, cloud, mosaic and blueprint modules; reuse only where they improve the actual sequence.
- `research/assembling-woolworths-v1plus/`: richer historical chrome worth comparing rather than discarding automatically.
- `research/assembling-woolworths-cine/`: historical cinematic staging, with obsolete reward and wait claims removed where necessary.
- `components/customers/everyday-rewards/assembled/`: inspect AssembledExperience, ChangeOneThing, WaitAssembly, SharedRunViews, MemoryPassport, AgentNegotiation, HumanRescue and related components.
- `lib/concepts/woolworths-assembled.ts` and `lib/journey/journeys/everyday-assembled.ts`: existing scenario and shared-state candidates.

The old `/customers/everyday-rewards/dash` and `/ops` surfaces are historical shopper/operator implementations. Their operational detail may be useful, but they are not interchangeable with the newer household assembly journey. Do not let a donor’s name imply its capabilities are currently live.

### Other valuable patterns

PowerPass supplies a concrete job, item list, store handoff and resulting artifact. Borrow that clarity without copying trade branding into grocery. Contact’s source-to-result composition, usage chart, bill explanation and unsent human-help summary are useful; rewards and promotional waits should not be transplanted into outages or distress.

The Contact consolidation adapted the existing UsageChart pattern and inspected earlier ledger and wait-state code. It deliberately excluded credit mechanics and synthetic live waits. Its energy schedule uses priority, departure and available windows rather than a fixed fabricated timetable.

### Preserve before combining

For each selected replacement, record its destination URL or repository path, source version, access classification, donor assets, baseline screenshots, rollback method and untouched dependants. Retain old URLs and source until the replacement passes the full journey. Do not delete, unpublish, archive in bulk or alter sharing as part of a visual cleanup.

Repository source, separately hosted Sites, Cloudflare Pages and the main Next.js app have different deployment boundaries. A GitHub commit does not automatically update a Site; a Site publication does not update the main app. Confirm which surface the user is actually reviewing.

<!--page-->

## 6 Engineering and memory constraints

Build on the existing foundation rather than creating a competing shared core. The intended shared model includes identity, constraints, budget, explicit approval, preparation, provenance and receipts. Treat the following as acceptance requirements to reconcile with existing types, not an instruction to replace them with a new abstraction.

### State and evidence requirements

- Give each plan a stable identity and a current revision. Keep source evidence and uncertainty attached to relevant fields.
- Keep proposed, reviewed, approved, declined, prepared and externally completed states distinguishable where the domain needs them.
- Invalidate approval when an edit changes its inputs. Keep receipt and operator views aligned with the same revision.
- Make retry safe. Do not duplicate rewards, external requests or completion records after refresh or repeated clicks.
- Keep permissions, retention and consent explicit. Only remember what the user chose to save.
- Isolate provider adapters from the experience. An unavailable provider should produce an honest error or labelled sample path, not a silent substitute presented as the requested service.

### Authentication and persistent memory

The local authentication reliability branch addresses repeated sign-in, storage coupling and browser draft scope. It is not deployed. The combined local staging branch includes further preparation work; database migrations remain unapplied and provider adapters remain unwired.

The preview Supabase environment currently shares production. Isolated staging is required before enabling persistent memory. Required tables, RPC and cleanup are missing; relevant feature flags remain OFF. Browser drafts are not cross-session cloud memory. Do not promise that a saved preference follows the user between devices or sessions until that behavior is demonstrated with the intended backend.

A native WKWebView versus external-browser callback mismatch is a possible explanation for sign-in difficulty, not a verified root cause. One authorized email-link request on 13 October at 10:09:50 NZDT delivered to the inbox, and the user confirmed receipt. The link was not clicked in the recorded test. This proves delivery for that attempt; it does not prove successful authentication or explain earlier failures. No SMTP change is established. Never include authentication links, tokens or session material in a handoff.

The user reports old branding in the delivered sign-in email. An email-template branding update is assigned but not yet implemented. Preserve magic-link behavior, security and delivery settings while updating the presentation; this is separate from a web login-page change.

### Gates before enabling memory

Create isolated staging; apply reviewed migrations there; test the table and RPC contract; verify user isolation, retention and cleanup; prove sign-in callback behavior in the browser and installed experience; test saving, reloading, editing and deleting remembered data; verify failure and sign-out behavior; only then consider a separately reviewed production rollout. Keep flags off until the relevant gates pass.

<!--page-->

## 7 Branch and release coordination

Recheck these heads before using them. They identify known work, not permission to reset, force-push, merge or deploy. Coordinate ownership when two changes touch shared components, authentication, app shell or icons.

Released main through PR 1513 is documented in section 3, including its exact commit and scoped release checks. Recheck current deployment health before integrating the local work below.

### Authentication reliability

Branch: `codex/do-auth-memory-reliability`.

Commit: `e3f1fddd3`.

Local checks: 72 tests, types and lint. Not deployed.

### Combined authentication and preparation staging

Branch: `codex/do-auth-preparation-staging`.

Commit: `51bc22da1`.

Local checks: 35 embedded-database tests, 100 focused tests, build, types and lint. Migrations unapplied; provider adapters unwired. This is not a production-ready memory claim. A later broad authentication integration suite recorded 1,686 passing tests, two skipped and one pre-existing literal-href test failure reproduced on the released branch. Relevant targeted checks passed; do not call the whole suite clean.

### Active logo and interface release

Branch: `codex/do-logo-interface-review`.

Commit: `7817d627fb1ad0ddd8ae7c6ebd5e61b995d822ba`.

Changed scope: DoPresence TSX and CSS, DoMark TSX and login CSS. The work uses the exact glass asset and 48px controls. Desktop 1440px, mobile 375px, types, lint and four tests passed. No authentication logic changes are part of this visual slice.

Publication and refresh of the installed Chrome PWA icon were approved at 10:07 NZDT on 13 October. Release work and Vercel diagnosis are active; deployment is not yet verified. The installed DO app points to `/do/personal` and has an old cached icon; source icons are new.

The user also reports an actual widget with an old green A and the wrong font. This differs from the previously observed old plum D PWA icon; its source is still unknown. Investigate the exact screenshot and installed surface before claiming coverage. The requirement is current branding across actual installed interfaces, not only the webpage. Verify web assets, manifest, installed app, widget and sign-in email independently.

### Owned voice and phone avatar review

Branch: `codex/assembl-owned-voice-phone-avatar-review`.

Commit: `a559fc7b638e7f73969bbad8b30cb0d973a4c96f`.

Local checks: 41 tests. The `/do/voices` preview is local only and no preview server is currently established as running. See the voice constraints on the next page.

<!--page-->

## 8 Voice and external capability boundaries

### Owned New Zealand voice

The direction is an owned or self-hosted New Zealand voice, with a consistent identity across interfaces. Do not use ElevenLabs. Three existing recordings, warm, clear and bright, are playable in the local review work. They are previews, not newly generated conversational replies, Māori capability or a functioning phone service.

Linux ARM64 Docker is running on the Mac M5 Air with 16GB memory. At the last completed check, no Qwen weights or runtime were installed; installation is now authorized and in progress. The pinned model is approximately 4.52GB. Two approved caches recovered 6.19GiB; the latest free-space check is 19.13GiB. A bounded CPU attempt is considered feasible, with estimated steady disk use of 5.8–7.8GiB and transient use of 9.3–9.5GiB. These are planning estimates, not measured inference results.

At 10:18 NZDT on 13 October, the user approved official CPU runtime and pinned-model downloads followed by one short local test, bounded to 3 CPUs and 6GiB with an 8GiB host-disk reserve, offline inference and no paid infrastructure. Installation is in progress; successful completion and new generated audio are not yet verified. Runtime proof remains outstanding.

Do not promise that matching voice is available everywhere today. Do not introduce paid GPU infrastructure or configure new credentials without approval. Validate latency, intelligibility, memory pressure, cancellation and fallback before integrating voice into the main DO flow. Māori pronunciation and language support need deliberate validation and appropriate data permissions rather than an assumed capability claim.

### Travel provider

Duffel’s production live-travel configuration is recorded as ACTIVE at version 105. `DUFFEL_API_TOKEN` was absent from the inspected metadata. That observation does not prove the user lacks an account. The live adapter is prepared but unwired. Search may incur costs, so obtain approval before initiating a chargeable provider workflow.

Do not create new credentials, switch accounts or enable persistent access as an incidental implementation step. Confirm the intended environment and approved service scope. Keep offer search, itinerary preparation, payment and booking as separate capabilities with appropriate state and permission boundaries.

### Retailer and model providers

No authorized retailer feed, cart or checkout integration is verified. Keep catalogue fixtures and sample prices visibly labelled. Seek the approved partnership or retailer route before treating a demo basket as executable.

The Woolworths model integration has a tested OpenAI path. The Anthropic adapter is prepared but inactive; do not silently activate it or change providers. Apply durable spending controls and monitoring before any broader live usage claim. Basic rate limits do not constitute a budget cap.

### Commercial evidence

Use proposed pilot measures such as successful task completion, corrections, avoided rework, accepted and rejected substitutions, response latency and explicitly opted-in reward outcomes. Do not invent customer demand, funded pilots, revenue, endorsement, conversion uplift or savings. Where a result is estimated, show the assumptions and source.

<!--page-->

## 9 Priorities and acceptance gates

### First establish the release baseline

Inspect the actual Vercel failure, affected project, commit and environment. Separate a build or deployment problem from authentication, cached PWA assets and a client-side rendering failure. Do not “fix” all four by replacing the app shell. Preserve the active visual branch and recover a verified preview before considering publication complete.

Acceptance: exact commit and deployment identified; build and runtime checks complete; desktop and mobile route checked; served glass asset and manifest verified; installed PWA icon checked separately; remaining failures stated clearly.

### Then make one grocery journey dependable

Use public Woolworths version 13 as the current published baseline and inspect saved version 14 before changing the same destination. Keep live model behavior separate from sample commercial data. Check correction of uncertain fridge detections, budget edits, substitutions, decline, retry, reset and shared receipts.

Acceptance: the current basket drives model context; edits update the same revision; unsupported or cancelled uploads fail safely; decline does not earn rewards; no external order or reward is sent; keyboard, reduced motion and 375px mobile work; model failure is honestly labelled; cost controls are explicit.

### Verify private Contact and finish the next bounded slice

Obtain an authorized authenticated session for the existing private Contact site. Preserve owner-only access. Verify desktop and mobile behavior, energy conflicts, edit invalidation, decline, reset, shared customer/operator state and reduced motion. Then address Z as a separate scoped journey rather than treating its unchanged site as complete.

Acceptance: screenshots and interaction evidence from the actual authorized site; current version recorded; no unsupported savings, live device or tariff claims; no privacy or sharing expansion.

### Isolate staging before persistent memory

Reconcile the two authentication branches and combined staging work with current main. Establish the isolated environment and prove the memory gates in section 6. Do not enable persistent behavior to make a visual demo feel more complete.

### Advance voice and providers only through their gates

Follow the approved bounded voice installation plan and verify its disk and memory limits. Test a real generated reply before making a runtime claim. For external providers, verify account, environment, approved costs, credential availability, data permission and rollback before wiring live actions.

### Definition of done for each slice

Return the actual user outcome, changed files and exact version, preview and production status, relevant tests, desktop/mobile screenshots, limitations and rollback. Mark blocked work as blocked. A screenshot, local passing test or successful publication alone is not proof of the full customer journey.

<!--page-->

## 10 Reusable brief for Claude

Use the following instruction with this handoff and the current repository or design export.

“Continue Assembl’s existing DO product and client demonstrations. First inspect the current branch, uncommitted changes, active release and target hosting surface. Confirm which slice you will own before editing shared files. Preserve original sources, access boundaries, assets and historical versions.

Keep Assembl’s premium editorial design, Instrument Sans and IBM Plex Mono, its plum/chalk/paper palette and the exact glass D asset. Keep client demos in their client identity. Improve one complete journey with clear preparation, review, approval, decline, error recovery and receipts. Preserve separate Shop and Travel experiences on shared foundations.

Reuse the strongest existing scenes and working components. Move from design reference to real code, running preview, desktop/mobile screenshots and refinement. Do not replace useful domain behavior with generic cards or create another competing flagship.

Before claiming something is live, verify it. Model chat does not make stock, prices, carts, checkout, rewards, booking, persistent memory or generated voice live. Label simulations and prepared states. Do not manufacture wait times, rewards, savings, endorsements or completion claims.

For the agreed slice, return the best preview URL, repository/branch/commit or exact Site version, changed files, test results, desktop and mobile screenshots, export ZIP if available, known limitations and rollback. Do not publish, change sharing, merge competing work, send outreach, initiate paid provider activity or configure credentials without the applicable approval.”

### Input package for the next design iteration

- This handoff and the canonical repository or a current export.
- Exact target URL and version, plus a clear description of the slice to improve.
- The actual glass D and other selected source assets, with client branding preserved.
- The newest desktop and mobile screenshots from that target, identifying viewport and date.
- Active branches and the person coordinating shared-file changes.
- A concise list of acceptance tests and any currently blocked access.

No export ZIP or fresh screenshots are bundled with this document. Obtain the current target export and capture the actual preview rather than treating historical portfolio thumbnails as current runtime evidence.

### Evidence and reference hierarchy

Use the latest verified target version and release evidence ahead of older portfolio labels. The 12 October concept inventory, portfolio rationalisation and implementation checklist explain the donor map and original prioritisation. The Contact consolidation result establishes private version 3 publication and its outstanding visual QA boundary. Repository anchors include `docs/concept-visual-inventory.md` and `lib/demos/catalogue.ts`.

The portfolio audit scanned main at `707f529ca9a5b2712c951dde15458b0337afb890`, with 9,750 tree entries, and paginated 838 branch names. It compared selected relevant branch heads; it was not an exhaustive inspection of every historical branch tree. Do not reset to that audit commit or equate ancestor status with preservation of every old visual.

The current repository, PR and client preview links in sections 3 and 4 are the practical starting points. Reconfirm current state before implementation. Keep this handoff updated with dated evidence rather than silently upgrading planned or local work to production status.
