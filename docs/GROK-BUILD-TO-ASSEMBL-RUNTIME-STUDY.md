# Grok Build → assembl Agent Runtime

_In-depth architecture study, adaptation framework and implementation roadmap · 18 July 2026_

## Executive decision

Do **not** fork Grok Build or make it the runtime underneath assembl.

Use it as a reference implementation for six patterns that assembl currently needs:

1. a declarative agent manifest;
2. one inspectable context-assembly pipeline;
3. explicit lifecycle hooks around every tool call;
4. isolated child-agent sessions with narrow contracts;
5. plan review and permission gates before consequential work;
6. resumable execution with visible events, checkpoints and evidence.

assembl already has stronger foundations for business agents than a coding harness:

- tenant-scoped Business Genome context;
- capability and model routing;
- human approval requests;
- task state and evidence tables;
- immutable agent releases;
- model evaluation on real assembl workflows;
- Mana Receipts and audit records.

The missing layer is a shared **Agent Runtime Contract** that compiles what Pilot builds into the same governed execution path used by every first-party and customer-built agent.

The target is:

> Pilot produces a versioned Agent Manifest. The assembl runtime validates it, resolves tenant context and capabilities, creates a task, executes a bounded plan, pauses at policy gates, records every event and produces evidence.

---

## 1. Sources reviewed

Primary sources:

- xAI announcement: <https://x.ai/news/grok-build-open-source>
- official repository: <https://github.com/xai-org/grok-build>
- official Grok Build documentation: <https://docs.x.ai/build/overview>
- in-repository user guide covering configuration, MCP, skills, plugins, hooks, models, project rules, memory, headless execution, subagents, sessions, sandboxing, plan mode, background tasks, permissions and monitoring:
  <https://github.com/xai-org/grok-build/tree/main/crates/codegen/xai-grok-pager/docs/user-guide>
- first-party licence: Apache-2.0; third-party notices must still be reviewed before copying implementation code.

assembl sources reviewed:

- `docs/AGENTIC-OS-ARCHITECTURE.md`
- `lib/os/orchestrator.ts`
- `lib/os/routing.ts`
- `lib/os/agent-registry.ts`
- `lib/os/tasks.ts`
- `lib/os/evidence.ts`
- `lib/os/capabilities.ts`
- `lib/pilot/types.ts`
- `lib/pilot/pack-builder.ts`
- `lib/pilot/catalogues.ts`
- `lib/marketplace/agent-prompts.ts`
- `lib/agents/action-requests.ts`

---

## 2. What Grok Build actually is

Grok Build separates its product into clear architectural layers:

| Layer | Grok Build role | Useful assembl lesson |
|---|---|---|
| Composition root | Builds the executable and wires dependencies | Keep one assembl runtime entry point instead of different chat, edge and vertical routers |
| Agent runtime | Context assembly, model loop, tool dispatch, headless/stdio modes | Create one bounded execution loop shared by chat, events, schedules and voice |
| Tool layer | File, terminal, search and execution tools | Tools must implement a common capability contract and return typed evidence |
| Workspace | Filesystem, VCS, commands and checkpoints | Replace coding workspace with tenant task workspace: genome snapshot, task state, approvals and artefacts |
| Configuration | Models, instructions, plugins, hooks and MCP sources | Pilot should compile to one portable, versioned manifest |
| Skills | Reusable instruction packages | assembl skills should be separately versioned from agent identity and prompt |
| Plugins | Bundles of skills, agents, commands, hooks and MCP | assembl vertical packs can bundle agents, genome modules, capabilities and workflow templates |
| Hooks | Pre/post lifecycle scripts and callbacks | Policy, audit, cost and evidence should be enforced through runtime hooks, not remembered in prompts |
| Subagents | Child sessions with personas and capability modes | Use explicit handoff contracts and isolated context, not free-form agent conversations |
| Sessions | Save, resume, rewind and compact | Tasks need resumable attempts and immutable event history |
| Plan mode | Structured plan edited/reviewed before execution | Medium/high-risk assembl work should expose a proposed plan before actions start |
| Sandbox | Filesystem/network isolation profiles | Business tools need equivalent logical sandboxes: tenant boundary, data class, allowed capabilities and spend ceiling |
| Permissions | Auto-approved tools, restricted modes and pre-tool hooks | Permission decisions belong in deterministic policy code before every tool invocation |
| Monitoring | Usage and long-running task visibility | Surface runtime events, cost, progress, waiting reasons and evidence in Work/Proof |
| ACP/headless | Same runtime can be embedded or scripted | Expose assembl through UI, API, scheduled jobs, voice and future protocols without duplicating the agent logic |

### Important constraint

Grok Build is a coding agent. Its natural unit of work is a repository and its primary actions are file and shell operations.

assembl’s unit of work is a tenant-scoped business task. Its actions may affect customers, money, calendars, CRM records, private documents and public communications. The safety model therefore must be stricter and the evidence model richer.

---

## 3. Current assembl architecture: what is already real

### Already strong

1. **Task state exists.** `os_tasks`, `os_task_events` and `os_evidence` provide the beginning of a durable execution record.
2. **One production orchestrator exists.** `intakeEnquiry()` already follows classify → ground → route → draft → approval → evidence.
3. **Capabilities are vendor-neutral.** The enquiry agent requests `send_customer_email`; the capability registry determines the implementation and risk.
4. **Models are routed by requirements and measured performance.** `lib/os/routing.ts` considers capability, privacy, latency, provider policy, availability and real assembl evals.
5. **Human gates are structural.** `agent_action_requests` and `ACTION_DISPATCH_ENABLED` prevent a prompt from bypassing approval.
6. **Agent releases are immutable and content-hashed.** The registry records prompt, skills, genome schema, model policy and release versions.
7. **Business context is differentiated.** Confirmed genome facts can be used for commitments; inferred facts are not silently promoted.

### Fragmentation to resolve

1. Pilot outputs a 19-item pack, but there is no canonical executable manifest.
2. The orchestrator is a vertical slice, not yet a reusable runtime.
3. Prompt-backed marketplace agents, OS agents and Pilot-built agents do not compile into one runtime type.
4. Tools/capabilities do not yet share one typed invocation and evidence-return contract.
5. Policy is applied at selected points rather than as mandatory pre-tool middleware.
6. There is no first-class execution attempt, checkpoint or resumable session abstraction.
7. Handoffs are not yet persisted as child tasks with constrained context.
8. Runtime inspection is spread across task events, routing rationale, receipts and logs.

---

## 4. The assembl Agent Runtime v1

### 4.1 Runtime invariants

These rules must be impossible to bypass accidentally:

- Every run belongs to one tenant and one task.
- Every run references an immutable agent release and manifest hash.
- Tenant context is assembled by policy; models never browse arbitrary tenant data.
- Every capability call is checked before invocation.
- The runtime never turns a model-generated tool name directly into execution.
- Medium/high-risk actions produce a visible plan and approval record.
- Child agents receive the minimum context and capabilities required.
- Every state transition and capability result becomes a task event.
- Every meaningful output produces evidence.
- Every run has budgets for turns, time, tokens, cost, tool calls and child agents.
- Failed or interrupted work is resumable from durable state, not hidden model memory.
- No agent can confirm a genome inference about the business without a human or authoritative source.

### 4.2 Core components

```text
Trigger / user request / schedule / API / voice
                     │
                     ▼
              Runtime intake
     validate tenant + manifest + task input
                     │
                     ▼
             Context assembler
 genome snapshot + user input + task history + permitted knowledge
                     │
                     ▼
                Plan engine
 deterministic template or bounded model-generated plan
                     │
                     ▼
             Policy preflight hook
 risk + permission + privacy + spend + approval decision
                     │
          ┌──────────┴───────────┐
          │                      │
       execute              pause/approve
          │                      │
          ▼                      ▼
  capability resolver     action request / plan review
          │
          ▼
 provider adapter / deterministic service / MCP adapter
          │
          ▼
 post-tool hooks: validate → redact → audit → evidence → cost
          │
          ▼
 task state + checkpoint + result + next bounded step
```

### 4.3 Canonical agent manifest

Pilot and all first-party agents should produce the same `AgentManifest`.

Required domains:

- identity and semantic version;
- immutable prompt and skill references;
- accepted triggers and input/output schemas;
- required Business Genome domains;
- allowed knowledge sources;
- requested capabilities;
- per-capability approval rules;
- data-classification ceiling;
- model requirements and fallback policy;
- memory read/write policy;
- handoff/child-agent permissions;
- evidence requirements;
- runtime budgets;
- evaluation suite and release owner.

The initial TypeScript/Zod contract lives in `lib/os/runtime/manifest.ts`.

### 4.4 Runtime object model

#### AgentManifest
The governed recipe. Built by Pilot, checked into source for first-party agents, published as an immutable release.

#### RuntimeTask
The durable business job. Existing `os_tasks` remains the parent object.

#### RuntimeAttempt
One execution attempt for a task. Add `os_task_attempts` rather than overloading the task row.

Suggested fields:

```text
id, task_id, tenant, agent_id, agent_version, manifest_hash,
status, started_at, ended_at, model_ladder, selected_model,
turn_count, tool_call_count, child_count, token_usage, cost_nzd,
checkpoint, error_code, error_summary
```

#### RuntimeEvent
Continue using `os_task_events`, but formalise event names:

```text
intake.validated
context.assembled
plan.proposed
plan.approved
model.selected
model.completed
capability.requested
policy.allowed
policy.blocked
approval.requested
approval.decided
capability.completed
handoff.created
handoff.completed
checkpoint.saved
evidence.recorded
run.completed
run.failed
```

#### CapabilityInvocation
A typed request resolved only through the registry:

```ts
interface CapabilityInvocation<I = unknown> {
  capability: string;
  input: I;
  tenant: string;
  taskId: string;
  attemptId: string;
  agent: { id: string; version: string };
  justification: string;
  idempotencyKey: string;
}
```

Every capability returns:

```ts
interface CapabilityResult<O = unknown> {
  ok: boolean;
  output?: O;
  error?: { code: string; message: string; retryable: boolean };
  evidence: EvidenceDraft[];
  provider: string;
  externalRefs?: Record<string, string>;
  costNzd?: number;
}
```

#### ContextBundle
A deterministic, inspectable snapshot—not an unlabelled prompt string:

```text
user_input
confirmed_genome_facts
suggested_or_conflicting_facts (labelled and non-authoritative)
knowledge_chunks with source pointers
prior task events selected by policy
agent instructions and skills
capability summaries
budgets and policy summary
```

Store the selected source pointers and a hash of the bundle with the attempt. Do not persist unnecessary raw personal data.

#### HandoffContract
A child task, not a conversation:

```text
parent_task_id
parent_attempt_id
from_agent
to_agent
objective
input_schema + payload
allowed_context_refs
allowed_capabilities
risk_ceiling
expected_output_schema
evidence_requirements
budget
deadline/status
```

The parent receives only the validated child output and evidence references.

---

## 5. Lifecycle hooks

Grok Build’s hooks are highly transferable, but assembl hooks should be typed internal middleware rather than arbitrary shell scripts.

### Mandatory hook sequence

#### BeforeRun
- verify manifest hash and release status;
- confirm tenant and actor;
- enforce data-classification ceiling;
- create attempt and budget ledger.

#### AssembleContext
- retrieve only authorised genome domains and knowledge;
- mark fact verification states visibly;
- redact or omit fields not required by the manifest;
- capture source pointers and context hash.

#### BeforePlan
- choose deterministic workflow template where available;
- set maximum plan steps;
- forbid unsupported actions.

#### AfterPlan
- validate plan against schema;
- calculate aggregate risk;
- require review when policy says so.

#### BeforeCapability
- resolve capability to one configured provider;
- check tenant connection health;
- check actor/agent permission;
- check approval, spend, privacy, idempotency and rate limits;
- deny by default.

#### AfterCapability
- validate output schema;
- redact secrets and unnecessary personal information;
- write evidence and audit records;
- update cost and budgets;
- decide whether a retry is safe.

#### BeforeHandoff
- validate recipient and objective;
- minimise context;
- prevent privilege escalation;
- reserve child budget.

#### AfterHandoff
- validate child output;
- attach evidence;
- close child task before continuing.

#### BeforeComplete
- verify required evidence exists;
- verify outputs match schema and success criteria;
- ensure no unresolved approval or child task remains.

#### AfterComplete
- write outcome evaluation;
- suggest—not confirm—new genome knowledge;
- emit signals for Today and Intelligence.

---

## 6. Permissions and sandboxing for business agents

Do not copy a coding-agent `dontAsk` mode into production business workflows.

Use four independent controls:

1. **Data sandbox** — tenant, permitted genome domains, permitted knowledge stores, maximum data classification.
2. **Capability sandbox** — explicit allow-list; no dynamic capability discovery at execution time.
3. **Action sandbox** — read/draft/propose/execute scope with approval and dispatch flags.
4. **Resource sandbox** — tokens, cost, tool calls, child agents, runtime and external spend.

Recommended policy defaults:

| Action | Default |
|---|---|
| Read confirmed tenant data | automatic with audit |
| Search public web | automatic for public-data tasks; citations required |
| Draft internal content | automatic |
| Draft external communication | automatic; cannot send |
| Modify internal record | medium risk; policy-controlled approval |
| Contact customer or prospect | high risk; explicit approval |
| Spend money or purchase data | high risk; explicit approval and amount ceiling |
| Delete, publish, sign or accept terms | high risk; explicit approval; some actions never delegated |

---

## 7. Skills, plugins and vertical packs

### Skill
A versioned, reusable procedure with:

- purpose;
- input/output schema;
- instruction body;
- required capabilities;
- risk notes;
- tests;
- owner and version.

Examples: `ground-business-lead`, `draft-enquiry-reply`, `extract-school-dates`, `compare-bill-plan`.

### Vertical pack
assembl’s equivalent of a plugin bundle:

```text
manifest metadata
vertical genome schema/extensions
recommended starting agent team
skills
workflow templates
capability requirements
sample data and demo configuration
evaluation cases
UI surface configuration
```

A dog trainer pack may install Desk, Scheduling, Course Builder and Recruitment agents. A family pack may install Pānui Parser, 9am Brief, Kitchen and Transport workflows.

Vertical packs must not carry tenant secrets or silently grant capabilities.

---

## 8. Pilot: how the builder should change

Pilot’s current 19-item pack remains valuable as a human-readable design artefact. Add a compile step after Pack generation:

```text
Pilot answers
   ↓
19-item Agent Pack
   ↓
compileAgentManifest(pack, spec)
   ↓
manifest validation
   ↓
automatic safety lint
   ↓
generated eval cases
   ↓
test drive in simulated runtime
   ↓
draft immutable agent release
   ↓
human release approval
```

### New Pilot screens/options

1. **Runtime mode** — assistant, bounded workflow, event-driven agent. Avoid unrestricted autonomy wording.
2. **Business context** — exact Genome domains and verification states the agent may read.
3. **Capabilities** — choose business capabilities, not vendors.
4. **Action level** — read, draft, propose, execute-with-policy.
5. **Approval map** — per capability and condition.
6. **Budgets** — max turns, calls, children, cost and external spend.
7. **Handoffs** — permitted specialist agents and contract outputs.
8. **Proof** — evidence required before a task can complete.
9. **Evaluation** — minimum pass score and critical tests.
10. **Manifest preview** — plain-English and JSON views with validation errors.

### Safety lints

Pilot must block release when:

- a high-risk capability has no approval policy;
- the output schema is absent;
- personal/confidential data has no declared purpose;
- a child agent can access more than its parent;
- the evidence requirements do not cover consequential actions;
- budgets are unbounded;
- a workflow can loop without a hard limit;
- agent instructions conflict with a deterministic policy.

---

## 9. First implementation slice: Lead Hunter

Lead Hunter is the best runtime proving ground because it needs research, structured outputs, evidence, deduplication and approval, but it must not autonomously contact anyone.

### Workflow

1. Validate niche, criteria, exclusions, market, target count and freshness.
2. Create an `os_task` and runtime attempt.
3. Assemble only public campaign context, allowed brand rules and approved CRM dedupe keys.
4. Produce a bounded search plan.
5. Resolve `grounded_web_search` through the capability registry.
6. Search and read first-party/official sources.
7. Validate evidence and confidence for each candidate.
8. Deduplicate before acceptance.
9. Produce a structured lead set and evidence rows.
10. Create optional CRM draft action requests—no writes without approval.
11. Create optional outreach drafts—no sending.
12. Complete only when required evidence and schema validation pass.

### Lead Hunter handoffs

Permitted child specialists:

- `research-verifier`: verifies business, geography and matching criteria;
- `offer-matcher`: uses Assembl’s approved offer catalogue and public evidence;
- `copy-drafter`: receives only the accepted lead record and brand rules.

Do not use multiple agents initially unless single-agent evaluations show a material quality gain. The runtime contract should support handoffs; the first production workflow should stay simple.

### Acceptance criteria

- Every accepted factual attribute has a source pointer.
- No accepted lead is below the confidence threshold.
- Domain/business duplicates are removed.
- NZ location is confirmed.
- No private contact data is inferred or scraped.
- No CRM write, paid enrichment or outbound contact occurs without approval.
- The run can be resumed after interruption without repeating completed external calls.
- Cost, provider, model, manifest version, prompt/skill versions and evidence are visible.

---

## 10. Build / borrow / avoid

| Area | Decision |
|---|---|
| Declarative manifest | Build in TypeScript/Zod, inspired by Grok configuration and extensions |
| Agent loop | Build around existing `os_tasks`, router, policy and evidence—not a direct port |
| MCP client | Borrow a maintained library later; keep MCP behind capability adapters |
| Skills format | Support a simple Assembl schema; optionally import SKILL.md as source material |
| Plugins/vertical packs | Build Assembl-native bundle format |
| Hooks | Build typed middleware; do not permit arbitrary tenant shell hooks |
| Subagents | Build persisted child tasks with contracts |
| Sessions/checkpoints | Build on Supabase task attempts/events |
| Sandbox | Build logical business sandbox; use isolated execution environments only for code/file work |
| TUI / terminal UI | Ignore for customer product; useful only as an internal developer tool |
| Coding file-edit tools | Reuse only for future website/code agents in a separate execution sandbox |
| Grok Build source | Study and selectively adapt Apache-licensed patterns after legal/notice review; do not wholesale copy |

---

## 11. Implementation roadmap

### Phase 0 — Architecture lock and inventory

Deliverables:

- approve the `AgentManifest` contract;
- map every current agent source to manifest fields;
- map Pilot’s 19 items to manifest fields;
- inventory capability implementations and current approval checks;
- define canonical runtime event names;
- select Lead Hunter as the first runtime migration.

Exit criteria:

- no unresolved duplicate concept between marketplace agent types, OS releases and Pilot output;
- one owner for manifest, runtime, policy and capability registry.

### Phase 1 — Manifest compiler and registry integration

Build:

- `lib/os/runtime/manifest.ts` schemas;
- `compilePilotManifest()`;
- manifest hashing and attachment to immutable `agent_releases`;
- manifest preview and safety lint in Pilot;
- seed manifests for Desk and Lead Hunter.

Tests:

- valid/invalid manifest cases;
- deterministic hash;
- no release with unbounded budgets or unsafe approvals;
- backwards-compatible conversion from current agent release records.

### Phase 2 — Runtime kernel

Build:

- `lib/os/runtime/run.ts`;
- `context.ts`, `plan.ts`, `hooks.ts`, `attempts.ts`, `events.ts`;
- `os_task_attempts` migration;
- budget tracking and checkpoints;
- one deterministic execution loop with bounded model steps.

Exit criteria:

- Desk enquiry workflow runs through the kernel without changing user-visible behaviour;
- every run is inspectable and resumable;
- all state transitions are persisted.

### Phase 3 — Capability invocation contract

Build:

- typed `CapabilityInvocation` and `CapabilityResult`;
- registry adapters for grounded web search, website read, CRM draft and email draft;
- mandatory `BeforeCapability` and `AfterCapability` hooks;
- idempotency and connection-health checks;
- evidence conversion for every result.

Exit criteria:

- no runtime code calls a vendor SDK directly outside a provider adapter;
- capability policy cannot be skipped;
- retries do not duplicate external work.

### Phase 4 — Lead Hunter vertical slice

Build:

- compile existing Lead Hunter definition into a manifest;
- grounded search adapter with at least two provider options/fallbacks;
- structured lead validation;
- dedupe and confidence policy;
- Work task view and Proof detail;
- CRM/outreach draft approval requests.

Evaluate:

- accepted-lead precision;
- hallucination rate;
- source quality;
- duplicate rate;
- cost per accepted lead;
- provider/model comparison;
- human acceptance rate.

### Phase 5 — Handoffs and vertical packs

Build only after the single-agent runtime is stable:

- `HandoffContract` and child tasks;
- context minimisation;
- privilege non-escalation checks;
- vertical-pack manifests;
- installer recommendations and capability setup.

### Phase 6 — Protocol surfaces

Expose the same runtime through:

- web chat;
- scheduled/event jobs;
- voice interface;
- internal API/headless runner;
- optional MCP/A2A adapters;
- future Agent Client Protocol integration where useful.

Protocols are adapters. They must not become assembl’s internal domain model.

---

## 12. Proposed repository structure

```text
lib/os/runtime/
  manifest.ts          # public/client-safe schema and types
  compile-pilot.ts     # Pilot pack → manifest
  lint.ts              # release-blocking safety checks
  run.ts               # bounded execution kernel
  context.ts           # inspectable context bundles
  plan.ts              # deterministic/model plan creation + validation
  hooks.ts             # typed lifecycle middleware
  attempts.ts          # durable attempts/checkpoints
  events.ts            # canonical event writer
  capabilities.ts      # invocation/result contracts and adapter wrapper
  handoffs.ts           # child-task contracts
  budgets.ts            # cost/turn/tool/child ceilings
  inspect.ts            # human-readable runtime inspection

lib/os/runtime/adapters/
  grounded-web/
  website-read/
  crm-draft/
  email-draft/
  calendar/
  documents/

lib/os/skills/
  definitions/
  registry.ts
  compiler.ts

lib/os/packs/
  schema.ts
  installer.ts
  definitions/

supabase/migrations/
  *_os_task_attempts.sql
  *_agent_manifest_columns.sql
  *_skill_releases.sql
```

---

## 13. Definition of done for the framework

The framework is real when:

1. Pilot can create a manifest without engineering edits.
2. The manifest is validated, safety-linted, versioned and content-hashed.
3. Desk and Lead Hunter execute through the same runtime kernel.
4. Every capability call passes through mandatory policy hooks.
5. Every run can be inspected, paused, resumed and attributed to exact versions.
6. Required evidence is enforced before completion.
7. A provider or protocol can be changed without changing the agent definition.
8. A tenant cannot gain tools, data access or spend authority merely by editing a prompt.
9. Work and Proof show what happened, why, which context was used, what changed and what it cost.
10. Runtime evaluations prove the framework improves reliability over the current direct-agent paths.

---

## Immediate next action

Implement Phase 1 on the existing Lead Hunter/Pilot branch, then update/rebase the branch onto current `main` before attempting the runtime kernel. Do not add more agent types until Desk and Lead Hunter both compile to the canonical manifest and pass the same safety lint.
