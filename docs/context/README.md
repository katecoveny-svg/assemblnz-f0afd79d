# assembl context router

Use this file to decide what context to load. The goal is one coherent source of truth without loading the entire company history into every task.

Machine-readable routing lives in `config/context-manifest.json`.
Fast-moving working context lives in `docs/context/CURRENT.md`.

## precedence

When instructions conflict, use this order:

1. **Current explicit user/task instruction**
2. **Root `AGENTS.md`** — repo-wide operating and safety rules
3. **Nearest nested `AGENTS.md`** — only for files inside that subtree
4. **Canonical current docs in `config/context-manifest.json` and listed below**
5. **Current code/schema/tests** for implementation reality
6. **`CLAUDE.md` and other harness-specific compatibility memory** — useful but supplementary
7. **Handovers, audits, research, old briefs, generated outputs and legacy experiments** — reference only

Never silently merge contradictory truths. Flag the conflict and prefer the higher-precedence source.

## always load first

For a fresh coding/agent task, use:

1. `START_HERE.md`
2. `AGENTS.md`
3. `config/context-manifest.json`
4. `docs/context/CURRENT.md`
5. this router
6. only the smallest task-specific canon + source/tests

## canonical context by question

| Need | Canonical source |
|---|---|
| Where is Assembl at right now? | `docs/context/CURRENT.md` |
| What is assembl / durable strategy / product philosophy? | `docs/assembl-context.md` |
| Visual system / brand tokens | `docs/assembl-brand-system.md` |
| Public copy rules | `docs/assembl-copy-standard.md` + `COPY.md` where still mirrored |
| Machine-readable source map | `config/context-manifest.json` |
| Repo operating rules / done criteria | `AGENTS.md` |
| Current software-factory model | `docs/factory/FACTORY.md` |
| Reusable capabilities | `docs/factory/PRIMITIVES.md` |
| Durable architecture/product decisions | `docs/factory/DECISIONS.md` |
| Factory learnings / repeated failures | `docs/factory/LEARNINGS.md` |
| Agentic journey foundation | `docs/agentic-customer-journey.md` |
| Journey foundation plan | `docs/agentic-journey-foundation-plan.md` |
| Wait-state product family | `docs/agentic-wait-states-roadmap.md` |
| DO Action Cloud build briefs (Assembl orchestration · DO safe action · Pursuit vertical) | `docs/do-action-cloud/` |
| DO Meet build briefs (meeting-to-work engine on Action Cloud Permit/Wait/Receipt; not live production) | `docs/do-meet/` |
| Architecture / agent registry | `docs/AGENTIC-OS-ARCHITECTURE.md` + `docs/AGENT-REGISTRY.md` |
| Environment variables | `.env.local.example` + `docs/ENVIRONMENT.md` |
| Deployment / release | `docs/deployment-and-release-checklist.md` + `docs/deployment-surfaces.md` |
| Plugin subtree | `plugins/CLAUDE.md` plus any nested instructions |
| Remotion subtree | `remotion/CLAUDE.md` |

## product routing

### Pursuit / FIND
Load the context needed for signals, opportunity intelligence, evidence provenance, buyer/company understanding, tenders and commercial opportunity. Pursuit should create evidence-backed opportunities, not speculative certainty.

### DO
Load execution/tool/authority context. DO should preview risky work, obtain approval at meaningful boundaries, execute within granted limits and leave a receipt. For the DO Action Cloud build-brief package (not a live-production claim), start at `docs/do-action-cloud/`. For DO Meet (meeting-to-work engine on Permit/Wait/Receipt; MVP = work engine first, native video Phase 2; not live production), start at `docs/do-meet/`.

### SHOW / Studio
Load brand + copy + relevant product/customer context. SHOW is the proof surface: working demonstrations, journeys, interfaces, video, image, 3D, pitches and tender artefacts should make the possibility tangible without inventing customer claims.

### Factory
Load this router + relevant `docs/factory/*` + only the product area being changed. Factory work should improve multiple future builds where practical.

### Business Genome
A Business Genome is context for a specific business/client/tenant. It is not Assembl company memory. Load only the parts of a Genome required for the current task or journey stage.

## truth labels

Use these labels in planning/docs when useful:

- **canonical** — current intended durable truth
- **current state** — today's operating state; can change faster than canon
- **runtime truth** — what current code/schema/tests actually do
- **proposal** — not yet accepted
- **historical** — useful background, not current instruction
- **legacy** — retained for compatibility only
- **archive candidate** — likely removable/movable after reference checks

## context budget rule

Do not automatically load `CLAUDE.md`, all of `docs/`, all research files, all Business Genome content, or prior chat transcripts.

The agent should be able to state which files it loaded and why.

Run `pnpm context:check` when context/brand work changes or when drift is suspected.

## promoting chat knowledge into persistent memory

Chat history is working memory, not the company source of truth.

When a conversation produces something durable:

- current state change → update `docs/context/CURRENT.md`
- durable product/strategy change → update `docs/assembl-context.md`
- brand change → update `docs/assembl-brand-system.md` + manifest snapshot
- reusable capability → update `docs/factory/PRIMITIVES.md`
- durable decision → update `docs/factory/DECISIONS.md`
- repeated lesson/failure → update `docs/factory/LEARNINGS.md`
- agent role/capability change → update the appropriate agent registry/definition

Do not let a nightly automation silently promote experiments into canon.
