# Bounded direct-source brief: final wiring review

Extends existing Pursuit research input, native transport, trial reservation/storage, lookup-only recovery, canvas and exports. One scoped mode; no billing platform, new credentials/grants, provider retries, trial-limit changes or manual deployment. Homepage integration awaits useful actual output and truthful recording.

## Source contract

Fixed allowlist is https://www.assembl.co.nz/ and https://www.business.govt.nz/operations/getting-started-with-ai/safe-and-smart-ai-use . Native HTTPS GET, exact returned URLs, no redirects/credentials/followed links/fallbacks/retries. Shared5-second retrieval deadline,256KiB per page (512KiB total),6000 normalized text characters per page,5-minute freshness. Title/main/substantive body required. Server receipts retain exact URL, raw/text SHA256, bytes, retrieval/expiry, truncation flag; publishedAt:null. Receipt objects are server-generated, never browser inputs.

Evidence must contain exactly one entire short paragraph/heading candidate from EACH source, verbatim with its associated URL. Whole-element extraction avoids decimal/domain/abbreviation prefix loss. Source content is inert untrusted data; proposed work/opportunity remain commercial hypotheses. Formatter must retain evidence unchanged. parseGroundedDraft still enforces source membership. Direct result explicitly labels scoped fixed-page research and zero web searches, not broad discovery/qualified buyer demand.

Approved source substitution was independently reviewed. Native Mac retrieval of Safe and smart AI use returned exact URL HTTP200 text/html;charset=utf-8, complete189783-byte body/title/main; SHA25602ab25221e93eb357d3e9df7be670752e61519b0da862e94adf6b1b8a0d2edff. Guidance supports hypothetical privacy/human-review readiness work, not buying intent or a new event. Publisher dates are separate metadata: visible reviewed30March2026, structured published20March2026/modified7April2026; existing receipt keeps publication unknown. Original Digital.govt.nz URL and focused MBIE guidance returned challenge shells on this Mac; no bypass or indexed-text substitution occurred.

## Provider bound

One admission is shared by initial draft (2400output tokens) and optional formatter (2000). Model is pinned claude-haiku-4-5-20251001; service_tier standard_only forced. No tools/thinking/cache/beta/unknown settings, TypeSafe or automatic retries. Native transport reads existing server ANTHROPIC_API_KEY in place, sets auth header only for exact first-party Messages endpoint, and performs one fetch per admission. No credential transfer/env changes.

Official tariff rechecked2October2026:200K context,$1/M input,$5/M output,USD. Reserve entire200K context plus requested output BEFORE each dispatch, retain reservations on errors/abort. Candidate maximum .212+.210=US$0.422pre-tax; absolute guard maximum two5000output calls=.450. Assuming15%tax: candidate=.4853USD; guard=.5175USD. Admission net ceiling1/1.15. Direct first-party/standard-only routing avoids gateway/priority/cloud premiums and extra paid feature charges.

Account-specific taxes, FX/payment fees or minimums are NOT verified by public tariff/config booleans. Remaining candidate margin after assumed15%tax is .5147USD; margin alone is not proof. Final review must verify/resolve account-total<=US$1 before the ONE approved live test. Excludes unrequested Vercel/other operating costs. No paid request has occurred during this candidate preparation.

## Route, persistence and recovery

Optional TrialInput.sourceMode=direct_source_brief; legacy input/fingerprint unchanged. Direct mode accepts only fixed Assembl scope and rejects outreach/TypeSafe/other target before reservation. User goal is inert proposal context. Uses existing atomic reserveTrial, completeTrial and owner/input-matched lookup-only recovery. Explicit sourceMode participates in immutable attempt fingerprint/input hash. Same-ID recovery never reserves or infers.

DirectBriefFailure retains safe category/stage, attempted-call count and budget receipt without raw provider content/URLs/secrets. Route retains receipt after inference/formatter errors or post-inference save failure; existing private JSONB trace stores it, without schema/grant changes. Result sources retain public receipt metadata, not entire retrieved bodies. UI shows fixed-page mode, source quotes, proposal/plan and independently reviewed HTML/JSON export; export does not claim web search.

Read-only runtime proof: GET /api/pursuit/research?checkDirectSources=1 invokes bounded native retrieval only and returns source readiness/receipt metadata, providerConfigured boolean, pinned model, providerCalls0, webSearches0, billingAccountTotalVerified:false. No reservation, inference or private knowledge query. Intended preview must verify both sources before paid execution; Mac captures alone do not prove Vercel reachability.

## Validation and authority

117 Pursuit/route tests, changed-file ESLint, typecheck and diff whitespace check pass. Includes URL/byte/deadline/freshness/challenge checks, whole paragraph quote regressions, exact quote/formatter association, one/two-call receipt math, model/tier/no-tools admission, zero-inference source failure, no transport retries, safe post-call failure receipts, route admission/recovery/save failure, private failure persistence and truthful direct-source exports. All inference fixtures are injected; no live upstream calls in tests.

public-pursuit-review.yml only adds bounded tests and lint to existing job; shared NZ workflow untouched. One coherent update to owned PR1461, no merge/manual deploy. Independent final wiring review, exact-commit CI/automatic preview, intended-runtime source/config verification and account-total cap resolution are required before the live test. If paid attempt fails, stop; do not repeat fresh IDs. Homepage/working recording remain pending actual useful success.

Primary references:
- https://platform.claude.com/docs/en/models/haiku-4-5/overview
- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/api/messages/create
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools
- https://www.ird.govt.nz/gst/charging-gst (15% assumption; actual account treatment unverified)
