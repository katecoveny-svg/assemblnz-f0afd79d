# Assembl agent access and commerce

## Observed state, not assumed readiness

On 18 September, the accessible Supabase project named `assembl-prod` (`wurwcrgxjjwqdaxqceey`) initially had no `pursuit_public_*` or `assembl_tool_*` tables. New, empty, service-role-only public-trial tables and a daily retention job were subsequently created there. The policy remains DISABLED, with a deliberately small ceiling of three total attempts and one per network per UTC day. Anonymous and authenticated roles were verified unable to read the new run table or invoke its reservation function.

Do not infer the Vercel production database mapping from a project name. A separate parallel implementation referenced `vjsmwtpubjyelwdeueup`. The protected preview did return an actual research availability response with provider and storage configuration present and the trial disabled, but the exact production mapping and a real provider search are not yet verified. No public trial activation or paid model result is claimed.

The existing paid-tool code has sandbox and storage adapters, but that is not evidence of a working production billing path. The LIVE `/api/tools/nz-who-runs-it` response reported `nzbn_configured:false` and `companies_office_configured:false`; its test keys use fixtures. Do not advertise those calls as a working paid company-register lookup.

The existing NZ knowledge helper embeds a query and retrieves KB citations using a service role. Its corpus must be classified and publication rights audited before exposing it to anonymous agents. Prompt instructions to search are not usage evidence.

This implementation exposes six owned public product records only. It does not expose private client hubs, clinical material, customer documents, credentials, or the full NZ corpus. The research pipeline executes published-record retrieval, requires an actual provider web-search result, and records source URLs, selected record IDs, token usage and whether TypeSafe really ran. TypeSafe is optional decision support, not a factual source or search engine. A source URL match establishes provenance, not independent fact-checking or claim entailment.

## Distribution

1. Publish human-readable documentation at `/tools/agents`, a stable OpenAPI file, an explicitly scoped public MCP endpoint and machine-readable catalogue.
2. Submit the working remote server to the official MCP Registry after runtime testing. The prepared `server.json` is a publication candidate, NOT a completed listing. Publishing requires namespace ownership and an explicit authenticated publication step.
3. Submit separately to relevant client directories and marketplaces with exact instructions, examples, availability and pricing. Do not claim every agent automatically discovers or trusts the Registry.
4. Consider x402 with Bazaar after a successful paid pilot. Bazaar is evolving, facilitator-specific and requires payment/discovery integration. It is not an automatic listing for any HTTP API.

Primary references checked 18 September 2026:
- https://modelcontextprotocol.io/registry/remote-servers
- https://modelcontextprotocol.io/registry/quickstart
- https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- https://docs.x402.org/extensions/bazaar
- https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage-api

## Charging recommendation

Sell resolved tasks and reliable structured answers, not a promise of access to the public web. Start with prepaid call credits for a small customer group, or a monthly allowance with aggregated usage for a business account. Do not make a separate card transaction for every tiny API request. No new price or charge is activated by this build.

Required production spine: explicit plan/price acceptance; customer-linked hashed API key; atomic reservation before upstream work; bounded provider/time/output costs; request-id idempotency; result validation; durable receipt; debit only successful billable outputs; release on failed calls; Stripe usage outbox with retries; reconciliation; per-key and global spend ceilings; revocation; versioned terms; source licensing and attribution. A memory-store fallback cannot substitute for this ledger.

Stripe meter events are asynchronous. Record usage in our own ledger first, use an idempotency key and reconcile with Stripe. A successful meter-event HTTP request is not settled revenue.

## NZ tools to validate with customers

**Company identity and change brief.** Normalise NZBN data, resolve the correct legal entity and return a dated change summary. Official NZBN lookup and watchlists already exist for free. Differentiation is matching, provenance, change interpretation and workflow integration, not exclusivity over public data. Verify source terms and production credentials.

**Tender qualification pack.** Parse an authorised procurement notice into its deadline/timezone, buyer, eligibility, required evidence, submission steps and a bid/no-bid draft. Return unknowns and prove whether the notice remains open. Do not scrape restricted portals or invent an active tender feed.

**Property/site context.** Join permitted LINZ address/geospatial data with relevant public council layers. Return boundaries, source dates and links, not legal conclusions or harvested owner-contact lists. Open geospatial data and personal ownership data have different terms.

**Grant eligibility pre-check.** Return current programme rules, missing facts and source-linked questions. Avoid guaranteed eligibility or funding promises. Keeping conditions and expiry dates current is the value.

**NZ source-to-pitch.** An evidence-backed opportunity and a reviewable branded deck. It is a strong lead-product hypothesis because visitors can assess an output before a sales conversation. Public trial first; authenticated client-safe persistence and paid API access later.

These are product hypotheses, not proof that competitors or free alternatives do not exist. Validate two with paying design partners before expanding the catalogue.

Official NZ data references:
- https://www.nzbn.govt.nz/using-the-nzbn/nzbn-services/api/
- https://portal.api.business.govt.nz/api/nzbn
- https://www.linz.govt.nz/guidance/data-service/linz-data-service-guide/web-services/lds-apis-and-web-services
- https://www.linz.govt.nz/products-services/data/licensing-and-using-data/linz-licence-personal-data

## Cost, privacy and export boundary

The trial defaults disabled. Its database policy imposes global and per-network daily attempt caps, counts failures against the cost ceiling, and stores a hashed network principal, input hash, final draft and trace. Results expire after seven days; daily cleanup deletes expired rows. The raw IP and original prompt are not stored in these tables. Upstream providers receive the submitted public brief under their own terms.

Activation requires verification of the deployment's database, configured provider credentials and a bounded real search with a saved source trail. The UI reports unavailable while disabled. Never expose API keys to the browser. A configured or named TypeSafe model is not evidence it was called.

The current pitch export is a six-slide editable HTML presentation, printable to PDF. It is not PPTX and does not automatically save to a private hub. A future client-brand import or hub handoff needs explicit scope, a verified tenant and permission; a workspace link alone is not a data handoff.
