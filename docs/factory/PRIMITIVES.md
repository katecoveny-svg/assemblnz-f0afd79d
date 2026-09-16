# assembl primitive registry

A primitive is a reusable capability that makes later products faster, safer or better.

Do not extract something merely because it might be reused. Prefer extraction after a second real use or when the mechanic is clearly cross-product infrastructure.

| Primitive | Status | Location | Used by | Tests/evals | Notes |
|---|---|---|---|---|---|
| CustomerJourney foundation | existing | `lib/journey/` | journey surfaces | see journey docs/evals | reusable journey runtime |
| Business/customer context | existing | `lib/customers/` + related genome/context code | customer workspaces/journeys | audit needed | consolidate semantics before expanding |
| Model routing | existing | `lib/ai/router.ts`, `lib/os/routing.ts` | agent/model work | routing tests | model is replaceable; route by task capability, measured performance, privacy, latency and cost |
| Agent registry | existing | `lib/agents.ts` + plugin prompts | agent surfaces | `pnpm test:agents` | files are canonical; DB prompt table is cache |
| Canvas/design primitives | existing | `packages/canvas/` | UI surfaces | package build required | use current canon palette |
| Journey proof/eval | existing | `lib/journey/` + `pnpm eval:journeys` | journeys | existing eval command | expand before creating parallel proof systems |
| DO AgentSpec runtime | existing / active | `apps/do/shared/` | browser extension, hosted DO, Mac/mobile surfaces | DO tests need expansion | portable agent definition, policy, compile/router/evidence spine; surface ≠ agent |
| Studio Task DO Maker | active foundation | `lib/studio/task-do-maker.ts`, `/studio/do-maker`, `/do/maker/partner/*` | Pursuit overview handoff + partner-facing skins + DO Office session intake | `lib/studio/task-do-maker.test.ts` | shared core for Mode A (Pursuit pitch) and Mode B (partner chrome, rewarded-wait); offline `bp`/`warehouse` skins; drafts-only AgentSpec export |
| DO approval/evidence boundary | existing / active | `apps/do/shared/policy.ts`, approval/evidence primitives | all DO surfaces | audit/expand | consequential actions remain approval-gated and should leave evidence |
| Builderdoo job contract | active foundation | `apps/do/shared/builder.ts`, `/api/do/builder/plan`, `/do/builder` | Builderdoo + future repo execution adapters | `apps/do/shared/builder.test.ts` | persistent build identity/context/authority/proof contract; provider is selected separately |
| Builderdoo durable Office jobs | active foundation | `apps/do/shared/office-jobs.ts`, `apps/do/services/office-jobs.ts`, `/api/do/builder/jobs`, `do_agents`/`do_receipts`/`do_job_events` | Builder + Office | `apps/do/shared/office-jobs.test.ts`, `app/api/do/builder/jobs/route.test.ts` | owner-scoped save/list/reopen; idempotent events; `job_accepted` receipts only on plan save — never fabricated execution success |
| DO Office coordination projection | active foundation | `apps/do/shared/office.ts`, `docs/DO-OFFICE-ARCHITECTURE.md` | DO Office + future voice/companion coordination | add tests before wider use | Personal/Work/Client workspaces, structured handoffs, visible approvals/evidence; not a second agent runtime |
| DO Office spatial projection | active foundation | `app/do/office/DoOfficeSpatial.tsx` | 3D Office | visual/runtime proof required | R3F scene projects real Office status; accessible 2D board remains the task-detail surface and state owner |
| DO native Mac companion | active development | `apps/do/macos/` | cross-app DO surface | Mac compile/smoke-test needed | floating companion, explicit accessibility capture/paste, persisted position/visibility, opt-in login launch |
| Agent email transport/audit | existing | `lib/agent-email/`, `supabase/functions/agent-email-*`, `agent_email_*` tables | provisioned agent identities | audit before DO mailbox linking | reuse for real DO mailboxes; never fabricate addresses from agent names |
| Shared context manifest | existing | `config/context-manifest.json`, `docs/context/*` | Codex, Claude, Grok, Hermes, DO runtimes | `pnpm context:check` | one repo-backed memory spine across harnesses |

## Candidates to inventory

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
