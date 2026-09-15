# assembl context router

Use this file to decide what context to load. The goal is one coherent source of truth without loading the entire company history into every task.

## Precedence

When instructions conflict, use this order:

1. **Current user/task instruction**
2. **Root `AGENTS.md`** — repo-wide operating and safety rules
3. **Nested `AGENTS.md`** — only for files inside that subtree
4. **Canonical current docs listed below**
5. **Current code/schema/tests** for implementation reality
6. **`CLAUDE.md` and harness-specific compatibility files** — useful memory, but not allowed to override canonical docs above
7. **Handovers, audits, research, old briefs, generated outputs and legacy experiments** — reference only

Never silently merge contradictory truths. Flag the conflict and prefer the higher-precedence source.

## Canonical context by question

| Need | Canonical source |
|---|---|
| What is assembl / strategy / product philosophy? | `docs/assembl-context.md` |
| Visual system / brand tokens | `docs/assembl-brand-system.md` |
| Public copy rules | `docs/assembl-copy-standard.md` + `COPY.md` where still mirrored |
| Repo operating rules / done criteria | `AGENTS.md` |
| Current software-factory model | `docs/factory/FACTORY.md` |
| Reusable capabilities | `docs/factory/PRIMITIVES.md` |
| Durable architecture/product decisions | `docs/factory/DECISIONS.md` |
| Factory learnings / repeated failures | `docs/factory/LEARNINGS.md` |
| Agentic journey foundation | `docs/agentic-customer-journey.md` |
| Journey foundation plan | `docs/agentic-journey-foundation-plan.md` |
| Wait-state product family | `docs/agentic-wait-states-roadmap.md` |
| Architecture / agent registry | `docs/AGENTIC-OS-ARCHITECTURE.md` + `docs/AGENT-REGISTRY.md` |
| Environment variables | `.env.local.example` + `docs/ENVIRONMENT.md` |
| Deployment / release | `docs/deployment-and-release-checklist.md` + `docs/deployment-surfaces.md` |
| Plugin subtree | `plugins/CLAUDE.md` plus any nested instructions |
| Remotion subtree | `remotion/CLAUDE.md` |

## Product routing

### Pursuit
Load only the context needed for signals, opportunity intelligence, evidence provenance, buyer/company understanding and commercial opportunity. Pursuit should create evidence-backed opportunities, not speculative certainty.

### Studio
Load brand + copy + relevant product/customer context. Studio is the proof surface: working demonstrations, journeys, interfaces, video, image and pitch artefacts should show the possibility without inventing customer claims.

### DO
Load execution/tool/authority context. DO should preview risky work, obtain approval at meaningful boundaries and leave a receipt after action.

### Factory
Load this router + `docs/factory/*` + only the product area being changed. Factory work should improve multiple future builds where possible.

## Truth labels

Use these labels in planning/docs when useful:

- **canonical** — current intended truth
- **runtime truth** — what the current code/schema actually does
- **proposal** — not yet accepted
- **historical** — useful background, not current instruction
- **legacy** — retained for compatibility only
- **archive candidate** — likely removable/movable after reference checks

## Context budget rule

Default new coding session:

1. `START_HERE.md`
2. `AGENTS.md`
3. this router
4. one or two task-specific canonical docs
5. the relevant code/tests

Do not automatically load `CLAUDE.md`, all of `docs/`, all research files, or prior chat transcripts.

The agent should be able to state which files it loaded and why.
