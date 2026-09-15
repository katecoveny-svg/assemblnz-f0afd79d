# assembl

**Find the work. DO the work. Show the possibility.**

This repository is the canonical main repo for assembl. It contains the current Next.js web runtime, the multi-platform DO product, shared packages, Supabase infrastructure, agent/plugin tooling, research/reference material and retained legacy code.

Before substantial work, start with:

1. [`START_HERE.md`](./START_HERE.md)
2. [`AGENTS.md`](./AGENTS.md)
3. [`config/context-manifest.json`](./config/context-manifest.json)
4. [`docs/context/CURRENT.md`](./docs/context/CURRENT.md)
5. [`docs/context/README.md`](./docs/context/README.md)

Do not infer current product direction or brand from nearby legacy code. The context router tells you what is canonical.

## current structure

assembl is organised around one connected system:

- **Pursuit / FIND** — signals, friction, opportunities, buyers, tenders and evidence
- **Factory** — shared context, primitives, agents, skills, connectors, tests, evals and learning
- **DO** — portable bounded execution with permissions, approvals and receipts
- **SHOW / Studio** — working demonstrations, journeys, creative, pitches and commercial proof
- **Proof + learning** — outcomes returning to Pursuit and the Factory

The Business Genome remains a reusable client/business context substrate. It is not the top-level definition of assembl.

Canonical strategy: [`docs/assembl-context.md`](./docs/assembl-context.md)  
Current working state: [`docs/context/CURRENT.md`](./docs/context/CURRENT.md)

## brand

Current assembl company brand is defined in [`docs/assembl-brand-system.md`](./docs/assembl-brand-system.md).

- deep plum `#240B21`
- muted plum `#654A4E`
- dusty rose `#916A70`
- chalk `#F5F1F2`
- paper `#FFFDFB`
- **Instrument Sans** — primary company type
- **IBM Plex Mono** — evidence/proof/status role only

Old Cormorant, champagne/gold, pearl, pounamu and canary-era implementation is not current company-brand precedent. Named client demonstrators may retain verified client branding.

## toolchain

Main web runtime:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- pnpm 9.15.9
- Node 20+

Install and run:

```bash
pnpm install
pnpm --filter @assembl/canvas build
pnpm dev
```

Common checks:

```bash
pnpm typecheck
pnpm test
pnpm lint:all
pnpm lint:macrons
pnpm context:check
pnpm build
pnpm eval:journeys
pnpm test:agents
```

`@assembl/canvas` must be built before typecheck/dev/build when its compiled output is absent.

## repository map

```text
app/                 Next.js web App Router
apps/do/             DO multi-platform product: browser extension, macOS, iOS,
                     Android, shared runtime and service primitives
components/          shared + product UI
lib/                 domain logic and reusable runtime capabilities
packages/            workspace packages, including @assembl/canvas
plugins/             plugin / agent tooling; scoped instructions apply
supabase/            migrations + Deno edge functions
scripts/             guards, evals, setup and maintenance
remotion/            independent Bun-based creative/video runtime
research/            reference/research — not automatic context
legacy-vite/         historical Vite SPA — reference only; do not edit casually
docs/                 canonical + historical documentation; use context router
pr-evidence/         canonical location for new PR proof
```

`app/` and `apps/do/` are intentionally different runtimes. `test/` and `tests/` also currently serve different purposes; do not consolidate either pair simply for naming neatness.

## DO

DO's core principle is:

**surface ≠ agent**

A browser side panel, floating orb, native Mac companion, mobile surface or voice session is a launch surface. The portable capability is the shared `AgentSpec` and runtime underneath it.

Current DO code lives across:

- `apps/do/shared/` — shared AgentSpec/runtime/policy primitives
- `apps/do/extension/` — browser extension + side-panel/companion surfaces
- `apps/do/macos/` — native Mac development companion
- `apps/do/ios/` / `apps/do/android/` — native/mobile work
- `app/do/` — hosted DO web experience
- `app/api/do/` — DO server routes

Consequential actions must pass the existing approval/evidence boundary. Never claim a simulated, proposed or preparation-only action actually happened.

## environment and secrets

Do **not** use a tracked root `.env` as the source of truth.

For current local setup, copy or pull values into `.env.local` using [` .env.local.example`](./.env.local.example) as the annotated variable reference. Production/preview values belong in their deployment/provider secret stores (for example Vercel and Supabase), not in committed source.

See [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md).

Never commit real provider keys, service-role credentials, signing secrets or private tokens. The public repository still contains historical environment material that is being audited; do not copy values from Git history into new configuration.

## deployment and release

The root Next.js app is deployed through Vercel. Supabase functions/migrations and other sub-projects have separate deployment workflows. Read:

- `docs/deployment-and-release-checklist.md`
- `docs/deployment-surfaces.md`

Do not merge or deploy automatically unless the current task explicitly authorises it.

## working rule

**Build the factory, then build through the factory.**

Before adding shared infrastructure, inspect [`docs/factory/PRIMITIVES.md`](./docs/factory/PRIMITIVES.md). Before making a durable architectural/product decision, check [`docs/factory/DECISIONS.md`](./docs/factory/DECISIONS.md). Record repeated lessons in [`docs/factory/LEARNINGS.md`](./docs/factory/LEARNINGS.md).
