# assembl — start here

This is the single entry point for humans and coding agents working in this repository.

## Read order

Read only what the task needs. Do not preload the whole repository context.

1. `AGENTS.md` — operating rules, safety, repo conventions, definition of done.
2. `docs/context/README.md` — context router and precedence rules.
3. The smallest task-specific canonical document linked from the router.
4. Relevant code and tests.

Do **not** treat old briefs, generated research, chat exports, root-level experiments, or historical handovers as current truth unless a canonical document points to them.

## What assembl is now

assembl is becoming an intelligence-powered software factory for agentic customer work.

The connected system is:

- **Pursuit** — finds valuable work, friction, signals and opportunities.
- **Studio** — frames and proves the possibility through working demonstrations and experiences.
- **DO** — executes bounded work in the user's browser/tools with appropriate approval.
- **Factory** — the reusable primitives, context, agents, skills, tests, evals and proof system underneath all three.

Core loop:

`signal → opportunity → spec → isolated build → proof → review → ship-ready → reusable primitive → learning`

The long-term product strategy remains governed by `docs/assembl-context.md`.

## Before starting a task

Write down:

- objective
- product/surface: Pursuit | Studio | DO | shared Factory | other
- files/area expected to change
- canonical docs required
- definition of done
- evidence required
- authority boundary: read/draft/build vs external action/deploy/production

If this cannot be stated clearly, do discovery first rather than coding broadly.

## Context efficiency

To reduce model cost and drift:

- load `AGENTS.md` + this file first
- use `docs/context/README.md` to choose only relevant context
- prefer repository evidence over remembered chat context
- do not paste large strategy docs into prompts when they already live in the repo
- do not ask multiple agents to independently rediscover architecture
- record durable decisions once in the canonical decision log
- extract reusable mechanics into the primitive registry

## Repository cleanup rule

The repository is currently mixed: shipping code, historical experiments, research, demos and operational artefacts coexist at the root.

Do not perform a mass move or delete.

First classify items as:

- `shipping`
- `shared primitive`
- `active product/demo`
- `research/reference`
- `generated evidence/output`
- `legacy/archive candidate`

Only move/delete in a separate cleanup PR after imports, scripts, deploy paths and references have been verified.

## If instructions conflict

Use the precedence defined in `docs/context/README.md`.

When a lower-precedence file conflicts with a higher-precedence file, follow the higher-precedence source and record the conflict rather than blending both.
