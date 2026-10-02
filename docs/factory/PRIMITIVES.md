# assembl primitive registry

A primitive is a reusable capability that makes later products faster, safer or better.

Do not extract something merely because it might be reused. Prefer extraction after a second real use or when the mechanic is clearly cross-product infrastructure.

| Primitive | Status | Location | Used by | Tests/evals | Notes |
|---|---|---|---|---|---|
| NZ evidence service contracts | inactive review slice | `lib/nz-evidence/` | future authenticated connected dots; no runtime registration | `lib/nz-evidence/service.test.ts` | closed auth/NZBN adapters, mock-tested official wire contract, owner/version/page-cited fictional preparation receipts; no provider, charging, ingestion or production change; see `docs/services/nz-evidence-pilot.md` |
| NZ freight / redacted RFI public transforms | unpublished callable candidates; HTTP unmounted | `lib/nz-evidence/{freight,customs-public,architecture}.ts`, `plugins/mcp-servers/mcp-nz-evidence/` | portable freight and architecture development packages | candidate/transport suites + 16 executed MCP cases | exact public Customs code/FX references, deterministic non-identifying shipment packet and user-supplied RFI register/compare/CSV; no source-PDF verification, model, private account, storage, billing or submission; see `docs/services/nz-plugin-candidates.md` |
| NZ plugin hosting admission / ZIP normalization | inactive closed proposal; local proof | `security-proposals/nz-plugin-hosting/policy.ts`, `scripts/lib/nz-plugin-zip.mjs` | future public stateless freight/RFI endpoints; no mounts | hosting contract tests and full four-timezone package parity | closed distributed port, strict host/body/metric contracts, proposed atomic limits and deterministic development ZIP headers; DB/WAF/DNS/hosting/cost/identity release gates remain; see `docs/services/nz-plugin-hosting-proposal.md` |
| CustomerJourney foundation | existing | `lib/journey/` | journey surfaces | see journey docs/evals | reusable journey runtime |
| Business/customer context | existing | `lib/customers/` + related genome/context code | customer workspaces/journeys | audit needed | consolidate semantics before expanding |
| Model routing | existing | `lib/ai/router.ts`, `lib/os/routing.ts` | agent/model work | routing tests | model is replaceable; route by task capability, measured performance, privacy, latency and cost |
| TypeSafe bounded decision pilot | review-branch preview | `lib/typesafe/`, `/api/do/decision` | `/pursuit/typesafe`, `/do/typesafe`, `/creative-studio/typesafe` | `lib/typesafe/pilot-contract.test.ts`, `node --test scripts/check-typesafe-pilot.cjs` | creates a shared decision adapter; uses DO router/policy/auth; source consent + owner allowlist; live provider verification pending key; draft-only, no cross-tab execution or durable client storage; see `docs/integrations/typesafe-pilot.md` |
| Agent registry | existing | `lib/agents.ts` + plugin prompts | agent surfaces | `pnpm test:agents` | files are canonical; DB prompt table is cache |
| DO focused product frame | review branch | `components/do/DoProductFrame.tsx`, `do-product-focus.module.css` | Meeting DO + portable workspace | `scripts/review-do-focus.py` | Shared chrome with DO home return and route-preserving sign-in; full-page workspace keeps browser drafts, embeds keep their isolation; one primary task, secondary tools in More; no task/record data deleted; capture and provider permissions remain separate |
| Meeting follow-through | review branch | `apps/do/shared/meeting-followthrough.ts`, `apps/do/services/meeting-followup.ts`, `/api/do/meetings/follow-up` | Meeting DO | helper, route, ownership and action-request retry tests | Extends existing operator action queue with owner-scoped retry IDs; reuses browser task store; agenda/ICS export only; no autonomous sending, calendar booking or completed-work claims; see `docs/do-meet/MEETING-FOLLOW-THROUGH.md` |
| Canvas/design primitives | existing | `packages/canvas/` | UI surfaces | package build required | use current canon palette |
| Journey proof/eval | existing | `lib/journey/` + `pnpm eval:journeys` | journeys | existing eval command | expand before creating parallel proof systems |
| DO bounded text reasoning | review branch, explicit config | `apps/do/shared/reasoning-server.ts`, `provider-consent.ts` | text/Life Admin/meeting drafts, decision preparation, family digest | reasoning wire, preparation/route/family tests | Extends proven Personal TypeSafe → GPT-6 Astra orchestration and durable owner admission; no fallback/tools; named request consent; old background grants paused pending durable renewal; private allowlisted Personal path remains scoped. See `docs/do-personal/ASTRA-COORDINATION.md`. |
| DO AgentSpec runtime | existing / active | `apps/do/shared/` | browser extension, hosted DO, Mac/mobile surfaces | DO tests need expansion | portable agent definition, policy, compile/router/evidence spine; surface ≠ agent |
| DO travel preparation | review module | `lib/do/travel/preparation.ts`, `manual-input.ts` | existing editable DO trip; UI integration pending | travel preparation/manual-input tests | extends shared travel; synthetic import and real manual-field review controller, explicit timezone/offset, session-only originals, private-field allowlist, stale evidence, opens Uber only; no booking permission; see `docs/do-travel/README.md` |
| Studio Task DO Maker | active foundation | `lib/studio/task-do-maker.ts`, `/studio/do-maker`, `/do/maker/partner/*` | Pursuit overview handoff + partner-facing skins + DO Office session intake | `lib/studio/task-do-maker.test.ts` | shared core for Mode A (Pursuit pitch) and Mode B (partner chrome, rewarded-wait); offline `bp`/`warehouse` skins; drafts-only AgentSpec export |
| DO approval/evidence boundary | existing / active | `apps/do/shared/policy.ts`, approval/evidence primitives | all DO surfaces | audit/expand | consequential actions remain approval-gated and should leave evidence |
| DO appointment availability | review branch / disconnected | `lib/do/availability/` | personal appointment/tradie preparation | `availability.test.ts` | Creates bounded read-only provider/directory adapters, dated slot evidence and exact review/enquiry objects; uses DO demo fixtures and prepare/review conventions. No live feeds, bookings, holds or messages. Synthetic mode cannot prepare live actions; see `docs/DO-APPOINTMENT-AVAILABILITY.md`. |
| Builderdoo job contract | active foundation | `apps/do/shared/builder.ts`, `/api/do/builder/plan`, `/do/builder` | Builderdoo + future repo execution adapters | `apps/do/shared/builder.test.ts` | persistent build identity/context/authority/proof contract; provider is selected separately |
| Builderdoo durable Office jobs | active foundation | `apps/do/shared/office-jobs.ts`, `apps/do/services/office-jobs.ts`, `/api/do/builder/jobs`, `do_agents`/`do_receipts`/`do_job_events` | Builder + Office | `apps/do/shared/office-jobs.test.ts`, `app/api/do/builder/jobs/route.test.ts` | owner-scoped save/list/reopen; database provenance; missing storage returns unavailable, never hidden memory fallback; `job_accepted` means saved plan, never build success |
| DO Office coordination projection | active foundation | `apps/do/shared/office.ts`, `docs/DO-OFFICE-ARCHITECTURE.md` | DO Office + future voice/companion coordination | add tests before wider use | Personal/Work/Client workspaces, structured handoffs, visible approvals/evidence; not a second agent runtime |
| DO Office spatial projection | active foundation | `app/do/office/DoOfficeSpatial.tsx` | 3D Office | visual/runtime proof required | R3F scene projects real Office status; accessible 2D board remains the task-detail surface and state owner |
| Public atelier journey | existing / hardened | `WorldAtelierStage.tsx`, `AssemblWorldHero.tsx`, `DoAtelierHero.tsx`, `app/preview/do-world/WorldScene.tsx` | public home, `/do` landing, world study, Studio spatial tour (review) | hero resilience tests + front-door guard | one Blender scene; shared stage; Studio adds an opt-in 24-second tour and playhead-driven demand rendering in the 28 Sep review branch; still fallback and reduced-motion support |
| Browser Runtime owner preview | preview / non-durable | `apps/do/shared/browser-runtime.ts`, `/api/do/browser-runtime` | authenticated web preview | helper + route ownership/stale-review tests | owner-bound memory; permit/review generation required; no external effects or extension auth bridge |
| DO native Mac companion | active development | `apps/do/macos/` | cross-app DO surface | Mac compile/smoke-test needed | floating companion, explicit accessibility capture/paste, persisted position/visibility, opt-in login launch |
| Agent email transport/audit | existing | `lib/agent-email/`, `supabase/functions/agent-email-*`, `agent_email_*` tables | provisioned agent identities | audit before DO mailbox linking | reuse for real DO mailboxes; never fabricate addresses from agent names |
| Shared context manifest | existing | `config/context-manifest.json`, `docs/context/*` | Codex, Claude, Grok, Hermes, DO runtimes | `pnpm context:check` | one repo-backed memory spine across harnesses |
| Agent-paid tool gate | active | `lib/tools/` (`auth`, `keys`, `sandbox`, `cap`, `receipts`, `invoke`, `store`, `registry`) | `/api/tools/nz-who-runs-it`, `nz-trade-finder`, `meeting-enhance`, `nz-compliance-ping` | `lib/tools/__tests__/agent-paid-tools.test.ts` + route tests | URL + key + daily cap + receipt; `test_` sandbox never hits live upstreams |

| DO shared financial foundation | review build; demo + local CSV; Redbark adapter only | apps/do/finance/, app/do/bills/ | Bills now; Money/Business/Tradie contract | financial domain/adapter tests; browser proof pending | integer money, scoped reads, checked invoice dates, recurring candidates and editable enquiries; no live bank auth or financial writes |

| DO sculpted identity + composition light | review build | `components/do/DoPresence.tsx`, `DoGlowCard.tsx` | Public product scenes, DO launcher, workspace, Bills | build/SSR checks; desktop and 375px visual proof pending | Canonical SVG with CSS depth; no WebGL dependency; decorative, never connectivity evidence; reduced-motion fallback; extends existing glow primitive with bare composition variant |

## Candidates to inventory

### Assembl creative brand profile (review implementation, 22 Sep)

- **Extends:** existing `CreativeStudioShell`, `BrandImageMaker` and `/api/creative/image`; mounted at `/creative-studio/assembl`.
- **Shares:** `lib/creative/assembl-brand.ts` across reference selection, prompt export and server-side image direction. Explicit Assembl profile only; client briefs retain their own direction. Canvas exports use the active next/font family.
- **Proof:** API brand/rate-limit tests, destination and middleware tests. Visual export and provider quality review still required. Separate hosted private Studio source is outside this repository; see `docs/PURSUIT-STUDIO-BRAND-ALIGNMENT.md`.

### Website-led Pursuit outreach (review implementation)

- **Extends:** public Pursuit research, source provenance, bounded provider calls and existing trial reservation/storage. Optional `website_outreach` workflow; legacy research remains supported.
- **Creates:** `lib/pursuit/outreach.ts` for typed account research, source-link validation, exact-draft review identity and evidence-bearing text exports.
- **Used by:** `/pursuit#website-outreach`. Evidence: `lib/pursuit/outreach.test.ts` and public Pursuit browser CI. See `docs/PURSUIT-WEBSITE-OUTREACH.md`.
- **Limit:** drafts and downloads only; no verified personal contacts, sending, scheduling or CRM mutations. Live quality and visual proof must be verified before ship-ready status.

### Household flexibility simulation (review implementation)

- **Creates:** `lib/flex/adapter.ts` — a provider-neutral read/prepare/execute/override boundary with a simulated-only implementation, exact-plan approval, expiry, replay protection and revocation.
- **Uses:** Journey `ProposedAction`, canonical DO identity; one shared experience serves `/do/flex`, `/creative-studio/flex` and `/pursuit/flex`.
- **Evidence:** `lib/flex/adapter.test.ts`. Scope and live-provider prerequisites: `docs/ASSEMBL-FLEX.md`.
- **Limit:** browser-local simulation, not production identity/authorisation, grid control or settlement. No verified Kraken integration.

### Other candidates

- Builderdoo repo execution adapters (GitHub-connected worker, local harness, external coding harness)
- Builder/Office execution outcome receipts linked to `os_evidence` / `model_calls`
- model/token/cost usage rail from `model_calls`
- signal ingestion
- opportunity scoring / evidence provenance
- company/brand ingestion
- explicit screen/window context capture for DO (ScreenCaptureKit + browser bridge)
- durable DO Office handoffs + multi-workspace UI wiring
- human approval gates outside existing DO/journey paths
- receipts/traces across non-DO products
- connector framework consolidation
- Studio demo shell
- image/video/Remotion generation wrappers
- tender/proposal generation
- PR/browser evidence capture
- tenant/demo provisioning
- billing/entitlements

## Rule for new work

Every substantial feature should state one of:

- **uses** existing primitive(s)
- **extends** existing primitive(s)
- **creates** a new primitive
- **one-off by design**, with reason

When a feature creates reusable mechanics, update this registry before closing the task.

### Portable DO context companion (September 2026 refinement)

**Extends** the existing `apps/do/shared/distribution.ts` widget and existing `DoTextWorkspace`/`DoVision` review flows. `page-context-script.ts` is the single bounded DOM text reader used by the website embed and generated Chrome `floating.js`; regenerate with `node --import tsx scripts/generate-do-companion.ts` before packaging downloads. Position preferences alone persist. Pointing requires an explicit mode and click, then an editable context review. The receiver acknowledges receipt, clears prior provider consent and never starts preparation from a message. Cross-window pixels use the existing user-selected snapshot flow. Keep extension permissions unchanged and retain the full-window/copy fallback on sites that block frames. This is not the separately hosted Pursuit app's source or a background desktop agent.

**Extends** portable export with `apps/do/shared/sharing.ts` and `DoShareButton`: a fixed public invitation URL is a separate request type from explicit reviewed text. Native sharing uses a supported text file or text payload; cancellation never falls through to copying. This is user-directed sharing through the OS, not a server send or public note publication. Phone home-screen installation reuses the existing DO PWA identity.

### DO meeting wrap and Studio framing (review implementation, 28 Sep)

- **Creates:** `apps/do/shared/meeting-wrap.ts`, an explicit-entry closing check and portable reviewed text pack. Used by `MeetingWorkpad`; extends existing share/export and transcript preparation. It does not analyse live audio, assign tasks or send follow-up. Editing clears sharing review.
- **Creates:** `lib/creative/image-framing.ts`, one crop/contain/position/zoom/matte geometry for canvas preview, full PNG export and post handoff. Controls live in the existing Assembl image maker. Original uploaded references remain intact for generation.
- **Extends:** actual atelier `WorldAtelierStage` with optional playhead invalidation for opt-in Studio playback, without changing the scroll-led callers. New generated concept artwork is documented in `public/studio/assembly/README.md`.
- **Proof:** helper tests, existing meeting/share/image route regression tests, `scripts/review-do-studio.cjs` and the evidence linked in `docs/DO-STUDIO-MUSE-20260928.md`.
- **Access boundary:** separate signed-in Pursuit/Studio source was not available; no claim that those hosted private hubs changed.

## DO phone viewport handling · 30 Sep 2026

Extends `apps/do/shared/distribution.ts`, shared by the website and generated extension: clamps launcher/panel to `visualViewport`, preserves safe areas, supports touch dragging and reset position, and keeps context review separate from movement. Proof: `floating.test.ts` and `scripts/review-do-mobile.cjs`. Physical iPhone QA remains separate. The iOS keyboard is an offline development foundation, not a native agent runtime or installable release.

### Personal DO responsibilities (30 Sep 2026)

**Creates:** `apps/do/personal/` + `/api/do/personal` and the `do_personal_*` tables/RPCs: owner-scoped saved context, expiring preparation consent, atomic daily claims, revocation-aware finish, independent quota and review history. **Uses:** existing DO owner verification, preparation provider ladder, evidence hashes and reviewed sharing. Cloud scheduling requires production cron configuration; no account monitoring, native push or autonomous external action is implied. See `docs/DO-PERSONAL-20260930.md` and its repeatable SQL/API/browser checks.

### Personal DO identity, calls and NZ life admin (30 Sep review implementation)

- **Creates:** owner-scoped `apps/do/personal/profile*.ts` identity/style contract and `/api/do/personal/profile`. **Extends:** existing preparation and Gemini live calls with bounded style, explicit consent, owner/revision checks and reviewed unsaved handoffs. Production profile-migration application and real audio proof require verification.
- **Creates:** twelve-workflow `apps/do/personal/life-admin/` review/evidence flow, UUID-scoped optional snapshots, guest work-loss warnings, local exports and calendar files. Uses existing vision and draft providers only after consent. No automatic external completion or reminders.
- **Creates:** `/do/receive` and `apps/do/shared/share-intake.ts`, a scoped text/link PWA handoff with escaped review, expiry, owner binding and URL token stripping. Old share API remains retired; OS support must be checked.
- **Creates:** `lib/do/nz-public-data.ts` and `/api/do/nz-public-data`, fixed-upstream, bounded, no-store NZTA public reads. **Uses:** existing rate backstop. Live source/route HTTP 200/400/503 proved; no user data, keys or private records sent.
- **Extends public-source reads:** `apps/do/personal/local-updates.ts`, `lib/do/nz-local-updates.ts` and `/api/do/nz-local-updates` add explicit city-centre MET Norway model forecasts and dated national GeoNet headlines, with source attribution, bounded provider caching, conditional validation and honest stale/unavailable UI states. No household login, precise location, private context or emergency monitoring. Fifty focused tests and live outbound adapter reads passed; combined preview/mobile proof remains a release gate. See `docs/integrations/nz-local-updates.md`.
- **Creates:** `DoReadAloud` / `read-aloud.ts`, explicit local-English-only speech output with safe unavailability. Device runtime proof pending.
- **Proof and rollout:** `docs/DO-PERSONAL-CUSTOMISATION-20260930.md`, focused API/domain tests, profile SQL suite, repeatable browser scripts. Do not turn passing unit tests into a live-provider or physical-device claim.

### Personal DO conversational reasoning and portable focus (30 Sep follow-up review)

- **Extends:** existing `lib/typesafe` vendor choice transport and `lib/ai/router.ts` OpenAI setup for `apps/do/personal/assistant*` and `/api/do/personal/assistant`. The primary conversation uses explicit named-provider consent, a bounded TypeSafe request check and validated Astra-only Responses output. No fallback, executor or durable conversation storage is introduced. Existing scheduled/checklist drafting and Google voice retain their distinct providers and consent; see `docs/DO-PERSONAL-ASTRA-TYPESAFE-20260930.md`.
- **Extends:** the shared distribution launcher to focus an already-open Personal DO rather than open a duplicate workspace. PWA installation keeps its identity and opens `/do/personal`; the older `/do/widget` remains a separate reviewed-capture surface. Source/generated-extension parity and fictional browser proof are tracked in `docs/DO-PORTABLE-UNIFICATION-20260930.md`.
- **Hardens:** the existing Android IME development scaffold with explicit local clipboard review/insertion and a fixed web-app handoff. No network permission, background clipboard capture or fake preparation success remains. Source checks are not a compiled or installed Android release.

### Private checklist snapshots and worker health (30 Sep 2026)

**Extends:** the existing life-admin schema, verified DO owner and Supabase service pattern with `/api/do/personal/checklists`, `ChecklistCloud`, `cloud*.ts` and `do_personal_save_checklists`. Explicit consent, owner/session-scope matching, full-schema validation, bounded collections and atomic expected-revision writes are reusable. Empty snapshots retain their revision to prevent stale resurrection. Restore preserves open edits. No automatic sync, chat storage, household sharing or model invocation. **Extends:** scheduled-worker presentation with heartbeat freshness; configuration is not operational proof. See `docs/ASSEMBL-DELIVERY-AUDIT-20260930.md` and repeatable SQL/API/browser checks.
# Enquiry execution primitive (30 September 2026)

`apps/do/enquiries` extends verified DO ownership, Supabase storage, the existing
Brevo sender, the Personal DO scheduler and MCP membership permissions. Approval
is an atomic database claim bound to a saved draft revision; uncertain transport
results are not retried. Durable job evidence distinguishes provider acceptance
from recorded replies and bookings. Per-owner webhook keys accept idempotent
intake and outcome events; three-day follow-ups are fresh approval-required jobs.
`/api/mcp` exposes owner-scoped preparation/status/evidence, with no send tool.
See `docs/DO-ENQUIRIES-RUNBOOK.md` for activation, validation and limits.

### Unified DO entry and identity (30 Sep review implementation)

**Extends:** existing PersonalDo at `/do`, retaining `/do/personal` for PWA and reviewed share intake. Keeps `/do/widget` as the exact-path capture receiver; known legacy task links resolve there. Uses existing owner/session/consent logic unchanged. No notes enter navigation URLs.

**Extends:** `DoMark` through shared `DoPresence`, `DoBrand`, optional `DoEntryObject`/`DoObjectCanvas`, and `scripts/generate-do-identity.mjs`. Real bevelled geometry is progressive enhancement with static/reduced-motion fallback; no hosted provider or continuous render loop is needed. Consumer menus no longer label the seeded developer board as saved user tasks. Native source changes are not an installed/signed Mac release.

**Creates:** `lib/do/navigation.ts` for non-content DO sign-in return selectors, with explicit task/tool allowlists. Proof: `navigation.test.ts`, existing consent/owner/capture regression tests, and `scripts/review-do-unified.cjs`. See `docs/DO-UNIFIED-20260930.md` for actual check results and remaining release gates.
## Reviewed NZ public link boundary — review foundation

**Extends** kb_sources/kb_documents via `lib/public-nz/` and homepage/knowledge-search/general Pursuit. Code-reviewed GETS/Bills identity and URL constraints, anonymous bounded reads, no stored content/metadata output, explicit unknown publication/status and per-source stale/error telemetry. It supplies discovery links, not substantive intelligence or current opportunity claims. Proof: `lib/public-nz/model.test.ts`, `lib/public-nz/server.test.ts`; see `docs/PUBLIC-NZ-LINK-BOUNDARY.md` for DO integration and ingestion guarantees still required. No new ingestion, permissions, database changes or deployment.

**Review-stage extension:** `lib/public-nz/parliament.ts` independently reads fixed official bill UUID detail endpoints with a shared 2-second deadline, 128 KiB body cap and maximum two records. Strict identity/selected-field validation yields inert public title/excerpt/status plus explicitly named introduction/activity dates. Fresh factual evidence and discovery remain distinct within one 4,000-character context budget; stale evidence is excluded. Read-only live proof succeeded; DO integration remains with its owning worker. See the same boundary document for the contract and remaining release gates.

### Optional Personal DO context and review queue (review build)

Extends existing `apps/do/personal` responsibilities, runs and worker health with `memory.ts`, `memory-service.ts` and `review-queue.ts`. Owner-only self context has explicit notice/consent, provenance, retention and CAS/tombstone forgetting; memory is never model input in this phase. Family roles are fictional preview metadata with no authority. SQL proposal remains outside migrations and the feature is inactive. Proof: personal unit/API suite plus `scripts/test-do-memory-sql.cjs` with isolated PostgreSQL concurrency mode. See `docs/do-personal/README.md` for activation blockers and adapter contract.

The separate inactive provider-use stage extends this with `memory-use.ts`, `memory-use-server.ts`, `memory-use-storage.ts` and `preparation-controls.ts`. Confirmed self goals/preferences/constraints require separate versioned OpenAI+TypeSafe consent, exact owner/purpose/revisions and fresh dispatch/publication checks; collection-only records remain rejected. An unapplied SQL proposal adds CAS/tombstones, consistent retrieval and unique job-bound novelty reservations that survive restarts. Context changes revoke derived drafts. No route, scheduler or provider wiring activates this capability. See `docs/do-personal/PROVIDER-MEMORY.md` and isolated `scripts/test-do-provider-memory-sql.cjs` for contract and proof.

### EA-to-EA diary coordination (fictional review foundation)

Creates `apps/do/coordination/protocol.ts` and `/do/coordination`: strict synthetic envelopes, exact-window disclosure, deterministic overlap, revision/digest-bound dual review, expiry/revocation, idempotent delivery and three-round cap. Uses canonical DO frame/identity. Session-only two-adult fixtures; no production peer identity, memory access, calendar permissions, durable delivery or booking. See `docs/DO-EA-COORDINATION.md` for audited boundaries, tests and live adapter gates.

### Authenticated EA coordination (inactive durable proposal)

Adds `apps/do/coordination/durable/*` and `/api/do/coordination` behind an off-by-default pilot flag and a reject-all pairing adapter. Authenticated session-bound commands and private snapshots use proposed isolated participant storage, exact disclosure/proposal approval, CAS, bounded rounds/quotas and durable replay tombstones. SQL remains `docs/do-coordination/schema-review.sql` outside migrations; no real pairing, calendar/provider action or external transport. Public fictional review stays unchanged. See `docs/do-coordination/README.md` for PostgreSQL proof and activation gates.

- **Assembled glass identity:** `components/brand/AssembledGlassMarks.tsx` reuses canonical lowercase assembl a and uppercase DO D-dot contours as real scene geometry; `AssemblGlassMark` supplies the small opaque vector. Keep the demand-rendered atelier and complete real-scene fallbacks; raster artwork never substitutes for motion proof.
### Freight-only closed hosting review

Extends the inactive NZ hosting proposal with a minimal closed Node entry/build, quota-only driver, separate cleanup role/RPC and fixed health receipts. Actual local PostgreSQL/Node-driver and HTTP proofs are recorded in the source review artifact; no project, route, login, grant, Cron or provider is activated. See `docs/services/nz-freight-owner-permission.md` for the narrowly scoped protected-setup boundary, pending actual cost confirmation; no database/Cron/public/spending authority is included.
