# Agent Definition Registry — governing agents like production code

_2026-07-13 · prompted by the Mistral Studio prompt/skill-versioning watch.
Mistral validated the pattern; assembl keeps the system of record in its own
database rather than inside a model provider's platform._

## Inspection: how agent logic lives today (the problem)

A repo sweep found agent business logic that is not governed:

- **Embedded in source files** — system prompts and role instructions in
  20+ files: every `lib/customers/<tenant>/agent.ts`
  (`FRED_SYSTEM_PROMPT` and siblings), `lib/marketplace/agent-prompts.ts`
  (1,307 lines of locked prompts), `lib/identity/inbound.ts`,
  `lib/bills/llm.ts`, `lib/creative/agents.ts`, `lib/government/…`, etc.
- **Duplicated / drifting registries** — `lib/marketplace/agents.ts`
  (2,535 lines, ~40 agents), `lib/agents.ts` (650), the edge `iho-router`
  (46 agents), `agent-router` (78), and `lib/os/agents.ts` (the OS core).
  No two agree on the agent list.
- **Edited without version history** — prompts are plain strings; a change
  is a silent diff with no release, no rollback, no "which version ran".
- **Missing owners and evaluation results** — nothing records who owns an
  agent's behaviour or how it scores on real work.
- Mixed with tenant data only loosely — prompts reference the genome at
  runtime (good), but the definitions themselves aren't versioned artefacts.

## The registry (the fix)

`agent_releases` (migration `20260722097000`) — a provider-neutral, immutable
system of record in Assembl's own database. Each release records exactly the
shape the watch note recommended:

```
{ agentId, version, promptVersion, skillVersions, genomeSchemaVersion,
  modelPolicyVersion, owner, status, evaluationScore, releasedAt }
```

plus the full `definition` snapshot and a `content_hash` (SHA-256 over a
stable serialisation) so tamper is detectable. Releases are **immutable**:
`(agent_id, version)` is unique and rows are never updated — a new version
is a new row. RLS deny-all; access only through `lib/os/agent-registry.ts`.

Seeded now: the three OS agents (`desk`, `operations`, `knowledge`) as
`1.0.0` production releases, owner `operations`, `genomeSchemaVersion 2`
(provenance columns) and `modelPolicyVersion 1` (the Model & Capability
Router). `evaluationScore` is null until the Assembl evals score them.

## Beside the proof ledger

Every enquiry-reply task now records the exact recipe that produced it —
`provenanceStamp()` writes `{ agentId, agentVersion, promptVersion,
skillVersions, genomeSchemaVersion, modelPolicyVersion, model }` into the
task's `model_call` evidence, and `os_tasks.agent_version` stamps the task.
Open a completed task in Work & proof and you can see not just what happened
but which governed version of which agent, on which model policy, did it.

## Provider-neutral, deliberately

Mistral Studio (and equivalents) are useful validation that prompts and
skills deserve versioning, ownership and immutable releases. assembl stores
that system of record in its own database so its core business logic isn't
locked inside one model provider — the registry is the interface, providers
are swappable behind the Model & Capability Router.

## Next (incremental)

- A governance view in the ops console (releases, owners, eval scores,
  diff between versions) — read-only over `listReleases()`.
- `run-os-evals.ts` writes `evaluationScore` back onto the release it tested.
- Rehome the scattered per-tenant prompts into versioned releases, one agent
  at a time, replacing the embedded strings with a registry lookup.
