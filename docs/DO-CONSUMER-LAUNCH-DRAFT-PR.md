# Personal DO web/PWA and fail-closed consumer billing

Personal DO needs a coherent direct consumer experience and a trustworthy boundary between paid access, private account tests and provider spending. This branch reconciles the reviewed unified UI onto ce99584, fixes private PWA caching and webhook error acknowledgements, and adds a dedicated owner-bound consumer subscription and usage path. Existing industry and marketplace prices are not consumer defaults.

The consumer path is disabled unless its dedicated price, tax, tariffs, input/output/request limits and verified reservation budgets are complete. Owner entitlement comes from an atomic signed webhook mirror; checkout redirects never grant access. Durable admission binds retries to owner/input digest, serializes concurrency/global budgets, and fails closed before providers. Portal does not provision customers; checkout uses durable Stripe idempotency and blocks existing subscriptions. Cancellation and stale-event behavior have local SQL coverage.

Production provider connection is a **separate completed configuration action**: approved account-only TypeSafe enrollment and provider keys, exact unchanged ce99584 redeploy dpl_DPdWj5WnUf3gSnN5hHDaT9ufM6kb. One fictional Ask DO returned GPT-6 Astra/TypeSafe output with provenance. None of this branch is production code.

Validation: 2287 tests passed, 2 intentionally skipped; typecheck and changed-source lint pass. Isolated PostgreSQL/PGlite migration assertions cover owner entitlements, retry/conflict, concurrency, allowances, cost reservations, cancellation ordering, role denial and checkout attempts. PWA runtime privacy and webhook failed-write/redelivery tests pass. Clean Node24 production build passes; no fonts or tests removed. See release review for exact-head CI/preview results and remaining live payment/device proof.

Release blockers: no approved fee/GST/allowances; TypeSafe tariffs and real cost distribution not established; reservations are conservative accounting, not a measured invoice guarantee; unapplied migration and unconfigured dedicated Stripe test/webhook/portal path; real iPhone installation/private-session test pending. Live NZ answer retrieval is owned separately and is not claimed by this PR. Voice/cron/native capabilities retain honest labels.

Draft only. No merge, auto-merge, production code deployment, live prices/charges or consumer flag activation. Roll back consumer hardening separately from held UI restoration. Full release checklist: docs/DO-CONSUMER-LAUNCH-20261001.md.
