# Assembl / agent discovery, public research and revenue

## Product decision
The public homepage should demonstrate a complete useful job: public brief → real search → evidence-backed proposed pursuit → review → branded pitch. Keep the existing private client hubs and Creative Studio. Do not label a simulated canvas as a live agent.

## Implemented in this branch
- Server-side provider web search with three-search / two-request bounds and strict source-URL validation.
- A real search over the small published Assembl product corpus on every research request. This is NOT a search over all company or client knowledge.
- Durable, serialised quota reservation and source/result receipt. Storage or provider failure closes the trial rather than substituting a sample.
- Optional TypeSafe decision review behind separate deployment enablement and visitor consent. Existing model transport is reused; it is not independently verified by this implementation.
- Homepage canvas with sources, proposal and plan. An editable HTML pitch export includes evidence and review caveats. It does not create a PowerPoint or write into a private hub.
- Free read-only MCP public knowledge endpoint, OpenAPI schema and a human-readable /tools/agents directory.
- Explicit copywriting skill and targeted checks. This is not a claim that every old client/demo page has been rewritten.

## Activation is a distinct step
Migration creates isolated service-role-only tables; the trial is OFF by default. Requires the correct Supabase project, service-role configuration, working Anthropic web-search entitlement, suitable model, verified retention cleanup, bounded trial policy and a successful live smoke test. TypeSafe stays off until its separate live call is proved. No billing prices, payment links or customer charges are created by this code.

The current paid-tool scaffolding must not be promoted as production commerce merely because endpoint files exist. Audit upstream NZBN/Companies Office access, storage errors, concurrent spend reservations, idempotency and Stripe reconciliation first. Do not meter failed/unavailable tool calls as successful value delivery.

## Distribution order
1. Own-domain documentation, schemas, sample inputs and exact tool descriptions. Explain when to call, expected output, source dates and unavailable states.
2. Publish a verified remote MCP server to the official MCP Registry. The registry lists metadata; clients decide what to install or call. A repository README or llms.txt alone does not perform registration.
3. Submit the verified server to relevant directories/aggregators such as Smithery or Glama using their current submission procedures. Do not claim listing until a discoverable record is returned.
4. Add examples for coding agents and suitable SDKs. A good task-specific tool description matters more than a vague 'NZ intelligence' name.
5. Consider x402 plus Bazaar only after real paid-call settlement is proven. Discovery and payments are separate from a good data product.

Sources checked 18 September 2026:
- https://modelcontextprotocol.io/registry/quickstart
- https://modelcontextprotocol.io/registry/remote-servers
- https://docs.x402.org/extensions/bazaar
- https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage-api
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool

## Commercial recommendation (proposal, not activated pricing)
Start with prepaid customer credit or a monthly allowance plus overage rather than card charges on every tiny call. Sell a finished structured answer with sources, not raw tokens. Trial customers accept the currency, unit price, caps and refund/failure rule before paid use. Validate demand before choosing a price.

One ledger: authenticated API key → reserve approved allowance → provider call → validated result + receipt → settle billable usage → idempotent Stripe outbox → reconciliation. A timeout may have incurred provider cost without delivering customer value; account for that internally rather than blindly charging the user. Failed upstream readiness should incur no customer charge. No anonymous public endpoint should spend without a global cap.

## NZ tool priorities
1. Tender-fit brief: a notice, dates, buyer, fit, missing evidence and a bid/no-bid rationale with source references. Licence, active-vs-closed status and update cadence must be checked before integration.
2. Company identity and change context: resolve trading/legal names and NZBN, then explain relevant published changes. The NZBN API itself is free, so charge only for useful resolution, monitoring and combined context, not invented exclusivity. Source: https://www.nzbn.govt.nz/using-the-nzbn/nzbn-services/api/
3. Funding-fit evidence: map a business profile to current eligibility, deadlines and official sources. No guarantee of eligibility or funding. Keep expired programmes visible as expired, not current leads.
4. Council/project signal brief: combine licensed consent/project/procurement information into a usable sales signal; do not imply all councils have equivalent API access or licence terms.
5. NZ operational context: public delivery, geospatial or disruption signals turned into task-specific summaries. GeoNet/LINZ already have APIs; value must come from relevance, provenance and workflow, not merely repackaging free data.

These are product hypotheses, not evidence that no competing tools exist. First validate with a few paying users or agent developers. Prioritise tender-fit and company-resolution work because it directly supplies Pursuit.

## Visual system
The Blender scene is a separate authored asset review. Modern Auckland Scandi direction: pale oak, limewash, linen, mineral surfaces, restrained rose/plum furniture, daylight and a stylised harbour outlook. Do not present it as a photograph of an actual office. Still renders and runtime glTF can have different material/lighting limits; both need inspection. Do not replace the live model just because Blender exported without an error.

## Private knowledge
Public search is allowlisted published records only. Licensed paid knowledge needs per-record permission/licence/provenance and customer entitlement. Private client knowledge needs tenant isolation and authenticated access, never exposure through the free MCP server. Tool receipts and counts are operational proof of invocation, not proof of business value or complete factual accuracy.
