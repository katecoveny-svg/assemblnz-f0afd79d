# Lead Hunter + Pilot surfacing

## Delivered

- Provider-neutral grounded web research options in Pilot's knowledge and tool catalogues.
- A typed Lead Hunter agent definition with evidence, confidence, deduplication and approval requirements.
- A production system prompt for evidence-first New Zealand prospect research.
- A first-class `build an agent` link in the homepage navigation.
- A homepage section explaining Pilot and linking directly to `/pilot`.
- A `Build an agent` entry in the marketplace header and homepage footer.

## Runtime boundary

This change defines the capability and builder option. The grounded-search runtime must resolve `grounded_web_search` to whichever provider is configured for the tenant and preserve source provenance. Outreach, CRM writes and paid enrichment remain approval-gated.

## Validation required before merge

- `pnpm typecheck`
- `pnpm lint:all` or targeted lint for changed files
- `pnpm test`
- Visual check at desktop and mobile widths for homepage and marketplace navigation
- Confirm `/pilot` is reachable signed out and save/ship remains authentication-gated
