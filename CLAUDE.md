# assembl — Claude bootstrap

This file is a **harness adapter**, not a second source of company truth.

Before substantial work, read in this order:

1. `START_HERE.md`
2. `AGENTS.md`
3. `config/context-manifest.json`
4. `docs/context/CURRENT.md`
5. `docs/context/README.md`
6. only the task-specific canonical docs + relevant code/tests

If anything in older Claude conversation history, remembered repo state, old research, legacy code, or this file conflicts with those sources, the canonical repo context wins.

## Current assembl structure

Treat assembl as one connected intelligence-powered software factory:

- **Pursuit / FIND** — find evidence-backed work, friction, signals and opportunities.
- **Factory** — shared context, primitives, agents, skills, connectors, evals and proof infrastructure.
- **DO** — execute bounded work in the browser/tools with explicit authority and receipts.
- **SHOW / Studio** — make the possibility understandable and commercially compelling through working demos, interfaces, journeys, video, imagery, pitches and tender artefacts.
- **Proof + learning** — measure the result and return reusable capability/learning to the factory.

The **Business Genome** remains important as client/business context, but it is not the top-level definition of assembl. Load only the slice required for the current task or journey stage.

Canonical strategy: `docs/assembl-context.md`.

## Brand — do not improvise

Canonical visual source: `docs/assembl-brand-system.md`.

Current assembl company defaults:

- deep plum `#240B21`
- muted plum `#654A4E`
- dusty rose `#916A70`
- chalk `#F5F1F2`
- paper `#FFFDFB`
- **Instrument Sans** for headline/body/navigation/control typography
- **IBM Plex Mono** only for evidence, timestamps, proof, permissions and wait-state labels

Old Cormorant, champagne/gold, pounamu/teal, cobalt, pearl and canary directions are historical/legacy unless a specifically scoped client or legacy surface requires them.

For any Assembl visual/copy/interface task, read the current brand/copy canon before editing. Do not infer branding from nearby legacy implementation.

## Claude-specific rule

Do not duplicate company strategy or brand into this file again. Add durable truth to the appropriate canonical doc, durable technical decisions to `docs/factory/DECISIONS.md`, reusable capability to `docs/factory/PRIMITIVES.md`, and repeated lessons/failures to `docs/factory/LEARNINGS.md`.

## Critical implementation reminders

- Root app: Next.js 16 / React 19 / TypeScript / pnpm 9.15.9 / Node 20+.
- Build `@assembl/canvas` before typecheck/dev/build when `dist/` is absent: `pnpm --filter @assembl/canvas build`.
- `pnpm lint` is narrow; use `pnpm lint:all` outside its configured scope.
- `middleware.ts` contains splash/demo gating; new public routes/assets must be checked against it.
- Agent prompt files are canonical where documented; runtime DB prompt rows may be caches.
- Never claim simulated/proposed/sandbox/approval-required actions are completed.
- Do not merge, deploy, publish, spend, send externally, or perform irreversible/high-consequence actions without explicit authority.
- Run `pnpm context:check` when context or brand drift is suspected.

## Scoped subtrees

If working inside a subtree with its own instructions, read those after root canon:

- `plugins/CLAUDE.md`
- `remotion/CLAUDE.md`
- nearest nested `AGENTS.md`, if present

## Historical Claude memory

The previous long-form `CLAUDE.md` contained useful implementation history, but it also mixed superseded July strategy and old design directions with current fault memory. It remains recoverable through Git history if a historical investigation requires it. Do not use historical Claude memory as current canon by default.

## Rule

**One source of truth, many adapters.**

Claude should know where assembl's memory lives, not maintain its own copy of assembl's memory.
