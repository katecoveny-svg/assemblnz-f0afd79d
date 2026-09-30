# DO consumer launch review — 1 October 2026

## Release conclusion

The hosted web/PWA is the smallest sensible launch surface. The public local checklist works, but this does not establish a live model answer. A paid consumer assistant launch is blocked by provider configuration, approved pricing/usage, durable consumer entitlement and cost accounting, and production build proof. No consumer product/price, billing account, charge or production code release was created in this review.

Production is `ce99584feeb46b493d82ecf4036a70d0041a7342`, deployment `dpl_2RBCbtENAEKmr3yTx21ta9atoREN`. The held 111-file UI bundle was byte-verified (SHA256 `8f1555e3b29133c7c439502cd288a08456a8909c358d69299893b65c50c039b7`) and restored onto that exact base in an isolated clone. The original dirty Mac checkout and other jobs were untouched.

## Proven and blocked paths

- Ordinary magic-link sign-in succeeded and Chrome opened the installed DO PWA. This was installed-app link handling, not an extension authentication failure. Existing private hub sessions are not sufficient evidence for the separate www account.
- Authenticated Personal DO shows account settings, saved checklists and zero ongoing responsibilities. Ask DO reports the account access gate. The exact owner was verified from the existing owner-scoped response without cookies or credentials.
- A fictional school notice produced a local, reviewable checklist. It is a deterministic device workflow, not a GPT-6 Astra result.
- Phone install instructions are visible. Native iPhone remains not installable; Mac is source only; Chrome is unpacked. Desktop PWA already exists on Kate's Mac, but real iPhone installation and session continuity still need device proof.
- Voice and background cron remain unproven. Do not market always-on operation, automatic cross-app access or autonomous sending.

## Secure configuration handoff

Project `assemblnz-f0afd79d`, team `katecoveny-svgs-projects`, Vercel Production: names-only inspection found no `TYPESAFE_API_KEY`, `TYPESAFE_ENABLED`, `TYPESAFE_PILOT_USER_IDS` or `OPENAI_API_KEY`. The exact production deployment's runtime/build key names also lack them. Supabase Edge secret names include OpenAI, Anthropic and Gemini, but not TypeSafe. Edge configuration is not automatically available to the Next.js assistant.

Kate must enter `TYPESAFE_API_KEY` and `OPENAI_API_KEY` directly as Production secrets. She handles Vercel's authenticator prompt herself. No credential values were read, copied or saved. After her confirmation, verify names/scopes only, preserve any existing/concurrently added allowlist entries, and apply her approved account-only enrollment plus `TYPESAFE_ENABLED=true`. Redeploy only the pinned existing production deployment, never this local UI branch or an unrelated preview. Verify the resulting commit, account availability and one fictional assistant request before claiming readiness.

## Proposed consumer offer — requires Kate's decision

Recommend one Personal DO subscription for one person: text/context to an editable draft or plan, explicit review, saved preferences/checklists and web/PWA access. Keep business/private-client workflows under their existing commercial model; assembl remains Pursuit + DO + Studio and includes creative and tender/evidence work.

For an initial measured release, propose **100 successful preparations per month**, **5 per day**, **one in flight per account**, no automatic overage or rollover. Local checklist preparation can remain free because it makes no provider call. Failed generations should not consume the customer's successful-preparation allowance, but their actual provider cost must still count against the operator budget. These are recommendations, not active defaults or approved promises.

Kate decides: the monthly NZD sale price and GST treatment; accept/change these limits; set an operator-funded pilot ceiling and a maximum monthly provider budget. A reasonable proposed margin rule is provider spending no more than 25% of net subscription receipts, combined with an absolute deployment-wide ceiling. This is not an estimate of achievable margin: current provider tariffs and real token consumption have not been verified, and no sale amount is proposed here.

Evidence for caution: each assistant request runs TypeSafe classification and then GPT-6 Astra at medium reasoning, currently up to 6,000 output tokens, input up to 24,000 characters, no retry/fallback, bounded timeout. Reasoning and failed calls can incur cost. Current IP throttling fails open when storage is unavailable and is not a durable monetary cap. Do not sell unlimited usage.

## Normal TypeSafe-backed DO access design

Retain the restricted enrollment until explicit rollout approval. Separate access to the DO product from provider readiness. A consumer implementation must resolve a **user-owned** Personal DO subscription, not the user's newest business tenant or industry Solo/Team tier; obtain active/trialing status from a signed webhook mirror of the dedicated configured price. Checkout success URLs and client metadata never grant access.

Admission before either provider call must atomically reserve the daily/monthly allowance, one concurrent slot, and conservative cost budget; refusal or ledger failure stops the call. Settlement records both providers' actual billable usage and releases the reservation. The request receives a retry key so client retries do not double-spend; rejected/failed generations retain actual incurred cost. Service-wide budget and provider kill switch remain independent of subscription entitlement. No table/migration or global gate was deployed in this review.

`lib/billing/personal-do-plan.ts` is a review-only strict parser with dedicated price/tax/usage/budget fields and no fallback to business tiers. It does not sell, create prices, or grant access. Consumer-facing availability wording no longer instructs users to join a pilot; the server gate remains intact.

## Payment path and remaining work

Existing `/api/billing/checkout` sells industry `solo/team` and provisions business tenants; its subscription mirror is `/api/stripe-webhook`. `/api/agents/checkout` uses agent marketplace plans and `/api/stripe/webhooks`. Neither is approved Personal DO billing. `/pricing` business installation fees and historical $49/$149 tiers must not become consumer defaults.

Reuse Stripe infrastructure only after dedicated owner-scoped consumer checkout, webhook entitlement, billing portal/cancel and daily/monthly cost ledger exist. Validate configured Stripe price currency/amount/recurrence/product against the accepted offer server-side. Real test-mode checkout, webhook delivery/redelivery, scheduled cancellation, period-end revocation and failed payment must be exercised before live sales. Do not create Stripe customers during a read-only billing visit; review owner/tenant membership checks before reusing legacy helpers.

Safe repairs here: same-origin checks before billing checkout/portal; webhook 503 on failed required audit/domain writes; missing-table errors no longer acknowledge lost entitlement. Upserts and status updates make repeated successful delivery converge; tests exercise failure followed by same-event redelivery. A durable Stripe-event ledger, ordering/late-event reconciliation and zero-row cancellation detection remain required for a stronger paid launch. These repairs are not proof of exactly-once billing or a completed consumer payment system.

## Shared public NZ retrieval

Ask DO currently has no tools and explicitly cannot retrieve links/live facts. Do not equate a feed logo or static public product-knowledge search with corpus access. Parent's database audit reports GETS, Parliament and PCO fetches current today; Beehive is active but failing since 14 September. Empty `live_feed` tables do not negate the active `kb_*` pipeline.

Extend existing `kb_sources`, `kb_documents`, `kb_doc_chunks` and existing retrieval primitives. Select only explicitly public source/document scope with a verified provenance policy. A service-role query must enforce that restriction itself; never merge tenant/client/clinical records into a personal request. Return source URL, published/document date, last successful fetch, retrieval time and stale/unavailable status. Keep quote/citation provenance tied to document/chunk IDs. TypeSafe assesses a bounded request/result; it is not fact verification. Clearly disclose stale Beehive coverage and avoid silently substituting invented updates. Shared public retrieval is still a design gap, not implemented or live proof.

## Verification and release gates

Full typecheck passed with isolated locked dependencies and canvas build. Full suite after restoring held UI: 2,273 passed, 2 intentionally skipped; additional audit-failure webhook test also passed. Targeted checks cover redelivery/cancellation failures, account allowlist/consent, explicit plan fields and PWA privacy. Changed-source lint passed. Local desktop/375px DO entry rendered; document width equals 375 at phone width, with the sculptural scene visible.

PWA v2 removes authenticated navigation HTML from caches, serves a static no-store shell offline, and purges older worker caches. A runtime worker test verifies that neither fresh nor stale account HTML is stored/replayed. It still caches immutable static assets.

`pnpm build` fails in this environment at Turbopack Google-font import mapping for legacy Cormorant/Fraunces (`next/font/google queries have exactly one entry`), before production output. A green exact-head preview/CI build remains required. Live provider output, real phone installation and complete consumer payments remain blocked; no merge/deploy occurred.
