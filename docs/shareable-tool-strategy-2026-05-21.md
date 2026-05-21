# Shareable Tool Strategy

Locked 21 May 2026.

## Product Decision

assembl will make HAPAI the first shareable tool layer, then apply the same framework to Tōro apps and business workflows.

The repeatable pattern is:

- one public URL per tool
- one clear job to be done
- draft-only output
- copy, download, and share affordances
- a visible "make yours" path into Pilot Sprint or Industry Pack
- human review before any external action
- private/audited processing only when the customer has the right setup

The shareable artefact is the marketing. Chat can support the work, but the thing people pass around should be a useful record, brief, plan, checklist, or card.

## Naming

"Chief of Staff" is not the lead public angle. It is too US/startup-coded for the NZ market.

Use **The 9am Brief by assembl** as the flagship HAPAI tool:

- clear morning ritual
- useful to founders, operators, EAs, and small teams
- strong enough to become a widget later
- avoids promising autonomous executive authority

Internal product language may use "operator brief" or "action desk". Any te reo naming needs a separate tikanga review before becoming public-facing.

## Product Map

- **HAPAI tools**: public/shareable utilities that demonstrate value quickly. Meeting recorder, 9am Brief, Privacy Act one-pager, project picker, food temp log, vessel studio.
- **Tōro by assembl apps**: lifestyle and whānau tools. School notices, weekly planner, shopping list, routines, kids admin, holiday planning.
- **Workflows**: paid business record/evidence tools. They turn messy work into reviewed records.
- **Kete**: industry packs that bundle agents, workflows, live knowledge, and dashboards.

## Reuse From Legacy Code

Run an "agent archaeology" pass before rebuilding new tools. Priority sources:

- `legacy-vite/src/data/agentCapabilities.ts`
- `legacy-vite/src/data/agentLiveDataMap.ts`
- `legacy-vite/src/data/keteStarterPrompts.ts`
- `legacy-vite/src/pages/Toro*.tsx`
- `legacy-vite/src/pages/EmbedPage.tsx`
- `legacy-vite/src/aaaip/agent/*`
- `lib/business-pulse/*`
- `components/site/WorkflowRunner.tsx`

## Guardrails

- Do not claim autonomous sending, calendar changes, legal compliance, or current-law correctness unless the connected tool actually performs and verifies that action.
- Public tools are draft-only and should not receive sensitive material unless the page explicitly says the customer has private processing configured.
- Live RAG improves grounding, but outputs still need named human review.
