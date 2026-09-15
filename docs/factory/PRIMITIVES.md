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

## Candidates to inventory

- signal ingestion
- opportunity scoring / evidence provenance
- company/brand ingestion
- browser/DO actions
- human approval gates
- receipts/traces
- connector framework
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
