# AGENTS.md — assembl repo operating instructions

This is the root operating contract for coding agents in `katecoveny-svg/assemblnz-f0afd79d`.

Start with [`START_HERE.md`](./START_HERE.md), then use [`docs/context/README.md`](./docs/context/README.md) to load only the context needed for the task.

Do **not** preload every strategy, research or historical file. Repository context should be routed, not dumped.

## 1. instruction precedence

When instructions conflict:

1. current user/task instruction
2. this root `AGENTS.md`
3. nearest nested `AGENTS.md` for the subtree being edited
4. canonical docs listed in `docs/context/README.md`
5. current code/schema/tests for implementation reality
6. `CLAUDE.md` or other harness-specific memory files
7. historical handovers, audits, research and legacy experiments

Never silently blend contradictory instructions. Follow the higher-precedence source and record the conflict.

## 2. what assembl is

Current strategy is canonical in `docs/assembl-context.md`.

Operationally, treat assembl as a connected intelligence-powered software factory:

- **Pursuit** finds evidence-backed work, friction, signals and opportunities.
- **Studio** turns valuable opportunities into working proof and compelling experiences.
- **DO** executes bounded work in the user's browser/tools with appropriate approval.
- **Factory** supplies the reusable primitives, context, agents, skills, connectors, tests, evals and proof system underneath all three.

Factory loop:

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

Read `docs/factory/FACTORY.md` for the operating model and `docs/factory/PRIMITIVES.md` before inventing shared infrastructure.

## 3. working repository

Expected origin:

`katecoveny-svg/assemblnz-f0afd79d`

Local working path may differ by machine. Do not hard-code a user's home directory as repository truth. Verify with `git remote -v` and `pwd`.

The live application is the **Next.js 16 app at the repository root**, managed with **pnpm 9.15.9**, Node 20+.

Sub-projects have independent toolchains:

- `remotion/` — Bun
- `plugins/mcp-servers/*` — npm
- `supabase/functions/*` — Deno

## 4. context budget

Default for a fresh coding task:

1. `START_HERE.md`
2. this file
3. `docs/context/README.md`
4. 1–2 task-specific canonical docs
5. relevant source/tests

Do not automatically load all of `CLAUDE.md`, `docs/`, `research/`, chat transcripts or generated outputs.

Before coding, be able to state:

- objective
- product/surface
- canonical docs loaded
- files expected to change
- definition of done
- proof required
- authority boundary

## 5. repo map

Primary shipping/runtime areas:

- `app/` — Next.js App Router
- `components/` — shared and product components
- `lib/` — domain logic and runtime capabilities
- `packages/` — shippable shared packages
- `plugins/` — plugin/agent ecosystem; obey scoped instructions
- `supabase/` — migrations + edge functions
- `scripts/` — checks, catalog builders, setup and evals

Important shared areas:

- `lib/journey/` — reusable CustomerJourney foundation
- `lib/customers/` — tenant/customer context and demo data
- `lib/ai/` — model routing
- `lib/agents.ts` — agent fleet registry
- `packages/canvas/` — current design/motion primitives

Mixed/non-shipping areas such as `research/`, `marketing/`, root-level audits/briefs, generated evidence folders and `legacy-vite/` require classification before cleanup. Do not mass-move/delete them in feature work.

`legacy-vite/` is historical compatibility/reference. Do not edit casually.

## 6. canonical brand

Visual source of truth: `docs/assembl-brand-system.md`.

Current tokens:

- deep plum `#240B21`
- muted plum `#654A4E`
- dusty rose `#916A70`
- chalk `#F5F1F2`
- paper `#FFFDFB`

Typography:

- Instrument Sans — headlines/body/navigation/controls
- IBM Plex Mono — wait-state labels/evidence/timestamps/proof

Wordmark: lowercase `assembl`.

No chatbot/robot imagery. Prefer editorial or sculptural product photography and visual metaphors of assembly.

No bare “AI” in customer-facing copy when an agent/function/product description is clearer.

Use required te reo Māori macrons in display copy, including Tōro, Pīkau, Mātauranga, whānau, kaitiaki, tikanga, Aotearoa and Māori.

## 7. before coding

For schema/file/runtime-dependent work:

1. update/inspect current `main`
2. verify the file/table/API actually exists
3. inspect existing implementation before creating a parallel one
4. check `docs/factory/PRIMITIVES.md`
5. isolate feature work on a dedicated branch/worktree where supported

If the brief conflicts with runtime reality, do not guess.

## 8. architecture rules

- Prefer explicit inputs/structured outputs.
- Reuse existing primitives before creating new infrastructure.
- Keep risky side effects bounded and observable.
- Files are canonical for agent prompts; runtime DB prompt records are caches where documented.
- Optional integrations should fail safely/open as designed rather than crash unrelated surfaces.
- Never claim an action is completed when it is simulated, proposed, sandboxed or approval-required.
- Human approval remains required for meaningful external actions unless the task explicitly grants authority.

Every substantial feature should say whether it **uses**, **extends**, **creates** a primitive, or is intentionally one-off.

## 9. important runtime caveats

### canvas build

`@assembl/canvas` must be built before typecheck/dev/build when its compiled `dist/` is absent:

`pnpm --filter @assembl/canvas build`

### env

`.env.local` is required for Supabase-backed authenticated/internal surfaces. Public marketing can render without optional provider credentials. Use `.env.local.example` + `docs/ENVIRONMENT.md` as canonical environment documentation.

### splash gate

`middleware.ts` contains splash/demo gating. New public routes/assets must be correctly exempted or they may rewrite to `/` or 401. Verify exact/prefix/static-file behaviour when adding public surfaces.

## 10. standard commands

```bash
pnpm install
pnpm --filter @assembl/canvas build
pnpm dev
pnpm typecheck
pnpm test
pnpm lint
pnpm lint:all
pnpm lint:macrons
node scripts/brand-guard.mjs
pnpm build
pnpm eval:journeys
pnpm test:agents
```

`pnpm lint` is narrow. Use `pnpm lint:all` when work touches outside its configured scope.

## 11. proof before done

“No error” is not proof.

Every meaningful change needs evidence appropriate to its claim:

- automated tests/checks
- runtime path exercised
- screenshot/video for visible interaction changes
- API input/output for service changes
- eval result for agent/journey behaviour
- accessibility or network/console evidence where relevant

Visible changes require visual proof.

## 12. done criteria

A PR is ship-ready only when relevant checks are green and the PR explains:

- what changed
- why
- acceptance criteria
- test plan/checks run
- evidence
- risks
- rollback/reversal where relevant
- follow-ups outside current scope

Baseline checks for main app changes:

- `pnpm typecheck`
- relevant tests
- appropriate lint (`pnpm lint` or `pnpm lint:all`)
- `pnpm build` when the change can affect production build
- mobile behaviour at 375px for UI changes
- brand/macron guards for customer-facing work
- preview/runtime proof where available

Do not merge or deploy production changes without explicit authority.

## 13. compound the factory

Before closing substantial work, ask:

**What should assembl never have to rebuild or rediscover from scratch again?**

Update the appropriate canonical asset:

- reusable capability → `docs/factory/PRIMITIVES.md`
- durable decision → `docs/factory/DECISIONS.md`
- repeatable lesson/failure → `docs/factory/LEARNINGS.md`
- company/product truth → appropriate canonical context doc
- repeatable workflow → skill/runbook/test/eval

Build the factory, then build through the factory.
