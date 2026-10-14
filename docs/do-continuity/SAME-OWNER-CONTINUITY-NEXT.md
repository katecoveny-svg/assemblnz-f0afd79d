# Smallest real cross-device continuation

The Mac action menu brings deliberately chosen text to review. It is not sync. Native WebKit, Chrome/PWA and phone browser have separate cookie/storage containers today; an installer update cannot join their task stores.

## Proposed first live scope

One approved canary owner, Personal scope only, manually pasted request plus explicitly selected notes, inert worksheet only. Phone saves one stable ID to approved private online storage; independently signed-in desktop reopens that exact ID and edits it; phone sees the confirmed edit. No memory reads, recurring responsibilities, other owners, providers, calendar or native background actions. Do not broaden to Work or peer scopes until independently reviewed.

## Required decisions and proof before any activation

1. Review the already frozen SQL proposal `130b100a88d4adc5807ba0e7912c43d651c793805b4ade8efbe7853736398ceb` against current main. Explicitly decide the 2,048 lifetime-ID cap/content-free metadata retention, account deletion and maximum delay for physical seven-day content purge. The prior isolated tests used Auth stubs, not actual Supabase Auth or PostgREST.
2. Approve an isolated Supabase Auth/API environment using the existing cookie/publishable-key client. Review function ownership/default ACLs/schema exposure/RLS and run actual authenticated cookie/PostgREST tests. Clients must not gain private table/helper access or service-role transport. No proposal is in automatic migrations.
3. Separately approve installation of the exact schema, authenticated-only RPC execution and a trusted administrator's single expiring owner/Personal access row. RPC grants alone must not enrol an account. No owners are pre-enabled. Prove disable/expiry denial after lock waits, including same-ID save retries.
4. Approve and test retention maintenance/account-delete cascade before exposing owner content. Review the scoped environment-only opening of the currently false activation constant; do not silently open a production-wide flag or provide a fixture fallback on storage errors.
5. In an isolated preview, use real phone session A and desktop session B signed in separately to the same owner. Save/reopen/edit by the same task ID, stale revision and acknowledgement-loss retry, owner B denial, scope switch, logout/identity switch, revocation/expiry, offline resume and physical purge. Only this actual two-device proof justifies a cross-device-persistence claim.
6. Obtain root review for the narrowly gated production canary. Keep the executor an inert worksheet and clearly describe foreground/online requirements. OpenAI/TypeSafe drafting would require its separate approved consent, admission/cost/account model; phone capture or task storage is not that permission.

If native DO participates, it must use its own normal sign-in rather than harvesting/relaying another browser's tokens. Authenticated online task access can then join otherwise separate containers. Opening an owner-private task link does not give another owner access and must never include context bodies in URLs, telemetry or peer handoffs.

No step in this proposal has been activated by the widget work. The existing public `/do/continue` fixture remains browser-local.
