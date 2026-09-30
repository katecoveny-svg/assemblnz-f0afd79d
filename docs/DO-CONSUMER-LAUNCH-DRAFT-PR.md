# DO web/PWA launch review and billing reliability

Personal DO currently requires account enrollment and two provider credentials unavailable in its production Vercel runtime. This review restores the held unified UI on the exact production base, keeps account access restricted, and documents the bounded consumer offer and remaining launch gates without inventing pricing.

The billing routes now reject cross-origin requests, and both Stripe webhook endpoints return retryable failures when required audit or domain writes fail. DO's worker no longer persists authenticated page HTML or replays it offline. A dedicated consumer configuration parser has no industry/business price defaults and does not enable sales.

Acceptance criteria:
- Auth/account/consent gates remain intact; no paid/public access widening.
- Failed webhook writes are retried; repeated upsert delivery converges and cancellation write failures are not acknowledged.
- Offline DO returns only a public shell; older page caches are purged.
- Production labels remain honest about web/PWA, Chrome unpacked, Mac source and native iPhone availability.
- One coherent consumer proposal and secure setup handoff is documented without replacing assembl's business/creative positioning.

Validation: full typecheck, changed-source lint; full suite 2,273 passed/2 skipped before the final added webhook audit test; final targeted suite 26 passed. Desktop and 375px rendered DO entry, no horizontal overflow. Production build fails on legacy Turbopack Google-font import mapping; green CI/preview is still required. Exact final run totals are in the task's verification logs.

Remaining risks: no live assistant answer until secure configuration is saved and the existing production deployment is redeployed; no approved consumer price, durable consumer entitlement/cost ledger or complete payment proof; no real iPhone install/voice/cron proof; shared public NZ retrieval not wired into Ask DO. Existing business payment paths are not Personal DO subscriptions. Stripe event-ordering/late-event reconciliation is not solved by retry handling alone.

Rollback: revert the launch-hardening commit; held UI restoration is a separate commit. Publish as draft only after parent approval of the held bundle publication. Do not merge or deploy this branch.
