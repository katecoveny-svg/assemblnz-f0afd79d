# Public research activation evidence / 18 September 2026

## Confirmed

The live custom domain's `/api/pursuit/research` returned the policy limits 3 global / 1 per network after these values were changed in accessible Supabase project `wurwcrgxjjwqdaxqceey`. This verifies the actual deployment mapping; the older note naming only the inaccessible `vjsmwtpubjyelwdeueup` is not the current runtime truth.

Service-role-only trial tables and an active daily `assembl-public-pursuit-retention` cleanup were created and verified. The trial remains disabled outside bounded smoke tests. No billing is activated.

Live HTTP public-knowledge search, MCP initialize and MCP tools/call returned the expected published records and recorded usage in test run `35289784237`. No private corpus was searched. This is real endpoint proof, not a mocked browser result.

## Failed end-to-end research

One bounded research POST for a public Bunnings New Zealand proposal returned HTTP 503, request `d124d423-ae3a-404f-a891-98fe616e7c71`. No finished research or pitch export was returned. The public trial was immediately disabled again. TypeSafe was not enabled or called.

An earlier test `35289615114` failed before any research POST because the test expected an old knowledge-response property name. That was corrected to the deployed `records`, `paid`, `privateKnowledge` contract.

The generic failed receipt did not identify whether the final failure was provider, timeout, JSON, schema, source validation or storage. The error must not be guessed.

## Parser hardening and diagnostics

The provider's official web-search documentation shows text blocks before and after server-tool results. Combining every text block and applying JSON.parse to the entire string is therefore not robust. Add a bounded single-draft JSON extractor, retain full schema/source validation, reject ambiguous drafts and retain fixed error categories without logging raw prompts, provider replies or credentials.

Primary reference: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool

This is a verified protocol weakness, not yet proof that it caused the live failure. A new real smoke test is still required after the fix.

## Delivery boundaries

The existing deck exporter produces six editable HTML slides, not PPTX. No automatic client branding import, private-hub save, paid API activation, external MCP Registry listing or verified TypeSafe result is claimed. The Blender model and three rendered room views exist separately; the main hero still uses the accepted original atelier until a reviewed replacement is connected.
