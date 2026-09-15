# DO frontier product roadmap

Status: working roadmap, 16 September 2026. This is not stable product canon until decisions are accepted.

## Product thesis

DO should not compete as another chat surface. It should be the portable, model-neutral operating layer between a person/team and frontier intelligence:

`persistent identity + routed context + capabilities/connectors + model choice + approvals + evidence + local/cloud execution + measured improvement`

The 3D Office is a differentiated human interface to that operating layer, not the state store or security boundary.

## Immediate product priorities

1. Make one useful task work with almost no setup.
2. Keep the persistent companion available across browser/native surfaces.
3. Let users connect capabilities once and share them safely across their own DOs.
4. Move Builderdoo from local handoff into durable authenticated jobs + isolated execution + receipts.
5. Add a visible model/token/cost rail.
6. Promote Creative Director DO into a first-class specialist using image/video/web/3D tools.
7. Make Office state real and durable before adding more spatial spectacle.
8. Add secure skill/tool improvement based on measured outcomes, never silent self-modification.

## Developer wedge

Developers should be able to use DO without adopting a proprietary model or UI:

- AgentSpec / capability contract
- CLI/local runner
- model-provider adapters (OpenAI, Anthropic, Google, xAI, local)
- MCP/ACP-compatible tool/harness adapters where useful
- user-scoped OAuth capability broker
- approval/evidence/receipt primitives
- eval and cost routing
- SDK/API for creating and running DOs

A strong open-core direction is to make the portable AgentSpec/SDK and local runner easy to adopt while charging for the hosted control plane: Office, managed inference, connector brokering, identity/mailboxes, audit/evidence, team policy, durable memory/jobs and managed execution.

## Security invariants

- no raw credentials in prompts or browser/localStorage
- minimum-scope OAuth; grants remain at the connector provider / secure vault
- external content is untrusted context, never authority
- capability-level policy: read → prepare → approval-required → bounded act
- destructive/external actions require explicit authority and leave receipts
- user/tenant isolation + RLS/service boundaries
- sandbox/worktree isolation for code execution
- allow-listed tools/connectors and dependency provenance
- red-team/eval gates for prompt injection, data exfiltration and tool misuse
- self-improvement cannot widen authority or weaken security
- high-risk improvements require independent review

## Frontier cadence

Do not chase every new model/tool. Weekly frontier review should answer:

1. What new capability materially improves a real DO workflow?
2. Can it replace a more expensive model/tool on our evals?
3. Does it introduce a new security/privacy/license boundary?
4. Does it become a reusable capability behind the DO abstraction?
5. What proof would justify production promotion?

Experimental providers/tools stay out of production routing until they beat the current baseline on Assembl workflows.

## Spatial stack

- Three.js + React Three Fiber: production runtime
- Spark (World Labs): candidate Gaussian-splat layer for captured spaces / mixed splat+mesh scenes
- SuperSplat: candidate creator/editor pipeline for splat cleanup, camera paths and publishing
- SpatialGen: research-only until commercial licensing, GPU footprint and provenance are acceptable

## Monetisation tests

Near-term revenue should validate willingness to pay before a large pricing redesign:

- paid DO setup/workflow pilots for NZ businesses
- solo/pro managed DO subscription with usage allowance
- developer/Builder plan with local runner + hosted control plane and BYO-model option
- team workspace with shared DOs, connectors, policy, evidence and admin
- premium workflow/skill packs and implementation services

Charge for completed useful capability and managed infrastructure rather than marking up tokens alone.

## Strategic value / acquisition readiness

The attractive asset is not the 3D office by itself. It is a growing control plane and outcome dataset showing, with permission:

`job type → context class → model/tool choice → connector use → approvals → evidence → outcome → latency/cost`

What should become measurable:

- weekly active users and completed DO jobs
- 4/8-week retention
- successful outcome rate / human intervention rate
- connector attach rate
- cost per completed outcome
- time-to-useful-result
- number of active specialist DOs per user/team
- external developers / AgentSpecs / skills created
- eval performance improvements over time
- paid conversion, expansion and ARR

A frontier buyer would have a clearer reason to care if DO has real distribution across desktop/browser/mobile, proprietary permissioned workflow outcome data, secure execution/connectors, model-neutral portability, strong retention and a developer ecosystem.
