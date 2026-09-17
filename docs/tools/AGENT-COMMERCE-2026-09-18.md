# Assembl agent access and commerce

## Observed state, not assumed readiness

The production database inspection on 18 September found no pursuit_public_* or assembl_tool_* tables. The existing paid-tool code has sandbox and storage adapters, but that is not evidence of a production billing path. The public NZ knowledge helper exists; it embeds a query and retrieves KB citations using a service role. Its corpus must be classified and publication rights audited before exposing it to anonymous agents. Prompt instructions to search are not usage evidence.

This release exposes six owned public product records only. It does not expose private client hubs, clinical material, customer documents, credentials, or the full NZ corpus. Every public research request executes that published-record retrieval, requires an actual provider web-search result, and records source URLs, selected record IDs, token usage and whether TypeSafe really ran. TypeSafe is optional decision support, not a factual source or search engine.

## Distribution

1. Human and crawler-readable documentation at /tools/agents, a stable OpenAPI file, an explicitly scoped public MCP endpoint and machine-readable catalogue.
2. Submit a working remote server to the official MCP Registry after testing. The prepared server.json is a publication candidate, not a completed listing. Publishing requires namespace ownership/authentication and an explicit registry command.
3. Submit separately to relevant client directories and marketplaces with exact instructions, examples, availability and pricing. Do not claim all clients automatically discover the Registry.
4. Consider x402 plus Bazaar after a successful paid pilot. Bazaar is evolving, facilitator-specific and requires implemented payment/discovery metadata. It is not a free automatic listing for every HTTP API.

Primary references checked 18 September 2026:
- https://modelcontextprotocol.io/registry/remote-servers
- https://modelcontextprotocol.io/registry/quickstart
- https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- https://docs.x402.org/extensions/bazaar
- https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage-api

## Charging recommendation

Sell resolved tasks and reliable structured answers, not a vague promise of access to the public web. Start with prepaid call credits for a small number of customers, or a base monthly allowance with aggregated usage for a business account. Do not make a separate card transaction for every tiny API request. No new price or charge is activated by this build.

Required production spine: explicit plan/price acceptance; customer-linked hashed API key; atomic reserve before upstream work; provider/time/output bounds; request-id idempotency; result validation; durable receipt; debit only successful billable outputs; failed-call release; Stripe usage outbox with retries; reconciliation; per-key and global spend ceilings; revocation; versioned terms; source licensing/attribution. Existing memory-store fallbacks cannot substitute for this ledger.

Stripe meter events are asynchronous. Record the usage in our own ledger first, use an idempotency key and reconcile against Stripe rather than treating a successful HTTP submission as settled revenue.

## NZ tools to validate with customers

**Company identity and change brief.** Normalise an NZBN/Companies Office record, identify the correct entity and return a dated change summary. Official NZBN access already exists; differentiation is matching, provenance, change handling and integration, not exclusivity over public data. Provider keys and source terms must be verified.

**Tender qualification pack.** Parse an authorised public procurement notice into deadline/timezone, buyer, eligibility, required evidence, submission steps and a bid/no-bid draft. Return unknowns and prove whether the notice is still open. Do not scrape restricted portals or invent an active tender feed.

**Property/site context.** Join allowed LINZ address and geospatial data with relevant public council layers. Return boundaries, source dates and links, not professional/legal conclusions or a harvested owner-contact list. Open data and personal ownership data have different terms.

**Grant eligibility pre-check.** Return current published programme rules, missing facts and source-linked questions. Avoid guaranteed eligibility or funding promises; expiry tracking is the core value.

**NZ source-to-pitch.** One evidence-backed opportunity and a reviewable, branded deck. This is the strongest lead product because visitors experience the output before a sales conversation. Public trial first; authenticated client-safe persistence and paid API access later.

These are product hypotheses, not a claim that no competitor or free tool exists. Validate two with paying design partners before expanding the catalogue.

## Cost and privacy boundary

The trial defaults disabled. Its database policy sets small global/per-network daily attempt caps, counts failures against the cost ceiling, and stores only a hashed network principal, input hash, final draft and trace. Results expire after seven days and daily cleanup deletes expired rows. No raw IP or original prompt is stored in our tables; upstream providers receive the submitted public brief under their own terms.

Activation requires configured provider credentials and successful live testing. The new UI must say unavailable when disabled. The model name, key and TypeSafe configuration must never be guessed or exposed to the browser. Authenticated private-hub imports are a separate permissioned step; a correct workspace link alone is not a data handoff.
