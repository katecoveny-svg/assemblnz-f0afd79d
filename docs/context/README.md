# assembl context router

Use this file to decide what context to load. The goal is one coherent source of truth without loading the entire company history into every task.

Machine-readable routing: `config/context-manifest.json`.  
Fast-moving working context: `docs/context/CURRENT.md`.

## precedence

When instructions conflict, use this order:

1. **Current explicit user/task instruction**
2. **Root `AGENTS.md`** — repo-wide operating and safety rules
3. **Nearest nested `AGENTS.md`** — only for files inside that subtree
4. **Canonical current docs in `config/context-manifest.json` and listed below**
5. **Current code/schema/tests** for implementation reality
6. **Harness-specific compatibility memory**
7. **Handovers, audits, research, old briefs, generated outputs and legacy experiments**

Never silently merge contradictory truths. Flag the conflict and prefer the higher-precedence source.

## always load first

For a fresh coding/agent task:

1. `START_HERE.md`
2. `AGENTS.md`
3. `config/context-manifest.json`
4. `docs/context/CURRENT.md`
5. this router
6. only the smallest task-specific canon + relevant source/tests

## canonical context by question

| Need | Canonical source |
|---|---|
| Where is assembl at right now? | `docs/context/CURRENT.md` |
| What is assembl / durable strategy / product philosophy? | `docs/assembl-context.md` |
| Visual system / brand tokens | `docs/assembl-brand-system.md` |
| Operational design / composition / motion / creative rules | `DESIGN.md` + `docs/assembl-brand-system.md` |
| Public copy rules | `docs/assembl-copy-standard.md` |
| Machine-readable source map | `config/context-manifest.json` |
| Repo operating rules / done criteria | `AGENTS.md` |
| Current software-factory model | `docs/factory/FACTORY.md` |
| Reusable capabilities | `docs/factory/PRIMITIVES.md` |
| Durable architecture/product decisions | `docs/factory/DECISIONS.md` |
| Factory learnings / repeated failures | `docs/factory/LEARNINGS.md` |
| Agentic journey foundation | `docs/agentic-customer-journey.md` |
| Journey foundation plan | `docs/agentic-journey-foundation-plan.md` |
| Wait-state product family | `docs/agentic-wait-states-roadmap.md` |
| DO Action Cloud | `docs/do-action-cloud/` — mixed implementation/build package; verify runtime |
| DO Meet | `docs/do-meet/` — meeting-to-work build package plus related Meeting DO runtime; verify runtime |
| Architecture / agent registry | `docs/AGENTIC-OS-ARCHITECTURE.md` + `docs/AGENT-REGISTRY.md` |
| Environment variables | `.env.local.example` + `docs/ENVIRONMENT.md` |
| Deployment / release | `docs/deployment-and-release-checklist.md` + `docs/deployment-surfaces.md` |
| Plugin subtree | `plugins/CLAUDE.md` plus nested instructions |
| Remotion subtree | `remotion/CLAUDE.md` |

## product routing

### Pursuit / FIND

Load signal, opportunity, evidence/provenance, buyer/company and relevant product context.

Pursuit should create evidence-backed opportunities, not speculative certainty. Keep source freshness, verified fact and commercial hypothesis distinct.

If working on the flexible journey builder, Sponsored Agent module or `/pursuit/playground`, check current runtime status. Preview surfaces must stay labelled as preview/draft unless the backing integrations are verified.

### DO

Load execution/tool/authority context.

DO should preview meaningful risky work, obtain approval at the correct boundary, execute within granted limits, verify where possible and leave a receipt.

Shared lifecycle:

`know → prepare → permit → do → verify → receipt`

For Action Cloud work, start at `docs/do-action-cloud/README.md`. Phase 1 primitives exist, but the package includes staged build briefs too. Do not infer that every described rail or service is live.

For Meeting DO / DO Meet, start at `docs/do-meet/`. Distinguish current Meeting DO runtime from broader hosted-video/provider build plans.

### SHOW / Studio

Load:

- `docs/assembl-brand-system.md`;
- `DESIGN.md`;
- `docs/assembl-copy-standard.md`;
- relevant product/customer context;
- verified client brand sources where applicable.

SHOW is the proof surface: working demonstrations, journeys, interfaces, video, image, 3D, websites, advertising, campaigns, pitches and tender artefacts should make the possibility tangible without inventing customer claims.

For a named client, distinguish the **Assembl frame** from the **verified client brand**.

### Factory

Load this router + relevant `docs/factory/*` + only the product area being changed.

Factory work should improve multiple future builds where practical.

### Business Genome

A Business Genome is context for a specific business/client/tenant. It is not Assembl company memory. Load only the parts required for the current task or journey stage.

## brand routing

Current master visual grammar:

> **things gather, organise and move with purpose until a useful whole is visible.**

Use two complementary modes:

1. **brand/narrative assembly** — premium aerial/top-down collective movement, often with an Aotearoa sensibility;
2. **product/proof assembly** — recognisable inputs become a reviewable output with permission, reviewer and evidence visible.

Current company type is **Instrument Sans**, with **IBM Plex Mono** only in evidence/proof roles. Do not revive Jost or legacy serif systems from old demonstrators as company-wide canon.

## truth labels

Use these labels in planning/docs when useful:

- **canonical** — current intended durable truth
- **current state** — today's operating state
- **runtime truth** — what current code/schema/tests actually do
- **preview** — implemented for demonstration/evaluation, not production proof
- **build brief** — defined work that may not be implemented
- **proposal** — not yet accepted
- **simulated** — no real external effect
- **historical** — useful background, not current instruction
- **legacy** — retained for compatibility only
- **archive candidate** — likely removable/movable after reference checks

## context budget rule

Do not automatically load `CLAUDE.md`, all of `docs/`, all research files, all Business Genome content or prior chat transcripts.

The agent should be able to state which files it loaded and why.

Run `pnpm context:check` when context/brand work changes or drift is suspected.

## promoting chat knowledge into persistent memory

Chat history is working memory, not the company source of truth.

When a conversation produces something durable:

- current state change → update `docs/context/CURRENT.md`
- durable product/strategy change → update `docs/assembl-context.md`
- brand change → update `docs/assembl-brand-system.md` + manifest snapshot
- operational design rule → update `DESIGN.md` if it belongs there
- public copy rule → update `docs/assembl-copy-standard.md`
- reusable capability → update `docs/factory/PRIMITIVES.md`
- durable decision → update `docs/factory/DECISIONS.md`
- repeated lesson/failure → update `docs/factory/LEARNINGS.md`
- agent role/capability change → update the relevant registry/definition

Do not let an automated process silently promote experiments into canon.
