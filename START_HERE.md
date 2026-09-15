# assembl — start here

This is the single entry point for humans and coding agents working in this repository.

## Read order

Read only what the task needs. Do not preload the whole repository context.

1. `AGENTS.md` — operating rules, safety, repo conventions and definition of done.
2. `config/context-manifest.json` — machine-readable map of current canonical sources.
3. `docs/context/CURRENT.md` — where Assembl is at now.
4. `docs/context/README.md` — route into only the task-specific canon you need.
5. Relevant code and tests.

Do **not** treat old briefs, generated research, chat exports, root-level experiments, legacy code or historical handovers as current truth unless a canonical document points to them.

## what assembl is now

assembl is becoming an intelligence-powered software factory for finding, doing and showing valuable work.

The connected system is:

- **Pursuit / FIND** — finds valuable work, friction, signals and opportunities.
- **DO** — executes bounded work in the user's browser/tools with appropriate approval.
- **SHOW / Studio** — frames, demonstrates and commercialises the possibility through working experiences, creative and proof.
- **Factory** — reusable primitives, context, agents, skills, connectors, tests, evals and proof infrastructure underneath all three.
- **Proof + learning** — feeds outcomes and lessons back into Pursuit and the Factory.

Core loop:

`signals → Pursuit → opportunity → Factory → DO/SHOW → proof → learning → stronger Pursuit + Factory`

The long-term product strategy is governed by `docs/assembl-context.md`. The fast-moving working state is `docs/context/CURRENT.md`.

## before starting a task

Write down:

- objective
- product/surface: Pursuit | DO | SHOW/Studio | shared Factory | other
- files/area expected to change
- canonical docs required
- definition of done
- evidence required
- authority boundary: read/draft/build vs external action/deploy/production

If this cannot be stated clearly, do discovery first rather than coding broadly.

## context efficiency

To reduce model cost and drift:

- load this file, `AGENTS.md`, the manifest and `CURRENT.md` first
- use `docs/context/README.md` to choose only relevant deeper context
- prefer repository evidence over remembered chat context
- do not paste large strategy docs into prompts when they already live in the repo
- do not ask multiple agents to independently rediscover architecture
- record durable decisions once in the canonical decision log
- extract reusable mechanics into the primitive registry
- treat chat history as working memory, not company canon

## repository cleanup rule

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

## if instructions conflict

Use the precedence defined in `docs/context/README.md` and `config/context-manifest.json`.

When a lower-precedence file conflicts with a higher-precedence file, follow the higher-precedence source and record the conflict rather than blending both.
