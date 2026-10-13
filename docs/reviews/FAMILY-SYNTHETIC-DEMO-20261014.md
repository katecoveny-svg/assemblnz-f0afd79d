# Family demonstration source boundary — draft remediation

The reusable `/customers/family/ops` page previously selected between personal and demonstration fixtures using a presentation cookie. That cookie was not family-owner authorization. The route also composed stored items, invite-viewer context and genome content. Source review establishes an unsafe boundary; **it does not establish that private content was publicly exposed**.

This separate draft replaces that page's runtime composition with one read-only synthetic dataset (`lib/family/demo.ts`). It preserves the existing demo shell and section navigation, but no longer imports personal profiles, custody data, saved family items, genome readers, invite-viewer identity, inbox status, uploads, agent chats or server actions. Every tab is a synthetic illustration. Old presentation-cookie values cannot select another dataset. The layout's disclosure now matches that reduced capability.

This deliberately removes interactive capabilities from this reusable demo rather than implying they are a safe private family workspace. A real family workspace remains **unproved**, and must separately establish authenticated household membership, adult/child roles, owner isolation, scoped consent, retention and safe action handling. Shared demo admission, basic auth, an invite or a hub pass must not be inherited as family-owner authority.

## Exact scope

- Changed runtime: `/customers/family/ops` and its `tab` variants, its layout disclosure, and the new synthetic-only dataset.
- New tests: presentation-cookie variants, all six sections and invalid tabs, fixed source-import boundary, no action forms; browser proof uses synthetic local credentials and blocks all APIs/external origins.
- Legacy fixture files and unmounted legacy components/actions remain in source/history. They are not imported by this page. This is not a repository/history erasure or a certification of every family API, agent, backend, stored record or previously deployed bundle. Reconnecting those components requires a separate privacy/authorization review.
- No middleware, authentication policy, database, secret, enrollment, provider, stored record, history or production deployment changes. No live family records were read. No private fixture values are included in this note or test evidence.

## Release boundary

Keep the PR draft until review. Verify exact-head CI and deployed source/bundle identity before claiming the unsafe page composition is removed in production. The current deployed page is unchanged by opening this draft. Source rollback would restore the unsafe composition, so prefer fixing forward. Do not enable a personal-data toggle as rollback.

Synthetic local reproduction: start Next with `DEMO_BASIC_AUTH_USER=synthetic-demo DEMO_BASIC_AUTH_PASSWORD=synthetic-local-only`, then run `scripts/review-family-synthetic-demo.cjs` against localhost port 3160. Browser artifacts are under `output/playwright/family-synthetic-demo/`. These are demonstration fixtures, not hosted authorization or production persistence proof.
