# DO consumer web/PWA release review

## Proven production scope

Kate securely saved the two provider keys herself. Names-only verification distinguished Vercel Next.js configuration from Supabase Edge secrets; no secret values were read or copied. Her approved account-only allowlist and `TYPESAFE_ENABLED=true` were added without changing other configuration. The configuration-only production redeploy is **READY**, `dpl_DPdWj5WnUf3gSnN5hHDaT9ufM6kb`, aliased to www, exact unchanged commit **ce99584feeb46b493d82ecf4036a70d0041a7342**. None of this review branch is production code.

Ordinary sign-in succeeded. Chrome opened the already installed DO PWA through normal app link handling; this was not an extension authentication failure. A fictional neighbourhood book-swap request returned three useful preparation steps and an editable invitation with unknown venue/date/time placeholders. Provenance identifies **GPT-6 Astra, medium reasoning; TypeSafe jev-1.13.0**. Nothing was sent, booked or saved as memory. The earlier fictional school checklist was a separate deterministic device workflow, not AI proof. The successful production contract omitted token usage, so its actual cost remains unmeasured; no extra provider request was made just to obtain metrics.

## Review branch

The isolated branch starts on that exact production base. The held 111-file unified UI bundle was byte-verified (SHA256 `8f1555e3b29133c7c439502cd288a08456a8909c358d69299893b65c50c039b7`) before restoration. The original dirty Mac checkout and other jobs are untouched. Canonical D/lowercase assembl, Instrument Sans/IBM Plex Mono and the reviewed plum/rose/paper/lilac/petal direction remain. DO is the direct consumer entry; creative, construction/tender/evidence and private business positioning remain substantial parts of assembl.

- Existing billing checkout/portal reject cross-origin requests. Both legacy Stripe webhooks return retryable 503 errors when required audit/domain writes fail.
- PWA v2 never stores authenticated navigation HTML, never replays old private HTML offline, and purges old worker caches. Only a static public offline shell and immutable static assets remain cacheable.
- Dedicated `/do/billing` and `/api/do/billing/{checkout,portal,webhook}` reuse the existing Stripe/service client primitives, with dedicated owner mappings and configured consumer price. No business tenant provisioning or legacy price fallback.
- Checkout checks the real configured Stripe price's amount, currency, monthly licensed recurrence and tax behavior. A durable per-owner attempt supplies Stripe idempotency; current subscriptions also block a second sale during webhook delay. Portal visits do not create customers. A checkout success redirect never grants access.
- Dedicated signed webhook retrieves current Stripe subscription state. Subscription write and event receipt commit atomically. Required lookup/write failures return 503; duplicate durable receipts return 200. Older events cannot roll back newer state, and a cancelled subscription cannot be reactivated by an old snapshot. Unexpected prices/items fail closed. Real Stripe delivery remains a release test.
- A service-only SQL admission function serializes global budget and owner concurrency, rechecks current owner entitlement, binds retry UUID to a digest, and reserves daily/monthly allowance and owner/global provider budget before either provider. One request per owner is in flight. Duplicate IDs cannot call providers twice. Expired workers release concurrency after 120 seconds while retaining cost reservations.
- Failed provider attempts do not consume the successful-preparation allowance, but retain conservative cost reservations. Settlement failure stays visible. Successful requests record only token counts, not prompts or replies. Reasoning token counts are separate from total output counts; do not double-charge them in estimates.
- The existing private allowlist path stays intact while consumer enablement is off. Consumer mode requires dedicated paid entitlement; being on the pilot allowlist does not substitute for it. Consumer-facing wording has no pilot enrollment jargon.

No production schema, paid product/price/customer, charge, consumer flag activation, merge or production code deployment was performed.

## Minimal plan decision

Recommend one personal subscription: one conversation, editable drafts/plans, explicit user review, deliberate saved style/checklists, web/PWA access. Keep local deterministic checklist tools free if desired. Propose **5 requests per UTC day, 100 successful requests per UTC month, one in flight, no automatic overage or rollover** only as a candidate allowance. A hard provider-reservation budget can pause service earlier; Kate must accept that visible behavior before it becomes an offer. These are not configured defaults or approved sale promises.

**No fee recommendation is credible until costs are measured.** Current official Astra Standard text tariffs: USD10/M input, USD1/M cached reads, USD12.50/M cache writes, USD50/M output. [Official Astra model documentation](https://developers.openai.com/api/docs/models/gpt-6-astra). Reasoning is billable output. At the existing 6,000 output-token cap, output alone can cost **USD0.30/request, USD30/100 maximum-output requests**, before input, TypeSafe, exchange rates, taxes and other operations. A lower consumer output ceiling is configurable, but requires quality proof with Astra; the model is not switched. [TypeSafe model documentation](https://docs.typesafe.ai/models) has not yet established an approved tariff in this review; third-party rates are insufficient.

The reservation gate is not proof of a provider invoice ceiling. Require verified conservative ceilings based on both providers, bounded input/output, failed requests, reasoning and FX. Missing usage is unknown, never zero. The explicit cost verification flag records the operator's completed assessment; it must not be enabled as a shortcut around missing measurements. A proposed margin target of provider cost at most 25% of net receipts is a business decision, not evidence it is achievable.

Bundle Kate's decisions once: **NZD monthly fee/GST and Stripe automatic-tax policy; request/input/output allowances and budget-pause behavior; verified TypeSafe tariff, conservative request/owner/deployment spend ceilings and NZD/USD conversion; cancellation/failed-payment/refund terms; explicit public rollout approval.**

## Exact configuration (no defaults)

Provider secrets already exist in production for the private proof. Consumer rollout remains disabled. In the review code, `PERSONAL_DO_CONSUMER_ENABLED=true` is insufficient unless all of these are present and valid:

- `PERSONAL_DO_STRIPE_PRICE_ID`, `PERSONAL_DO_MONTHLY_AMOUNT_CENTS`, `PERSONAL_DO_CURRENCY=nzd`, `PERSONAL_DO_TAX_TREATMENT=inclusive|exclusive`, `PERSONAL_DO_STRIPE_AUTOMATIC_TAX=true|false`.
- `PERSONAL_DO_REQUESTS_PER_DAY`, `PERSONAL_DO_REQUESTS_PER_MONTH`, `PERSONAL_DO_MAX_INPUT_BYTES` (at most 64000), `PERSONAL_DO_MAX_OUTPUT_TOKENS` (at most 6000).
- `PERSONAL_DO_MAX_REQUEST_PROVIDER_COST_CENTS`, `PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS`, `PERSONAL_DO_GLOBAL_MONTHLY_PROVIDER_COST_CENTS`, `PERSONAL_DO_COST_LIMITS_VERIFIED=true` after actual verification.
- `PERSONAL_DO_PROVIDER_TARIFFS_JSON` contains positive explicit `astraInputUsdPerMillion`, `astraOutputUsdPerMillion`, `astraCacheReadUsdPerMillion`, `astraCacheWriteUsdPerMillion`, `typesafeInputUsdPerMillion`, `typesafeOutputUsdPerMillion`, `usdToNzd`. Rates do not automatically settle reservations; conservative accounting retains the full reserved ceiling.
- Dedicated `PERSONAL_DO_STRIPE_WEBHOOK_SECRET`, existing Stripe/service-role configuration and both configured providers; dedicated endpoint delivery and Stripe portal cancellation setup must be verified before enablement. User enters credentials directly in the provider console.

Unapplied migration: `supabase/migrations/20260930220845_do_consumer_usage_billing.sql`. Authenticated/anonymous clients cannot read or mutate these service tables or execute the admission functions. The authenticated owner comes from verified server auth, not checkout metadata or client UUID.

Existing `/api/billing/checkout` is industry Solo/Team and `/api/stripe-webhook` its mirror. Agent marketplace uses `/api/agents/checkout` and `/api/stripe/webhooks`. Neither is Personal DO billing. Do not reuse the business installation fee or historical $49/$149 consumer prices.

## Public NZ and capability boundaries

Ask DO currently has no external tools or live factual retrieval. The existing public `kb_*` pipeline contains current GETS/Parliament/PCO material; Beehive fetching has failed since 14 September. Empty `live_feed` tables do not negate that pipeline. A separate task owns the bounded official-source adapter. Its discovery link index must not be used as factual evidence. Wait for verified excerpt/date/source contract before model integration; preserve tenant/private boundaries and surface source dates and stale coverage.

The smallest release is hosted web/PWA. Desktop PWA sign-in/AI works. Real iPhone installation and session continuity remain unproven; native iPhone is not installable, Mac download is source, Chrome is unpacked. Talk/photo/document capabilities must retain their current accurate labels; live voice, SMS, telephony, autonomous cross-app actions and background cron are not proved. No Bloomberg implementation is inferred.

## Verification and exact release checklist

Full suite: **2287 passed, 2 intentionally skipped**. Full typecheck and changed-source lint pass. Unapplied SQL executed in isolated local PGlite PostgreSQL: entitlement, owner binding, duplicate/conflict, concurrency, daily/monthly allowance, owner/global budget, failed/expired reservation retention, cancellation ordering, service-role denial and durable checkout assertions pass. This is not a multi-replica production load test. Runtime worker tests prove private-cache behavior; mock webhook tests prove failed-write redelivery and duplicate acknowledgement.

The initial local font error was a generated-cache/toolchain problem: no font/dependency regression was found against the successful same-base Pursuit preview. Stopping the isolated dev server, clearing its own generated `.next` and matching Node24 produced a successful production build without removing tests or changing typography. Final draft exact-commit CI/preview remains required.

Release order:
1. Review the draft and exact-commit green CI/preview; smoke signed-out/login/DO/billing-disabled routes at phone width.
2. Approve the offer and cost decisions above. Measure both provider usages/cost distribution with representative consented requests. Verify the conservative ceiling and provider-side controls.
3. Approve/apply the owner-bound migration and configure the **dedicated** Stripe test path. Prove checkout, durable webhook retry/duplicate/out-of-order delivery, portal cancellation, period-end revocation, failed payment, and no second subscription or account mismatch.
4. Prove iPhone Safari install, sign-in continuity, logout/offline privacy and account isolation. Do not advertise native availability or unproven voice/cron.
5. Integrate only independently verified dated public-source excerpts if marketing live NZ-informed replies; otherwise label official reference links honestly.
6. Obtain explicit merge/production code and public consumer rollout approval. Keep consumer enablement off until all gates pass; no live price creation or charges in this review.
