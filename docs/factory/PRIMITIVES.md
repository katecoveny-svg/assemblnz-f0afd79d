# assembl primitive registry

A primitive is a reusable capability that makes later products faster, safer or better.

Do not extract something merely because it might be reused. Prefer extraction after a second real use or when the mechanic is clearly cross-product infrastructure.

| Primitive | Status | Location | Used by | Tests/evals | Notes |
|---|---|---|---|---|---|
| CustomerJourney foundation | existing | `lib/journey/` | journey surfaces | see journey docs/evals | reusable journey runtime |
| Business/customer context | existing | `lib/customers/` + related genome/context code | customer workspaces/journeys | audit needed | consolidate semantics before expanding |
| Model routing | existing | `lib/ai/router.ts` | agent/model work | audit needed | fail-open provider ladder |
| Agent registry | existing | `lib/agents.ts` + plugin prompts | agent surfaces | `pnpm test:agents` | files are canonical; DB prompt table is cache |
| Canvas/design primitives | existing | `packages/canvas/` | UI surfaces | package build required | use current canon palette |
| Journey proof/eval | existing | `lib/journey/` + `pnpm eval:journeys` | journeys | existing eval command | expand before creating parallel proof systems |
| DO AgentSpec runtime | existing / active | `apps/do/shared/` | browser extension, hosted DO, Mac/mobile surfaces | DO tests need expansion | portable agent definition, policy, compile/router/evidence spine; surface ≠ agent |
| DO approval/evidence boundary | existing / active | `apps/do/shared/policy.ts`, approval/evidence primitives | all DO surfaces | audit/expand | consequential actions remain approval-gated and should leave evidence |
| DO Office coordination projection | active foundation | `apps/do/shared/office.ts`, `docs/DO-OFFICE-ARCHITECTURE.md` | DO Office + future voice/companion coordination | add tests before wider use | Personal/Work/Client workspaces, structured handoffs, visible approvals/evidence; not a second agent runtime |
| DO native Mac companion | active development | `apps/do/macos/` | cross-app DO surface | Mac compile/smoke-test needed | floating companion, explicit accessibility capture/paste, persisted position/visibility, opt-in login launch |
| Agent email transport/audit | existing | `lib/agent-email/`, `supabase/functions/agent-email-*`, `agent_email_*` tables | provisioned agent identities | audit before DO mailbox linking | reuse for real DO mailboxes; never fabricate addresses from agent names |
| Shared context manifest | existing | `config/context-manifest.json`, `docs/context/*` | Codex, Claude, Hermes, DO runtimes | `pnpm context:check` | one repo-backed memory spine across harnesses |

## Candidates to inventory

- signal ingestion
- opportunity scoring / evidence provenance
- company/brand ingestion
- explicit screen/window context capture for DO (ScreenCaptureKit + browser bridge)
- durable DO Office repository/API wiring
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
