# assembl primitive registry

A primitive is a reusable capability that makes later products faster, safer or better.

Do not extract something merely because it might be reused. Prefer extraction after a second real use or when the mechanic is clearly cross-product infrastructure.

| Primitive | Status | Location | Used by | Tests/evals | Notes |
|---|---|---|---|---|---|
| CustomerJourney foundation | existing | `lib/journey/` | journey surfaces | see journey docs/evals | reusable journey runtime |
| Business/customer context | existing | `lib/customers/` + related genome/context code | customer workspaces/journeys | audit needed | consolidate semantics before expanding |
| Model routing | existing | `lib/ai/router.ts`, `lib/os/routing.ts` | agent/model work | routing tests | model is replaceable; route by task capability, measured performance, privacy, latency and cost |
| TypeSafe bounded decision pilot | review-branch preview | `lib/typesafe/`, `/api/do/decision` | `/pursuit/typesafe`, `/do/typesafe`, `/creative-studio/typesafe` | `lib/typesafe/pilot-contract.test.ts`, `node --test scripts/check-typesafe-pilot.cjs` | creates a shared decision adapter; uses DO router/policy/auth; source consent + owner allowlist; live provider verification pending key; draft-only, no cross-tab execution or durable client storage; see `docs/integrations/typesafe-pilot.md` |
| Agent registry | existing | `lib/agents.ts` + plugin prompts | agent surfaces | `pnpm test:agents` | files are canonical; DB prompt table is cache |
| DO focused product frame | review branch | `components/do/DoProductFrame.tsx`, `do-product-focus.module.css` | Meeting DO + portable workspace | `scripts/review-do-focus.py` | Shared chrome with DO home return and route-preserving sign-in; full-page workspace keeps browser drafts, embeds keep their isolation; one primary task, secondary tools in More; no task/record data deleted; capture and provider permissions remain separate |
| Meeting follow-through | review branch | `apps/do/shared/meeting-followthrough.ts`, `apps/do/services/meeting-followup.ts`, `/api/do/meetings/follow-up` | Meeting DO | helper, route, ownership and action-request retry tests | Extends existing operator action queue with owner-scoped retry IDs; reuses browser task store; agenda/ICS export only; no autonomous sending, calendar booking or completed-work claims; see `docs/do-meet/MEETING-FOLLOW-THROUGH.md` |
| Canvas/design primitives | existing | `packages/canvas/` | UI surfaces | package build required | use current canon palette |
| Journey proof/eval | existing | `lib/journey/` + `pnpm eval:journeys` | journeys | existing eval command | expand before creating parallel proof systems |
| DO AgentSpec runtime | existing / active | `apps/do/shared/` | browser extension, hosted DO, Mac/mobile surfaces | DO tests need expansion | portable agent definition, policy, compile/router/evidence spine; surface ≠ agent |
| Studio Task DO Maker | active foundation | `lib/studio/task-do-maker.ts`, `/studio/do-maker`, `/do/maker/partner/*` | Pursuit overview handoff + partner-facing skins + DO Office session intake | `lib/studio/task-do-maker.test.ts` | shared core for Mode A (Pursuit pitch) and Mode B (partner chrome, rewarded-wait); offline `bp`/`warehouse` skins; drafts-only AgentSpec export |
| DO approval/evidence boundary | existing / active | `apps/do/shared/policy.ts`, approval/evidence primitives | all DO surfaces | audit/expand | consequential actions remain approval-gated and should leave evidence |
| Builderdoo job contract | active foundation | `apps/do/shared/builder.ts`, `/api/do/builder/plan`, `/do/builder` | Builderdoo + future repo execution adapters | `apps/do/shared/builder.test.ts` | persistent build identity/context/authority/proof contract; provider is selected separately |
| Builderdoo durable Office jobs | active foundation | `apps/do/shared/office-jobs.ts`, `apps/do/services/office-jobs.ts`, `/api/do/builder/jobs`, `do_agents`/`do_receipts`/`do_job_events` | Builder + Office | `apps/do/shared/office-jobs.test.ts`, `app/api/do/builder/jobs/route.test.ts` | owner-scoped save/list/reopen; database provenance; missing storage returns unavailable, never hidden memory fallback; `job_accepted` means saved plan, never build success |
| DO Office coordination projection | active foundation | `apps/do/shared/office.ts`, `docs/DO-OFFICE-ARCHITECTURE.md` | DO Office + future voice/companion coordination | add tests before wider use | Personal/Work/Client workspaces, structured handoffs, visible approvals/evidence; not a second agent runtime |
| DO Office spatial projection | active foundation | `app/do/office/DoOfficeSpatial.tsx` | 3D Office | visual/runtime proof required | R3F scene projects real Office status; accessible 2D board remains the task-detail surface and state owner |
| Public atelier journey | existing / hardened | `WorldAtelierStage.tsx`, `AssemblWorldHero.tsx`, `DoAtelierHero.tsx`, `app/preview/do-world/WorldScene.tsx` | public home, `/do` landing, world study, Studio poster | hero resilience tests + front-door guard | one Blender scene; shared stage; Studio uses poster + link to study until a full rail is justified |
| Browser Runtime owner preview | preview / non-durable | `apps/do/shared/browser-runtime.ts`, `/api/do/browser-runtime` | authenticated web preview | helper + route ownership/stale-review tests | owner-bound memory; permit/review generation required; no external effects or extension auth bridge |
| DO native Mac companion | active development | `apps/do/macos/` | cross-app DO surface | Mac compile/smoke-test needed | floating companion, explicit accessibility capture/paste, persisted position/visibility, opt-in login launch |
| Agent email transport/audit | existing | `lib/agent-email/`, `supabase/functions/agent-email-*`, `agent_email_*` tables | provisioned agent identities | audit before DO mailbox linking | reuse for real DO mailboxes; never fabricate addresses from agent names |
| Shared context manifest | existing | `config/context-manifest.json`, `docs/context/*` | Codex, Claude, Grok, Hermes, DO runtimes | `pnpm context:check` | one repo-backed memory spine across harnesses |
| Agent-paid tool gate | active | `lib/tools/` (`auth`, `keys`, `sandbox`, `cap`, `receipts`, `invoke`, `store`, `registry`) | `/api/tools/nz-who-runs-it`, `nz-trade-finder`, `meeting-enhance`, `nz-compliance-ping` | `lib/tools/__tests__/agent-paid-tools.test.ts` + route tests | URL + key + daily cap + receipt; `test_` sandbox never hits live upstreams |

| DO shared financial foundation | review build; demo + local CSV; Redbark adapter only | apps/do/finance/, app/do/bills/ | Bills now; Money/Business/Tradie contract | financial domain/adapter tests; browser proof pending | integer money, scoped reads, checked invoice dates, recurring candidates and editable enquiries; no live bank auth or financial writes |

| DO sculpted identity + composition light | review build | `components/do/DoPresence.tsx`, `DoGlowCard.tsx` | Public product scenes, DO launcher, workspace, Bills | build/SSR checks; desktop and 375px visual proof pending | Canonical SVG with CSS depth; no WebGL dependency; decorative, never connectivity evidence; reduced-motion fallback; extends existing glow primitive with bare composition variant |

## Candidates to inventory

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
