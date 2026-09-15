# assembl cross-agent adapters

Goal: Codex, Claude, Hermes-style agents and Assembl DO runtimes should all resolve to the same company memory rather than maintaining separate truths.

## universal bootstrap

Any agent capable of reading the repository should start with:

1. `START_HERE.md`
2. `AGENTS.md`
3. `config/context-manifest.json`
4. `docs/context/CURRENT.md`
5. `docs/context/README.md`
6. only the task-specific canonical docs + relevant code/tests

Suggested bootstrap instruction:

> Work from the repository's canonical context. Read START_HERE.md, AGENTS.md, config/context-manifest.json and docs/context/CURRENT.md first. Use docs/context/README.md to load only the task-specific canon you need. Do not treat chat history, legacy code, research or harness-specific memory as higher authority than the repo canon. State what context you loaded before making substantial changes.

## Codex / agents that support AGENTS.md

`AGENTS.md` is the root operating contract. No separate Codex company prompt should duplicate strategy or brand.

A task prompt should normally contain only:
- objective
- constraints specific to this task
- desired evidence/definition of done

The repo supplies company context.

## Claude / agents that prefer CLAUDE.md

`CLAUDE.md` may contain useful fault memory and harness notes, but it is supplementary.

Claude should be instructed/configured to read `START_HERE.md` and follow root `AGENTS.md` before relying on `CLAUDE.md`.

Do not copy the whole strategy/brand into `CLAUDE.md`; link to canonical sources instead. This prevents Claude-specific context from drifting away from Codex/DO context.

## Hermes or other general agents

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
5. apply agent-specific role/authority/tools
6. execute with trace/approval rules

Keep these layers separate:

- **Assembl canon** — how Assembl works
- **Business Genome** — client/company context
- **agent role** — purpose/authority/tools
- **task state** — current job
- **conversation memory** — useful temporary history

Do not flatten all five into one giant system prompt.

## personal DOs

A personal DO should inherit the same Assembl execution principles and brand/product context where relevant, but personal preferences/state should live in its own user-scoped memory rather than being written into company canon.

Recommended composition:

`Assembl runtime canon + DO role + user-scoped preferences + current task + required tools/context`

This lets personal DOs improve without contaminating company/product truth.

## versioning and freshness

Every agent should be able to report:
- context manifest `updated_at`
- `CURRENT.md` last verified date
- canonical files loaded
- whether runtime truth conflicts with documented canon

Run `pnpm context:check` during context/brand maintenance or when drift is suspected.

## rule

**One source of truth, many adapters.**

Never maintain a separate full copy of Assembl strategy/brand for each model or harness.
