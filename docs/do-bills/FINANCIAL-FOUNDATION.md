# DO Bills: financial foundation

Status: review build, 21 September 2026. Not a live bank connection.

## Accepted task and useful first release

Kate asked to bring job-specific DOs, shared evidence and Redbark into the existing product. The brief's recommended first release is DO Bills with fictional data and reusable financial infrastructure. This change delivers that slice. It does not claim Tradie, LockedIn, Money or Business are complete products.

From the site: **DO → Watch my bills** opens /do/bills. The same link is in the shared DO More menu.

The flow works without provider credentials:
1. Open the explicitly fictional household, start empty, or choose a single-account NZD CSV.
2. Check recurring candidates, higher charges, actual checked invoice dates and renewal notices.
3. Prepare an enquiry from a selected finding, edit it, and record review of the exact text.
4. Copy the enquiry or download its preparation/review record with source references and hashes.

The prior bill image reader, sourced offer research and first-year comparison calculator remain available at /do/bills/compare. Their existing service consent and trial rules still apply. No uploaded CSV or bill record is automatically passed into that research flow.

## Primitive reuse

- **Uses** DoProductFrame and the current DO home task launcher.
- **Uses** the existing bill reader, comparison service and CSV field/date primitives.
- **Uses** the shared DoEvidence source/summary/why contract.
- **Extends** financial intake with strict all-or-nothing validation instead of the older heuristic CSV parser.
- **Creates** apps/do/finance: reusable integer-money models, recurring candidates, checked invoice matching/calendar, local preparation/review receipts and a server-only Redbark read adapter.
- Shared consumer contract supports bills, money, business, tradie. Registering a consumer grants no live access.

Bills is explicitly permitted in the public entry guard for this accepted user task. Other private/unfinished route restrictions remain in place. This is an intentional, recorded change to the earlier Bills promotion restriction.

## Data and action boundaries

- The default household is fictional, fixed at 21 September 2026. No account is connected.
- Local mode handles one NZD account, up to 2,000 CSV rows / 256 KB. Required columns: Date, Description/Details/Payee, Amount. Outflows must be negative. Reference and Currency are optional. Quoted fields cannot span lines. Invalid rows reject the complete file.
- CSV settlement, transfer classifications and file coverage are not independently verified. Repeated transfers or purchases can resemble bills.
- At least three posted outflows with the same account, currency and exact normalised merchant identity establish a candidate, not a confirmed subscription.
- Regular intervals produce a labelled pattern estimate. Estimates are never invoice due dates; dates that passed are not inferred arrears.
- Higher charges use the latest amount versus the prior median (at least NZ$1/equivalent and 5%). Usage or fees may explain the difference. No savings claim follows automatically.
- Invoice dates and payment status come from details explicitly checked by the person. Reference/amount matches remain suggestions, even if exact. Ambiguous matches never settle an invoice.
- Totals keep currencies separate; no foreign-exchange conversion or aggregate balance is inferred.
- New records, imports and mode changes do not persist in localStorage, cookies or a database. They are held in page memory and cleared on leaving/reload. Import/mode changes clear the previous invoices and open draft. Download is explicit and contains financial details.
- Preparation uses deterministic local templates. No CSV, invoice or draft enters a model, advertising flow or external API.
- The review fingerprint binds to exact draft text. Editing clears review. A local name/review is not authenticated identity, signed audit evidence or an execution permit.
- Receipts state externalAction: not-executed. There is no send, payment, cancellation, switch, booking or Xero write. Source document bytes are not embedded in the download; retain originals separately.
- The existing action cloud only executes supported registered actions; this change does not register financial writes or pretend a draft was executed. Trading remains disabled.

## Redbark adapter: implemented, not activated

The registry marks Redbark adapter-only. There is deliberately no Connect button, browser credential form, shared server banking token, callback or financial API route.

readRedbarkSnapshot accepts a trusted server caller's authenticated owner, consumer, account-bound read grant and resolved per-user credential. It refuses owner/consumer mismatch, expiry, revocation and wider scopes before making requests. The caller must eventually load grant and credential from protected server custody, never accept browser-supplied owner/grant claims.

The adapter permits GET only to the fixed Redbark v2 accounts, balances and transactions endpoints. Redirects are refused. Pagination must stay on the same fixed origin/path, responses are size/time/page bounded, and row account/currency/date/direction are checked. Truncation is explicit. Missing/stale/unknown balances cannot claim confirmed available funds. No sync, destination, consent configuration or banking mutation is exposed.

Provider references verified during this implementation:
- [Developers](https://redbark.com/developers)
- [v2 overview](https://redbark.com/docs/api-reference/v2/overview)
- [Banking reads](https://redbark.com/docs/api-reference/v2/banking)
- [Public OpenAPI](https://api.redbark.com/v2/openapi.json)
- [MCP server docs](https://redbark.com/docs/mcp-server)
- [Provider MCP repository](https://github.com/redbark-co/redbark-mcp)

The hosted MCP endpoint is https://mcp.redbark.com/mcp. The public https://redbark.com/mcp URL is an information page. The wider MCP interface can perform configuration writes; it must not be wholesale exposed as a read-only financial connector.

The retrieved beta OpenAPI advertises version 2026-10-01.wattle; the adapter pins that advertised version. It is not evidence that a live credentialed request works today. Provider version, status conventions, signs, scopes and actual NZ account responses must be validated in the private pilot.

## Before live banking or consequential actions

1. Confirm provider commercial/multi-customer permissions and support for a per-user SaaS OAuth integration. Standard subscription pricing is not assumed to cover all customers.
2. Implement per-user OAuth with verified discovery/PKCE/state, encrypted credential custody, owner-bound server grants, account/consumer choices and working disconnect/revocation. No global bank credential.
3. Validate a separately authorised private pilot against real provider responses, freshness, pagination, errors and revocation. Do not expose real data in the public demonstrator.
4. Add durable owner-isolated records and signed evidence before calling this an audit ledger or a persistent monitoring product.
5. Add separately authorised provider action adapters with fresh approval, idempotency and actual execution receipts before sending, switching, cancelling, booking or writing accounting entries.

Next product slices can reuse this foundation: Money recurring-expense review; Business/Tradie receivable matching with Xero; LockedIn provider availability and booking requests. Those integrations are not silently supplied by a bank feed.

## Review gates

Automated coverage exercises recurrence exclusions and uncertainty, precise amounts, calendar dates, account/currency isolation, CSV rejection, invoice ambiguity, exact-text review invalidation, provider permission isolation, safe pagination, truncation and error redaction. Existing bill-reading/research tests are retained.

Required before ship-ready: production build/typecheck, relevant tests, lint and brand/macron guards, plus browser interaction and 375px visual proof. The user asked for their local Chrome; this session did not expose it. No cloud-browser substitution or production deployment is authorised by this document.
