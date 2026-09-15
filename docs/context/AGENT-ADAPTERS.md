# assembl cross-agent adapters

Goal: Codex, Claude, Jules, Hermes, Grok/Grok Build, Gemini-based coding agents, local/open-source agents and Assembl DO runtimes should all resolve to the same company memory rather than maintaining separate truths.

**One source of truth, many adapters, replaceable models.**

## universal bootstrap

Any agent capable of reading the repository should start with:

1. `START_HERE.md`
2. `AGENTS.md`
3. `config/context-manifest.json`
4. `docs/context/CURRENT.md`
5. `docs/context/README.md`
6. only the task-specific canonical docs + relevant code/tests

Suggested bootstrap instruction:

> Work from the repository's canonical context. Read START_HERE.md, AGENTS.md, config/context-manifest.json and docs/context/CURRENT.md first. Use docs/context/README.md to load only the task-specific canon you need. Do not treat chat history, model memory, legacy code, research or harness-specific memory as higher authority than the repo canon. Treat the model/provider as replaceable; use existing Assembl tools, policy and evidence primitives. State what context you loaded before making substantial changes.

## Codex / agents that support AGENTS.md

`AGENTS.md` is the root operating contract. No separate Codex company prompt should duplicate strategy or brand.

A task prompt should normally contain only:
- objective
- constraints specific to this task
- desired evidence/definition of done

The repo supplies company context.

## Claude / agents that prefer CLAUDE.md

`CLAUDE.md` is a harness adapter and fault-memory layer, not a second company brain.

Claude should read `START_HERE.md` and follow root `AGENTS.md` before relying on `CLAUDE.md`.

Do not copy the whole strategy/brand into `CLAUDE.md`; link to canonical sources instead. This prevents Claude-specific context from drifting away from Codex/DO context.

## Grok / Grok Build

Grok gets the **same universal bootstrap**, not a Grok-specific copy of Assembl strategy.

Grok Build currently supports the `AGENTS.md` instruction-file family and Claude-compatible instruction files. Use root `AGENTS.md` as the repo contract and run `grok inspect` when needed to verify what the harness discovered.

Keep `.grok/` for harness concerns such as:
- MCP servers
- skills/plugins/workflows
- permissions/hooks
- repo-specific tool configuration

Do not duplicate Assembl company/product/brand canon into `.grok/`.

Grok Build can also be configured with custom models. Therefore “Grok Build” is a harness and does not have to imply “xAI model”. Whether the active model is Grok, Claude-compatible, an OpenAI-compatible endpoint or another configured model, the same Assembl context and approval contract applies.

For Grok used through the Assembl application/runtime rather than the Grok Build CLI, use the shared model layer:
- capability selection: `lib/os/routing.ts`
- provider/model adapter: `lib/ai/router.ts`

Never create a separate Grok-only DO architecture.

## Jules, Hermes or other general agents

If the harness does not automatically understand `AGENTS.md`, give it the universal bootstrap instruction once in its workspace/project/system configuration.

Prefer teaching the harness where context lives over pasting the context itself.

If it can fetch a small machine-readable file, start with `config/context-manifest.json` and then retrieve only the files required by the task.

## Assembl DO runtimes

DO should not depend on a coding-agent markdown convention at runtime.

Runtime pattern:

1. fetch/cache `config/context-manifest.json`
2. resolve `docs/context/CURRENT.md` + required canon
3. load only the task/customer context required
4. combine with the relevant Business Genome slice
5. apply DO role/authority/tools
6. declare task capability requirements
7. route to the best permitted/configured model through the shared capability router
8. execute with trace/approval rules
9. record model/tool usage, evidence and outcome

Keep these layers separate:

- **Assembl canon** — how Assembl works
- **Business Genome** — client/company context
- **user memory** — user-scoped preferences/state where applicable
- **DO role** — purpose/authority/tools
- **task state** — current job
- **model runtime** — replaceable provider/model chosen for this task
- **conversation memory** — useful temporary history

Do not flatten these into one giant permanent system prompt.

## Builder DO

Builder DO is the persistent **software-factory role** for working on Assembl. It should not be equated with a particular model vendor.

The durable capability is the harness around the model:
- canonical repo context
- repo/filesystem access
- shell and package tools
- git branches/worktrees
- tests/lint/typecheck/build
- browser/preview evidence
- GitHub PR operations
- model/cost routing
- approval boundaries
- factory memory updates

A high-quality coding model can handle planning/code review while cheaper or local models handle bounded routine work. Models should earn routing through Assembl evals rather than brand preference alone.

## personal DOs

A personal DO should inherit the same Assembl execution principles, but personal preferences/state should live in its own user-scoped memory rather than being written into company canon.

Recommended composition:

`Assembl runtime canon + DO role + user-scoped preferences + current task + required tools/context + routed model`

This lets personal DOs improve without contaminating company/product truth.

## versioning and freshness

Every agent should be able to report:
- context manifest `updated_at`
- `CURRENT.md` last verified date
- canonical files loaded
- active model/provider when relevant
- whether runtime truth conflicts with documented canon

Run `pnpm context:check` during context/brand maintenance or when drift is suspected.

## rule

**One source of truth, many adapters, replaceable intelligence.**

Never maintain a separate full copy of Assembl strategy/brand for each model or harness.
